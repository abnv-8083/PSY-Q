-- Drop existing trigger and function to ensure a clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Reocreate the function with better error handling and logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_role TEXT;
  new_phone TEXT;
BEGIN
  -- Log the start of the function
  RAISE LOG 'handle_new_user trigger started for user_id: %', new.id;

  -- Get role from metadata or default to student
  new_role := COALESCE(new.raw_user_metadata->>'role', 'student');
  new_phone := new.raw_user_metadata->>'phone';

  RAISE LOG 'Data extracted - Role: %, Phone: %', new_role, new_phone;

  -- Insert into public.profiles
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, phone)
    VALUES (
      new.id,
      new.email,
      new.raw_user_metadata->>'full_name',
      new_role,
      new_phone
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      phone = EXCLUDED.phone,
      updated_at = NOW();
      
    RAISE LOG 'Profile inserted/updated successfully for user_id: %', new.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error inserting profile for user_id: % - %', new.id, SQLERRM;
    -- Reraise error to fail the transaction if needed, or swallow it
    -- RAISE EXCEPTION 'Profile creation failed: %', SQLERRM;
  END;

  -- Sync role to app_metadata so RLS can use it via auth.jwt()
  BEGIN
    UPDATE auth.users 
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', new_role)
    WHERE id = new.id;
    
    RAISE LOG 'Auth metadata synced for user_id: %', new.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error syncing metadata for user_id: % - %', new.id, SQLERRM;
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
