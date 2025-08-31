export type CelebrityCategoryResponse = {
  id: string;
  name: string;
  date_of_birth: string;
  day: number;
  month: number;
  year: number;
  nationality: string;
  place_of_birth: string;
  image_url: string;
  bio: string;
}[];

export type RedisTypes = {
  celebrities: {
    category: {
      response: CelebrityCategoryResponse;
    };
  };
};
