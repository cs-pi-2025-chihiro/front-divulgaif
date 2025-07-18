export const ENDPOINTS = {
  WORKS: {
    LIST: "/works/list",
    CREATE: "/works",
    GET_BY_ID: "/works/{id}",
    UPDATE: "/works/{id}",
    DELETE: "/works/{id}",
    UPLOAD_IMAGE: "/works/upload-image",
  },
  AUTHORS: {
    SEARCH: "/authors/list",
    CREATE: "/authors",
  },
  LABELS: {
    LIST: "/labels/list",
    CREATE: "/labels",
  },
  LINKS: {
    LIST: "/links/list",
    CREATE: "/links",
  },
  SUAP: {
    OAUTH: "https://suap.ifpr.edu.br/o/authorize/",
    INFO: "https://suap.ifpr.edu.br/api/eu/",
  },
  USERS: {
    CREATE: "/users",
  },
};
