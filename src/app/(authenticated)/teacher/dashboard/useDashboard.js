import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "../../../../services/dashboard/getDashboardData";
import { ENDPOINTS } from "../../../../enums/endpoints";

export const useDashboard = () => {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [ENDPOINTS.DASHBOARD.GET],
    queryFn: getDashboardData,
    refetchOnMount: true,
  });

  return {
    dashboardData,
    isLoading,
    error,
    refetch,
    totalWorksByStatus: dashboardData?.totalWorksByStatus || [],
    totalPublishedWorksByLabel: dashboardData?.totalPublishedWorksByLabel || [],
    totalPublishedWorksByAuthor:
      dashboardData?.totalPublishedWorksByAuthor || [],
  };
};
