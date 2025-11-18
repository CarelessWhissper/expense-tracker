export const BASE_URL = process.env.EXPO_PUBLIC_API_ROUTE;

export const AuthRoutes = {
  signup: `${BASE_URL}/register`,
  login: `${BASE_URL}/login`,
};

export const routes = {
  auth: AuthRoutes,
};
