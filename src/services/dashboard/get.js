import { api } from "../utils/api";
import { ENDPOINTS } from "../../enums/endpoints";

export const getDashboardData = async () => {
  try {
    const response = await api.get(ENDPOINTS.DASHBOARD.GET);
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};
