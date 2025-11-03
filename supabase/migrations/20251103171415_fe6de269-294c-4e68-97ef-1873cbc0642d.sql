-- Add public read access policy for amrit_yojna_data
-- This allows the public Home page to display Amrit Yojna data
CREATE POLICY "Public can view amrit yojna data"
ON public.amrit_yojna_data
FOR SELECT
USING (true);