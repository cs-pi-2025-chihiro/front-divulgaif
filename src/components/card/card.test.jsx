import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Card from "./card";

jest.mock("../image/image", () => ({
  __esModule: true,
  default: ({ src, alt, className }) => (
    <img src={src} alt={alt} className={className} data-testid="mock-image" />
  ),
}));

describe("Card Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders title when provided", () => {
    render(<Card title="My Card Title" />);
    expect(screen.getByText("My Card Title")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "My Card Title" })).toBeInTheDocument();
  });

  test("does not render title element when title is not provided", () => {
    render(<Card />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  test("renders content when provided", () => {
    render(<Card content="Some card content" />);
    expect(screen.getByText("Some card content")).toBeInTheDocument();
  });

  test("does not render card-body when content is not provided", () => {
    const { container } = render(<Card />);
    expect(container.querySelector(".card-body")).not.toBeInTheDocument();
  });

  test("renders footer when provided", () => {
    render(<Card footer={<button>Footer Action</button>} />);
    expect(screen.getByText("Footer Action")).toBeInTheDocument();
  });

  test("does not render card-footer when footer is not provided", () => {
    const { container } = render(<Card />);
    expect(container.querySelector(".card-footer")).not.toBeInTheDocument();
  });

  test("renders children", () => {
    render(
      <Card>
        <span>Child element</span>
      </Card>
    );
    expect(screen.getByText("Child element")).toBeInTheDocument();
  });

  test("calls onClick handler when the card is clicked", () => {
    const handleClick = jest.fn();
    const { container } = render(<Card onClick={handleClick} title="Clickable Card" />);
    fireEvent.click(container.querySelector(".card"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("renders image when imageUrl is provided", () => {
    render(<Card imageUrl="https://example.com/image.jpg" imageAlt="Test image" />);
    const img = screen.getByTestId("mock-image");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
    expect(img).toHaveAttribute("alt", "Test image");
  });

  test("renders image container when imageUrl is provided", () => {
    const { container } = render(<Card imageUrl="https://example.com/image.jpg" />);
    expect(container.querySelector(".card-image-container")).toBeInTheDocument();
  });

  test("does not render image when imageUrl is not provided", () => {
    render(<Card title="No Image" />);
    expect(screen.queryByTestId("mock-image")).not.toBeInTheDocument();
  });

  test("does not render image container when imageUrl is not provided", () => {
    const { container } = render(<Card title="No Image" />);
    expect(container.querySelector(".card-image-container")).not.toBeInTheDocument();
  });

  test("applies default card class", () => {
    const { container } = render(<Card />);
    expect(container.querySelector(".card")).toBeInTheDocument();
  });

  test("applies custom className alongside default card class", () => {
    const { container } = render(<Card className="custom-card" />);
    const card = container.querySelector(".card");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("card");
    expect(card).toHaveClass("custom-card");
  });

  test("uses empty string as default imageAlt when imageUrl is provided without alt", () => {
    render(<Card imageUrl="https://example.com/image.jpg" />);
    const img = screen.getByTestId("mock-image");
    expect(img).toHaveAttribute("alt", "");
  });

  test("renders title, content, footer and children together", () => {
    render(
      <Card
        title="Full Card"
        content="Body text"
        footer={<span>Footer text</span>}
      >
        <em>Child</em>
      </Card>
    );
    expect(screen.getByText("Full Card")).toBeInTheDocument();
    expect(screen.getByText("Body text")).toBeInTheDocument();
    expect(screen.getByText("Footer text")).toBeInTheDocument();
    expect(screen.getByText("Child")).toBeInTheDocument();
  });
});
