import { QueryClient, isServer } from '@tanstack/react-query';

const STALE_TIME = 60 * 1000; // 1 minute
let browserQueryClient: QueryClient | undefined = undefined;

const makeQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: STALE_TIME,
            },
        },
    });

export const getQueryClient = () => {
    if (isServer) return makeQueryClient();
    else {
        if (!browserQueryClient) browserQueryClient = makeQueryClient();
        return browserQueryClient;
    }
};
