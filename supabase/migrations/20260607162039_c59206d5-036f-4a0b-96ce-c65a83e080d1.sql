
-- inspections
CREATE TABLE public.inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  route_name text NOT NULL,
  total_defects integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inspections TO authenticated;
GRANT ALL ON public.inspections TO service_role;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own inspections" ON public.inspections FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- defects
CREATE TABLE public.defects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inspection_id uuid REFERENCES public.inspections(id) ON DELETE CASCADE,
  defect_type text NOT NULL,
  severity text NOT NULL,
  confidence numeric NOT NULL DEFAULT 0,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.defects TO authenticated;
GRANT ALL ON public.defects TO service_role;
ALTER TABLE public.defects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own defects" ON public.defects FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- maintenance_tickets
CREATE TABLE public.maintenance_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  defect_id uuid REFERENCES public.defects(id) ON DELETE CASCADE,
  assigned_team text NOT NULL,
  priority text NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_tickets TO authenticated;
GRANT ALL ON public.maintenance_tickets TO service_role;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tickets" ON public.maintenance_tickets FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_defects_user ON public.defects(user_id);
CREATE INDEX idx_defects_inspection ON public.defects(inspection_id);
CREATE INDEX idx_tickets_user ON public.maintenance_tickets(user_id);
CREATE INDEX idx_inspections_user ON public.inspections(user_id);
