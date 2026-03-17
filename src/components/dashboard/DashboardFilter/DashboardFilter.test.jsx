import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DashboardFilter from "./DashboardFilter";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

jest.mock("lucide-react", () => ({
  BookOpen: (props) => <svg data-testid="icon-BookOpen" {...props} />,
  Tags: (props) => <svg data-testid="icon-Tags" {...props} />,
}));

describe("DashboardFilter Component", () => {
  const onToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders two filter toggle buttons", () => {
    render(<DashboardFilter activeView="authors" onToggle={onToggle} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
  });

  test("renders the authors button with translated label", () => {
    render(<DashboardFilter activeView="authors" onToggle={onToggle} />);
    expect(screen.getByText("dashboard.toggles.authors")).toBeInTheDocument();
  });

  test("renders the labels button with translated label", () => {
    render(<DashboardFilter activeView="labels" onToggle={onToggle} />);
    expect(screen.getByText("dashboard.toggles.labels")).toBeInTheDocument();
  });

  test("clicking the authors button calls onToggle with 'authors'", () => {
    render(<DashboardFilter activeView="" onToggle={onToggle} />);
    const authorsButton = screen.getByText("dashboard.toggles.authors").closest("button");
    fireEvent.click(authorsButton);
    expect(onToggle).toHaveBeenCalledWith("authors");
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  test("clicking the labels button calls onToggle with 'labels'", () => {
    render(<DashboardFilter activeView="" onToggle={onToggle} />);
    const labelsButton = screen.getByText("dashboard.toggles.labels").closest("button");
    fireEvent.click(labelsButton);
    expect(onToggle).toHaveBeenCalledWith("labels");
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  test("applies active class to authors button when activeView is 'authors'", () => {
    render(<DashboardFilter activeView="authors" onToggle={onToggle} />);
    const authorsButton = screen.getByText("dashboard.toggles.authors").closest("button");
    expect(authorsButton).toHaveClass("active");
  });

  test("does not apply active class to labels button when activeView is 'authors'", () => {
    render(<DashboardFilter activeView="authors" onToggle={onToggle} />);
    const labelsButton = screen.getByText("dashboard.toggles.labels").closest("button");
    expect(labelsButton).not.toHaveClass("active");
  });

  test("applies active class to labels button when activeView is 'labels'", () => {
    render(<DashboardFilter activeView="labels" onToggle={onToggle} />);
    const labelsButton = screen.getByText("dashboard.toggles.labels").closest("button");
    expect(labelsButton).toHaveClass("active");
  });

  test("does not apply active class to authors button when activeView is 'labels'", () => {
    render(<DashboardFilter activeView="labels" onToggle={onToggle} />);
    const authorsButton = screen.getByText("dashboard.toggles.authors").closest("button");
    expect(authorsButton).not.toHaveClass("active");
  });

  test("neither button has active class when activeView does not match any view", () => {
    render(<DashboardFilter activeView="" onToggle={onToggle} />);
    const authorsButton = screen.getByText("dashboard.toggles.authors").closest("button");
    const labelsButton = screen.getByText("dashboard.toggles.labels").closest("button");
    expect(authorsButton).not.toHaveClass("active");
    expect(labelsButton).not.toHaveClass("active");
  });

  test("renders BookOpen icon inside the authors button", () => {
    render(<DashboardFilter activeView="authors" onToggle={onToggle} />);
    expect(screen.getByTestId("icon-BookOpen")).toBeInTheDocument();
  });

  test("renders Tags icon inside the labels button", () => {
    render(<DashboardFilter activeView="labels" onToggle={onToggle} />);
    expect(screen.getByTestId("icon-Tags")).toBeInTheDocument();
  });

  test("buttons both have filter-toggle-btn class", () => {
    render(<DashboardFilter activeView="" onToggle={onToggle} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toHaveClass("filter-toggle-btn");
    });
  });
});
