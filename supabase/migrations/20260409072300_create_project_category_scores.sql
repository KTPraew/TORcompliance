-- Create project_category_scores table to store per-category compliance scores
CREATE TABLE IF NOT EXISTS public.project_category_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('Accessibility', 'Policy', 'Technical', 'Content')),
  score integer NOT NULL DEFAULT 0,
  passed integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0,
  review integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, category)
);

ALTER TABLE public.project_category_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own project category scores"
  ON public.project_category_scores FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own project category scores"
  ON public.project_category_scores FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own project category scores"
  ON public.project_category_scores FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = auth.uid()
  ));
