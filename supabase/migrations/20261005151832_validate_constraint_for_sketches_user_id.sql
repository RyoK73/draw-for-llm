SET lock_timeout = '5s';

ALTER TABLE public.sketches
	VALIDATE CONSTRAINT sketches_user_id_fkey;
