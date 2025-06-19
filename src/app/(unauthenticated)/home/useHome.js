import { useQuery } from "@tanstack/react-query";
import { listWorks } from "../../../services/works/list";
import { atom, useAtom } from "jotai";
import { ENDPOINTS } from "../../../enums/endpoints";
import { PAGE_SIZE } from "../../../constants";
import { useDebounce } from "@uidotdev/usehooks";

export const pageAtom = atom(0);
export const sizeAtom = atom(PAGE_SIZE);
export const searchAtom = atom("");

export const useHome = (appliedFilters = {}) => {
  const [page] = useAtom(pageAtom);
  const [size] = useAtom(sizeAtom);
  const [search] = useAtom(searchAtom);

  const debouncedSearch = useDebounce(search, 500);

  const fetchWorks = async ({ currentPage, size, filters }) => {
    try {
      const response = await listWorks(currentPage, size, filters);
      return response;
    } catch (err) {
      throw err;
    }
  };

  const combinedFilters = {
    ...appliedFilters,
    ...(debouncedSearch?.trim() && { search: debouncedSearch.trim() }),
  };

  const {
    data: works,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryFn: () =>
      fetchWorks({
        currentPage: page,
        size,
        filters: combinedFilters,
      }),
    queryKey: [
      ENDPOINTS.WORKS.LIST,
      page,
      size,
      debouncedSearch,
      appliedFilters,
    ],
    keepPreviousData: true,
    refetchOnMount: true,
  });

  return {
    works: works?.data?.content || [],
    totalWorks: works?.data?.totalElements || 0,
    totalPages: works?.data?.totalPages || 0,
    isLoading,
    refetch,
    error,
  };
};
