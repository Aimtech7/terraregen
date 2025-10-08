-- Add username and phone_number to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username text UNIQUE,
ADD COLUMN phone_number text;

-- Add constraints
ALTER TABLE public.profiles
ADD CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30);

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, username, phone_number, location)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'phone_number',
    new.raw_user_meta_data->>'location'
  );
  RETURN new;
END;
$function$;