const env = process.env.REACT_APP_ENV || process.env.NODE_ENV;
export const BASE_URL = (() => {
  switch (env) {
    case "development":
      return "http://localhost:8080";
    case "production":
      return "https://divulgaif.com.br";
    case "staging":
      return "https://desenvolvimento.divulgaif.com.br";
    default:
      return "https://desenvolvimento.divulgaif.com.br";
  }
})();
