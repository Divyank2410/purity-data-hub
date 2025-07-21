-- Add RLS policy to allow admins to update lab test records with test parameters
CREATE POLICY "Admins can update lab test parameters" 
ON public.lab_tests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);