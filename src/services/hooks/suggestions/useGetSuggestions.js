import { searchLabels } from "../../labels/list";
import { searchLinks } from "../../links/list";
import { searchAuthors } from "../../authors/list";

export const useGetSuggestions = () => {
  const getLabelSuggestions = async (searchTerm) => {
    try {
      const result = await searchLabels(searchTerm, 0, 10);
      return result.content;
    } catch (error) {
      console.error("Error fetching label suggestions:", error);
      return [];
    }
  };

  const getLinkSuggestions = async (searchTerm) => {
    try {
      const result = await searchLinks(searchTerm, 0, 10);
      return result.content;
    } catch (error) {
      console.error("Error fetching link suggestions:", error);
      return [];
    }
  };

  const getAuthorSuggestions = async (searchTerm) => {
    try {
      const result = await searchAuthors(searchTerm, 0, 10);
      return result.content;
    } catch (error) {
      console.error("Error fetching author suggestions:", error);
      return [];
    }
  };

  return {
    getLabelSuggestions,
    getLinkSuggestions,
    getAuthorSuggestions,
  };
};
