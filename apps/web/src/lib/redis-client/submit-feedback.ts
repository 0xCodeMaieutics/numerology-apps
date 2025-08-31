// "use server";

// import { redisKeys } from "@/utils/redis";
// import { redisClient } from ".";

// export const submitFeedback = async ({
//   description,
//   pathname,
//   userEmail,
// }: {
//   description: string;
//   pathname: string;
//   userEmail: string;
// }) => {
//   return redisClient.lpush(redisKeys.feedback, {
//     description,
//     pathname,
//     userEmail,
//   });
// };
