const isDev = process.env.NODE_ENV === "development";
export const BASE_URL = isDev
  ? "http://localhost:8080"
  : "https://desenvolvimento.divulgaif.com.br";
