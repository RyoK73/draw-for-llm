CREATE TABLE public.sketches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  title text not null,
  description text,
  canvas_json jsonb not null,
  fabric_version text not null, -- for process of compatibility
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index
CREATE INDEX ON public.sketches USING btree (user_id);

-- Grant
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sketches TO authenticated;

-- RLS
ALTER TABLE public.sketches
	ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated User can operate own sketches"
ON public.sketches
AS permissive
FOR ALL
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END
$function$;

CREATE TRIGGER trg_set_updated_at
BEFORE UPDATE
ON public.sketches
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
