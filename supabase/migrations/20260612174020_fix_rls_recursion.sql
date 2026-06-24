-- Fix infinite recursion in profiles RLS policies
-- The problem: admin policies on profiles referenced profiles table in EXISTS clause
-- Solution: Use the is_admin() SECURITY DEFINER function instead

-- Drop the problematic admin policies on profiles
DROP POLICY IF EXISTS "admin_select_all_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_update_all_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_delete_profiles" ON profiles;

-- Similarly fix admin policies on donors and blood_requests
DROP POLICY IF EXISTS "admin_all_donors" ON donors;
DROP POLICY IF EXISTS "admin_all_blood_requests" ON blood_requests;

-- Recreate admin policies using is_admin() function (SECURITY DEFINER, bypasses RLS)
CREATE POLICY "admin_select_all_profiles" ON profiles FOR SELECT
  TO authenticated USING (is_admin());

CREATE POLICY "admin_update_all_profiles" ON profiles FOR UPDATE
  TO authenticated USING (is_admin());

CREATE POLICY "admin_delete_profiles" ON profiles FOR DELETE
  TO authenticated USING (is_admin());

CREATE POLICY "admin_all_donors" ON donors FOR ALL
  TO authenticated USING (is_admin());

CREATE POLICY "admin_all_blood_requests" ON blood_requests FOR ALL
  TO authenticated USING (is_admin());

-- Also recreate the is_admin function to ensure it exists and is correct
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;