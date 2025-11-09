import { api } from "../utils/api";
import { ENDPOINTS } from "../../enums/endpoints";

export const getAuthorsData = async () => {
  try {
    const response = await api.get(ENDPOINTS.DASHBOARD.GET_AUTHORS);
    return response.data;
  } catch (error) {
    console.error("Error fetching authors data:", error);
    throw error;
  }
};
