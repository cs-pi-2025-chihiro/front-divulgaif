const env = process.env.REACT_APP_ENV || process.env.NODE_ENV;
export const BASE_URL = (() => {
  switch (env) {
    case "development":
      return "http://localhost:8081/api/v1";
    case "production":
      return "https://divulgaif.com.br/api/v1";
    case "staging":
      return "https://desenvolvimento.divulgaif.com.br/api/v1";
    default:
      return "https://desenvolvimento.divulgaif.com.br/api/v1";
  }
})();
export const PAGE_SIZE = 8;
export const aboutWebsite =
  "https://chihiro-front.s3.sa-east-1.amazonaws.com/team-chihiro-front/sobre-produto-eduardo/pagina.html";

export const SUAP_CREDENTIALS = {
  clientId: process.env.REACT_APP_SUAP_CLIENT_ID,
  scope: process.env.REACT_APP_SUAP_SCOPE,
  provider: process.env.REACT_APP_SUAP_PROVIDER,
};
