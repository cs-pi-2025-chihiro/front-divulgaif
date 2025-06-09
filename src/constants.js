const isDev = process.env.NODE_ENV === "development";
export const BASE_URL = isDev
  ? "http://localhost:8080/api/v1"
  : "https://desenvolvimento.divulgaif.com.br/api/v1";
