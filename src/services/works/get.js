import { ENDPOINTS } from "../../enums/endpoints";
import api from "../utils/api";

export const getWork = async (id) => {
  const result = await api.get(ENDPOINTS.WORKS.GET + "/" + id, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return result.data;
};
