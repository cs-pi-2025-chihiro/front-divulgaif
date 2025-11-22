import { useState } from "react";
import {
  listAuthors,
  updateAuthorById,
  deleteAuthorById,
} from "../../../services/authors/authorService";

export const useAuthors = () => {
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAuthors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        size: 8,
      };

      if (searchTerm) {
        params.name = searchTerm;
      }

      const response = await listAuthors(params);
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
    searchTerm,
    setSearchTerm,
    fetchAuthors,
    updateAuthor,
    deleteAuthor,
  };
};