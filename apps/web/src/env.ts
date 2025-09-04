// src/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
    /*
     * Serverside Environment variables, not available on the client.
     * Will throw if you access these variables on the client.
     */
    server: {
        DATABASE_URL: z.string().url(),
        UPSTASH_TOKEN: z.string(),

        BETTER_AUTH_SECRET: z.string(),
        BETTER_AUTH_URL: z.string().url(),

        GOOGLE_CLIENT_ID: z.string(),
        GOOGLE_CLIENT_SECRET: z.string(),
    },
    /*
     * Environment variables available on the client (and server).
     *
     * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
     */
    client: {},
    /*
     * Specify what values should be validated by your schemas above.
     *
     * If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
     * For Next.js >= 13.4.4, you can use the experimental__runtimeEnv option and
     * only specify client-side variables.
     */
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        UPSTASH_TOKEN: process.env.UPSTASH_TOKEN,

        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,

        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    },
    // experimental__runtimeEnv: {
    //   NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
    // }
});
