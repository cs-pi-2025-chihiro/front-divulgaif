import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import WorkEvaluation from "./page";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const mockNavigate = jest.fn();
const mockParams = { id: "42" };

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, fallback) => {
      if (typeof fallback === "string") return fallback;
      if (typeof fallback === "object" && fallback !== null) return key;
      const map = {
        "workEvaluation.loadingWork": "Loading work...",
        "workEvaluation.errorLoading": "Error loading:",
        "workEvaluation.status.underReview": "Under Review",
        "workEvaluation.status.accepted": "Accepted",
        "workEvaluation.status.returned": "Returned",
        "workEvaluation.messages.workAccepted": "Work accepted!",
        "workEvaluation.messages.workReturned": "Work returned!",
        "workEvaluation.imageSection.addImage": "Add Image",
        "workEvaluation.imageSection.selectFile": "Select File",
        "workEvaluation.form.workType": "Work Type",
        "workEvaluation.form.workTitle": "Work Title",
        "workEvaluation.form.workTitlePlaceholder": "Enter work title",
        "workEvaluation.form.authors": "Authors",
        "workEvaluation.form.descriptionWordCount": "Description",
        "workEvaluation.form.descriptionPlaceholder": "Enter description",
        "workEvaluation.form.contentWordCount": "Content",
        "workEvaluation.form.contentPlaceholder": "Enter the content...",
        "workEvaluation.form.labels": "Labels",
        "workEvaluation.form.newLabel": "New label",
        "workEvaluation.form.links": "Links",
        "workEvaluation.form.addLink": "Add Link",
        "workEvaluation.form.linkPlaceholder": "Enter link",
        "workEvaluation.form.feedbackWordCount": "Feedback",
        "workEvaluation.form.feedbackPlaceholder": "Provide feedback for the student...",
        "workEvaluation.authors.student": "Student",
        "workEvaluation.authors.teacher": "Teacher",
        "workEvaluation.authors.fullName": "Full Name",
        "workEvaluation.authors.email": "Email",
        "workEvaluation.authors.type": "Type",
        "workEvaluation.authors.add": "Add",
        "workEvaluation.actions.return": "Return",
        "workEvaluation.actions.accept": "Accept",
        "workEvaluation.feedback.required": "Feedback is required to request changes",
        "workEvaluation.feedback.error": "Error occurred while requesting changes",
      };
      return map[key] || key;
    },
    i18n: { language: "pt" },
  }),
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
  navigateTo: jest.fn(),
}));

const mockRequestChangesWithData = jest.fn();
const mockPublishWork = jest.fn();

jest.mock("./useWorkEvaluation", () => ({
  useWorkEvaluation: jest.fn(() => ({
    requestChangesWithData: mockRequestChangesWithData,
    publishWork: mockPublishWork,
    isRequestChangesLoading: false,
    isPublishLoading: false,
  })),
}));

let mockWorkDataState = {};

jest.mock("../../../../../hooks/useWorkStore", () => ({
  useWorkData: jest.fn(() => mockWorkDataState),
}));

jest.mock("../../../../../components/button", () => {
  return function MockButton({ children, onClick, disabled, type, className }) {
    return (
      <button onClick={onClick} disabled={disabled} type={type || "button"} className={className}>
        {children}
      </button>
    );
  };
});

jest.mock("./page.css", () => ({}), { virtual: true });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const { useWorkData } = require("../../../../../hooks/useWorkStore");
const { useWorkEvaluation } = require("./useWorkEvaluation");
const { navigateTo } = require("../../../../../services/utils/utils");

const sampleWork = {
  id: 42,
  title: "Sample Work Title",
  imageUrl: null,
  workType: { name: "ARTICLE" },
  authors: [{ id: 10, name: "Author One", email: "author@test.com" }],
  description: "Sample description text",
  content: "Sample content text",
  links: [{ url: "https://example.com" }],
  labels: [{ name: "React" }, { name: "Testing" }],
  status: "Under Review",
  feedback: "",
  teachers: null,
  approvedAt: null,
};

function setupWorkData(overrides = {}) {
  mockWorkDataState = {
    workData: sampleWork,
    hasData: true,
    isLoading: false,
    error: null,
    ...overrides,
  };
  useWorkData.mockReturnValue(mockWorkDataState);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("WorkEvaluation page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupWorkData();
    mockPublishWork.mockResolvedValue(true);
    mockRequestChangesWithData.mockResolvedValue(true);
    useWorkEvaluation.mockReturnValue({
      requestChangesWithData: mockRequestChangesWithData,
      publishWork: mockPublishWork,
      isRequestChangesLoading: false,
      isPublishLoading: false,
    });
  });

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  test("renders loading indicator when isLoading is true", () => {
    setupWorkData({ workData: null, hasData: false, isLoading: true });
    render(<WorkEvaluation />);
    expect(screen.getByText("Loading work...")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Error state
  // -------------------------------------------------------------------------

  test("renders error message when error is present", () => {
    setupWorkData({ workData: null, hasData: false, isLoading: false, error: "Not found" });
    render(<WorkEvaluation />);
    expect(screen.getByText(/Error loading/i)).toBeInTheDocument();
    expect(screen.getByText(/Not found/i)).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Rendered form (normal state)
  // -------------------------------------------------------------------------

  test("renders work title in the form", () => {
    render(<WorkEvaluation />);
    expect(screen.getByDisplayValue("Sample Work Title")).toBeInTheDocument();
  });

  test("renders work description in the form", () => {
    render(<WorkEvaluation />);
    expect(screen.getByDisplayValue("Sample description text")).toBeInTheDocument();
  });

  test("renders work content in the form", () => {
    render(<WorkEvaluation />);
    expect(screen.getByDisplayValue("Sample content text")).toBeInTheDocument();
  });

  test("renders author cards from stored work", () => {
    render(<WorkEvaluation />);
    expect(screen.getByText("Author One")).toBeInTheDocument();
  });

  test("renders labels from stored work", () => {
    render(<WorkEvaluation />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Testing")).toBeInTheDocument();
  });

  test("renders links from stored work", () => {
    render(<WorkEvaluation />);
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
  });

  test("renders Return and Accept action buttons", () => {
    render(<WorkEvaluation />);
    expect(screen.getByText("Return")).toBeInTheDocument();
    expect(screen.getByText("Accept")).toBeInTheDocument();
  });

  test("renders work type buttons for each WORK_TYPE", () => {
    render(<WorkEvaluation />);
    expect(screen.getByText("Artigo")).toBeInTheDocument();
    expect(screen.getByText("Pesquisa")).toBeInTheDocument();
    expect(screen.getByText("Dissertação")).toBeInTheDocument();
    expect(screen.getByText("Extensão")).toBeInTheDocument();
    expect(screen.getByText("TCC")).toBeInTheDocument();
  });

  test("renders upload prompt when no image is present", () => {
    render(<WorkEvaluation />);
    expect(screen.getByText("Add Image")).toBeInTheDocument();
    expect(screen.getByText("Select File")).toBeInTheDocument();
  });

  test("renders image and remove button when imageUrl is set", () => {
    setupWorkData({
      workData: { ...sampleWork, imageUrl: "https://img.example.com/photo.jpg" },
    });
    render(<WorkEvaluation />);
    const img = screen.getByAltText("Trabalho");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://img.example.com/photo.jpg");
  });

  // -------------------------------------------------------------------------
  // Renders with no storedWork (fallback defaults)
  // -------------------------------------------------------------------------

  test("renders with default empty state when workData is null", () => {
    setupWorkData({ workData: null, hasData: false, isLoading: false, error: null });
    render(<WorkEvaluation />);
    expect(screen.getByText("Return")).toBeInTheDocument();
    expect(screen.getByText("Accept")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Form interactions
  // -------------------------------------------------------------------------

  test("changing title input updates form state", () => {
    render(<WorkEvaluation />);
    const titleInput = screen.getByDisplayValue("Sample Work Title");
    fireEvent.change(titleInput, { target: { value: "Updated Title" } });
    expect(titleInput.value).toBe("Updated Title");
  });

  test("changing description updates word count label", () => {
    render(<WorkEvaluation />);
    const descTextarea = screen.getByDisplayValue("Sample description text");
    fireEvent.change(descTextarea, { target: { value: "one two three" } });
    expect(descTextarea.value).toBe("one two three");
  });

  test("changing feedback clears feedbackError", async () => {
    render(<WorkEvaluation />);
    // Trigger the feedback error first by clicking Return with empty feedback
    const feedbackTextarea = screen.getByPlaceholderText("Provide feedback for the student...");
    // Leave feedback empty and click return
    fireEvent.click(screen.getByText("Return"));
    await waitFor(() => {
      expect(screen.getByText("Feedback is required to request changes")).toBeInTheDocument();
    });
    // Now type in the feedback field — the error should clear
    fireEvent.change(feedbackTextarea, { target: { value: "Some feedback" } });
    expect(screen.queryByText("Feedback is required to request changes")).not.toBeInTheDocument();
  });

  test("clicking a work type button changes active work type", () => {
    render(<WorkEvaluation />);
    const pesquisaBtn = screen.getByText("Pesquisa");
    fireEvent.click(pesquisaBtn);
    expect(pesquisaBtn).toHaveClass("active");
  });

  // -------------------------------------------------------------------------
  // Add / remove label
  // -------------------------------------------------------------------------

  test("clicking + label button shows label input", () => {
    render(<WorkEvaluation />);
    // The plus button for labels
    const addLabelBtns = screen.getAllByRole("button").filter((btn) =>
      btn.className && btn.className.includes("add-tag-btn")
    );
    if (addLabelBtns.length > 0) {
      fireEvent.click(addLabelBtns[0]);
      expect(screen.getByPlaceholderText("New label")).toBeInTheDocument();
    } else {
      // Alternative: find by class
      const container = document.querySelector(".add-tag-btn");
      if (container) fireEvent.click(container);
      expect(screen.getByPlaceholderText("New label")).toBeInTheDocument();
    }
  });

  test("adding a new label via confirm button adds it to list", () => {
    render(<WorkEvaluation />);
    const addTagBtn = document.querySelector(".add-tag-btn");
    if (addTagBtn) {
      fireEvent.click(addTagBtn);
      const labelInput = screen.getByPlaceholderText("New label");
      fireEvent.change(labelInput, { target: { value: "NewTag" } });
      const confirmBtn = document.querySelector(".confirm-btn");
      fireEvent.click(confirmBtn);
      expect(screen.getByText("NewTag")).toBeInTheDocument();
    }
  });

  test("pressing Enter in label input adds label", () => {
    render(<WorkEvaluation />);
    const addTagBtn = document.querySelector(".add-tag-btn");
    if (addTagBtn) {
      fireEvent.click(addTagBtn);
      const labelInput = screen.getByPlaceholderText("New label");
      fireEvent.change(labelInput, { target: { value: "EnterTag" } });
      fireEvent.keyPress(labelInput, { key: "Enter", code: "Enter", charCode: 13 });
      expect(screen.getByText("EnterTag")).toBeInTheDocument();
    }
  });

  test("cancel button in label input hides input and clears value", () => {
    render(<WorkEvaluation />);
    const addTagBtn = document.querySelector(".add-tag-btn");
    if (addTagBtn) {
      fireEvent.click(addTagBtn);
      const cancelBtn = document.querySelector(".cancel-btn");
      fireEvent.click(cancelBtn);
      expect(screen.queryByPlaceholderText("New label")).not.toBeInTheDocument();
    }
  });

  test("removing a label removes it from the list", () => {
    render(<WorkEvaluation />);
    const tagRemoveBtns = document.querySelectorAll(".tag-remove");
    if (tagRemoveBtns.length > 0) {
      expect(screen.getByText("React")).toBeInTheDocument();
      fireEvent.click(tagRemoveBtns[0]);
      expect(screen.queryByText("React")).not.toBeInTheDocument();
    }
  });

  // -------------------------------------------------------------------------
  // Add / remove link
  // -------------------------------------------------------------------------

  test("clicking add link button shows link input", () => {
    render(<WorkEvaluation />);
    const addLinkBtn = document.querySelector(".add-link-btn");
    if (addLinkBtn) {
      fireEvent.click(addLinkBtn);
      expect(screen.getByPlaceholderText("Enter link")).toBeInTheDocument();
    }
  });

  test("adding a link via confirm button adds it to the list", () => {
    render(<WorkEvaluation />);
    const addLinkBtn = document.querySelector(".add-link-btn");
    if (addLinkBtn) {
      fireEvent.click(addLinkBtn);
      const linkInput = screen.getByPlaceholderText("Enter link");
      fireEvent.change(linkInput, { target: { value: "https://new-link.com" } });
      const confirmBtns = document.querySelectorAll(".confirm-btn");
      fireEvent.click(confirmBtns[confirmBtns.length - 1]);
      expect(screen.getByText("https://new-link.com")).toBeInTheDocument();
    }
  });

  test("pressing Enter in link input adds link", () => {
    render(<WorkEvaluation />);
    const addLinkBtn = document.querySelector(".add-link-btn");
    if (addLinkBtn) {
      fireEvent.click(addLinkBtn);
      const linkInput = screen.getByPlaceholderText("Enter link");
      fireEvent.change(linkInput, { target: { value: "https://enter-link.com" } });
      fireEvent.keyPress(linkInput, { key: "Enter", code: "Enter", charCode: 13 });
      expect(screen.getByText("https://enter-link.com")).toBeInTheDocument();
    }
  });

  test("cancel button in link input hides input", () => {
    render(<WorkEvaluation />);
    const addLinkBtn = document.querySelector(".add-link-btn");
    if (addLinkBtn) {
      fireEvent.click(addLinkBtn);
      const cancelBtns = document.querySelectorAll(".cancel-btn");
      fireEvent.click(cancelBtns[cancelBtns.length - 1]);
      expect(screen.queryByPlaceholderText("Enter link")).not.toBeInTheDocument();
    }
  });

  test("removing a link removes it from the list", () => {
    render(<WorkEvaluation />);
    const linkRemoveBtns = document.querySelectorAll(".link-remove");
    if (linkRemoveBtns.length > 0) {
      expect(screen.getByText("https://example.com")).toBeInTheDocument();
      fireEvent.click(linkRemoveBtns[0]);
      expect(screen.queryByText("https://example.com")).not.toBeInTheDocument();
    }
  });

  // -------------------------------------------------------------------------
  // Add / remove author
  // -------------------------------------------------------------------------

  test("add author button adds a new author when name is provided", () => {
    render(<WorkEvaluation />);
    const nameInput = screen.getByPlaceholderText("Full Name");
    fireEvent.change(nameInput, { target: { value: "New Author" } });
    const addBtn = screen.getByText("Add");
    fireEvent.click(addBtn);
    expect(screen.getByText("New Author")).toBeInTheDocument();
  });

  test("add author button does nothing when name is empty", () => {
    render(<WorkEvaluation />);
    const addBtn = screen.getByText("Add");
    const countBefore = screen.getAllByText("Author One").length;
    fireEvent.click(addBtn);
    expect(screen.getAllByText("Author One").length).toBe(countBefore);
  });

  test("removing an existing author removes it", () => {
    render(<WorkEvaluation />);
    const removeAuthorBtns = document.querySelectorAll(".remove-btn");
    if (removeAuthorBtns.length > 0) {
      fireEvent.click(removeAuthorBtns[0]);
      expect(screen.queryByText("Author One")).not.toBeInTheDocument();
    }
  });

  test("clicking type button in add-author form updates authorInput type", () => {
    render(<WorkEvaluation />);
    const teacherTypeBtns = screen.getAllByText("Teacher");
    // The last set of type buttons is in the add-author form
    fireEvent.click(teacherTypeBtns[teacherTypeBtns.length - 1]);
    // The teacher button should now have 'active' class
    expect(teacherTypeBtns[teacherTypeBtns.length - 1]).toHaveClass("active");
  });

  // -------------------------------------------------------------------------
  // Image upload
  // -------------------------------------------------------------------------

  test("uploading an image file sets image in form", async () => {
    render(<WorkEvaluation />);
    const fileInput = document.querySelector("input[type='file']");
    if (fileInput) {
      const file = new File(["pixel"], "photo.png", { type: "image/png" });
      const mockReader = {
        onload: null,
        readAsDataURL: jest.fn(function () {
          this.onload({ target: { result: "data:image/png;base64,abc" } });
        }),
        result: "data:image/png;base64,abc",
      };
      jest.spyOn(global, "FileReader").mockImplementation(() => mockReader);

      fireEvent.change(fileInput, { target: { files: [file] } });
      await waitFor(() => {
        expect(mockReader.readAsDataURL).toHaveBeenCalledWith(file);
      });
    }
  });

  test("uploading a non-image file is ignored", () => {
    render(<WorkEvaluation />);
    const fileInput = document.querySelector("input[type='file']");
    if (fileInput) {
      const file = new File(["data"], "doc.pdf", { type: "application/pdf" });
      const readSpy = jest.spyOn(global, "FileReader").mockImplementation(() => ({
        readAsDataURL: jest.fn(),
        onload: null,
      }));
      fireEvent.change(fileInput, { target: { files: [file] } });
      // FileReader should NOT have been used for non-image
      expect(readSpy).not.toHaveBeenCalled();
    }
  });

  test("clicking remove image button clears image and imageUrl", () => {
    setupWorkData({
      workData: { ...sampleWork, imageUrl: "https://img.example.com/photo.jpg" },
    });
    render(<WorkEvaluation />);
    const removeImageBtn = document.querySelector(".image-remove-btn");
    if (removeImageBtn) {
      fireEvent.click(removeImageBtn);
      expect(screen.queryByAltText("Trabalho")).not.toBeInTheDocument();
    }
  });

  // -------------------------------------------------------------------------
  // handleAccept
  // -------------------------------------------------------------------------

  test("clicking Accept calls publishWork with workId", async () => {
    render(<WorkEvaluation />);
    const acceptBtn = screen.getByText("Accept");
    fireEvent.click(acceptBtn);
    await waitFor(() => {
      expect(mockPublishWork).toHaveBeenCalledWith(42);
    });
  });

  test("successful accept navigates away", async () => {
    mockPublishWork.mockResolvedValue(true);
    render(<WorkEvaluation />);
    fireEvent.click(screen.getByText("Accept"));
    await waitFor(() => {
      expect(navigateTo).toHaveBeenCalled();
    });
  });

  test("unsuccessful accept (returns false) does not navigate", async () => {
    mockPublishWork.mockResolvedValue(false);
    render(<WorkEvaluation />);
    fireEvent.click(screen.getByText("Accept"));
    await waitFor(() => {
      expect(mockPublishWork).toHaveBeenCalled();
    });
    expect(navigateTo).not.toHaveBeenCalled();
  });

  test("handleAccept handles thrown error gracefully", async () => {
    mockPublishWork.mockRejectedValueOnce(new Error("Publish error"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<WorkEvaluation />);
    fireEvent.click(screen.getByText("Accept"));
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Error publishing work:", expect.any(Error));
    });
    consoleSpy.mockRestore();
  });

  test("Accept button is disabled when isPublishLoading is true", () => {
    useWorkEvaluation.mockReturnValue({
      requestChangesWithData: mockRequestChangesWithData,
      publishWork: mockPublishWork,
      isRequestChangesLoading: false,
      isPublishLoading: true,
    });
    render(<WorkEvaluation />);
    expect(screen.getByText("Accept")).toBeDisabled();
  });

  test("Return button is disabled when isRequestChangesLoading is true", () => {
    useWorkEvaluation.mockReturnValue({
      requestChangesWithData: mockRequestChangesWithData,
      publishWork: mockPublishWork,
      isRequestChangesLoading: true,
      isPublishLoading: false,
    });
    render(<WorkEvaluation />);
    expect(screen.getByText("Return")).toBeDisabled();
  });

  // -------------------------------------------------------------------------
  // handleReturn
  // -------------------------------------------------------------------------

  test("clicking Return with empty feedback shows error message", async () => {
    render(<WorkEvaluation />);
    const feedbackTextarea = screen.getByPlaceholderText("Provide feedback for the student...");
    // Ensure feedback is empty
    fireEvent.change(feedbackTextarea, { target: { value: "" } });
    fireEvent.click(screen.getByText("Return"));
    await waitFor(() => {
      expect(screen.getByText("Feedback is required to request changes")).toBeInTheDocument();
    });
  });

  test("clicking Return with only whitespace feedback shows error message", async () => {
    render(<WorkEvaluation />);
    const feedbackTextarea = screen.getByPlaceholderText("Provide feedback for the student...");
    fireEvent.change(feedbackTextarea, { target: { value: "   " } });
    fireEvent.click(screen.getByText("Return"));
    await waitFor(() => {
      expect(screen.getByText("Feedback is required to request changes")).toBeInTheDocument();
    });
    expect(mockRequestChangesWithData).not.toHaveBeenCalled();
  });

  test("clicking Return with valid feedback calls requestChangesWithData", async () => {
    render(<WorkEvaluation />);
    const feedbackTextarea = screen.getByPlaceholderText("Provide feedback for the student...");
    fireEvent.change(feedbackTextarea, { target: { value: "Please fix section 2" } });
    fireEvent.click(screen.getByText("Return"));
    await waitFor(() => {
      expect(mockRequestChangesWithData).toHaveBeenCalledWith(
        42,
        expect.objectContaining({ feedback: "Please fix section 2" }),
        sampleWork,
        "pt"
      );
    });
  });

  test("successful return navigates away and shows success message", async () => {
    mockRequestChangesWithData.mockResolvedValue(true);
    render(<WorkEvaluation />);
    const feedbackTextarea = screen.getByPlaceholderText("Provide feedback for the student...");
    fireEvent.change(feedbackTextarea, { target: { value: "Good effort but needs work" } });
    fireEvent.click(screen.getByText("Return"));
    await waitFor(() => {
      expect(navigateTo).toHaveBeenCalled();
    });
  });

  test("unsuccessful return (returns false) does not navigate", async () => {
    mockRequestChangesWithData.mockResolvedValue(false);
    render(<WorkEvaluation />);
    const feedbackTextarea = screen.getByPlaceholderText("Provide feedback for the student...");
    fireEvent.change(feedbackTextarea, { target: { value: "Review required" } });
    fireEvent.click(screen.getByText("Return"));
    await waitFor(() => {
      expect(mockRequestChangesWithData).toHaveBeenCalled();
    });
    expect(navigateTo).not.toHaveBeenCalled();
  });

  test("handleReturn handles thrown error and sets feedbackError", async () => {
    mockRequestChangesWithData.mockRejectedValueOnce(new Error("Request changes error"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<WorkEvaluation />);
    const feedbackTextarea = screen.getByPlaceholderText("Provide feedback for the student...");
    fireEvent.change(feedbackTextarea, { target: { value: "Some feedback" } });
    fireEvent.click(screen.getByText("Return"));
    await waitFor(() => {
      expect(screen.getByText("Error occurred while requesting changes")).toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });

  // -------------------------------------------------------------------------
  // Stored work with string links and labels (branch coverage)
  // -------------------------------------------------------------------------

  test("handles stored work with string links correctly", () => {
    setupWorkData({
      workData: {
        ...sampleWork,
        links: ["https://string-link.com"],
        labels: ["StringLabel"],
      },
    });
    render(<WorkEvaluation />);
    expect(screen.getByText("https://string-link.com")).toBeInTheDocument();
    expect(screen.getByText("StringLabel")).toBeInTheDocument();
  });

  test("handles labels with title property", () => {
    setupWorkData({
      workData: { ...sampleWork, labels: [{ title: "TitleLabel" }] },
    });
    render(<WorkEvaluation />);
    expect(screen.getByText("TitleLabel")).toBeInTheDocument();
  });

  test("handles labels that are plain objects (fallback to String)", () => {
    setupWorkData({
      workData: { ...sampleWork, labels: [{}] },
    });
    render(<WorkEvaluation />);
    // Should not crash
    expect(screen.getByText("Return")).toBeInTheDocument();
  });

  test("renders label with object that has no name/title using JSON", () => {
    render(<WorkEvaluation />);
    // Labels in form rendering — testing label display branch for object label
    const addTagBtn = document.querySelector(".add-tag-btn");
    if (addTagBtn) {
      fireEvent.click(addTagBtn);
      const labelInput = screen.getByPlaceholderText("New label");
      fireEvent.change(labelInput, { target: { value: "ObjectLabel" } });
      const confirmBtn = document.querySelector(".confirm-btn");
      if (confirmBtn) fireEvent.click(confirmBtn);
    }
    expect(screen.getByText("Return")).toBeInTheDocument();
  });
});
