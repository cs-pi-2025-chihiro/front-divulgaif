import {
  mapPaginationValues,
  navigateTo,
  getStatusColor,
  getWorkTypes,
  getWorkStatus,
  isTeacher,
  mapStatusToBackend,
  mapWorkTypeToBackend,
  isValidEmail,
  formatAuthorsForBackend,
  formatLabelsForBackend,
  formatLinksForBackend,
} from "./utils";

jest.mock("../hooks/auth/useAuth", () => ({
  hasRole: jest.fn(),
}));

import { hasRole } from "../hooks/auth/useAuth";

describe("utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("mapPaginationValues", () => {
    test("sets size to 8 for 'eight'", () => {
      const setSize = jest.fn();
      mapPaginationValues("eight", setSize);
      expect(setSize).toHaveBeenCalledWith(8);
    });

    test("sets size to 12 for 'twelve'", () => {
      const setSize = jest.fn();
      mapPaginationValues("twelve", setSize);
      expect(setSize).toHaveBeenCalledWith(12);
    });

    test("sets size to 24 for 'twentyfour'", () => {
      const setSize = jest.fn();
      mapPaginationValues("twentyfour", setSize);
      expect(setSize).toHaveBeenCalledWith(24);
    });

    test("sets size to 36 for 'thirtysix'", () => {
      const setSize = jest.fn();
      mapPaginationValues("thirtysix", setSize);
      expect(setSize).toHaveBeenCalledWith(36);
    });

    test("does not call setSize for unknown value", () => {
      const setSize = jest.fn();
      mapPaginationValues("unknown", setSize);
      expect(setSize).not.toHaveBeenCalled();
    });
  });

  describe("navigateTo", () => {
    test("navigates with leading slash stripped", () => {
      const navigate = jest.fn();
      navigateTo("/about", navigate, "pt");
      expect(navigate).toHaveBeenCalledWith("/pt/about");
    });

    test("navigates without leading slash", () => {
      const navigate = jest.fn();
      navigateTo("about", navigate, "pt");
      expect(navigate).toHaveBeenCalledWith("/pt/about");
    });

    test("navigates to language root when path is empty", () => {
      const navigate = jest.fn();
      navigateTo("", navigate, "pt");
      expect(navigate).toHaveBeenCalledWith("/pt");
    });

    test("uses 'pt' as default language", () => {
      const navigate = jest.fn();
      navigateTo("home", navigate);
      expect(navigate).toHaveBeenCalledWith("/pt/home");
    });

    test("respects 'en' language", () => {
      const navigate = jest.fn();
      navigateTo("home", navigate, "en");
      expect(navigate).toHaveBeenCalledWith("/en/home");
    });

    test("navigates to language root when path is just a slash", () => {
      const navigate = jest.fn();
      navigateTo("/", navigate, "pt");
      expect(navigate).toHaveBeenCalledWith("/pt");
    });
  });

  describe("getStatusColor", () => {
    test("returns 'status-aprovado' for 'Aprovado'", () => {
      expect(getStatusColor("Aprovado")).toBe("status-aprovado");
    });

    test("returns 'status-enviado' for 'Enviado'", () => {
      expect(getStatusColor("Enviado")).toBe("status-enviado");
    });

    test("returns 'status-rascunho' for 'Rascunho'", () => {
      expect(getStatusColor("Rascunho")).toBe("status-rascunho");
    });

    test("returns 'status-rejeitado' for 'Rejeitado'", () => {
      expect(getStatusColor("Rejeitado")).toBe("status-rejeitado");
    });

    test("returns 'status-default' for unknown status", () => {
      expect(getStatusColor("Unknown")).toBe("status-default");
    });

    test("returns 'status-default' for undefined", () => {
      expect(getStatusColor(undefined)).toBe("status-default");
    });
  });

  describe("getWorkTypes", () => {
    test("returns 'Artigo' for ARTICLE in pt", () => {
      expect(getWorkTypes("ARTICLE", "pt")).toBe("Artigo");
    });

    test("returns 'Article' for ARTICLE in en", () => {
      expect(getWorkTypes("ARTICLE", "en")).toBe("Article");
    });

    test("returns 'Pesquisa' for SEARCH in pt", () => {
      expect(getWorkTypes("SEARCH", "pt")).toBe("Pesquisa");
    });

    test("returns 'Search' for SEARCH in en", () => {
      expect(getWorkTypes("SEARCH", "en")).toBe("Search");
    });

    test("returns 'Dissertação' for DISSERTATION in pt", () => {
      expect(getWorkTypes("DISSERTATION", "pt")).toBe("Dissertação");
    });

    test("returns 'Dissertation' for DISSERTATION in en", () => {
      expect(getWorkTypes("DISSERTATION", "en")).toBe("Dissertation");
    });

    test("returns 'Extensão' for EXTENSION in pt", () => {
      expect(getWorkTypes("EXTENSION", "pt")).toBe("Extensão");
    });

    test("returns 'Extension' for EXTENSION in en", () => {
      expect(getWorkTypes("EXTENSION", "en")).toBe("Extension");
    });

    test("returns 'TCC' for FINAL_THESIS in pt", () => {
      expect(getWorkTypes("FINAL_THESIS", "pt")).toBe("TCC");
    });

    test("returns 'Final Thesis' for FINAL_THESIS in en", () => {
      expect(getWorkTypes("FINAL_THESIS", "en")).toBe("Final Thesis");
    });

    test("returns 'Projeto' for OTHER in pt", () => {
      expect(getWorkTypes("OTHER", "pt")).toBe("Projeto");
    });

    test("returns 'Project' for OTHER in en", () => {
      expect(getWorkTypes("OTHER", "en")).toBe("Project");
    });

    test("returns 'Desconhecido' for unknown type in pt", () => {
      expect(getWorkTypes("UNKNOWN", "pt")).toBe("Desconhecido");
    });

    test("returns 'Unknown' for unknown type in en", () => {
      expect(getWorkTypes("UNKNOWN", "en")).toBe("Unknown");
    });
  });

  describe("getWorkStatus", () => {
    test("returns 'Rascunho' for DRAFT in pt", () => {
      expect(getWorkStatus("DRAFT", "pt")).toBe("Rascunho");
    });

    test("returns 'Draft' for DRAFT in en", () => {
      expect(getWorkStatus("DRAFT", "en")).toBe("Draft");
    });

    test("returns 'Enviado' for SUBMITTED in pt", () => {
      expect(getWorkStatus("SUBMITTED", "pt")).toBe("Enviado");
    });

    test("returns 'Sent' for SUBMITTED in en", () => {
      expect(getWorkStatus("SUBMITTED", "en")).toBe("Sent");
    });

    test("returns 'Aprovado' for PENDING_CHANGES in pt", () => {
      expect(getWorkStatus("PENDING_CHANGES", "pt")).toBe("Aprovado");
    });

    test("returns 'Approved' for PENDING_CHANGES in en", () => {
      expect(getWorkStatus("PENDING_CHANGES", "en")).toBe("Approved");
    });

    test("returns 'Publicado' for PUBLISHED in pt", () => {
      expect(getWorkStatus("PUBLISHED", "pt")).toBe("Publicado");
    });

    test("returns 'Published' for PUBLISHED in en", () => {
      expect(getWorkStatus("PUBLISHED", "en")).toBe("Published");
    });

    test("returns 'Rejeitado' for REJECTED in pt", () => {
      expect(getWorkStatus("REJECTED", "pt")).toBe("Rejeitado");
    });

    test("returns 'Rejected' for REJECTED in en", () => {
      expect(getWorkStatus("REJECTED", "en")).toBe("Rejected");
    });

    test("returns 'Desconhecido' for unknown status in pt", () => {
      expect(getWorkStatus("UNKNOWN", "pt")).toBe("Desconhecido");
    });

    test("returns 'Unknown' for unknown status in en", () => {
      expect(getWorkStatus("UNKNOWN", "en")).toBe("Unknown");
    });
  });

  describe("isTeacher", () => {
    test("returns true when hasRole returns true", () => {
      hasRole.mockReturnValue(true);
      expect(isTeacher()).toBe(true);
      expect(hasRole).toHaveBeenCalledWith("IS_TEACHER");
    });

    test("returns false when hasRole returns false", () => {
      hasRole.mockReturnValue(false);
      expect(isTeacher()).toBe(false);
      expect(hasRole).toHaveBeenCalledWith("IS_TEACHER");
    });
  });

  describe("mapStatusToBackend", () => {
    test("maps 'draft' to 'DRAFT'", () => {
      expect(mapStatusToBackend("draft")).toBe("DRAFT");
    });

    test("maps 'submitted' to 'SUBMITTED'", () => {
      expect(mapStatusToBackend("submitted")).toBe("SUBMITTED");
    });

    test("maps 'published' to 'PUBLISHED'", () => {
      expect(mapStatusToBackend("published")).toBe("PUBLISHED");
    });

    test("maps 'pending_changes' to 'PENDING_CHANGES'", () => {
      expect(mapStatusToBackend("pending_changes")).toBe("PENDING_CHANGES");
    });

    test("maps 'rejected' to 'REJECTED'", () => {
      expect(mapStatusToBackend("rejected")).toBe("REJECTED");
    });

    test("maps uppercase 'DRAFT' to 'DRAFT' via toLowerCase", () => {
      expect(mapStatusToBackend("DRAFT")).toBe("DRAFT");
    });

    test("returns 'DRAFT' for unknown status", () => {
      expect(mapStatusToBackend("unknown")).toBe("DRAFT");
    });

    test("returns 'DRAFT' for null", () => {
      expect(mapStatusToBackend(null)).toBe("DRAFT");
    });

    test("returns 'DRAFT' for undefined", () => {
      expect(mapStatusToBackend(undefined)).toBe("DRAFT");
    });
  });

  describe("mapWorkTypeToBackend", () => {
    test("maps 'ARTICLE' to 'ARTICLE'", () => {
      expect(mapWorkTypeToBackend("ARTICLE")).toBe("ARTICLE");
    });

    test("maps 'RESEARCH' to 'SEARCH'", () => {
      expect(mapWorkTypeToBackend("RESEARCH")).toBe("SEARCH");
    });

    test("maps 'DISSERTATION' to 'DISSERTATION'", () => {
      expect(mapWorkTypeToBackend("DISSERTATION")).toBe("DISSERTATION");
    });

    test("maps 'EXTENSION' to 'EXTENSION'", () => {
      expect(mapWorkTypeToBackend("EXTENSION")).toBe("EXTENSION");
    });

    test("maps 'FINAL_THESIS' to 'FINAL_THESIS'", () => {
      expect(mapWorkTypeToBackend("FINAL_THESIS")).toBe("FINAL_THESIS");
    });

    test("returns the original value for unknown work type", () => {
      expect(mapWorkTypeToBackend("OTHER")).toBe("OTHER");
    });

    test("returns undefined for undefined input", () => {
      expect(mapWorkTypeToBackend(undefined)).toBeUndefined();
    });
  });

  describe("isValidEmail", () => {
    test("returns true for valid email", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
    });

    test("returns true for email with subdomain", () => {
      expect(isValidEmail("user@mail.example.com")).toBe(true);
    });

    test("returns false for email without @", () => {
      expect(isValidEmail("userexample.com")).toBe(false);
    });

    test("returns false for email without domain", () => {
      expect(isValidEmail("user@")).toBe(false);
    });

    test("returns false for email with spaces", () => {
      expect(isValidEmail("user @example.com")).toBe(false);
    });

    test("returns false for null", () => {
      expect(isValidEmail(null)).toBe(false);
    });

    test("returns false for undefined", () => {
      expect(isValidEmail(undefined)).toBe(false);
    });

    test("returns false for empty string", () => {
      expect(isValidEmail("")).toBe(false);
    });

    test("returns false for non-string value", () => {
      expect(isValidEmail(123)).toBe(false);
    });
  });

  describe("formatAuthorsForBackend", () => {
    test("separates new authors (no id) from existing students (with id)", () => {
      const authors = [
        { name: "Alice", email: "alice@example.com" },
        { id: 10, name: "Bob", email: "bob@example.com" },
      ];
      const result = formatAuthorsForBackend(authors);
      expect(result.newAuthors).toEqual([
        { name: "Alice", email: "alice@example.com" },
      ]);
      expect(result.studentIds).toEqual([10]);
    });

    test("returns empty arrays when given empty input", () => {
      const result = formatAuthorsForBackend([]);
      expect(result.newAuthors).toEqual([]);
      expect(result.studentIds).toEqual([]);
    });

    test("handles all new authors", () => {
      const authors = [
        { name: "Alice", email: "alice@example.com" },
        { name: "Carol", email: "carol@example.com" },
      ];
      const result = formatAuthorsForBackend(authors);
      expect(result.newAuthors).toHaveLength(2);
      expect(result.studentIds).toHaveLength(0);
    });

    test("handles all existing students", () => {
      const authors = [
        { id: 1, name: "Bob", email: "bob@example.com" },
        { id: 2, name: "Dave", email: "dave@example.com" },
      ];
      const result = formatAuthorsForBackend(authors);
      expect(result.newAuthors).toHaveLength(0);
      expect(result.studentIds).toEqual([1, 2]);
    });

    test("only maps name and email for new authors", () => {
      const authors = [
        {
          name: "Alice",
          email: "alice@example.com",
          extraField: "should be ignored",
        },
      ];
      const result = formatAuthorsForBackend(authors);
      expect(result.newAuthors[0]).toEqual({
        name: "Alice",
        email: "alice@example.com",
      });
      expect(result.newAuthors[0].extraField).toBeUndefined();
    });
  });

  describe("formatLabelsForBackend", () => {
    test("formats string label with default color", () => {
      const result = formatLabelsForBackend(["JavaScript"]);
      expect(result).toEqual([{ name: "JavaScript", color: "#3B82F6" }]);
    });

    test("formats object label with name and color", () => {
      const result = formatLabelsForBackend([
        { name: "React", color: "#61DAFB" },
      ]);
      expect(result).toEqual([{ name: "React", color: "#61DAFB" }]);
    });

    test("formats object label using label property", () => {
      const result = formatLabelsForBackend([{ label: "Vue", color: "#42b883" }]);
      expect(result).toEqual([{ name: "Vue", color: "#42b883" }]);
    });

    test("prepends # to color if missing", () => {
      const result = formatLabelsForBackend([{ name: "Node", color: "3B82F6" }]);
      expect(result[0].color).toBe("#3B82F6");
    });

    test("keeps # prefix if already present", () => {
      const result = formatLabelsForBackend([
        { name: "Node", color: "#3B82F6" },
      ]);
      expect(result[0].color).toBe("#3B82F6");
    });

    test("returns empty array for empty input", () => {
      expect(formatLabelsForBackend([])).toEqual([]);
    });

    test("handles multiple labels", () => {
      const result = formatLabelsForBackend(["JS", "TS"]);
      expect(result).toHaveLength(2);
    });
  });

  describe("formatLinksForBackend", () => {
    test("formats string link prepending https:// when missing", () => {
      const result = formatLinksForBackend(["example.com"]);
      expect(result[0].url).toBe("https://example.com");
      expect(result[0].name).toBe("example.com");
      expect(result[0].description).toBe("");
    });

    test("keeps existing https:// prefix", () => {
      const result = formatLinksForBackend(["https://example.com"]);
      expect(result[0].url).toBe("https://example.com");
    });

    test("keeps existing http:// prefix", () => {
      const result = formatLinksForBackend(["http://example.com"]);
      expect(result[0].url).toBe("http://example.com");
    });

    test("formats object link with url, name and description", () => {
      const result = formatLinksForBackend([
        {
          url: "https://example.com",
          name: "Example",
          description: "A site",
        },
      ]);
      expect(result[0]).toEqual({
        url: "https://example.com",
        name: "Example",
        description: "A site",
      });
    });

    test("uses link.link when url is absent", () => {
      const result = formatLinksForBackend([
        { link: "https://example.com", name: "Example" },
      ]);
      expect(result[0].url).toBe("https://example.com");
    });

    test("uses label as name fallback", () => {
      const result = formatLinksForBackend([
        { url: "https://example.com", label: "My Label" },
      ]);
      expect(result[0].name).toBe("My Label");
    });

    test("defaults description to empty string when absent", () => {
      const result = formatLinksForBackend([
        { url: "https://example.com", name: "Example" },
      ]);
      expect(result[0].description).toBe("");
    });

    test("returns empty array for empty input", () => {
      expect(formatLinksForBackend([])).toEqual([]);
    });

    test("handles multiple links", () => {
      const result = formatLinksForBackend([
        "https://first.com",
        "https://second.com",
      ]);
      expect(result).toHaveLength(2);
    });
  });
});
