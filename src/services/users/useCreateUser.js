import { ENDPOINTS } from "../../enums/endpoints";
import api from "../utils/api";

export const createSuapUser = async (suapUserData) => {
  await api.post(ENDPOINTS.USERS.CREATE, {
    name: suapUserData.nome_registro,
    email: suapUserData.email,
    secondaryEmail: suapUserData.email_secundario,
    ra: suapUserData.identificacao,
    avatarUrl: suapUserData.foto,
    userType: suapUserData.tipo_usuario,
  });
};
