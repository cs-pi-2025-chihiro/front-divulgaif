import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "./button";

describe("Button Component", () => {
  test("renders button with text", () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByText(/click me/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test("calls onClick handler when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const buttonElement = screen.getByText(/click me/i);
    fireEvent.click(buttonElement);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("does not call onClick when disabled", () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>,
    );

    const buttonElement = screen.getByText(/click me/i);
    fireEvent.click(buttonElement);

    expect(handleClick).not.toHaveBeenCalled();
  });

  test("applies correct variant class", () => {
    render(<Button variant="primary">Primary Button</Button>);
    const buttonElement = screen.getByText(/primary button/i);
    expect(buttonElement).toHaveClass("btn-primary");
  });

  test("applies correct size class", () => {
    render(<Button size="lg">Large Button</Button>);
    const buttonElement = screen.getByText(/large button/i);
    expect(buttonElement).toHaveClass("btn-size-lg");
  });

  test("handles keyboard events (Enter key)", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Press Enter</Button>);

    const buttonElement = screen.getByText(/press enter/i);
    fireEvent.keyDown(buttonElement, { key: "Enter", code: "Enter" });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("handles keyboard events (Space key)", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Press Space</Button>);

    const buttonElement = screen.getByText(/press space/i);
    fireEvent.keyDown(buttonElement, { key: " ", code: "Space" });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("applies custom className", () => {
    render(<Button className="custom-class">Custom Button</Button>);
    const buttonElement = screen.getByText(/custom button/i);
    expect(buttonElement).toHaveClass("custom-class");
  });

  test("renders with correct aria-label", () => {
    render(<Button ariaLabel="Custom aria label">Button</Button>);
    const buttonElement = screen.getByLabelText(/custom aria label/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test("has aria-disabled when disabled", () => {
    render(<Button disabled>Disabled Button</Button>);
    const buttonElement = screen.getByText(/disabled button/i);
    expect(buttonElement).toHaveAttribute("aria-disabled", "true");
  });

  test("has correct tabIndex when disabled", () => {
    render(<Button disabled>Disabled Button</Button>);
    const buttonElement = screen.getByText(/disabled button/i);
    expect(buttonElement).toHaveAttribute("tabIndex", "-1");
  });

  test("renders with default type button", () => {
    render(<Button>Default Type</Button>);
    const buttonElement = screen.getByText(/default type/i);
    expect(buttonElement).toHaveAttribute("type", "button");
  });

  test("renders with submit type when specified", () => {
    render(<Button type="submit">Submit</Button>);
    const buttonElement = screen.getByText(/submit/i);
    expect(buttonElement).toHaveAttribute("type", "submit");
  });
});
