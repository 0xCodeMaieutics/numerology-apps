import { redis } from "@/lib/redis-client";

const responses = {
  400: new Response("Bad request", {
    status: 400,
  }),
  404: new Response("Not Found", {
    status: 404,
  }),
  500: new Response("Internal Server Error", {
    status: 500,
  }),
};

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    if (!category) return responses[400];
    const result = await redis.read.celebrities.category(category);
    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    return responses[500];
  }
};
