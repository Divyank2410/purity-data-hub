-- Create license applications table
CREATE TABLE public.license_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  applicant_name text NOT NULL,
  mobile_number text NOT NULL,
  email text NOT NULL,
  shop_registration_number text NOT NULL,
  status text NOT NULL DEFAULT 'submitted',
  documents_url text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create licenses table
CREATE TABLE public.licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.license_applications ON DELETE CASCADE NOT NULL UNIQUE,
  license_number text NOT NULL UNIQUE,
  approval_date date NOT NULL,
  expiry_date date NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create license notifications table
CREATE TABLE public.license_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id uuid REFERENCES public.licenses ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  notification_type text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.license_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for license_applications
CREATE POLICY "Users can insert their own applications"
  ON public.license_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own applications"
  ON public.license_applications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
  ON public.license_applications
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update applications"
  ON public.license_applications
  FOR UPDATE
  USING (is_admin(auth.uid()));

-- RLS Policies for licenses
CREATE POLICY "Users can view their own licenses"
  ON public.licenses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all licenses"
  ON public.licenses
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert licenses"
  ON public.licenses
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update licenses"
  ON public.licenses
  FOR UPDATE
  USING (is_admin(auth.uid()));

-- RLS Policies for license_notifications
CREATE POLICY "Users can view their own notifications"
  ON public.license_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.license_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications"
  ON public.license_notifications
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert notifications"
  ON public.license_notifications
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_license_applications_updated_at
  BEFORE UPDATE ON public.license_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at
  BEFORE UPDATE ON public.licenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for license documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('license-documents', 'license-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for license documents
CREATE POLICY "Users can upload their license documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'license-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own license documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'license-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all license documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'license-documents' AND
    is_admin(auth.uid())
  );