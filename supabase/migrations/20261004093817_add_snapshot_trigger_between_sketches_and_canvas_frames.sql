SET lock_timeout = '5s';

CREATE FUNCTION public.sketches_apply_frame()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
AS $function$
DECLARE
  frame_id_given boolean;
  size_given boolean;
  frame_rec record;
BEGIN
  -- Determine whether each value was "given".
  -- INSERT checks for presence; UPDATE compares against OLD.
  IF TG_OP = 'INSERT' THEN
    IF (NEW.width IS NULL) <> (NEW.height IS NULL) THEN
      RAISE EXCEPTION 'width and height must be specified together';
    END IF;
    frame_id_given := NEW.frame_id IS NOT NULL;
    size_given := NEW.width IS NOT NULL;
  ELSE
    frame_id_given := NEW.frame_id IS NOT NULL
      AND NEW.frame_id IS DISTINCT FROM OLD.frame_id;
    size_given := NEW.width IS DISTINCT FROM OLD.width
      OR NEW.height IS DISTINCT FROM OLD.height;
  END IF;

  -- Nothing was given
  IF NOT frame_id_given AND NOT size_given THEN
    IF TG_OP = 'UPDATE' THEN
      RETURN NEW;
    END IF;

    SELECT id, width, height
      INTO frame_rec
      FROM public.canvas_frames
      WHERE name = 'desktop_fhd';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'canvas_frame desktop_fhd not found';
    END IF;

    NEW.frame_id := frame_rec.id;
    NEW.width := frame_rec.width;
    NEW.height := frame_rec.height;
    RETURN NEW;
  END IF;

  -- If frame_id was given, fetch the frame
  IF frame_id_given THEN
    SELECT id, width, height
      INTO frame_rec
      FROM public.canvas_frames
      WHERE id = NEW.frame_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'canvas_frame % not found', NEW.frame_id;
    END IF;
  END IF;

  IF size_given THEN
    -- If width / height were given, they take precedence
    IF frame_id_given THEN
      IF frame_rec.width <> NEW.width OR frame_rec.height <> NEW.height THEN
        NEW.frame_id := NULL;
      END IF;
    ELSE
      NEW.frame_id := NULL;
    END IF;
  ELSE
    -- Only frame_id was given: copy the preset values
    NEW.width := frame_rec.width;
    NEW.height := frame_rec.height;
  END IF;

  RETURN NEW;
END
$function$;

CREATE TRIGGER sketches_apply_frame
BEFORE INSERT OR UPDATE OF frame_id,
width,
height
ON public.sketches
FOR EACH ROW
EXECUTE FUNCTION public.sketches_apply_frame();
