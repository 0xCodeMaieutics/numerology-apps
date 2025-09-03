#!/usr/bin/env node
import "dotenv/config";
import { db } from "./index.ts";
import { faker } from "@faker-js/faker";

Array.from({ length: 10 }).forEach(async () => {
  await db.client.insert(db.tables.celebrities).values({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    lifePath: faker.number.int({ min: 1, max: 9 }),
    day: faker.date.birthdate({ min: 18, max: 65, mode: "age" }).getDate(),
    month:
      faker.date.birthdate({ min: 18, max: 65, mode: "age" }).getMonth() + 1,
    year: faker.date.birthdate({ min: 18, max: 65, mode: "age" }).getFullYear(),
    bio: faker.person.bio(),
    categories: [faker.person.jobType(), faker.person.jobType()],
    imageUrl: faker.image.avatar(),
    nationality: faker.location.country(),
    placeOfBirth: faker.location.city(),
  });
});

// nvm use 23.9
// chmod +x ./src/seed.ts