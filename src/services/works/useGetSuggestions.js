import { useLabels } from "./useLabels";
import { useLinks } from "./useLinks";
import { useAuthors } from "./useAuthors";

export const useGetSuggestions = () => {
  const { searchLabels } = useLabels();
  const { searchLinks } = useLinks();
  const { searchAuthors } = useAuthors();

  const getLabelSuggestions = async (searchTerm) => {
    try {
      const result = await searchLabels(searchTerm, 0, 10);
      return result.content;
    } catch (error) {
      console.error("Erro ao buscar sugestões de labels:", error);
      return [];
    }
  };

  const getLinkSuggestions = async (searchTerm) => {
    try {
      const result = await searchLinks(searchTerm, 0, 10);
      return result.content;
    } catch (error) {
      console.error("Erro ao buscar sugestões de links:", error);
      return [];
    }
  };

  const getAuthorSuggestions = async (searchTerm) => {
    try {
      const result = await searchAuthors(searchTerm, 0, 10);
      return result.content;
    } catch (error) {
      console.error("Erro ao buscar sugestões de autores:", error);
      return [];
    }
  };

  return {
    getLabelSuggestions,
    getLinkSuggestions,
    getAuthorSuggestions,
  };
};
