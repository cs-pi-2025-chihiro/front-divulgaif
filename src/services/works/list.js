import { ENDPOINTS, endpoints } from "../../enums/endpoints";
import api from "../utils/api";

export const listWorks = async (page = 0, size = 8, filters = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (filters.workTypes) {
    params.append("workTypes", filters.workTypes);
  }

  if (filters.keywords) {
    params.append("keywords", filters.keywords);
  }

  if (filters.startDate) {
    params.append("startDate", filters.startDate);
  }

  if (filters.endDate) {
    params.append("endDate", filters.endDate);
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value &&
      !["workTypes", "keywords", "startDate", "endDate"].includes(key)
    ) {
      params.append(key, value);
    }
  });

  const result = await api.get(ENDPOINTS.WORKS.LIST + "?" + params, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return result;
};
