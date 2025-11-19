import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";
import { searchLinks } from "../../../../services/links/list";

export const pageAtom = atom(0);
export const sizeAtom = atom(20);
export const searchAtom = atom("");

export const useLinks = (filters = {}) => {
  const [currentPage] = useAtom(pageAtom);
  const [currentSize] = useAtom(sizeAtom);
  const [search] = useAtom(searchAtom);
  const [links, setLinks] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalLinks, setTotalLinks] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const response = await searchLinks(search, currentPage, currentSize);
      setLinks(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalLinks(response.totalElements || 0);
    } catch (error) {
      console.error("Error fetching links:", error);
      setLinks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [currentPage, currentSize, search, filters]);

  return {
    links,
    totalPages,
    totalLinks,
    isLoading,
    refetch: fetchLinks,
  };
};
