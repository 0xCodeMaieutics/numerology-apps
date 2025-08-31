// "use server";

// import { redisKeys } from "@/utils/redis";
// import { redisClient } from ".";

// export const submitRepoSettingsRequest = async (values: {
//   description: string;
//   organizationId: string;
//   repositoryId: string;
//   userEmail: string;
// }) => {
//   return redisClient.lpush(
//     redisKeys
//       .organization(values.organizationId)
//       .repository(values.repositoryId)
//       .settingsRequests(),
//     { description: values.description, userEmail: values.userEmail }
//   );
// };
