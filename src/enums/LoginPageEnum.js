export const LoginPageEnum = {
  MAIN_TITLE: "DivulgaIF",
  LOGIN_HEADING: "Login",
  LOGIN_SUBHEADING: "Acesse o DivulgaIF:",

  FIELDS: {
    USERNAME: {
      LABEL: "Usuário:",
      NAME: "username",
      PLACEHOLDER: "Digite seu usuário",
      ERROR: "Usuário é obrigatório",
    },
    PASSWORD: {
      LABEL: "Senha:",
      NAME: "password",
      PLACEHOLDER: "Senha",
      ERROR: "Senha é obrigatória",
    },
  },

  BUTTONS: {
    SUBMIT: {
      TEXT: "Login",
      LOADING_TEXT: "Carregando...",
      ARIA_LABEL: "Login no sistema",
    },
    SUAP: {
      TEXT: "SUAP",
      ARIA_LABEL: "Entrar com SUAP",
      URL: "https://suap.ifpr.edu.br",
    },
  },

  MESSAGES: {
    SUCCESS: "Login realizado com sucesso!",
    ERROR: "Falha no login. Verifique suas credenciais.",
    LOGIN_OPTIONS: "Entrar com:",
  },

  CSS_CLASSES: {
    CONTAINER: "divulgaif-login-container",
    CONTENT: "login-content",
    HEADER_WITH_FAVICON: "login-header-with-favicon",
    HEADER: "login-header",
    MAIN_TITLE: "main-title",
    FORM_CONTAINER: "login-form-container",
    HEADING: "login-heading",
    SUBHEADING: "login-subheading",
    FORM: "login-form",
    FORM_GROUP: "form-group",
    INPUT_ERROR: "input-error",
    ERROR_MESSAGE: "error-message",
    SUCCESS_MESSAGE: "success-message",
    LOGIN_OPTIONS: "login-options",
    OPTIONS_DIVIDER: "options-divider",
  },
};

export default LoginPageEnum;
