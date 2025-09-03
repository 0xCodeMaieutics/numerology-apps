#!/usr/bin/env node
import "dotenv/config";
import { db } from "./index.ts";
import { numerology } from "@workspace/utils/numerology";

const seed = (cat: string) =>
  [
    {
      id: "026ffa0c9f8ebc807284a3e96e5fc8ca",
      name: "Joe Biden",
      date_of_birth: "November 20, 1942",
      day: 20,
      month: 11,
      year: 1942,
      nationality: "U.S.",
      place_of_birth: "Scranton, Pennsylvania, U.S.",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Joe_Biden_presidential_portrait.jpg/250px-Joe_Biden_presidential_portrait.jpg",
      bio: "46th President of the United States in office from January 20, 2021 to January 20, 2025. He was also the 47th Vice President from January 20, 2009 to January 20, 2017, and a United States Senator from Delaware from January 3, 1973 to January 15, 2009.",
    },
    {
      id: "f35befee683f281a9a348968d4ba4a6a",
      name: "Donald John Trump",
      date_of_birth: "1946-06-14",
      day: 14,
      month: 6,
      year: 1946,
      nationality: "U.S.",
      place_of_birth: "Queens, New York City, U.S.",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Official_Presidential_Portrait_of_President_Donald_J._Trump_%282025%29.jpg/250px-Official_Presidential_Portrait_of_President_Donald_J._Trump_%282025%29.jpg",
      bio: "45th & 47th President of the United States; served from January 20, 2017 to January 20, 2021 and assumed office again on January 20, 2025.",
    },
    {
      id: "0384b8815d43f2a96e5f76b565478197",
      name: "Kamala Harris",
      date_of_birth: "1964-10-20",
      day: 20,
      month: 10,
      year: 1964,
      nationality: "U.S.",
      place_of_birth: "Oakland, California, U.S.",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Kamala_Harris_Vice_Presidential_Portrait.jpg/250px-Kamala_Harris_Vice_Presidential_Portrait.jpg",
      bio: "Kamala Harris is the 49th Vice President of the United States, serving since January 20, 2021. She previously served as a United States Senator from California and as the Attorney General of California.",
    },
    {
      id: "e2fd1f768b134ebb86c4b3776be1be8e",
      name: "Bernie Sanders",
      date_of_birth: "September 8, 1941",
      day: 8,
      month: 9,
      year: 1941,
      nationality: "U.S.",
      place_of_birth: "New York City, U.S.",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Bernie_Sanders_in_March_2020.jpg/250px-Bernie_Sanders_in_March_2020.jpg",
      bio: "United States Senator from Vermont since January 3, 2007. Previously served as a member of the U.S. House of Representatives from 1991 to 2007 and as the 37th Mayor of Burlington from 1981 to 1989.",
    },
    {
      id: "c51233079eaa59e0a81716db51e9370b",
      name: "Elizabeth Warren",
      date_of_birth: "June 22, 1949",
      day: 22,
      month: 6,
      year: 1949,
      nationality: "American",
      place_of_birth: "Oklahoma City, Oklahoma, U.S.",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Elizabeth_Warren%2C_official_portrait%2C_114th_Congress.jpg/250px-Elizabeth_Warren%2C_official_portrait%2C_114th_Congress.jpg",
      bio: "Elizabeth Warren is an American politician and academic serving as the Senior United States Senator from Massachusetts since 2013. She is a member of the Democratic Party and has previously held significant positions such as Vice Chair of the Senate Democratic Caucus and Special Advisor for the Consumer Financial Protection Bureau.",
    },
    {
      id: "f456cbf4a943c4386cfbe2b2aa76b3e3",
      name: "Ted Cruz",
      date_of_birth: "December 22, 1970",
      day: 22,
      month: 12,
      year: 1970,
      nationality: "United States",
      place_of_birth: "Calgary, Alberta, Canada",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Ted_Cruz_official_116th_portrait_%28center_crop%29.jpg/250px-Ted_Cruz_official_116th_portrait_%28center_crop%29.jpg",
      bio: "Ted Cruz is a United States Senator from Texas, assumed office on January 3, 2013. He served as the 3rd Solicitor General of Texas from January 9, 2003, to May 12, 2008, and has held various positions in the Senate including Chair and Ranking Member of the Senate Commerce Committee.",
    },
    {
      id: "f85419b5c3973df4a616c947d93f13df",
      name: "Nikki Haley",
      date_of_birth: "January 20, 1972",
      day: 20,
      month: 1,
      year: 1972,
      nationality: "U.S.",
      place_of_birth: "Bamberg, South Carolina, U.S.",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Nikki_Haley_official_photo.jpg/250px-Nikki_Haley_official_photo.jpg",
      bio: "Nikki Haley is the 29th United States Ambassador to the United Nations, serving from January 27, 2017, to December 31, 2018, under President Donald Trump. She previously served as the 116th Governor of South Carolina from January 12, 2011, to January 24, 2017, and was a member of the South Carolina House of Representatives from the 87th district from January 11, 2005, to January 11, 2011.",
    },
    {
      id: "f73503e42fce65451e507e518bf84394",
      name: "Andrew Yang",
      date_of_birth: "1975-01-13",
      day: 13,
      month: 1,
      year: 1975,
      nationality: "American",
      place_of_birth: "Schenectady, New York, U.S.",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Andrew_Yang_November_2023.jpg/250px-Andrew_Yang_November_2023.jpg",
      bio: "Chair of the Forward Party since July 28, 2022. Previously a member of the Democratic Party from 1995 to 2021. Married to Evelyn Lu since 2011, with two children.",
    },
    {
      id: "b6d6c06c7c896a66cf71ff576a89ffe1",
      name: "Tulsi Gabbard",
      date_of_birth: "1981-04-12",
      day: 12,
      month: 4,
      year: 1981,
      nationality: "American",
      place_of_birth: "Leloaloa, American Samoa",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Director_Tulsi_Gabbard_Official_Portrait.jpg/250px-Director_Tulsi_Gabbard_Official_Portrait.jpg",
      bio: "Tulsi Gabbard is the 8th Director of National Intelligence, having assumed office on February 12, 2025. She was previously a member of the U.S. House of Representatives from Hawaii's 2nd district from January 3, 2013, to January 3, 2021, and has held various other political positions including Vice Chair of the Democratic National Committee. Gabbard has served in the United States Army and continues to serve as a Lieutenant Colonel.",
    },
  ].map((celebrity) => ({
    ...celebrity,
    category: cat,
  }));

Array.from({ length: 10 }).forEach(async () => {
  const promises = seed("politics").map((celb) => {
    return db.client
      .insert(db.tables.celebrities)
      .values({
        id: celb.id,
        name: celb.name,

        lifePath: numerology.calculateLifePath(
          celb.day.toString(),
          celb.month.toString(),
          celb.year.toString()
        ),
        birthDay: celb.day,
        birthMonth: celb.month,
        birthYear: celb.year,
        bio: celb.bio,
        categories: [celb.category],
        imageUrl: celb.image_url,
        nationality: celb.nationality,
        placeOfBirth: celb.place_of_birth,
      })
      .onConflictDoNothing();
  });

  await Promise.all(promises);
});

// nvm use 23.9
// chmod +x ./src/seed.ts
