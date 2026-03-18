import { renderHook, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useWorkEvaluation } from "./useWorkEvaluation";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const mockMutateAsync = jest.fn();
const mockMutate = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn((opts) => ({
    mutate: mockMutate,
    mutateAsync: mockMutateAsync,
    isPending: false,
    error: null,
  })),
}));

jest.mock("../../../../../enums/endpoints", () => ({
  ENDPOINTS: {
    WORKS: {
      REQUEST_CHANGES: "/works/request-changes",
      PUBLISH: "/works/publish",
    },
  },
}));

jest.mock("../../../../../services/utils/api", () => ({
  post: jest.fn(),
}));

jest.mock("../../../../../enums/workTypes", () => ({
  WORK_TYPES: {
    ARTICLE: "ARTICLE",
    SEARCH: "SEARCH",
    DISSERTATION: "DISSERTATION",
    EXTENSION: "EXTENSION",
    FINAL_THESIS: "FINAL_THESIS",
  },
}));

jest.mock("../../../../../services/utils/utils", () => ({
  getWorkTypes: jest.fn((type, lang) => {
    const map = {
      ARTICLE: lang === "pt" ? "Artigo" : "Article",
      SEARCH: lang === "pt" ? "Pesquisa" : "Search",
      DISSERTATION: lang === "pt" ? "Dissertação" : "Dissertation",
      EXTENSION: lang === "pt" ? "Extensão" : "Extension",
      FINAL_THESIS: lang === "pt" ? "TCC" : "Final Thesis",
    };
    return map[type] || type;
  }),
}));

jest.mock("../../../../../services/hooks/auth/useAuth", () => ({
  getStoredUser: jest.fn(() => ({ id: 1, name: "Test Teacher" })),
}));

// ---------------------------------------------------------------------------
// Per-mutation tracking
// ---------------------------------------------------------------------------

const { useMutation } = require("@tanstack/react-query");

let requestChangesMutateAsync;
let publishMutateAsync;
let requestChangesMutate;
let publishMutate;
let requestChangesIsPending = false;
let publishIsPending = false;
let requestChangesError = null;
let publishError = null;

function rewireUseMutation() {
  let callCount = 0;
  useMutation.mockImplementation(() => {
    callCount++;
    if (callCount === 1) {
      // First call → requestChanges mutation
      return {
        mutate: requestChangesMutate,
        mutateAsync: requestChangesMutateAsync,
        isPending: requestChangesIsPending,
        error: requestChangesError,
      };
    }
    // Second call → publish mutation
    return {
      mutate: publishMutate,
      mutateAsync: publishMutateAsync,
      isPending: publishIsPending,
      error: publishError,
    };
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useWorkEvaluation hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requestChangesMutateAsync = jest.fn();
    publishMutateAsync = jest.fn();
    requestChangesMutate = jest.fn();
    publishMutate = jest.fn();
    requestChangesIsPending = false;
    publishIsPending = false;
    requestChangesError = null;
    publishError = null;
    rewireUseMutation();
  });

  // -------------------------------------------------------------------------
  // Hook structure
  // -------------------------------------------------------------------------

  test("returns expected properties", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const hook = result.current;

    expect(hook).toHaveProperty("requestChanges");
    expect(hook).toHaveProperty("requestChangesAsync");
    expect(hook).toHaveProperty("publish");
    expect(hook).toHaveProperty("publishAsync");
    expect(hook).toHaveProperty("requestChangesWithData");
    expect(hook).toHaveProperty("publishWork");
    expect(hook).toHaveProperty("isRequestChangesLoading");
    expect(hook).toHaveProperty("isPublishLoading");
    expect(hook).toHaveProperty("requestChangesError");
    expect(hook).toHaveProperty("publishError");
    expect(hook).toHaveProperty("buildRequestChangesPayload");
    expect(hook).toHaveProperty("mapWorkTypeToBackend");
  });

  test("isRequestChangesLoading reflects requestChanges mutation isPending", () => {
    requestChangesIsPending = true;
    rewireUseMutation();
    const { result } = renderHook(() => useWorkEvaluation());
    expect(result.current.isRequestChangesLoading).toBe(true);
  });

  test("isPublishLoading reflects publish mutation isPending", () => {
    publishIsPending = true;
    rewireUseMutation();
    const { result } = renderHook(() => useWorkEvaluation());
    expect(result.current.isPublishLoading).toBe(true);
  });

  test("requestChangesError reflects requestChanges mutation error", () => {
    requestChangesError = new Error("RC Error");
    rewireUseMutation();
    const { result } = renderHook(() => useWorkEvaluation());
    expect(result.current.requestChangesError).toEqual(new Error("RC Error"));
  });

  test("publishError reflects publish mutation error", () => {
    publishError = new Error("Publish Error");
    rewireUseMutation();
    const { result } = renderHook(() => useWorkEvaluation());
    expect(result.current.publishError).toEqual(new Error("Publish Error"));
  });

  // -------------------------------------------------------------------------
  // mapWorkTypeToBackend
  // -------------------------------------------------------------------------

  test("mapWorkTypeToBackend maps Artigo to ARTICLE", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    expect(result.current.mapWorkTypeToBackend("Artigo", "pt")).toBe("ARTICLE");
  });

  test("mapWorkTypeToBackend maps Pesquisa to SEARCH", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    expect(result.current.mapWorkTypeToBackend("Pesquisa", "pt")).toBe("SEARCH");
  });

  test("mapWorkTypeToBackend maps Dissertação to DISSERTATION", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    expect(result.current.mapWorkTypeToBackend("Dissertação", "pt")).toBe("DISSERTATION");
  });

  test("mapWorkTypeToBackend maps Extensão to EXTENSION", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    expect(result.current.mapWorkTypeToBackend("Extensão", "pt")).toBe("EXTENSION");
  });

  test("mapWorkTypeToBackend maps TCC to FINAL_THESIS", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    expect(result.current.mapWorkTypeToBackend("TCC", "pt")).toBe("FINAL_THESIS");
  });

  test("mapWorkTypeToBackend maps Article to ARTICLE (English)", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    expect(result.current.mapWorkTypeToBackend("Article", "en")).toBe("ARTICLE");
  });

  test("mapWorkTypeToBackend returns original value when no match", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    expect(result.current.mapWorkTypeToBackend("UNKNOWN_TYPE", "pt")).toBe("UNKNOWN_TYPE");
  });

  // -------------------------------------------------------------------------
  // buildRequestChangesPayload
  // -------------------------------------------------------------------------

  test("buildRequestChangesPayload includes feedbackMessage", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = { feedback: "Needs revision", title: "Title", description: "Desc", content: "Content", imageUrl: null, workType: "Artigo", authors: [], labels: [], links: [] };
    const storedWork = { title: "Title", description: "Desc", content: "Content", imageUrl: null, workType: { name: "ARTICLE" } };
    const payload = result.current.buildRequestChangesPayload(formData, storedWork, "pt");
    expect(payload.feedbackMessage).toBe("Needs revision");
  });

  test("buildRequestChangesPayload omits title when unchanged", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = { feedback: "fb", title: "Same Title", description: "", content: "", imageUrl: null, workType: "Artigo", authors: [], labels: [], links: [] };
    const storedWork = { title: "Same Title", description: "", content: "", imageUrl: null, workType: { name: "ARTICLE" } };
    const payload = result.current.buildRequestChangesPayload(formData, storedWork, "pt");
    expect(payload).not.toHaveProperty("title");
  });

  test("buildRequestChangesPayload includes title when changed", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = { feedback: "fb", title: "New Title", description: "", content: "", imageUrl: null, workType: "Artigo", authors: [], labels: [], links: [] };
    const storedWork = { title: "Old Title", description: "", content: "", imageUrl: null, workType: { name: "ARTICLE" } };
    const payload = result.current.buildRequestChangesPayload(formData, storedWork, "pt");
    expect(payload.title).toBe("New Title");
  });

  test("buildRequestChangesPayload includes description when changed", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = { feedback: "fb", title: "T", description: "New Desc", content: "", imageUrl: null, workType: "Artigo", authors: [], labels: [], links: [] };
    const storedWork = { title: "T", description: "Old Desc", content: "", imageUrl: null, workType: { name: "ARTICLE" } };
    const payload = result.current.buildRequestChangesPayload(formData, storedWork, "pt");
    expect(payload.description).toBe("New Desc");
  });

  test("buildRequestChangesPayload includes content when changed", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = { feedback: "fb", title: "T", description: "D", content: "New Content", imageUrl: null, workType: "Artigo", authors: [], labels: [], links: [] };
    const storedWork = { title: "T", description: "D", content: "Old Content", imageUrl: null, workType: { name: "ARTICLE" } };
    const payload = result.current.buildRequestChangesPayload(formData, storedWork, "pt");
    expect(payload.content).toBe("New Content");
  });

  test("buildRequestChangesPayload includes imageUrl when changed", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = { feedback: "fb", title: "T", description: "D", content: "C", imageUrl: "https://new.img", workType: "Artigo", authors: [], labels: [], links: [] };
    const storedWork = { title: "T", description: "D", content: "C", imageUrl: "https://old.img", workType: { name: "ARTICLE" } };
    const payload = result.current.buildRequestChangesPayload(formData, storedWork, "pt");
    expect(payload.imageUrl).toBe("https://new.img");
  });

  test("buildRequestChangesPayload includes workType when changed", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = { feedback: "fb", title: "T", description: "D", content: "C", imageUrl: null, workType: "Pesquisa", authors: [], labels: [], links: [] };
    const storedWork = { title: "T", description: "D", content: "C", imageUrl: null, workType: { name: "ARTICLE" } };
    const payload = result.current.buildRequestChangesPayload(formData, storedWork, "pt");
    expect(payload.workType).toBe("SEARCH");
  });

  test("buildRequestChangesPayload omits workType when unchanged", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = { feedback: "fb", title: "T", description: "D", content: "C", imageUrl: null, workType: "Artigo", authors: [], labels: [], links: [] };
    const storedWork = { title: "T", description: "D", content: "C", imageUrl: null, workType: { name: "ARTICLE" } };
    const payload = result.current.buildRequestChangesPayload(formData, storedWork, "pt");
    expect(payload).not.toHaveProperty("workType");
  });

  test("buildRequestChangesPayload includes existing authors (with id)", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = {
      feedback: "fb", title: "T", description: "D", content: "C", imageUrl: null, workType: "Artigo",
      authors: [{ id: 10, name: "Existing Author", email: "e@e.com" }],
      labels: [], links: [],
    };
    const storedWork = { title: "T", description: "D", content: "C", imageUrl: null, workType: { name: "ARTICLE" } };
    const payload = result.current.buildRequestChangesPayload(formData, storedWork, "pt");
    expect(payload.authors).toEqual([{ id: 10 }]);
  });

  test("buildRequestChangesPayload includes new authors (without id)", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = {
      feedback: "fb", title: "T", description: "D", content: "C", imageUrl: null, workType: "Artigo",
      authors: [{ name: "New Author", email: "new@test.com" }],
      labels: [], links: [],
    };
    const storedWork = { title: "T", description: "D", content: "C", imageUrl: null, workType: { name: "ARTICLE" } };
    const payload = result.current.buildRequestChangesPayload(formData, storedWork, "pt");
    expect(payload.newAuthors).toEqual([{ name: "New Author", email: "new@test.com" }]);
  });

  test("buildRequestChangesPayload handles mix of existing and new authors", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = {
      feedback: "fb", title: "T", description: "D", content: "C", imageUrl: null, workType: "Artigo",
      authors: [
        { id: 1, name: "Existing", email: "e@e.com" },
        { name: "New", email: "n@n.com" },
      ],
      labels: [], links: [],
    };
    const storedWork = { title: "T", description: "D", content: "C", imageUrl: null, workType: { name: "ARTICLE" } };
    const payload = result.current.buildRequestChangesPayload(formData, storedWork, "pt");
    expect(payload.authors).toEqual([{ id: 1 }]);
    expect(payload.newAuthors).toEqual([{ name: "New", email: "n@n.com" }]);
  });

  test("buildRequestChangesPayload includes string labels as workLabels", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = {
      feedback: "fb", title: "T", description: "D", content: "C", imageUrl: null, workType: "Artigo",
      authors: [], labels: ["React", "Testing"], links: [],
    };
    const storedWork = { title: "T", description: "D", content: "C", imageUrl: null, workType: { name: "ARTICLE" } };
    const payload = result.current.buildRequestChangesPayload(formData, storedWork, "pt");
    expect(payload.workLabels).toEqual([
      { name: "React", color: "#4a7c59" },
      { name: "Testing", color: "#4a7c59" },
    ]);
  });

  test("buildRequestChangesPayload includes object labels using name property", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = {
      feedback: "fb", title: "T", description: "D", content: "C", imageUrl: null, workType: "Artigo",
      authors: [], labels: [{ name: "ObjLabel" }], links: [],
    };
    const storedWork = { title: "T", description: "D", content: "C", imageUrl: null, workType: { name: "ARTICLE" } };
    const payload = result.current.buildRequestChangesPayload(formData, storedWork, "pt");
    expect(payload.workLabels[0].name).toBe("ObjLabel");
  });

  test("buildRequestChangesPayload includes object labels using title property as fallback", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = {
      feedback: "fb", title: "T", description: "D", content: "C", imageUrl: null, workType: "Artigo",
      authors: [], labels: [{ title: "TitleLabel" }], links: [],
    };
    const storedWork = { title: "T", description: "D", content: "C", imageUrl: null, workType: { name: "ARTICLE" } };
    const payload = result.current.buildRequestChangesPayload(formData, storedWork, "pt");
    expect(payload.workLabels[0].name).toBe("TitleLabel");
  });

  test("buildRequestChangesPayload includes string links as workLinks", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = {
      feedback: "fb", title: "T", description: "D", content: "C", imageUrl: null, workType: "Artigo",
      authors: [], labels: [], links: ["https://example.com"],
    };
    const storedWork = { title: "T", description: "D", content: "C", imageUrl: null, workType: { name: "ARTICLE" } };
    const payload = result.current.buildRequestChangesPayload(formData, storedWork, "pt");
    expect(payload.workLinks).toEqual([
      { name: "", url: "https://example.com", description: "" },
    ]);
  });

  test("buildRequestChangesPayload includes object links using url property", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = {
      feedback: "fb", title: "T", description: "D", content: "C", imageUrl: null, workType: "Artigo",
      authors: [], labels: [], links: [{ url: "https://link.com" }],
    };
    const storedWork = { title: "T", description: "D", content: "C", imageUrl: null, workType: { name: "ARTICLE" } };
    const payload = result.current.buildRequestChangesPayload(formData, storedWork, "pt");
    expect(payload.workLinks[0].url).toBe("https://link.com");
  });

  test("buildRequestChangesPayload omits workLabels when labels array is empty", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = { feedback: "fb", title: "T", description: "D", content: "C", imageUrl: null, workType: "Artigo", authors: [], labels: [], links: [] };
    const storedWork = { title: "T", description: "D", content: "C", imageUrl: null, workType: { name: "ARTICLE" } };
    const payload = result.current.buildRequestChangesPayload(formData, storedWork, "pt");
    expect(payload).not.toHaveProperty("workLabels");
  });

  test("buildRequestChangesPayload omits workLinks when links array is empty", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = { feedback: "fb", title: "T", description: "D", content: "C", imageUrl: null, workType: "Artigo", authors: [], labels: [], links: [] };
    const storedWork = { title: "T", description: "D", content: "C", imageUrl: null, workType: { name: "ARTICLE" } };
    const payload = result.current.buildRequestChangesPayload(formData, storedWork, "pt");
    expect(payload).not.toHaveProperty("workLinks");
  });

  test("buildRequestChangesPayload omits authors sections when authors array is empty", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = { feedback: "fb", title: "T", description: "D", content: "C", imageUrl: null, workType: "Artigo", authors: [], labels: [], links: [] };
    const storedWork = { title: "T", description: "D", content: "C", imageUrl: null, workType: { name: "ARTICLE" } };
    const payload = result.current.buildRequestChangesPayload(formData, storedWork, "pt");
    expect(payload).not.toHaveProperty("authors");
    expect(payload).not.toHaveProperty("newAuthors");
  });

  test("buildRequestChangesPayload handles null storedWork", () => {
    const { result } = renderHook(() => useWorkEvaluation());
    const formData = { feedback: "fb", title: "New Title", description: "New Desc", content: "New Content", imageUrl: "img.jpg", workType: "Artigo", authors: [], labels: [], links: [] };
    const payload = result.current.buildRequestChangesPayload(formData, null, "pt");
    expect(payload.title).toBe("New Title");
    expect(payload.description).toBe("New Desc");
    expect(payload.content).toBe("New Content");
    expect(payload.imageUrl).toBe("img.jpg");
  });

  // -------------------------------------------------------------------------
  // requestChangesWithData
  // -------------------------------------------------------------------------

  test("requestChangesWithData calls mutateAsync with built payload", async () => {
    requestChangesMutateAsync.mockResolvedValue(true);
    rewireUseMutation();
    const { result } = renderHook(() => useWorkEvaluation());

    const formData = { feedback: "Review needed", title: "New Title", description: "D", content: "C", imageUrl: null, workType: "Artigo", authors: [], labels: [], links: [] };
    const storedWork = { title: "Old Title", description: "D", content: "C", imageUrl: null, workType: { name: "ARTICLE" } };

    await act(async () => {
      await result.current.requestChangesWithData(1, formData, storedWork, "pt");
    });

    expect(requestChangesMutateAsync).toHaveBeenCalledWith({
      workId: 1,
      requestData: expect.objectContaining({
        feedbackMessage: "Review needed",
        title: "New Title",
      }),
    });
  });

  // -------------------------------------------------------------------------
  // publishWork
  // -------------------------------------------------------------------------

  test("publishWork calls mutateAsync with workId and empty evaluationData by default", async () => {
    publishMutateAsync.mockResolvedValue(true);
    rewireUseMutation();
    const { result } = renderHook(() => useWorkEvaluation());

    await act(async () => {
      await result.current.publishWork(99);
    });

    expect(publishMutateAsync).toHaveBeenCalledWith({
      workId: 99,
      evaluationData: {},
    });
  });

  test("publishWork passes custom evaluationData when provided", async () => {
    publishMutateAsync.mockResolvedValue(true);
    rewireUseMutation();
    const { result } = renderHook(() => useWorkEvaluation());
    const customData = { score: 95 };

    await act(async () => {
      await result.current.publishWork(10, customData);
    });

    expect(publishMutateAsync).toHaveBeenCalledWith({
      workId: 10,
      evaluationData: customData,
    });
  });

  // -------------------------------------------------------------------------
  // Direct mutation accessors (requestChanges / publish)
  // -------------------------------------------------------------------------

  test("requestChanges is the mutate function of the requestChanges mutation", () => {
    rewireUseMutation();
    const { result } = renderHook(() => useWorkEvaluation());
    expect(result.current.requestChanges).toBe(requestChangesMutate);
  });

  test("requestChangesAsync is the mutateAsync function of the requestChanges mutation", () => {
    rewireUseMutation();
    const { result } = renderHook(() => useWorkEvaluation());
    expect(result.current.requestChangesAsync).toBe(requestChangesMutateAsync);
  });

  test("publish is the mutate function of the publish mutation", () => {
    rewireUseMutation();
    const { result } = renderHook(() => useWorkEvaluation());
    expect(result.current.publish).toBe(publishMutate);
  });

  test("publishAsync is the mutateAsync function of the publish mutation", () => {
    rewireUseMutation();
    const { result } = renderHook(() => useWorkEvaluation());
    expect(result.current.publishAsync).toBe(publishMutateAsync);
  });
});
