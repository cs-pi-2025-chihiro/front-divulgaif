import { useState, useEffect } from "react";
import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { ENDPOINTS } from "../../../../enums/endpoints";
import { getLabelsData } from "../../../../services/dashboard/getLabels";
import { getAuthorsData } from "../../../../services/dashboard/getAuthors";
import { getDashboardData } from "../../../../services/dashboard/get";
import {
  searchLabels,
  createLabel,
  updateLabel,
  deleteLabel,
} from "../../../../services/labels/list";

const DEFAULT_PAGE_SIZE = 20;
const LABELS_QUERY_KEY = "dashboard_labels";

export const useDashboard = (activeDetailView) => {
  const queryClient = useQueryClient();

  // Pagination and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reset pagination when view changes
  useEffect(() => {
    setCurrentPage(0);
    setSearchTerm("");
  }, [activeDetailView]);

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

  // Labels grid query with pagination and search
  const labelsGridQuery = useQuery({
    queryKey: [LABELS_QUERY_KEY, currentPage, pageSize, debouncedSearchTerm],
    queryFn: () => searchLabels(debouncedSearchTerm, currentPage, pageSize),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    enabled: activeDetailView === "labels",
  });

  // Labels mutations
  const createLabelMutation = useMutation({
    mutationFn: createLabel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LABELS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.DASHBOARD.GET_LABELS],
      });
      queryClient.invalidateQueries({ queryKey: [ENDPOINTS.DASHBOARD.GET] });
    },
  });

  const updateLabelMutation = useMutation({
    mutationFn: (labelData) => updateLabel(labelData.id, labelData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LABELS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.DASHBOARD.GET_LABELS],
      });
      queryClient.invalidateQueries({ queryKey: [ENDPOINTS.DASHBOARD.GET] });
    },
  });

  const deleteLabelMutation = useMutation({
    mutationFn: deleteLabel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LABELS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.DASHBOARD.GET_LABELS],
      });
      queryClient.invalidateQueries({ queryKey: [ENDPOINTS.DASHBOARD.GET] });
    },
  });

  const activeDetailedData =
    activeDetailView === "labels" ? labelsQuery.data : authorsQuery.data;
  const isDetailedLoading =
    activeDetailView === "labels"
      ? labelsQuery.isLoading
      : authorsQuery.isLoading;

  // Labels grid data
  const labels = labelsGridQuery.data?.content ?? [];
  const totalLabelsPages = labelsGridQuery.data?.totalPages ?? 0;
  const totalLabels = labelsGridQuery.data?.totalElements ?? 0;
  const labelsPageNumber = labelsGridQuery.data?.number ?? 0;

  return {
    // Main dashboard data
    dashboardData: mainQuery.data,
    isLoading: mainQuery.isLoading,
    error: mainQuery.error,
    refetch: mainQuery.refetch,
    totalWorksByStatus: mainQuery.data?.totalWorksByStatus || [],
    totalPublishedWorksByLabel:
      mainQuery.data?.totalPublishedWorksByLabel || [],
    totalPublishedWorksByAuthor:
      mainQuery.data?.totalPublishedWorksByAuthor || [],

    // Detailed view data
    isDetailedLoading,
    detailedStats: activeDetailedData,
    detailedList: activeDetailedData?.list || [],

    // Labels grid state
    labels,
    totalLabelsPages,
    totalLabels,
    labelsPageNumber,
    isLabelsGridLoading: labelsGridQuery.isLoading,
    isLabelsGridFetching: labelsGridQuery.isFetching,
    labelsGridError: labelsGridQuery.error,

    // Search and pagination
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,

    // Mutations
    createLabel: createLabelMutation.mutate,
    updateLabel: updateLabelMutation.mutate,
    deleteLabel: deleteLabelMutation.mutate,
    isCreatingLabel: createLabelMutation.isPending,
    isUpdatingLabel: updateLabelMutation.isPending,
    isDeletingLabel: deleteLabelMutation.isPending,
  };
};
