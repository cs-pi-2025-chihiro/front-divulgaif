import React from "react";
import { render, screen } from "@testing-library/react";
import DashboardOverview from "./DashboardOverview";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

jest.mock("../StatCard", () => ({
  __esModule: true,
  default: ({ status, total, icon }) => (
    <div
      data-testid="stat-card"
      data-status={status}
      data-total={String(total)}
      data-icon={icon}
    >
      {status}: {total}
    </div>
  ),
}));

jest.mock("../BarListCard", () => ({
  __esModule: true,
  default: ({ title, data, isAuthor }) => (
    <div
      data-testid="bar-list-card"
      data-title={title}
      data-is-author={String(isAuthor)}
    >
      {title}
      {data.map((item, idx) => (
        <span key={idx} data-testid="bar-item">
          {item.name}:{item.value}
        </span>
      ))}
    </div>
  ),
}));

const defaultProps = {
  totalWorksByStatus: [
    { status: "PUBLISHED", total: 10 },
    { status: "PENDING_CHANGES", total: 3 },
    { status: "SUBMITTED", total: 5 },
  ],
  totalPublishedWorksByLabel: [
    { label: "Physics", total: 8 },
    { label: "Math", total: 6 },
    { label: "Chemistry", total: 4 },
  ],
  totalPublishedWorksByAuthor: [
    { author: "Alice Smith", total: 7 },
    { author: "Bob Jones", total: 5 },
  ],
};

describe("DashboardOverview Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders three StatCards", () => {
    render(<DashboardOverview {...defaultProps} />);
    const statCards = screen.getAllByTestId("stat-card");
    expect(statCards).toHaveLength(3);
  });

  test("StatCard for PUBLISHED status receives correct total", () => {
    render(<DashboardOverview {...defaultProps} />);
    const statCards = screen.getAllByTestId("stat-card");
    const publishedCard = statCards.find(
      (card) => card.getAttribute("data-status") === "dashboard.status.published"
    );
    expect(publishedCard).toBeDefined();
    expect(publishedCard).toHaveAttribute("data-total", "10");
  });

  test("StatCard for PENDING_CHANGES status receives correct total", () => {
    render(<DashboardOverview {...defaultProps} />);
    const statCards = screen.getAllByTestId("stat-card");
    const pendingCard = statCards.find(
      (card) => card.getAttribute("data-status") === "dashboard.status.pendingChanges"
    );
    expect(pendingCard).toBeDefined();
    expect(pendingCard).toHaveAttribute("data-total", "3");
  });

  test("StatCard for SUBMITTED status receives correct total", () => {
    render(<DashboardOverview {...defaultProps} />);
    const statCards = screen.getAllByTestId("stat-card");
    const submittedCard = statCards.find(
      (card) => card.getAttribute("data-status") === "dashboard.status.submitted"
    );
    expect(submittedCard).toBeDefined();
    expect(submittedCard).toHaveAttribute("data-total", "5");
  });

  test("StatCard for PUBLISHED uses CheckCheck icon", () => {
    render(<DashboardOverview {...defaultProps} />);
    const statCards = screen.getAllByTestId("stat-card");
    const publishedCard = statCards.find(
      (card) => card.getAttribute("data-status") === "dashboard.status.published"
    );
    expect(publishedCard).toHaveAttribute("data-icon", "CheckCheck");
  });

  test("StatCard for PENDING_CHANGES uses RefreshCw icon", () => {
    render(<DashboardOverview {...defaultProps} />);
    const statCards = screen.getAllByTestId("stat-card");
    const pendingCard = statCards.find(
      (card) => card.getAttribute("data-status") === "dashboard.status.pendingChanges"
    );
    expect(pendingCard).toHaveAttribute("data-icon", "RefreshCw");
  });

  test("StatCard for SUBMITTED uses Clock icon", () => {
    render(<DashboardOverview {...defaultProps} />);
    const statCards = screen.getAllByTestId("stat-card");
    const submittedCard = statCards.find(
      (card) => card.getAttribute("data-status") === "dashboard.status.submitted"
    );
    expect(submittedCard).toHaveAttribute("data-icon", "Clock");
  });

  test("renders two BarListCards", () => {
    render(<DashboardOverview {...defaultProps} />);
    const barCards = screen.getAllByTestId("bar-list-card");
    expect(barCards).toHaveLength(2);
  });

  test("BarListCard for labels has correct title", () => {
    render(<DashboardOverview {...defaultProps} />);
    const barCards = screen.getAllByTestId("bar-list-card");
    const labelsCard = barCards.find(
      (card) => card.getAttribute("data-title") === "dashboard.charts.frequentLabels"
    );
    expect(labelsCard).toBeDefined();
  });

  test("BarListCard for authors has correct title", () => {
    render(<DashboardOverview {...defaultProps} />);
    const barCards = screen.getAllByTestId("bar-list-card");
    const authorsCard = barCards.find(
      (card) => card.getAttribute("data-title") === "dashboard.charts.mostWorks"
    );
    expect(authorsCard).toBeDefined();
  });

  test("BarListCard for labels maps label/total to name/value", () => {
    render(<DashboardOverview {...defaultProps} />);
    expect(screen.getByText("Physics:8")).toBeInTheDocument();
    expect(screen.getByText("Math:6")).toBeInTheDocument();
    expect(screen.getByText("Chemistry:4")).toBeInTheDocument();
  });

  test("BarListCard for authors maps author/total to name/value", () => {
    render(<DashboardOverview {...defaultProps} />);
    expect(screen.getByText("Alice Smith:7")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones:5")).toBeInTheDocument();
  });

  test("BarListCard for labels does not receive isAuthor=true (no explicit isAuthor prop)", () => {
    render(<DashboardOverview {...defaultProps} />);
    const barCards = screen.getAllByTestId("bar-list-card");
    const labelsCard = barCards.find(
      (card) => card.getAttribute("data-title") === "dashboard.charts.frequentLabels"
    );
    // DashboardOverview does not pass isAuthor to the labels BarListCard,
    // so isAuthor defaults to false inside BarListCard (undefined at the prop level)
    expect(labelsCard).not.toHaveAttribute("data-is-author", "true");
  });

  test("BarListCard for authors passes isAuthor as true", () => {
    render(<DashboardOverview {...defaultProps} />);
    const barCards = screen.getAllByTestId("bar-list-card");
    const authorsCard = barCards.find(
      (card) => card.getAttribute("data-title") === "dashboard.charts.mostWorks"
    );
    expect(authorsCard).toHaveAttribute("data-is-author", "true");
  });

  test("slices labels data to at most 5 items", () => {
    const manyLabels = Array.from({ length: 8 }, (_, i) => ({
      label: `Label${i}`,
      total: i + 1,
    }));
    render(
      <DashboardOverview
        {...defaultProps}
        totalPublishedWorksByLabel={manyLabels}
      />
    );
    const barItems = screen.getAllByTestId("bar-item");
    const labelItems = barItems.filter((item) =>
      item.textContent.startsWith("Label")
    );
    expect(labelItems).toHaveLength(5);
  });

  test("slices authors data to at most 5 items", () => {
    const manyAuthors = Array.from({ length: 8 }, (_, i) => ({
      author: `Author${i}`,
      total: i + 1,
    }));
    render(
      <DashboardOverview
        {...defaultProps}
        totalPublishedWorksByAuthor={manyAuthors}
      />
    );
    const barItems = screen.getAllByTestId("bar-item");
    const authorItems = barItems.filter((item) =>
      item.textContent.startsWith("Author")
    );
    expect(authorItems).toHaveLength(5);
  });

  test("shows 0 total when a status is not present in totalWorksByStatus", () => {
    render(
      <DashboardOverview
        totalWorksByStatus={[{ status: "PUBLISHED", total: 5 }]}
        totalPublishedWorksByLabel={[]}
        totalPublishedWorksByAuthor={[]}
      />
    );
    const statCards = screen.getAllByTestId("stat-card");
    const pendingCard = statCards.find(
      (card) => card.getAttribute("data-status") === "dashboard.status.pendingChanges"
    );
    const submittedCard = statCards.find(
      (card) => card.getAttribute("data-status") === "dashboard.status.submitted"
    );
    expect(pendingCard).toHaveAttribute("data-total", "0");
    expect(submittedCard).toHaveAttribute("data-total", "0");
  });

  test("handles empty arrays for all props", () => {
    render(
      <DashboardOverview
        totalWorksByStatus={[]}
        totalPublishedWorksByLabel={[]}
        totalPublishedWorksByAuthor={[]}
      />
    );
    const statCards = screen.getAllByTestId("stat-card");
    expect(statCards).toHaveLength(3);
    statCards.forEach((card) => {
      expect(card).toHaveAttribute("data-total", "0");
    });
  });
});
