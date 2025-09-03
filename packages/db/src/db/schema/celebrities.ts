import * as t from "drizzle-orm/pg-core";

export const celebritiesTable = t.pgTable("celebrities", {
  id: t.text().primaryKey(),
  name: t.varchar(),
  lifePath: t.integer("life_path").notNull(),
  day: t.integer().notNull(),
  month: t.integer().notNull(),
  year: t.integer().notNull(),
  nationality: t.varchar(),
  placeOfBirth: t.text("place_of_birth"),
  imageUrl: t.text("image_url"),
  bio: t.text(),
  categories: t.text().array(),
});
