SET lock_timeout = '5s';

ALTER TABLE public.sketches
	ADD COLUMN frame_id UUID,
	ADD COLUMN width INT
		NOT NULL
		CHECK (width BETWEEN 320 AND 1920),
	ADD COLUMN height INT
		NOT NULL
		CHECK (height BETWEEN 320 AND 1920),
	ADD COLUMN cell_size INT
		NOT NULL
		DEFAULT 20
		CHECK (cell_size
		BETWEEN 4
		AND 200 --TODO: 4~200: Provisional value with no particular basis; revisit once real usage data is available.
		),
	ALTER COLUMN title SET DEFAULT 'Untitled',
	ALTER COLUMN canvas_json SET DEFAULT CAST('{}' AS JSONB),
	ADD CONSTRAINT "sketches_frame_id_fkey"
	FOREIGN KEY
	(frame_id)
	REFERENCES public.canvas_frames (id)
	ON DELETE SET NULL
	NOT VALID;
