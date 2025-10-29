-- Fix: Update admin user profile to have admin role
-- The user with email admin@gmail.com needs admin role to access admin features

UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'dea73b8b-a926-47fd-a43d-a06a88dd8a6c';