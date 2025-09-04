export const navigation = {
    login: {
        page: '/login',
        redirect: (page: string) => `/login?redirect=${page}`,
    },
    profile: {
        page: '/profile',
    },
    home: {
        page: '/',
    },
    settings: {
        page: '/settings',
    },
    explore: {
        page: '/explore',
    },
    celebrity: {
        detail: (id: string) => `/celebrity/${id}`,
    },
};
