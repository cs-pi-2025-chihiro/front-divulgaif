import { ENDPOINTS } from "../../enums/endpoints";
import api from "../utils/api";

export const create = async (userData) => {
  return await api.post(ENDPOINTS.USERS.CREATE, {
    name: userData.name,
    email: userData.email,
    password: userData.password,
  });
};
