import React from "react";
import { render, screen } from "@testing-library/react";
import BarListCard from "./BarListCard";

jest.mock("../BarListItem", () => ({
  __esModule: true,
  default: ({ name, value, maxValue, isAuthor }) => (
    <div
      data-testid="bar-list-item"
      data-name={name}
      data-value={value}
      data-max-value={maxValue}
      data-is-author={String(isAuthor)}
    >
      {name}
    </div>
  ),
}));

describe("BarListCard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the card title", () => {
    render(<BarListCard title="Top Labels" data={[]} />);
    expect(screen.getByText("Top Labels")).toBeInTheDocument();
  });

  test("renders a BarListItem for each data entry", () => {
    const data = [
      { name: "React", value: 10 },
      { name: "Vue", value: 8 },
      { name: "Angular", value: 5 },
    ];
    render(<BarListCard title="Frameworks" data={data} />);
    const items = screen.getAllByTestId("bar-list-item");
    expect(items).toHaveLength(3);
  });

  test("renders item names correctly", () => {
    const data = [
      { name: "React", value: 10 },
      { name: "Vue", value: 8 },
    ];
    render(<BarListCard title="Frameworks" data={data} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Vue")).toBeInTheDocument();
  });

  test("passes maxValue as the maximum value in data to each BarListItem", () => {
    const data = [
      { name: "A", value: 30 },
      { name: "B", value: 70 },
      { name: "C", value: 50 },
    ];
    render(<BarListCard title="Stats" data={data} />);
    const items = screen.getAllByTestId("bar-list-item");
    items.forEach((item) => {
      expect(item).toHaveAttribute("data-max-value", "70");
    });
  });

  test("renders nothing in the list when data is empty", () => {
    render(<BarListCard title="Empty Card" data={[]} />);
    expect(screen.queryByTestId("bar-list-item")).not.toBeInTheDocument();
  });

  test("still renders the title when data is empty", () => {
    render(<BarListCard title="Empty Card" data={[]} />);
    expect(screen.getByText("Empty Card")).toBeInTheDocument();
  });

  test("passes isAuthor as false by default to BarListItems", () => {
    const data = [{ name: "Label", value: 5 }];
    render(<BarListCard title="Labels" data={data} />);
    const item = screen.getByTestId("bar-list-item");
    expect(item).toHaveAttribute("data-is-author", "false");
  });

  test("passes isAuthor as true to BarListItems when isAuthor prop is true", () => {
    const data = [{ name: "Alice", value: 5 }];
    render(<BarListCard title="Authors" data={data} isAuthor={true} />);
    const item = screen.getByTestId("bar-list-item");
    expect(item).toHaveAttribute("data-is-author", "true");
  });

  test("passes correct value for each BarListItem", () => {
    const data = [
      { name: "A", value: 12 },
      { name: "B", value: 34 },
    ];
    render(<BarListCard title="Stats" data={data} />);
    const items = screen.getAllByTestId("bar-list-item");
    expect(items[0]).toHaveAttribute("data-value", "12");
    expect(items[1]).toHaveAttribute("data-value", "34");
  });

  test("passes correct name for each BarListItem", () => {
    const data = [
      { name: "Physics", value: 10 },
      { name: "Math", value: 20 },
    ];
    render(<BarListCard title="Labels" data={data} />);
    const items = screen.getAllByTestId("bar-list-item");
    expect(items[0]).toHaveAttribute("data-name", "Physics");
    expect(items[1]).toHaveAttribute("data-name", "Math");
  });

  test("renders title inside a heading element", () => {
    render(<BarListCard title="Chart Title" data={[]} />);
    expect(
      screen.getByRole("heading", { name: "Chart Title" })
    ).toBeInTheDocument();
  });
});
