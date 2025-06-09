import api from "../utils/api";

export const createSuapUser = async (suapUserData) => {
  await api.post(
    "/users",
    {
      name: suapUserData.nome_registro,
      email: suapUserData.email,
      secondaryEmail: suapUserData.email_secundario,
      ra: suapUserData.identificacao,
      avatarUrl: suapUserData.foto,
      userType: suapUserData.tipo_usuario,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
