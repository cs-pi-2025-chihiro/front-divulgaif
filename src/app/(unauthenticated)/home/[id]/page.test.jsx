import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import WorkDetail from "./page";
import { WORK_STATUS } from "../../../../enums/workStatus";
import { ROLES } from "../../../../enums/roles";

// Define mock functions at the top level
const mockNavigate = jest.fn();
const mockUseParams = jest.fn();
const mockUseWork = jest.fn();
const mockNavigateToWorkEvaluation = jest.fn();
const mockIsAuthenticated = jest.fn();
const mockGetStoredUser = jest.fn();
const mockIsTeacher = jest.fn();
const mockHasRole = jest.fn();
const mockUseTranslation = jest.fn();

// Mock dependencies
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => mockUseTranslation(),
}));

jest.mock("./useWork", () => ({
  useWork: (...args) => mockUseWork(...args),
}));

jest.mock("../../../../hooks/useWorkStore", () => ({
  useWorkNavigation: () => ({
    navigateToWorkEvaluation: mockNavigateToWorkEvaluation,
  }),
}));

jest.mock("../../../../services/hooks/auth/useAuth", () => ({
  isAuthenticated: () => mockIsAuthenticated(),
  getStoredUser: () => mockGetStoredUser(),
  hasRole: (...args) => mockHasRole(...args),
}));

jest.mock("../../../../services/utils/utils", () => ({
  isTeacher: () => mockIsTeacher(),
}));

jest.mock("../../../../components/button", () => ({
  __esModule: true,
  default: ({ children, onClick, variant, size, className }) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </button>
  ),
}));

describe("WorkDetail Component", () => {
  const mockWork = {
    id: 1,
    title: "Test Work Title",
    type: "ARTICLE",
    description: "Test work description",
    content: "Test work content",
    imageUrl: "https://example.com/image.jpg",
    workStatus: { name: WORK_STATUS.PUBLISHED },
    authors: [
      { id: 1, name: "Author 1", userId: 10 },
      { id: 2, name: "Author 2", userId: 20 },
    ],
    labels: [
      { id: 1, name: "Label 1" },
      { id: 2, name: "Label 2" },
    ],
    links: [
      { id: 1, name: "Link 1", url: "https://example.com/link1" },
      { id: 2, name: "Link 2", url: "https://example.com/link2" },
    ],
    teachers: { id: 1, name: "Teacher Name" },
    approvedAt: "2024-01-15T10:00:00",
    status: WORK_STATUS.PUBLISHED,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockUseParams.mockReturnValue({ id: "1" });
    mockUseTranslation.mockReturnValue({
      t: (key) => key,
      i18n: { language: "pt" },
    });
    mockUseWork.mockReturnValue({
      work: mockWork,
      isLoading: false,
    });
    mockIsAuthenticated.mockReturnValue(false);
    mockGetStoredUser.mockReturnValue(null);
    mockIsTeacher.mockReturnValue(false);
    mockHasRole.mockReturnValue(false);
  });

  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        {component}
      </BrowserRouter>,
    );
  };

  describe("Loading State", () => {
    test("displays loading indicator when work is loading", () => {
      mockUseWork.mockReturnValue({
        work: null,
        isLoading: true,
      });

      renderWithRouter(<WorkDetail />);

      expect(screen.getByText(/common\.loading/i)).toBeInTheDocument();
    });

    test("loading indicator has correct container", () => {
      mockUseWork.mockReturnValue({
        work: null,
        isLoading: true,
      });

      renderWithRouter(<WorkDetail />);

      const container = screen.getByText(/common\.loading/i).closest("div");
      expect(container).toHaveClass("loading-indicator");
    });
  });

  describe("Error State", () => {
    test("displays error message when work not found", () => {
      mockUseWork.mockReturnValue({
        work: null,
        isLoading: false,
      });

      renderWithRouter(<WorkDetail />);

      expect(screen.getByText(/errors\.workNotFound/i)).toBeInTheDocument();
    });

    test("displays work ID in error message", () => {
      mockUseParams.mockReturnValue({ id: "999" });
      mockUseWork.mockReturnValue({
        work: null,
        isLoading: false,
      });

      renderWithRouter(<WorkDetail />);

      expect(screen.getByText(/ID: 999/i)).toBeInTheDocument();
    });

    test("displays back button in error state", () => {
      mockUseWork.mockReturnValue({
        work: null,
        isLoading: false,
      });

      renderWithRouter(<WorkDetail />);

      const backButton = screen.getByText(/common\.back/i);
      expect(backButton).toBeInTheDocument();
    });

    test("back button navigates back when clicked", () => {
      mockUseWork.mockReturnValue({
        work: null,
        isLoading: false,
      });

      renderWithRouter(<WorkDetail />);

      const backButton = screen.getByText(/common\.back/i);
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe("Work Display", () => {
    test("renders work title", () => {
      renderWithRouter(<WorkDetail />);

      expect(screen.getByText(mockWork.title)).toBeInTheDocument();
    });

    test("renders work type", () => {
      renderWithRouter(<WorkDetail />);

      expect(screen.getByText(/article/i)).toBeInTheDocument();
    });

    test("renders work description", () => {
      renderWithRouter(<WorkDetail />);

      expect(screen.getByText(mockWork.description)).toBeInTheDocument();
    });

    test("renders work content", () => {
      renderWithRouter(<WorkDetail />);

      expect(screen.getByText(mockWork.content)).toBeInTheDocument();
    });

    test("renders work image", () => {
      renderWithRouter(<WorkDetail />);

      const image = screen.getByAltText(mockWork.title);
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", mockWork.imageUrl);
    });

    test("displays all authors", () => {
      renderWithRouter(<WorkDetail />);

      expect(screen.getByText("Author 1")).toBeInTheDocument();
      expect(screen.getByText("Author 2")).toBeInTheDocument();
    });

    test("displays teacher name", () => {
      renderWithRouter(<WorkDetail />);

      expect(screen.getByText("Teacher Name")).toBeInTheDocument();
    });

    test("displays formatted approval date", () => {
      renderWithRouter(<WorkDetail />);

      // Date should be formatted according to locale
      const dateElement = screen.getByText(/15\/01\/2024|1\/15\/2024/);
      expect(dateElement).toBeInTheDocument();
    });

    test("displays all labels", () => {
      renderWithRouter(<WorkDetail />);

      expect(screen.getByText("Label 1")).toBeInTheDocument();
      expect(screen.getByText("Label 2")).toBeInTheDocument();
    });

    test("displays all links", () => {
      renderWithRouter(<WorkDetail />);

      const link1 = screen.getByText("Link 1");
      const link2 = screen.getByText("Link 2");

      expect(link1).toBeInTheDocument();
      expect(link2).toBeInTheDocument();
      expect(link1.closest("a")).toHaveAttribute(
        "href",
        "https://example.com/link1",
      );
      expect(link2.closest("a")).toHaveAttribute(
        "href",
        "https://example.com/link2",
      );
    });

    test("links open in new tab", () => {
      renderWithRouter(<WorkDetail />);

      const link = screen.getByText("Link 1").closest("a");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("Missing Data Handling", () => {
    test("displays not available when description is missing", () => {
      const workWithoutDescription = { ...mockWork, description: null };
      mockUseWork.mockReturnValue({
        work: workWithoutDescription,
        isLoading: false,
      });

      renderWithRouter(<WorkDetail />);

      expect(screen.getByText(/common\.notAvailable/i)).toBeInTheDocument();
    });

    test("displays not available when content is missing", () => {
      const workWithoutContent = { ...mockWork, content: null };
      mockUseWork.mockReturnValue({
        work: workWithoutContent,
        isLoading: false,
      });

      renderWithRouter(<WorkDetail />);

      expect(screen.getByText(/common\.notAvailable/i)).toBeInTheDocument();
    });

    test("displays not available when approval date is missing", () => {
      const workWithoutDate = { ...mockWork, approvedAt: null };
      mockUseWork.mockReturnValue({
        work: workWithoutDate,
        isLoading: false,
      });

      renderWithRouter(<WorkDetail />);

      expect(screen.getByText(/common\.notAvailable/i)).toBeInTheDocument();
    });

    test("does not render labels section when no labels", () => {
      const workWithoutLabels = { ...mockWork, labels: [] };
      mockUseWork.mockReturnValue({
        work: workWithoutLabels,
        isLoading: false,
      });

      renderWithRouter(<WorkDetail />);

      expect(
        screen.queryByText(/workDetail\.keywords/i),
      ).not.toBeInTheDocument();
    });

    test("does not render links section when no links", () => {
      const workWithoutLinks = { ...mockWork, links: [] };
      mockUseWork.mockReturnValue({
        work: workWithoutLinks,
        isLoading: false,
      });

      renderWithRouter(<WorkDetail />);

      expect(
        screen.queryByText(/workDetail\.additionalLinks/i),
      ).not.toBeInTheDocument();
    });

    test("does not render teacher section when no teacher", () => {
      const workWithoutTeacher = { ...mockWork, teachers: null };
      mockUseWork.mockReturnValue({
        work: workWithoutTeacher,
        isLoading: false,
      });

      renderWithRouter(<WorkDetail />);

      expect(
        screen.queryByText(/workDetail\.advisor/i),
      ).not.toBeInTheDocument();
    });

    test("does not render type when missing", () => {
      const workWithoutType = { ...mockWork, type: null };
      mockUseWork.mockReturnValue({
        work: workWithoutType,
        isLoading: false,
      });

      renderWithRouter(<WorkDetail />);

      expect(screen.queryByText(/article/i)).not.toBeInTheDocument();
    });
  });

  describe("Edit Button Visibility", () => {
    test("does not show edit button for unauthenticated users", () => {
      mockIsAuthenticated.mockReturnValue(false);

      renderWithRouter(<WorkDetail />);

      expect(screen.queryByText(/common\.edit/i)).not.toBeInTheDocument();
    });

    test("shows edit button for work owner with unpublished work", () => {
      const unpublishedWork = {
        ...mockWork,
        workStatus: { name: WORK_STATUS.SUBMITTED },
      };
      mockUseWork.mockReturnValue({
        work: unpublishedWork,
        isLoading: false,
      });
      mockIsAuthenticated.mockReturnValue(true);
      mockGetStoredUser.mockReturnValue({ id: 10 });

      renderWithRouter(<WorkDetail />);

      expect(screen.getByText(/common\.edit/i)).toBeInTheDocument();
    });

    test("does not show edit button for non-owner", () => {
      mockIsAuthenticated.mockReturnValue(true);
      mockGetStoredUser.mockReturnValue({ id: 999 }); // Different user

      renderWithRouter(<WorkDetail />);

      expect(screen.queryByText(/common\.edit/i)).not.toBeInTheDocument();
    });

    test("shows edit button for teacher regardless of ownership", () => {
      mockIsAuthenticated.mockReturnValue(true);
      mockGetStoredUser.mockReturnValue({ id: 999 });
      mockIsTeacher.mockReturnValue(true);

      renderWithRouter(<WorkDetail />);

      expect(screen.getByText(/common\.edit/i)).toBeInTheDocument();
    });

    test("does not show edit button for owner with published work", () => {
      mockIsAuthenticated.mockReturnValue(true);
      mockGetStoredUser.mockReturnValue({ id: 10 });
      mockIsTeacher.mockReturnValue(false);

      renderWithRouter(<WorkDetail />);

      expect(screen.queryByText(/common\.edit/i)).not.toBeInTheDocument();
    });
  });

  describe("Evaluate Button Visibility", () => {
    test("shows evaluate button for submitted work", () => {
      const submittedWork = {
        ...mockWork,
        status: WORK_STATUS.SUBMITTED,
      };
      mockUseWork.mockReturnValue({
        work: submittedWork,
        isLoading: false,
      });

      renderWithRouter(<WorkDetail />);

      expect(screen.getByText(/workDetail\.evaluate/i)).toBeInTheDocument();
    });

    test("shows evaluate button for work under review when user is teacher", () => {
      const underReviewWork = {
        ...mockWork,
        status: WORK_STATUS.UNDER_REVIEW,
      };
      mockUseWork.mockReturnValue({
        work: underReviewWork,
        isLoading: false,
      });
      mockIsTeacher.mockReturnValue(true);

      renderWithRouter(<WorkDetail />);

      expect(screen.getByText(/workDetail\.evaluate/i)).toBeInTheDocument();
    });

    test("does not show evaluate button for published work", () => {
      renderWithRouter(<WorkDetail />);

      expect(
        screen.queryByText(/workDetail\.evaluate/i),
      ).not.toBeInTheDocument();
    });

    test("does not show evaluate button for under review when not teacher", () => {
      const underReviewWork = {
        ...mockWork,
        status: WORK_STATUS.UNDER_REVIEW,
      };
      mockUseWork.mockReturnValue({
        work: underReviewWork,
        isLoading: false,
      });
      mockIsTeacher.mockReturnValue(false);

      renderWithRouter(<WorkDetail />);

      expect(
        screen.queryByText(/workDetail\.evaluate/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("Button Actions", () => {
    test("edit button navigates to edit page with Portuguese language", () => {
      mockIsAuthenticated.mockReturnValue(true);
      mockGetStoredUser.mockReturnValue({ id: 10 });
      mockIsTeacher.mockReturnValue(true);
      mockUseTranslation.mockReturnValue({
        t: (key) => key,
        i18n: { language: "pt" },
      });

      renderWithRouter(<WorkDetail />);

      const editButton = screen.getByText(/common\.edit/i);
      fireEvent.click(editButton);

      expect(mockNavigate).toHaveBeenCalledWith("/pt/trabalho/editar/1");
    });

    test("edit button navigates to edit page with English language", () => {
      mockIsAuthenticated.mockReturnValue(true);
      mockGetStoredUser.mockReturnValue({ id: 10 });
      mockIsTeacher.mockReturnValue(true);
      mockUseTranslation.mockReturnValue({
        t: (key) => key,
        i18n: { language: "en" },
      });

      renderWithRouter(<WorkDetail />);

      const editButton = screen.getByText(/common\.edit/i);
      fireEvent.click(editButton);

      expect(mockNavigate).toHaveBeenCalledWith("/en/work/edit/1");
    });

    test("evaluate button calls navigateToWorkEvaluation", () => {
      const submittedWork = {
        ...mockWork,
        status: WORK_STATUS.SUBMITTED,
      };
      mockUseWork.mockReturnValue({
        work: submittedWork,
        isLoading: false,
      });

      renderWithRouter(<WorkDetail />);

      const evaluateButton = screen.getByText(/workDetail\.evaluate/i);
      fireEvent.click(evaluateButton);

      expect(mockNavigateToWorkEvaluation).toHaveBeenCalledWith(submittedWork);
    });

    test("evaluate button does not call navigation when work is null", () => {
      mockUseWork.mockReturnValue({
        work: null,
        isLoading: false,
      });

      renderWithRouter(<WorkDetail />);

      expect(mockNavigateToWorkEvaluation).not.toHaveBeenCalled();
    });
  });

  describe("ID Parameter Handling", () => {
    test("handles numeric string ID", () => {
      mockUseParams.mockReturnValue({ id: "42" });

      renderWithRouter(<WorkDetail />);

      expect(mockUseWork).toHaveBeenCalledWith({ id: 42 });
    });

    test("handles ID with leading zeros", () => {
      mockUseParams.mockReturnValue({ id: "007" });

      renderWithRouter(<WorkDetail />);

      expect(mockUseWork).toHaveBeenCalledWith({ id: 7 });
    });
  });

  describe("CSS Classes", () => {
    test("main container has correct class", () => {
      renderWithRouter(<WorkDetail />);

      const container = screen
        .getByText(mockWork.title)
        .closest(".work-detail-container");
      expect(container).toBeInTheDocument();
    });

    test("image has correct classes", () => {
      renderWithRouter(<WorkDetail />);

      const image = screen.getByAltText(mockWork.title);
      expect(image).toHaveClass("work-detail-image");
    });

    test("keyword tags have correct class", () => {
      renderWithRouter(<WorkDetail />);

      const label = screen.getByText("Label 1");
      expect(label).toHaveClass("keyword-tag");
    });
  });
});
