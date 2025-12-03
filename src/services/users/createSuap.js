import { ENDPOINTS } from "../../enums/endpoints";
import api from "../utils/api";

export const createSuap = async (userData) => {
  await api.post(ENDPOINTS.USERS.CREATE, {
    name: userData.nome_registro,
    email: userData.email,
    secondaryEmail: userData.email_secundario,
    ra: userData.identificacao,
    avatarUrl: userData.foto,
    userType: userData.tipo_usuario,
  });
};
