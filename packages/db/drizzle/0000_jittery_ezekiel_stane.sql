CREATE TABLE "celebrities" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar,
	"life_path" integer NOT NULL,
	"day" integer NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"nationality" varchar,
	"place_of_birth" text,
	"image_url" text,
	"bio" text,
	"categories" text[]
);
