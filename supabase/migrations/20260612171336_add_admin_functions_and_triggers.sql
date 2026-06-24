-- Admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_donors', (SELECT COUNT(*) FROM donors),
    'verified_donors', (SELECT COUNT(*) FROM donors WHERE verified = true),
    'available_donors', (SELECT COUNT(*) FROM donors WHERE availability = true),
    'total_recipients', (SELECT COUNT(*) FROM profiles WHERE role = 'recipient'),
    'total_requests', (SELECT COUNT(*) FROM blood_requests),
    'open_requests', (SELECT COUNT(*) FROM blood_requests WHERE status = 'open'),
    'critical_requests', (SELECT COUNT(*) FROM blood_requests WHERE urgency = 'critical' AND status = 'open'),
    'fulfilled_requests', (SELECT COUNT(*) FROM blood_requests WHERE status = 'fulfilled'),
    'total_donations', (SELECT COUNT(*) FROM donations),
    'donors_by_blood_group', (
      SELECT json_object_agg(blood_group, count)
      FROM (
        SELECT blood_group, COUNT(*) as count
        FROM donors
        GROUP BY blood_group
      ) t
    ),
    'requests_by_city', (
      SELECT json_object_agg(city, count)
      FROM (
        SELECT city, COUNT(*) as count
        FROM blood_requests
        WHERE status = 'open'
        GROUP BY city
        ORDER BY count DESC
        LIMIT 10
      ) t
    ),
    'recent_requests', (
      SELECT json_agg(r)
      FROM (
        SELECT id, patient_name, blood_group, urgency, status, created_at
        FROM blood_requests
        ORDER BY created_at DESC
        LIMIT 5
      ) r
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Search donors with filters
CREATE OR REPLACE FUNCTION search_donors(
  p_blood_group TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_available_only BOOLEAN DEFAULT true,
  p_verified_only BOOLEAN DEFAULT false,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  blood_group TEXT,
  city TEXT,
  availability BOOLEAN,
  last_donation_date DATE,
  verified BOOLEAN,
  age INTEGER,
  gender TEXT,
  phone TEXT,
  full_name TEXT,
  email TEXT,
  profile_phone TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.blood_group,
    d.city,
    d.availability,
    d.last_donation_date,
    d.verified,
    d.age,
    d.gender,
    d.phone,
    p.full_name,
    p.email,
    p.phone as profile_phone
  FROM donors d
  JOIN profiles p ON d.id = p.id
  WHERE
    (p_blood_group IS NULL OR d.blood_group = p_blood_group)
    AND (p_city IS NULL OR d.city ILIKE '%' || p_city || '%')
    AND (p_available_only = false OR d.availability = true)
    AND (p_verified_only = false OR d.verified = true)
  ORDER BY d.verified DESC, d.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Notify compatible donors when a new request is created
CREATE OR REPLACE FUNCTION notify_compatible_donors()
RETURNS TRIGGER AS $$
DECLARE
  donor_record RECORD;
  compatible_blood_groups TEXT[];
BEGIN
  compatible_blood_groups := CASE NEW.blood_group
    WHEN 'A+' THEN ARRAY['A+', 'A-', 'O+', 'O-']
    WHEN 'A-' THEN ARRAY['A-', 'O-']
    WHEN 'B+' THEN ARRAY['B+', 'B-', 'O+', 'O-']
    WHEN 'B-' THEN ARRAY['B-', 'O-']
    WHEN 'AB+' THEN ARRAY['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    WHEN 'AB-' THEN ARRAY['A-', 'B-', 'AB-', 'O-']
    WHEN 'O+' THEN ARRAY['O+', 'O-']
    WHEN 'O-' THEN ARRAY['O-']
  END;
  
  FOR donor_record IN
    SELECT d.id, p.full_name
    FROM donors d
    JOIN profiles p ON d.id = p.id
    WHERE d.blood_group = ANY(compatible_blood_groups)
      AND d.availability = true
      AND d.id != NEW.requester_id
      AND (NEW.city IS NULL OR d.city ILIKE '%' || NEW.city || '%')
  LOOP
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      donor_record.id,
      'blood_request',
      'New Blood Request in Your Area',
      'A patient needs ' || NEW.blood_group || ' blood. Please check if you can help.',
      json_build_object(
        'request_id', NEW.id,
        'blood_group', NEW.blood_group,
        'city', NEW.city,
        'urgency', NEW.urgency
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS on_blood_request_created ON blood_requests;
CREATE TRIGGER on_blood_request_created
  AFTER INSERT ON blood_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_compatible_donors();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_donors_updated_at ON donors;
CREATE TRIGGER update_donors_updated_at
  BEFORE UPDATE ON donors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_blood_requests_updated_at ON blood_requests;
CREATE TRIGGER update_blood_requests_updated_at
  BEFORE UPDATE ON blood_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Admin policies
DROP POLICY IF EXISTS "admin_select_all_profiles" ON profiles;
CREATE POLICY "admin_select_all_profiles" ON profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "admin_update_all_profiles" ON profiles;
CREATE POLICY "admin_update_all_profiles" ON profiles FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "admin_delete_profiles" ON profiles;
CREATE POLICY "admin_delete_profiles" ON profiles FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "admin_all_donors" ON donors;
CREATE POLICY "admin_all_donors" ON donors FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "admin_all_blood_requests" ON blood_requests;
CREATE POLICY "admin_all_blood_requests" ON blood_requests FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Notification policies
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
