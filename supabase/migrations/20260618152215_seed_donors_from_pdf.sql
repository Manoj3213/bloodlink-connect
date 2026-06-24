/*
# Seed donor data from PDF dataset

1. New Data
- 10 auth users created for each donor (email/password accounts, email pre-confirmed)
- 10 profiles inserted with donor role
- 10 donors inserted with blood group, city, availability, last_donation_date, age, gender, phone

2. Mapping notes
- availability: 'Available' -> true, 'Unavailable' -> false
- gender lowercased to match check constraint
- phones prefixed with +91
- Each block is idempotent: skips auth.users insert if email exists, uses ON CONFLICT for profiles/donors
*/

-- D001 Rahul Sharma
DO $$ DECLARE uid uuid; BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'rahul@gmail.com') THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (uid, 'rahul@gmail.com', crypt('BloodLink@2026', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated');
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'rahul@gmail.com';
  INSERT INTO public.profiles (id, full_name, email, phone, role) VALUES (uid, 'Rahul Sharma', 'rahul@gmail.com', '+919876543210', 'donor') ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.donors (id, blood_group, city, availability, last_donation_date, age, gender, phone) VALUES (uid, 'O+', 'Mumbai', true, '2026-03-15', 24, 'male', '+919876543210') ON CONFLICT (id) DO NOTHING;
END $$;

-- D002 Priya Reddy
DO $$ DECLARE uid uuid; BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'priya@gmail.com') THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (uid, 'priya@gmail.com', crypt('BloodLink@2026', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated');
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'priya@gmail.com';
  INSERT INTO public.profiles (id, full_name, email, phone, role) VALUES (uid, 'Priya Reddy', 'priya@gmail.com', '+919876543211', 'donor') ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.donors (id, blood_group, city, availability, last_donation_date, age, gender, phone) VALUES (uid, 'A+', 'Hyderabad', true, '2026-04-10', 22, 'female', '+919876543211') ON CONFLICT (id) DO NOTHING;
END $$;

-- D003 Arjun Kumar
DO $$ DECLARE uid uuid; BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'arjun@gmail.com') THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (uid, 'arjun@gmail.com', crypt('BloodLink@2026', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated');
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'arjun@gmail.com';
  INSERT INTO public.profiles (id, full_name, email, phone, role) VALUES (uid, 'Arjun Kumar', 'arjun@gmail.com', '+919876543212', 'donor') ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.donors (id, blood_group, city, availability, last_donation_date, age, gender, phone) VALUES (uid, 'B+', 'Chennai', false, '2026-02-20', 28, 'male', '+919876543212') ON CONFLICT (id) DO NOTHING;
END $$;

-- D004 Sneha Patel
DO $$ DECLARE uid uuid; BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sneha@gmail.com') THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (uid, 'sneha@gmail.com', crypt('BloodLink@2026', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated');
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'sneha@gmail.com';
  INSERT INTO public.profiles (id, full_name, email, phone, role) VALUES (uid, 'Sneha Patel', 'sneha@gmail.com', '+919876543213', 'donor') ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.donors (id, blood_group, city, availability, last_donation_date, age, gender, phone) VALUES (uid, 'AB+', 'Ahmedabad', true, '2026-01-15', 26, 'female', '+919876543213') ON CONFLICT (id) DO NOTHING;
END $$;

-- D005 Vikram Singh
DO $$ DECLARE uid uuid; BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'vikram@gmail.com') THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (uid, 'vikram@gmail.com', crypt('BloodLink@2026', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated');
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'vikram@gmail.com';
  INSERT INTO public.profiles (id, full_name, email, phone, role) VALUES (uid, 'Vikram Singh', 'vikram@gmail.com', '+919876543214', 'donor') ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.donors (id, blood_group, city, availability, last_donation_date, age, gender, phone) VALUES (uid, 'O-', 'Delhi', true, '2026-05-01', 30, 'male', '+919876543214') ON CONFLICT (id) DO NOTHING;
END $$;

-- D006 Anjali Das
DO $$ DECLARE uid uuid; BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'anjali@gmail.com') THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (uid, 'anjali@gmail.com', crypt('BloodLink@2026', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated');
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'anjali@gmail.com';
  INSERT INTO public.profiles (id, full_name, email, phone, role) VALUES (uid, 'Anjali Das', 'anjali@gmail.com', '+919876543215', 'donor') ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.donors (id, blood_group, city, availability, last_donation_date, age, gender, phone) VALUES (uid, 'A-', 'Kolkata', true, '2026-04-20', 25, 'female', '+919876543215') ON CONFLICT (id) DO NOTHING;
END $$;

-- D007 Karthik Rao
DO $$ DECLARE uid uuid; BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'karthik@gmail.com') THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (uid, 'karthik@gmail.com', crypt('BloodLink@2026', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated');
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'karthik@gmail.com';
  INSERT INTO public.profiles (id, full_name, email, phone, role) VALUES (uid, 'Karthik Rao', 'karthik@gmail.com', '+919876543216', 'donor') ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.donors (id, blood_group, city, availability, last_donation_date, age, gender, phone) VALUES (uid, 'B-', 'Bengaluru', true, '2026-03-05', 27, 'male', '+919876543216') ON CONFLICT (id) DO NOTHING;
END $$;

-- D008 Pooja Verma
DO $$ DECLARE uid uuid; BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'pooja@gmail.com') THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (uid, 'pooja@gmail.com', crypt('BloodLink@2026', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated');
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'pooja@gmail.com';
  INSERT INTO public.profiles (id, full_name, email, phone, role) VALUES (uid, 'Pooja Verma', 'pooja@gmail.com', '+919876543217', 'donor') ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.donors (id, blood_group, city, availability, last_donation_date, age, gender, phone) VALUES (uid, 'O+', 'Pune', true, '2026-02-18', 23, 'female', '+919876543217') ON CONFLICT (id) DO NOTHING;
END $$;

-- D009 Ramesh Gupta
DO $$ DECLARE uid uuid; BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ramesh@gmail.com') THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (uid, 'ramesh@gmail.com', crypt('BloodLink@2026', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated');
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'ramesh@gmail.com';
  INSERT INTO public.profiles (id, full_name, email, phone, role) VALUES (uid, 'Ramesh Gupta', 'ramesh@gmail.com', '+919876543218', 'donor') ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.donors (id, blood_group, city, availability, last_donation_date, age, gender, phone) VALUES (uid, 'A+', 'Jaipur', false, '2026-01-22', 35, 'male', '+919876543218') ON CONFLICT (id) DO NOTHING;
END $$;

-- D010 Meera Nair
DO $$ DECLARE uid uuid; BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'meera@gmail.com') THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (uid, 'meera@gmail.com', crypt('BloodLink@2026', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated');
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'meera@gmail.com';
  INSERT INTO public.profiles (id, full_name, email, phone, role) VALUES (uid, 'Meera Nair', 'meera@gmail.com', '+919876543219', 'donor') ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.donors (id, blood_group, city, availability, last_donation_date, age, gender, phone) VALUES (uid, 'AB-', 'Kochi', true, '2026-05-10', 29, 'female', '+919876543219') ON CONFLICT (id) DO NOTHING;
END $$;
