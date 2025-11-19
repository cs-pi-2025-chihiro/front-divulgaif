export const ENDPOINTS = {
  WORKS: {
    LIST: "/works/list",
    CREATE: "/works",
    GET: "/works",
    GET_BY_ID: "/works/{id}",
    LIST_MY_WORKS: "works/list-my-works",
    UPDATE: "/works/{id}",
    DELETE: "/works/{id}",
    UPLOAD_IMAGE: "/works/upload-image",
    EDIT: "/works/{id}",
    REQUEST_CHANGES: "/works/request-changes",
    PUBLISH: "/works/publish",
  },
  AUTH: {
    LOGIN: "/auth/login",
    OAUTH_LOGIN: "/auth/oauth-login",
    REFRESH: "/auth/refresh-token",
    ME: "/auth/me",
  },
  DASHBOARD: {
    GET: "/dashboards",
    GET_AUTHORS: "/dashboards/authors",
    GET_LABELS: "/dashboards/labels",
  },
  HISTORY: {
    CREATE: "/history",
  },
  AUTHORS: {
    SEARCH: "/authors/list",
    CREATE: "/authors",
    UPDATE: "/authors/{id}",
    DELETE: "/authors/{id}",
  },
  LABELS: {
    LIST: "/labels/list",
    CREATE: "/labels",
    UPDATE: "/labels/{id}",
    DELETE: "/labels/{id}",
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
  STORAGE: {
    UPLOAD: "/storage",
  },
};
