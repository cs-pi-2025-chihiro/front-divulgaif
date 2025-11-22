import { useState } from "react";
import {
  getAuthors,
  updateAuthorById,
  deleteAuthorById,
} from "../../../../../services/authors/authorService";

export const AUTHORS_PAGE_SIZE_OPTIONS = [10, 20, 50];
export const DEFAULT_AUTHORS_PAGE_SIZE = 10;

export const useAuthors = () => {
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_AUTHORS_PAGE_SIZE);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAuthors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
      };

      if (searchTerm) {
        params.name = searchTerm;
      }

      const response = await getAuthors(params);
      setAuthors(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAuthor = async (authorId, authorData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await updateAuthorById(authorId, authorData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAuthor = async (authorId) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteAuthorById(authorId);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    authors,
    isLoading,
    error,
    totalPages,
    totalElements,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    fetchAuthors,
    updateAuthor,
    deleteAuthor,
  };
};
