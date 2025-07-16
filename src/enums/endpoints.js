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
    SEARCH: "/authors/search",
    CREATE: "/authors",
  },
  LABELS: {
    LIST: "/labels",
    CREATE: "/labels",
  },
  SUAP: {
    OAUTH: "https://suap.ifpr.edu.br/o/authorize/",
    INFO: "https://suap.ifpr.edu.br/api/eu/",
  },
  USERS: {
    CREATE: "/users",
  },
};
