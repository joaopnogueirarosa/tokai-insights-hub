-- Drop existing overly permissive RLS policies
DROP POLICY IF EXISTS "Allow public read access" ON public.atendimentos;
DROP POLICY IF EXISTS "Allow public insert" ON public.atendimentos;
DROP POLICY IF EXISTS "Allow public update" ON public.atendimentos;

-- Create authentication-based RLS policies
CREATE POLICY "Authenticated users can read" 
ON public.atendimentos 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert" 
ON public.atendimentos 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update" 
ON public.atendimentos 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete" 
ON public.atendimentos 
FOR DELETE 
TO authenticated
USING (true);