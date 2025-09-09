export const API_RESPONSE = {
    400: (message = 'Bad request') =>
        new Response(message, {
            status: 400,
        }),
    404: (message = 'Not Found') =>
        new Response(message, {
            status: 404,
        }),
    500: (message = 'Internal Server Error') =>
        new Response(message, {
            status: 500,
        }),
};
