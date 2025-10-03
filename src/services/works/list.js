import { ENDPOINTS } from "../../enums/endpoints";
import api from "../utils/api";

export const listWorks = async (page = 0, size = 8, filters = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (filters.search) {
    params.append("search", filters.search);  
  }

  if (filters.workTypes) {
    const workTypesArray = filters.workTypes.split(",");
    workTypesArray.forEach((workType) => {
      params.append("workType.name", workType);
    });
  }

  if (filters.workStatus) {
    const workStatusArray = filters.workStatus.split(",");
    workStatusArray.forEach((status) => {
      params.append("workStatus.name", status);
    });
  }

  if (filters.order) {
    params.append(
      "sort",
      `createdAt,${filters.order === "desc" ? "desc" : "asc"}`
    );
  }

  if (filters.startDate) {
    params.append("createdAt.goe", `${filters.startDate}T00:00:00`);
  }

  if (filters.endDate) {
    params.append("createdAt.loe", `${filters.endDate}T23:59:59`);
  }

  if (filters.labels) {
    for (const label of filters.labels) {
      params.append("labels.name", label);
    }
  }

  if (filters.startDate) {
    params.append("startDate", filters.startDate);
  }

  if (filters.endDate) {
    params.append("endDate", filters.endDate);
  }

  const result = await api.get(ENDPOINTS.WORKS.LIST + "?" + params);

  return result;
};
