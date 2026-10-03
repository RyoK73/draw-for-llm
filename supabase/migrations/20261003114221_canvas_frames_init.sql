CREATE TABLE public.canvas_frames (
	id UUID
	PRIMARY KEY
	NOT NULL
	DEFAULT gen_random_uuid(),
	user_id UUID
	REFERENCES auth.users ON DELETE CASCADE,
	name TEXT
	NOT NULL
	CHECK (char_length(name) BETWEEN 1 AND 100),
	width INT
	NOT NULL
	CHECK (width BETWEEN 320 AND 1920),
	height INT
	NOT NULL
	CHECK (height BETWEEN 320 AND 1920)
);
-- With user_id null, the records are presented officially. Those with a non-null user_id are made by the user.


-- Index
CREATE INDEX ON public.canvas_frames USING btree (user_id);
CREATE UNIQUE
INDEX "Default_presets_should_have_unique_name"
ON public.canvas_frames
USING btree
(
	name
)
WHERE
	user_id IS NULL;

-- Grant
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.canvas_frames TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.canvas_frames TO service_role;

-- RLS
ALTER TABLE public.canvas_frames
	ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated user can select own canvas_frames"
ON public.canvas_frames
AS permissive
FOR SELECT
TO authenticated
USING (user_id IS NULL OR (SELECT auth.uid()) = user_id);

CREATE POLICY "Authenticated user can insert own canvas_frames"
ON public.canvas_frames
AS permissive
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Authenticated user can update own canvas_frames"
ON public.canvas_frames
AS permissive
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid() = user_id))
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Authenticated user can delete own canvas_frames"
ON public.canvas_frames
AS permissive
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);
