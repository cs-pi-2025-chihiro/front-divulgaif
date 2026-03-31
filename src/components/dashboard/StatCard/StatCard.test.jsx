import React from "react";
import { render, screen } from "@testing-library/react";
import StatCard, { iconMap } from "./StatCard";

jest.mock("lucide-react", () => ({
  CheckCheck: (props) => <svg data-testid="icon-CheckCheck" {...props} />,
  Clock: (props) => <svg data-testid="icon-Clock" {...props} />,
  RefreshCw: (props) => <svg data-testid="icon-RefreshCw" {...props} />,
  Users: (props) => <svg data-testid="icon-Users" {...props} />,
  Globe: (props) => <svg data-testid="icon-Globe" {...props} />,
  Trophy: (props) => <svg data-testid="icon-Trophy" {...props} />,
  Tag: (props) => <svg data-testid="icon-Tag" {...props} />,
  TrendingUp: (props) => <svg data-testid="icon-TrendingUp" {...props} />,
  TrendingDown: (props) => <svg data-testid="icon-TrendingDown" {...props} />,
}));

describe("StatCard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the status text", () => {
    render(<StatCard status="Published" total={42} icon="CheckCheck" />);
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  test("renders the total value", () => {
    render(<StatCard status="Pending" total={7} icon="Clock" />);
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  test("renders total as zero", () => {
    render(<StatCard status="Submitted" total={0} icon="RefreshCw" />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  test("renders CheckCheck icon when icon prop is CheckCheck", () => {
    render(<StatCard status="Published" total={10} icon="CheckCheck" />);
    expect(screen.getByTestId("icon-CheckCheck")).toBeInTheDocument();
  });

  test("renders Clock icon when icon prop is Clock", () => {
    render(<StatCard status="Submitted" total={3} icon="Clock" />);
    expect(screen.getByTestId("icon-Clock")).toBeInTheDocument();
  });

  test("renders RefreshCw icon when icon prop is RefreshCw", () => {
    render(<StatCard status="Pending Changes" total={5} icon="RefreshCw" />);
    expect(screen.getByTestId("icon-RefreshCw")).toBeInTheDocument();
  });

  test("renders Users icon when icon prop is Users", () => {
    render(<StatCard status="Users" total={100} icon="Users" />);
    expect(screen.getByTestId("icon-Users")).toBeInTheDocument();
  });

  test("renders Globe icon when icon prop is Globe", () => {
    render(<StatCard status="Global" total={50} icon="Globe" />);
    expect(screen.getByTestId("icon-Globe")).toBeInTheDocument();
  });

  test("renders Trophy icon when icon prop is Trophy", () => {
    render(<StatCard status="Top" total={1} icon="Trophy" />);
    expect(screen.getByTestId("icon-Trophy")).toBeInTheDocument();
  });

  test("renders Tag icon when icon prop is Tag", () => {
    render(<StatCard status="Labels" total={20} icon="Tag" />);
    expect(screen.getByTestId("icon-Tag")).toBeInTheDocument();
  });

  test("renders TrendingUp icon when icon prop is TrendingUp", () => {
    render(<StatCard status="Growth" total={15} icon="TrendingUp" />);
    expect(screen.getByTestId("icon-TrendingUp")).toBeInTheDocument();
  });

  test("renders TrendingDown icon when icon prop is TrendingDown", () => {
    render(<StatCard status="Decline" total={2} icon="TrendingDown" />);
    expect(screen.getByTestId("icon-TrendingDown")).toBeInTheDocument();
  });

  test("falls back to CheckCheck icon for an unknown icon key", () => {
    render(<StatCard status="Unknown" total={0} icon="NonExistentIcon" />);
    expect(screen.getByTestId("icon-CheckCheck")).toBeInTheDocument();
  });

  test("falls back to CheckCheck icon when icon prop is undefined", () => {
    render(<StatCard status="No Icon" total={0} />);
    expect(screen.getByTestId("icon-CheckCheck")).toBeInTheDocument();
  });

  test("iconMap contains CheckCheck key", () => {
    expect(iconMap).toHaveProperty("CheckCheck");
    expect(typeof iconMap.CheckCheck).toBe("function");
  });

  test("iconMap contains all expected icon keys", () => {
    const expectedKeys = [
      "CheckCheck",
      "RefreshCw",
      "Clock",
      "Users",
      "Globe",
      "Trophy",
      "Tag",
      "TrendingUp",
      "TrendingDown",
    ];
    expectedKeys.forEach((key) => {
      expect(iconMap).toHaveProperty(key);
    });
  });
});
