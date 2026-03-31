import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import WorkCard from "./workCard";

const mockNavigate = jest.fn();
let mockLanguage = "pt";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { get language() { return mockLanguage; } },
  }),
}));

const renderWithRouter = (ui) =>
  render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {ui}
    </BrowserRouter>
  );

describe("WorkCard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders title", () => {
    renderWithRouter(<WorkCard id="1" title="My Work Title" />);
    expect(screen.getByText("My Work Title")).toBeInTheDocument();
  });

  test("renders description", () => {
    renderWithRouter(<WorkCard id="1" description="Work description text" />);
    expect(screen.getByText("Work description text")).toBeInTheDocument();
  });

  test("renders authors as objects with name property", () => {
    const authors = [{ name: "Alice" }, { name: "Bob" }];
    renderWithRouter(<WorkCard id="1" authors={authors} />);
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
    expect(screen.getByText(/Bob/)).toBeInTheDocument();
  });

  test("renders only up to 2 authors", () => {
    const authors = [{ name: "Alice" }, { name: "Bob" }, { name: "Charlie" }];
    renderWithRouter(<WorkCard id="1" authors={authors} />);
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
    expect(screen.getByText(/Bob/)).toBeInTheDocument();
    expect(screen.queryByText(/Charlie/)).not.toBeInTheDocument();
  });

  test("renders labels as objects with name property", () => {
    const labels = [{ name: "Physics" }, { name: "Math" }, { name: "Chemistry" }];
    renderWithRouter(<WorkCard id="1" labels={labels} />);
    expect(screen.getByText("Physics")).toBeInTheDocument();
    expect(screen.getByText("Math")).toBeInTheDocument();
    expect(screen.getByText("Chemistry")).toBeInTheDocument();
  });

  test("renders only up to 3 labels", () => {
    const labels = [
      { name: "L1" },
      { name: "L2" },
      { name: "L3" },
      { name: "L4" },
    ];
    renderWithRouter(<WorkCard id="1" labels={labels} />);
    expect(screen.getByText("L1")).toBeInTheDocument();
    expect(screen.getByText("L2")).toBeInTheDocument();
    expect(screen.getByText("L3")).toBeInTheDocument();
    expect(screen.queryByText("L4")).not.toBeInTheDocument();
  });

  test("renders approvedAt date", () => {
    renderWithRouter(<WorkCard id="1" approvedAt="2024-01-15" />);
    expect(screen.getByText("2024-01-15")).toBeInTheDocument();
  });

  test("navigates to Portuguese work path when language is pt and card is clicked", () => {
    renderWithRouter(<WorkCard id="42" title="Work" />);
    const card = screen.getByText("Work").closest(".work-card-new");
    fireEvent.click(card);
    expect(mockNavigate).toHaveBeenCalledWith("/pt/trabalho/42");
  });

  test("navigates to English work path when language is en and card is clicked", () => {
    mockLanguage = "en";
    renderWithRouter(<WorkCard id="7" title="English Work" />);
    const card = screen.getByText("English Work").closest(".work-card-new");
    fireEvent.click(card);
    expect(mockNavigate).toHaveBeenCalledWith("/en/work/7");
    mockLanguage = "pt";
  });

  test("shows Ver mais link when first author has a link", () => {
    const authors = [{ name: "Alice", link: "https://author.example.com" }];
    renderWithRouter(<WorkCard id="1" authors={authors} />);
    const link = screen.getByText("Ver mais");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://author.example.com");
  });

  test("shows Ver mais link when first author has a url property", () => {
    const authors = [{ name: "Alice", url: "https://author.example.com/url" }];
    renderWithRouter(<WorkCard id="1" authors={authors} />);
    const link = screen.getByText("Ver mais");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://author.example.com/url");
  });

  test("does not show Ver mais link when first author has no link or url", () => {
    const authors = [{ name: "Alice" }];
    renderWithRouter(<WorkCard id="1" authors={authors} />);
    expect(screen.queryByText("Ver mais")).not.toBeInTheDocument();
  });

  test("Ver mais link click does not trigger card navigation (stopPropagation)", () => {
    const authors = [{ name: "Alice", link: "https://example.com" }];
    renderWithRouter(<WorkCard id="1" authors={authors} />);
    const link = screen.getByText("Ver mais");
    fireEvent.click(link);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("calls onView callback when card is clicked", () => {
    const onView = jest.fn();
    renderWithRouter(<WorkCard id="1" title="Work" onView={onView} />);
    const card = screen.getByText("Work").closest(".work-card-new");
    fireEvent.click(card);
    expect(onView).toHaveBeenCalledTimes(1);
  });

  test("does not navigate when id is not provided", () => {
    renderWithRouter(<WorkCard title="No ID Work" />);
    const card = screen.getByText("No ID Work").closest(".work-card-new");
    fireEvent.click(card);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("uses default image when imageUrl is not provided", () => {
    renderWithRouter(<WorkCard id="1" title="Default Image" />);
    const img = screen.getByAltText("Default Image");
    expect(img).toHaveAttribute("src", "/default-image.jpg");
  });

  test("uses custom imageUrl when provided", () => {
    renderWithRouter(
      <WorkCard id="1" title="Custom Img" imageUrl="https://example.com/img.jpg" />
    );
    const img = screen.getByAltText("Custom Img");
    expect(img).toHaveAttribute("src", "https://example.com/img.jpg");
  });
});
