import { api } from "../utils/api";
import { ENDPOINTS } from "../../enums/endpoints";

export const getLabelsData = async () => {
  try {
    const response = await api.get(ENDPOINTS.DASHBOARD.GET_LABELS);
    return response.data;
  } catch (error) {
    console.error("Error fetching labels data:", error);
    throw error;
  }
};
