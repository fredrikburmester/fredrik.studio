import { isAuthenticated } from "../../utils/auth";

export default defineEventHandler((event) => {
  return { authenticated: isAuthenticated(event) };
});
