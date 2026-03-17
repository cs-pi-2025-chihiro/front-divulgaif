import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PaginatedResults from "./paginated-results";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts) => {
      if (opts && opts.count !== undefined) return `${opts.count} results found`;
      return key;
    },
    i18n: { language: "pt" },
  }),
}));

jest.mock("../button", () => {
  const MockButton = ({ children, onClick, disabled, "aria-label": ariaLabel }) => (
    <button onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  );
  return MockButton;
});

jest.mock("../card/work-card", () => {
  const MockWorkCard = ({ id, title }) => (
    <div data-testid={`work-card-${id}`}>{title}</div>
  );
  return MockWorkCard;
});

jest.mock("../../constants", () => ({
  PAGE_SIZE: 8,
}));

const defaultProps = {
  content: [],
  totalPages: 1,
  isLoading: false,
  currentPage: 0,
  setCurrentPage: jest.fn(),
  totalElements: 0,
  refetch: jest.fn(),
};

describe("PaginatedResults", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders totalElements count", () => {
    render(<PaginatedResults {...defaultProps} totalElements={5} />);

    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  test("shows loading state when isLoading=true", () => {
    render(<PaginatedResults {...defaultProps} isLoading={true} />);

    expect(screen.getByText("---")).toBeInTheDocument();
    expect(document.querySelector(".paginated-results-spinner")).toBeInTheDocument();
  });

  test("shows no results when content is empty and not loading", () => {
    render(<PaginatedResults {...defaultProps} content={[]} isLoading={false} />);

    expect(screen.getByText("errors.NoWorksFound")).toBeInTheDocument();
  });

  test("renders WorkCards for each item in content", () => {
    const content = [
      { id: 1, title: "Work 1", authors: [], description: "", labels: [], approvedAt: "", imageUrl: "" },
      { id: 2, title: "Work 2", authors: [], description: "", labels: [], approvedAt: "", imageUrl: "" },
      { id: 3, title: "Work 3", authors: [], description: "", labels: [], approvedAt: "", imageUrl: "" },
    ];

    render(<PaginatedResults {...defaultProps} content={content} totalElements={3} />);

    expect(screen.getByTestId("work-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("work-card-2")).toBeInTheDocument();
    expect(screen.getByTestId("work-card-3")).toBeInTheDocument();
  });

  test("previous button is disabled on first page (currentPage=0)", () => {
    render(<PaginatedResults {...defaultProps} currentPage={0} totalPages={3} />);

    const prevButton = screen.getByLabelText("pagination.previousPage");
    expect(prevButton).toBeDisabled();
  });

  test("next button is disabled on last page (currentPage=totalPages-1)", () => {
    render(
      <PaginatedResults {...defaultProps} currentPage={2} totalPages={3} totalElements={10} />
    );

    const nextButton = screen.getByLabelText("pagination.nextPage");
    expect(nextButton).toBeDisabled();
  });

  test("clicking next page calls setCurrentPage and refetch", () => {
    const setCurrentPage = jest.fn();
    const refetch = jest.fn();

    render(
      <PaginatedResults
        {...defaultProps}
        currentPage={0}
        totalPages={3}
        setCurrentPage={setCurrentPage}
        refetch={refetch}
        totalElements={10}
      />
    );

    const nextButton = screen.getByLabelText("pagination.nextPage");
    fireEvent.click(nextButton);

    expect(setCurrentPage).toHaveBeenCalledWith(1);
    expect(refetch).toHaveBeenCalled();
  });

  test("clicking prev page calls setCurrentPage and refetch when currentPage > 0", () => {
    const setCurrentPage = jest.fn();
    const refetch = jest.fn();

    render(
      <PaginatedResults
        {...defaultProps}
        currentPage={2}
        totalPages={5}
        setCurrentPage={setCurrentPage}
        refetch={refetch}
        totalElements={20}
      />
    );

    const prevButton = screen.getByLabelText("pagination.previousPage");
    fireEvent.click(prevButton);

    expect(setCurrentPage).toHaveBeenCalledWith(1);
    expect(refetch).toHaveBeenCalled();
  });

  test("prev button does nothing when currentPage is 0", () => {
    const setCurrentPage = jest.fn();
    const refetch = jest.fn();

    render(
      <PaginatedResults
        {...defaultProps}
        currentPage={0}
        totalPages={3}
        setCurrentPage={setCurrentPage}
        refetch={refetch}
        totalElements={10}
      />
    );

    const prevButton = screen.getByLabelText("pagination.previousPage");
    fireEvent.click(prevButton);

    expect(setCurrentPage).not.toHaveBeenCalled();
    expect(refetch).not.toHaveBeenCalled();
  });
});
