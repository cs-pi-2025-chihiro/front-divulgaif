const env = process.env.REACT_APP_ENV || process.env.NODE_ENV;
export const BASE_URL = (() => {
  switch (env) {
    case "development":
      return "https://desenvolvimento.divulgaif.com.br/api/v1";
    case "production":
      return "https://desenvolvimento.divulgaif.com.br/api/v1";
    case "staging":
      return "https://desenvolvimento.divulgaif.com.br/api/v1";
    default:
      return "https://desenvolvimento.divulgaif.com.br/api/v1";
  }
})();
export const PAGE_SIZE = 8;
