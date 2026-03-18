import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Dashboard from "./page";
import { useDashboard } from "./useDashboard";
import { useTranslation } from "react-i18next";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock("./useDashboard", () => ({
  useDashboard: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

// Mock CSS import so it doesn't crash in the test environment
jest.mock("./page.css", () => ({}), { virtual: true });

// Mock heavy child components – the page tests focus solely on the Dashboard
// page logic (loading / error / normal rendering + view toggling).
jest.mock("../../../../components/dashboard/DashboardOverview", () => {
  return function MockDashboardOverview(props) {
    return (
      <div data-testid="dashboard-overview">
        <span data-testid="overview-status-data">
          {JSON.stringify(props.totalWorksByStatus)}
        </span>
        <span data-testid="overview-label-data">
          {JSON.stringify(props.totalPublishedWorksByLabel)}
        </span>
        <span data-testid="overview-author-data">
          {JSON.stringify(props.totalPublishedWorksByAuthor)}
        </span>
      </div>
    );
  };
});

jest.mock("../../../../components/dashboard/DetailedAnalysis", () => {
  return function MockDetailedAnalysis(props) {
    return (
      <div data-testid="detailed-analysis">
        <span data-testid="active-detail-view">{props.activeDetailView}</span>
        <button
          data-testid="toggle-detail-view-btn"
          onClick={() => props.onToggleDetailView("authors")}
        >
          Switch to authors
        </button>
        <span data-testid="is-detailed-loading">
          {String(props.isDetailedLoading)}
        </span>
      </div>
    );
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockT = (key) => key;

const defaultDashboardData = {
  isLoading: false,
  error: null,
  totalWorksByStatus: [{ status: "PUBLISHED", count: 5 }],
  totalPublishedWorksByLabel: [{ label: "AI", count: 3 }],
  totalPublishedWorksByAuthor: [{ author: "Alice", count: 2 }],
  isDetailedLoading: false,
  detailedStats: { quantityOfLabels: 10 },
  detailedList: [],
};

function setupMocks(dashboardOverrides = {}) {
  useTranslation.mockReturnValue({ t: mockT });
  useDashboard.mockReturnValue({ ...defaultDashboardData, ...dashboardOverrides });
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("Dashboard page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  describe("loading state", () => {
    it("renders the loading indicator when isLoading is true", () => {
      setupMocks({ isLoading: true });

      render(<Dashboard />);

      expect(screen.getByText("dashboard.loading")).toBeInTheDocument();
      expect(screen.queryByTestId("dashboard-overview")).not.toBeInTheDocument();
      expect(screen.queryByTestId("detailed-analysis")).not.toBeInTheDocument();
    });

    it("renders a div with class dashboard-loading when loading", () => {
      setupMocks({ isLoading: true });

      const { container } = render(<Dashboard />);

      expect(container.querySelector(".dashboard-loading")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Error state
  // -------------------------------------------------------------------------

  describe("error state", () => {
    it("renders error message when there is a non-403 error", () => {
      setupMocks({
        isLoading: false,
        error: { status: 500, message: "Internal Server Error" },
      });

      render(<Dashboard />);

      expect(screen.getByText(/dashboard\.error/i)).toBeInTheDocument();
      expect(screen.getByText(/Internal Server Error/i)).toBeInTheDocument();
      expect(screen.queryByTestId("dashboard-overview")).not.toBeInTheDocument();
    });

    it("renders the dashboard normally when the error status is 403 (access check)", () => {
      // A 403 error is treated as an expected / informational state and should
      // NOT trigger the error screen – the normal dashboard view is shown instead.
      setupMocks({
        isLoading: false,
        error: { status: 403, message: "Forbidden" },
      });

      render(<Dashboard />);

      expect(screen.getByTestId("dashboard-overview")).toBeInTheDocument();
      expect(screen.queryByText(/dashboard\.error/i)).not.toBeInTheDocument();
    });

    it("renders error div with class dashboard-error for non-403 errors", () => {
      setupMocks({
        isLoading: false,
        error: { status: 404, message: "Not Found" },
      });

      const { container } = render(<Dashboard />);

      expect(container.querySelector(".dashboard-error")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Normal (populated) state
  // -------------------------------------------------------------------------

  describe("normal state", () => {
    it("renders DashboardOverview and DetailedAnalysis when data is ready", () => {
      setupMocks();

      render(<Dashboard />);

      expect(screen.getByTestId("dashboard-overview")).toBeInTheDocument();
      expect(screen.getByTestId("detailed-analysis")).toBeInTheDocument();
    });

    it("passes the correct props to DashboardOverview", () => {
      setupMocks();

      render(<Dashboard />);

      expect(screen.getByTestId("overview-status-data")).toHaveTextContent(
        JSON.stringify(defaultDashboardData.totalWorksByStatus)
      );
      expect(screen.getByTestId("overview-label-data")).toHaveTextContent(
        JSON.stringify(defaultDashboardData.totalPublishedWorksByLabel)
      );
      expect(screen.getByTestId("overview-author-data")).toHaveTextContent(
        JSON.stringify(defaultDashboardData.totalPublishedWorksByAuthor)
      );
    });

    it("passes the default activeDetailView='labels' to DetailedAnalysis", () => {
      setupMocks();

      render(<Dashboard />);

      expect(screen.getByTestId("active-detail-view")).toHaveTextContent("labels");
    });

    it("passes isDetailedLoading=false to DetailedAnalysis when data is ready", () => {
      setupMocks({ isDetailedLoading: false });

      render(<Dashboard />);

      expect(screen.getByTestId("is-detailed-loading")).toHaveTextContent("false");
    });

    it("passes isDetailedLoading=true when detailed data is still loading", () => {
      setupMocks({ isDetailedLoading: true });

      render(<Dashboard />);

      expect(screen.getByTestId("is-detailed-loading")).toHaveTextContent("true");
    });
  });

  // -------------------------------------------------------------------------
  // State interactions
  // -------------------------------------------------------------------------

  describe("activeDetailView toggle", () => {
    it("starts with activeDetailView set to 'labels' by default", () => {
      setupMocks();

      render(<Dashboard />);

      // useDashboard is always called with the current activeDetailView.
      // On first render the default value is "labels".
      expect(useDashboard).toHaveBeenCalledWith("labels");
    });

    it("updates activeDetailView when the child calls onToggleDetailView", () => {
      setupMocks();

      render(<Dashboard />);

      // The mock DetailedAnalysis exposes a button that calls
      // onToggleDetailView("authors") when clicked.
      fireEvent.click(screen.getByTestId("toggle-detail-view-btn"));

      // After the toggle, useDashboard should be called with "authors".
      expect(useDashboard).toHaveBeenLastCalledWith("authors");
    });

    it("re-renders DetailedAnalysis with the updated activeDetailView", () => {
      setupMocks();

      render(<Dashboard />);

      expect(screen.getByTestId("active-detail-view")).toHaveTextContent("labels");

      fireEvent.click(screen.getByTestId("toggle-detail-view-btn"));

      expect(screen.getByTestId("active-detail-view")).toHaveTextContent("authors");
    });
  });

  // -------------------------------------------------------------------------
  // No error (null error)
  // -------------------------------------------------------------------------

  describe("null error", () => {
    it("does not show the error screen when error is null", () => {
      setupMocks({ error: null });

      render(<Dashboard />);

      expect(screen.queryByText(/dashboard\.error/i)).not.toBeInTheDocument();
      expect(screen.getByTestId("dashboard-overview")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Container class
  // -------------------------------------------------------------------------

  it("wraps the normal view in a div with class dashboard-container", () => {
    setupMocks();

    const { container } = render(<Dashboard />);

    expect(container.querySelector(".dashboard-container")).toBeInTheDocument();
  });
});
