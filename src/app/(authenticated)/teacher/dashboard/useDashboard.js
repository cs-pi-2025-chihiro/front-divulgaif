import { useQuery, useQueries, keepPreviousData } from "@tanstack/react-query";
import { ENDPOINTS } from "../../../../enums/endpoints";
import { getLabelsData } from "../../../../services/dashboard/getLabels";
import { getAuthorsData } from "../../../../services/dashboard/getAuthors";
import { getDashboardData } from "../../../../services/dashboard/get";

export const useDashboard = (activeDetailView) => {
  const mainQuery = useQuery({
    queryKey: [ENDPOINTS.DASHBOARD.GET],
    queryFn: getDashboardData,
    refetchOnMount: true,
  });

  const [labelsQuery, authorsQuery] = useQueries({
    queries: [
      {
        queryKey: [ENDPOINTS.DASHBOARD.GET_LABELS],
        queryFn: getLabelsData,
        enabled: activeDetailView === "labels",
        placeholderData: keepPreviousData,
      },
      {
        queryKey: [ENDPOINTS.DASHBOARD.GET_AUTHORS],
        queryFn: getAuthorsData,
        enabled: activeDetailView === "authors",
        placeholderData: keepPreviousData,
      },
    ],
  });

  const activeDetailedData =
    activeDetailView === "labels" ? labelsQuery.data : authorsQuery.data;
  const isDetailedLoading =
    activeDetailView === "labels"
      ? labelsQuery.isLoading
      : authorsQuery.isLoading;

  return {
    dashboardData: mainQuery.data,
    isLoading: mainQuery.isLoading,
    error: mainQuery.error,
    refetch: mainQuery.refetch,
    totalWorksByStatus: mainQuery.data?.totalWorksByStatus || [],
    totalPublishedWorksByLabel:
      mainQuery.data?.totalPublishedWorksByLabel || [],
    totalPublishedWorksByAuthor:
      mainQuery.data?.totalPublishedWorksByAuthor || [],

    isDetailedLoading,
    detailedStats: activeDetailedData,
    detailedList: activeDetailedData?.list || [],
  };
};
