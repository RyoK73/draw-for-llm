SET lock_timeout = '5s';

-- This index is for frame_id's "ON DELETE SET NULL".
CREATE INDEX ON public.sketches USING btree (frame_id);
