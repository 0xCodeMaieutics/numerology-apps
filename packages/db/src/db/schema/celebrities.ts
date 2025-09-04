import * as t from "drizzle-orm/pg-core";

export const celebritiesTable = t.pgTable("celebrities", {
  id: t.text().primaryKey(),
  name: t.varchar(),
  lifePath: t.integer("life_path").notNull(),
  birthDay: t.integer("birth_day").notNull(),
  birthMonth: t.integer("birth_month").notNull(),
  birthYear: t.integer("birth_year").notNull(),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
  updatedAt: t.timestamp("updated_at").defaultNow().notNull(),
  nationality: t.varchar(),
  placeOfBirth: t.text("place_of_birth"),
  imageUrl: t.text("image_url"),
  bio: t.text(),
  categories: t.text().array(),
  totalLikes: t.integer("likes").default(0),
  totalComments: t.integer("comments").default(0),
});
