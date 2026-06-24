/*
# Set default phone number to +91

1. Modified Tables
- `profiles` — set `phone` column default to '+91'
- `donors` — set `phone` column default to '+91'
- `blood_requests` — set `contact_phone` column default to '+91'

2. Important Notes
- This ensures the database default matches the UI default of +91.
- If a user explicitly clears the phone field, the stored value will be +91 unless the client sends NULL.
*/

ALTER TABLE public.profiles ALTER COLUMN phone SET DEFAULT '+91';
ALTER TABLE public.donors ALTER COLUMN phone SET DEFAULT '+91';
ALTER TABLE public.blood_requests ALTER COLUMN contact_phone SET DEFAULT '+91';
