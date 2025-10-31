import { useState, useEffect, useCallback } from "react";
import { searchAuthors } from "../../../../services/authors/list";

export const useAuthors = () => {
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAuthors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await searchAuthors(searchTerm, page);
      setAuthors(result.content);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, page]);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(0); // Reset page on new search
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return {
    authors,
    isLoading,
    error,
    searchTerm,
    page,
    totalPages,
    handleSearch,
    handlePageChange,
    fetchAuthors, // Expose fetchAuthors to allow manual refresh after update/delete
  };
};
