/*
# Seed blood request data from PDF dataset

1. New Data
- 5 blood_requests seeded from the PDF
- Each request uses the first available seeded donor profile as requester_id
  (requests are system/admin-level seed data, not tied to a specific user)

2. Mapping notes
- urgency: Emergency -> critical, High -> urgent, Medium -> normal
- status: Open -> open, Fulfilled -> fulfilled
- contact_phone prefixed with +91
- hospital field maps to hospital_name
- blood_group_needed maps to blood_group
- units maps to units_required
*/

DO $$ DECLARE req_user_id uuid; BEGIN
  -- Use Rahul Sharma (first seeded donor) as the system requester for seed data
  SELECT id INTO req_user_id FROM auth.users WHERE email = 'rahul@gmail.com';

  -- R001 Suresh Rao
  IF NOT EXISTS (SELECT 1 FROM public.blood_requests WHERE patient_name = 'Suresh Rao' AND hospital_name = 'Apollo Hospital') THEN
    INSERT INTO public.blood_requests (requester_id, patient_name, blood_group, units_required, hospital_name, city, contact_person, contact_phone, urgency, status)
    VALUES (req_user_id, 'Suresh Rao', 'O+', 2, 'Apollo Hospital', 'Mumbai', 'Ravi Rao', '+919876500001', 'critical', 'open');
  END IF;

  -- R002 Lakshmi Devi
  IF NOT EXISTS (SELECT 1 FROM public.blood_requests WHERE patient_name = 'Lakshmi Devi' AND hospital_name = 'Care Hospital') THEN
    INSERT INTO public.blood_requests (requester_id, patient_name, blood_group, units_required, hospital_name, city, contact_person, contact_phone, urgency, status)
    VALUES (req_user_id, 'Lakshmi Devi', 'A-', 1, 'Care Hospital', 'Hyderabad', 'Kiran', '+919876500002', 'urgent', 'open');
  END IF;

  -- R003 Mohan Singh
  IF NOT EXISTS (SELECT 1 FROM public.blood_requests WHERE patient_name = 'Mohan Singh' AND hospital_name = 'Fortis Hospital') THEN
    INSERT INTO public.blood_requests (requester_id, patient_name, blood_group, units_required, hospital_name, city, contact_person, contact_phone, urgency, status, fulfilled_at)
    VALUES (req_user_id, 'Mohan Singh', 'B+', 3, 'Fortis Hospital', 'Chennai', 'Ramesh', '+919876500003', 'normal', 'fulfilled', now());
  END IF;

  -- R004 Anitha
  IF NOT EXISTS (SELECT 1 FROM public.blood_requests WHERE patient_name = 'Anitha' AND hospital_name = 'KIMS Hospital') THEN
    INSERT INTO public.blood_requests (requester_id, patient_name, blood_group, units_required, hospital_name, city, contact_person, contact_phone, urgency, status)
    VALUES (req_user_id, 'Anitha', 'O-', 2, 'KIMS Hospital', 'Visakhapatnam', 'Prasad', '+919876500004', 'critical', 'open');
  END IF;

  -- R005 Ravi Kumar
  IF NOT EXISTS (SELECT 1 FROM public.blood_requests WHERE patient_name = 'Ravi Kumar' AND hospital_name = 'AIIMS') THEN
    INSERT INTO public.blood_requests (requester_id, patient_name, blood_group, units_required, hospital_name, city, contact_person, contact_phone, urgency, status)
    VALUES (req_user_id, 'Ravi Kumar', 'AB+', 1, 'AIIMS', 'Delhi', 'Suresh', '+919876500005', 'urgent', 'open');
  END IF;

END $$;
