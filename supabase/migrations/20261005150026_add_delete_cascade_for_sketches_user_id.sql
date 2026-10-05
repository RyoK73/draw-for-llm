SET lock_timeout = '5s';

ALTER TABLE public.sketches
	DROP CONSTRAINT sketches_user_id_fkey,
	ADD CONSTRAINT "sketches_user_id_fkey"
	FOREIGN KEY
	(user_id)
	REFERENCES auth.users (id)
	ON DELETE CASCADE
	NOT VALID;
