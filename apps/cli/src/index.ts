import "dotenv/config";
import { sqlDB } from "@workspace/db/sql";
import { numerology } from "@workspace/utils";

const seed = (cat: string) =>
  [
    {
      id: "9fe99937fef17b4a3a8a6ee6871dca1d",
      name: "James Stephen Donaldson",
      date_of_birth: "May 7, 1998",
      day: 7,
      month: 5,
      year: 1998,
      nationality: "U.S.",
      place_of_birth: "Wichita, Kansas, U.S.",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/MrBeast_2023_%28cropped%29.jpg/250px-MrBeast_2023_%28cropped%29.jpg",
      bio: "Known as MrBeast, James Stephen Donaldson is a prominent YouTuber, businessman, philanthropist, and online influencer, born on May 7, 1998, in Wichita, Kansas. Active since 2012, he has gained immense popularity for his philanthropic endeavors and entertaining content.",
    },
    {
      id: "51f74847cb7da43d93a8c51dafbc320e",
      name: "Andrew Tate",
      date_of_birth: "1 December 1986",
      day: 1,
      month: 12,
      year: 1986,
      nationality: "American, British, Vanuatuan",
      place_of_birth: "Washington, D.C., US",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Andrew_Tate_-_James_Tamim_Upload_%28Cropped_Wide_Portrait%29.png/250px-Andrew_Tate_-_James_Tamim_Upload_%28Cropped_Wide_Portrait%29.png",
      bio: "Businessman, media personality, and kickboxer known for his career in kickboxing, participation in Big Brother, and various criminal charges.",
    },
    {
      id: "0ee78f967a2071b8f2ac06f1a66556c3",
      name: "Sneako",
      date_of_birth: "September 8, 1998",
      day: 8,
      month: 9,
      year: 1998,
      nationality: "American",
      place_of_birth: "New York City, U.S.",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/YouTube_Silver_Play_Button_2.svg/40px-YouTube_Silver_Play_Button_2.svg.png",
      bio: "Online streamer active from 2013 to present. Associated with the Manosphere and Red Pill movement.",
    },
    {
      id: "bf798726372e5a1e323e92fdd5994356",
      name: "Darren Jason Watkins Jr.",
      date_of_birth: "January 21, 2005",
      day: 21,
      month: 1,
      year: 2005,
      nationality: "American",
      place_of_birth: "Cincinnati, Ohio, U.S.",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/IShowSpeed_at_Chinatown_%28Portrait%29_04.jpg/250px-IShowSpeed_at_Chinatown_%28Portrait%29_04.jpg",
      bio: "IShowSpeed is a popular YouTuber, online streamer, and rapper known for his gaming content and energetic personality. He has garnered millions of subscribers and has made a notable impact in the streaming and gaming community.",
    },
    {
      id: "993278c668c4ef3e736ac30543e86bc2",
      name: "Félix Lengyel",
      date_of_birth: "November 12, 1995",
      day: 12,
      month: 11,
      year: 1995,
      nationality: "Canadian",
      place_of_birth: "Laval, Quebec, Canada",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/XQc_July_4_2023.jpg/250px-XQc_July_4_2023.jpg",
      bio: "xQc is a popular Twitch streamer and former Overwatch professional player, known for his energetic personality and engaging content. He has garnered millions of followers across various platforms since he began his streaming career in 2014.",
    },
    {
      id: "0e6e88575cb62398b58d2f1923532af3",
      name: "KSI",
      date_of_birth: "19 June 1993",
      day: 19,
      month: 6,
      year: 1993,
      nationality: "British",
      place_of_birth: "London, England",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/KSI_in_2024.png/250px-KSI_in_2024.png",
      bio: "Born Olajide Olayinka Williams Olatunji Jr., KSI is a multifaceted entertainer, known for his career as a YouTuber, rapper, influencer, boxer, actor, and entrepreneur. He is the founder of several businesses and is the CEO of Misfits Boxing. With a significant following on YouTube and a successful musical career, KSI has made an impact across various entertainment genres.",
    },
    {
      id: "cdd2d827f7e3f31899219049b3f5628b",
      name: "Simon Edward Minter",
      date_of_birth: "1992-09-07",
      day: 7,
      month: 9,
      year: 1992,
      nationality: "English",
      place_of_birth: "Hemel Hempstead, Hertfordshire, England",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Miniminter_in_June_2024_at_Soccer_Aid_2024_charity_match.png/250px-Miniminter_in_June_2024_at_Soccer_Aid_2024_charity_match.png",
      bio: "Miniminter is an influencer and Twitch streamer actively participating in various gaming channels since 2012. He is set to appear as a minter at Soccer Aid 2024 in June 2024.",
    },
    {
      id: "349ac1c99afe90f6552fc88c8fbdbdfb",
      name: "Joshua Bradley",
      date_of_birth: "4 September 1992",
      day: 4,
      month: 9,
      year: 1992,
      nationality: "British",
      place_of_birth: "London, England",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Zerkaa_2018_%28cropped%29.jpg/250px-Zerkaa_2018_%28cropped%29.jpg",
      bio: "Zerkaa, born Joshua Bradley, is a British YouTuber and Twitch streamer known for his gaming content and vlogs. He is associated with the Sidemen group and has been active on YouTube since 2009 and on Twitch since 2010.",
    },
    {
      id: "f1cca5e69404a0c772c1b5ff420912bf",
      name: "Tobit John Brown",
      date_of_birth: "8 April 1993",
      day: 8,
      month: 4,
      year: 1993,
      nationality: "British",
      place_of_birth: "London, England",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/TBJZL_2025.jpg/250px-TBJZL_2025.jpg",
      bio: "TBJZL, also known as Tobjizzle or Tobi Lerone, is a British YouTuber, live streamer, rapper, influencer, and businessman. He has been active since 2005 and is associated with the Sidemen group.",
    },
    {
      id: "bb29b36cb13553216ad1715a97bbc53a",
      name: "Vikram Singh Barn",
      date_of_birth: "1995-08-02",
      day: 2,
      month: 8,
      year: 1995,
      nationality: "British",
      place_of_birth: "Guildford, Surrey, England",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Vikkstar123_2022_%28cropped%29.jpg/330px-Vikkstar123_2022_%28cropped%29.jpg",
      bio: "Vikkstar123 is a British YouTuber, online streamer, DJ, and music producer known for his gaming vlogs. He has been active since 2010 and has amassed over 12 million subscribers.",
    },
  ].map((celebrity) => ({
    ...celebrity,
    category: cat,
  }));

Array.from({ length: 10 }).forEach(async () => {
  const promises = seed("influencer").map((celb) => {
    return sqlDB.client
      .insert(sqlDB.schema.celebrities)
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
