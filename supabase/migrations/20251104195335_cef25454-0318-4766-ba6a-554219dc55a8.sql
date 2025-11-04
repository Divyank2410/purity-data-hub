-- Create app_role enum if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table for proper security
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role)
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.is_user_admin(auth.uid()));

-- Add tracking_number to license_applications if not exists
ALTER TABLE public.license_applications 
ADD COLUMN IF NOT EXISTS tracking_number text UNIQUE;

-- Create function to generate unique tracking number
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_tracking_number text;
  tracking_exists boolean;
BEGIN
  LOOP
    -- Generate format: WL-YYYYMMDD-XXXX (WL = Water License)
    new_tracking_number := 'WL-' || 
                          to_char(now(), 'YYYYMMDD') || '-' || 
                          upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if tracking number already exists
    SELECT EXISTS(
      SELECT 1 FROM public.license_applications 
      WHERE tracking_number = new_tracking_number
    ) INTO tracking_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT tracking_exists;
  END LOOP;
  
  RETURN new_tracking_number;
END;
$$;

-- Create trigger to auto-generate tracking number on insert
CREATE OR REPLACE FUNCTION public.set_tracking_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tracking_number IS NULL THEN
    NEW.tracking_number := public.generate_tracking_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_tracking_number_trigger ON public.license_applications;
CREATE TRIGGER set_tracking_number_trigger
  BEFORE INSERT ON public.license_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tracking_number();

-- Update RLS policies to allow public viewing by tracking number
CREATE POLICY "Public can view application by tracking number"
ON public.license_applications FOR SELECT
USING (true);

-- Create index for faster tracking number lookups
CREATE INDEX IF NOT EXISTS idx_tracking_number 
ON public.license_applications(tracking_number);

-- Migrate existing data - assign default user role to all existing users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT (user_id, role) DO NOTHING;