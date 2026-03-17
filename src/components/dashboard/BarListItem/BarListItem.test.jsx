import React from "react";
import { render, screen } from "@testing-library/react";
import BarListItem from "./BarListItem";

describe("BarListItem Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the item name", () => {
    render(<BarListItem name="React" value={10} maxValue={100} />);
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  test("renders the item value", () => {
    render(<BarListItem name="React" value={42} maxValue={100} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  test("sets bar width proportional to value/maxValue", () => {
    const { container } = render(
      <BarListItem name="React" value={50} maxValue={100} />
    );
    const bar = container.querySelector(".bar-list-bar");
    expect(bar).toHaveStyle({ width: "50%" });
  });

  test("sets bar width to 100% when value equals maxValue", () => {
    const { container } = render(
      <BarListItem name="React" value={80} maxValue={80} />
    );
    const bar = container.querySelector(".bar-list-bar");
    expect(bar).toHaveStyle({ width: "100%" });
  });

  test("sets bar width to 0% when maxValue is zero", () => {
    const { container } = render(
      <BarListItem name="React" value={10} maxValue={0} />
    );
    const bar = container.querySelector(".bar-list-bar");
    expect(bar).toHaveStyle({ width: "0%" });
  });

  test("sets bar width to 0% when value is zero", () => {
    const { container } = render(
      <BarListItem name="React" value={0} maxValue={100} />
    );
    const bar = container.querySelector(".bar-list-bar");
    expect(bar).toHaveStyle({ width: "0%" });
  });

  test("truncates name longer than 40 characters with ellipsis", () => {
    const longName = "A very long name that exceeds forty characters limit";
    render(<BarListItem name={longName} value={5} maxValue={10} />);
    expect(
      screen.getByText("A very long name that exceeds forty char...")
    ).toBeInTheDocument();
  });

  test("does not truncate name of exactly 40 characters", () => {
    const exactName = "Exactly forty characters long name here!";
    render(<BarListItem name={exactName} value={5} maxValue={10} />);
    expect(screen.getByText(exactName)).toBeInTheDocument();
  });

  test("does not truncate name shorter than 40 characters", () => {
    const shortName = "Short name";
    render(<BarListItem name={shortName} value={5} maxValue={10} />);
    expect(screen.getByText(shortName)).toBeInTheDocument();
  });

  test("shows only the first word when isAuthor is true", () => {
    render(
      <BarListItem name="John Doe Smith" value={5} maxValue={10} isAuthor={true} />
    );
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.queryByText("John Doe Smith")).not.toBeInTheDocument();
  });

  test("shows full name truncation logic when isAuthor is false", () => {
    const longName = "Very Long Author Name That Goes Beyond Forty Characters";
    render(
      <BarListItem name={longName} value={5} maxValue={10} isAuthor={false} />
    );
    expect(
      screen.getByText("Very Long Author Name That Goes Beyond F...")
    ).toBeInTheDocument();
  });

  test("sets title attribute to full name for tooltip", () => {
    const name = "Full Name For Tooltip";
    render(<BarListItem name={name} value={5} maxValue={10} />);
    const nameSpan = screen.getByTitle(name);
    expect(nameSpan).toBeInTheDocument();
  });

  test("title attribute always shows full name even when truncated", () => {
    const longName = "A very long name that exceeds forty characters for sure here";
    render(<BarListItem name={longName} value={3} maxValue={10} />);
    const nameSpan = screen.getByTitle(longName);
    expect(nameSpan).toBeInTheDocument();
  });

  test("computes bar width as a percentage based on value/maxValue", () => {
    const { container } = render(
      <BarListItem name="Item" value={25} maxValue={200} />
    );
    const bar = container.querySelector(".bar-list-bar");
    expect(bar).toHaveStyle({ width: "12.5%" });
  });
});
