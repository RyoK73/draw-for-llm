SET lock_timeout = '5s';

DROP TRIGGER prevent_official_frames_change ON public.canvas_frames;
DROP FUNCTION prevent_change_official_frames;
