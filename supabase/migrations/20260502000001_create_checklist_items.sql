-- Create checklist_items table to store per-item compliance checklist
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id text NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('Accessibility', 'Policy', 'Technical', 'Content')),
  standard text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  required boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'pass', 'fail', 'review')),
  suggestion text,
  severity text CHECK (severity IN ('critical', 'major', 'minor', 'info')),
  wcag_level text CHECK (wcag_level IN ('A', 'AA', 'AAA')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, project_id)
);

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own checklist items"
  ON public.checklist_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_checklist_items_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_checklist_items_updated
  BEFORE UPDATE ON public.checklist_items
  FOR EACH ROW EXECUTE PROCEDURE public.handle_checklist_items_updated_at();
