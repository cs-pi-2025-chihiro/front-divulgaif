import { useQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "../../../../enums/endpoints";
import { getWork } from "../../../../services/works/get";

const fetchWork = async ({ id }) => {
  try {
    const response = await getWork(id);
    return response;
  } catch (err) {
    throw err;
  }
};

export const useWork = ({ id }) => {
  const {
    data: work,
    isLoading,
    error,
  } = useQuery({
    queryFn: () => fetchWork({ id }),
    queryKey: [ENDPOINTS.WORKS.GET],
    keepPreviousData: true,
  });

  return { work, isLoading, error };
};
