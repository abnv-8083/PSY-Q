-- 1. Create Handle New User Function
-- This function will be called every time a new user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_role TEXT;
BEGIN
  -- Get role from metadata or default to student
  new_role := COALESCE(new.raw_user_metadata->>'role', 'student');

  -- Insert into public.profiles
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_metadata->>'full_name',
    new_role
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = NOW();

  -- Sync role to app_metadata so RLS can use it via auth.jwt()
  -- This requires the user to re-login to see the changes in their token
  UPDATE auth.users 
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', new_role)
  WHERE id = new.id;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create Trigger
-- Drop if exists to avoid errors on reapplying
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Function to sync existing users (One-time run helper)
CREATE OR REPLACE FUNCTION public.sync_existing_users_metadata()
RETURNS void AS $$
DECLARE
  profile_rec RECORD;
BEGIN
  FOR profile_rec IN SELECT id, role FROM public.profiles LOOP
    UPDATE auth.users 
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', profile_rec.role)
    WHERE id = profile_rec.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
