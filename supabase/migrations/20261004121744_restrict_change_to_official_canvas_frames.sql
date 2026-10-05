CREATE FUNCTION public.prevent_change_official_frames()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
  IF OLD.user_id IS NULL THEN
    RAISE EXCEPTION 'Change of the official frame is restricted';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END
$function$;

CREATE TRIGGER prevent_official_frames_change
BEFORE DELETE OR UPDATE
ON public.canvas_frames
FOR EACH ROW
EXECUTE FUNCTION public.prevent_change_official_frames();
