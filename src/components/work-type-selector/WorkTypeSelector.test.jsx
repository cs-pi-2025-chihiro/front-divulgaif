import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import WorkTypeSelector from "./WorkTypeSelector";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe("WorkTypeSelector Component", () => {
  const onTypeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders 5 work type buttons", () => {
    render(<WorkTypeSelector onTypeChange={onTypeChange} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(5);
  });

  test("renders button for ARTICLE type", () => {
    render(<WorkTypeSelector onTypeChange={onTypeChange} />);
    expect(screen.getByText("workTypes.article")).toBeInTheDocument();
  });

  test("renders button for RESEARCH type", () => {
    render(<WorkTypeSelector onTypeChange={onTypeChange} />);
    expect(screen.getByText("workTypes.research")).toBeInTheDocument();
  });

  test("renders button for DISSERTATION type", () => {
    render(<WorkTypeSelector onTypeChange={onTypeChange} />);
    expect(screen.getByText("workTypes.dissertation")).toBeInTheDocument();
  });

  test("renders button for EXTENSION type", () => {
    render(<WorkTypeSelector onTypeChange={onTypeChange} />);
    expect(screen.getByText("workTypes.extension")).toBeInTheDocument();
  });

  test("renders button for FINAL_THESIS type", () => {
    render(<WorkTypeSelector onTypeChange={onTypeChange} />);
    expect(screen.getByText("workTypes.finalThesis")).toBeInTheDocument();
  });

  test("clicking ARTICLE button calls onTypeChange with 'ARTICLE'", () => {
    render(<WorkTypeSelector onTypeChange={onTypeChange} />);
    fireEvent.click(screen.getByText("workTypes.article"));
    expect(onTypeChange).toHaveBeenCalledWith("ARTICLE");
    expect(onTypeChange).toHaveBeenCalledTimes(1);
  });

  test("clicking RESEARCH button calls onTypeChange with 'RESEARCH'", () => {
    render(<WorkTypeSelector onTypeChange={onTypeChange} />);
    fireEvent.click(screen.getByText("workTypes.research"));
    expect(onTypeChange).toHaveBeenCalledWith("RESEARCH");
  });

  test("clicking DISSERTATION button calls onTypeChange with 'DISSERTATION'", () => {
    render(<WorkTypeSelector onTypeChange={onTypeChange} />);
    fireEvent.click(screen.getByText("workTypes.dissertation"));
    expect(onTypeChange).toHaveBeenCalledWith("DISSERTATION");
  });

  test("clicking EXTENSION button calls onTypeChange with 'EXTENSION'", () => {
    render(<WorkTypeSelector onTypeChange={onTypeChange} />);
    fireEvent.click(screen.getByText("workTypes.extension"));
    expect(onTypeChange).toHaveBeenCalledWith("EXTENSION");
  });

  test("clicking FINAL_THESIS button calls onTypeChange with 'FINAL_THESIS'", () => {
    render(<WorkTypeSelector onTypeChange={onTypeChange} />);
    fireEvent.click(screen.getByText("workTypes.finalThesis"));
    expect(onTypeChange).toHaveBeenCalledWith("FINAL_THESIS");
  });

  test("no button has active class by default when no selectedType is provided", () => {
    render(<WorkTypeSelector onTypeChange={onTypeChange} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).not.toHaveClass("active");
    });
  });

  test("applies active class to the selected button after clicking it", () => {
    render(<WorkTypeSelector onTypeChange={onTypeChange} />);
    const articleButton = screen.getByText("workTypes.article");
    fireEvent.click(articleButton);
    expect(articleButton).toHaveClass("active");
  });

  test("removes active class from previously selected button when a new one is clicked", () => {
    render(<WorkTypeSelector onTypeChange={onTypeChange} />);
    const articleButton = screen.getByText("workTypes.article");
    const researchButton = screen.getByText("workTypes.research");

    fireEvent.click(articleButton);
    expect(articleButton).toHaveClass("active");

    fireEvent.click(researchButton);
    expect(researchButton).toHaveClass("active");
    expect(articleButton).not.toHaveClass("active");
  });

  test("sets initial selection from selectedType prop", () => {
    render(
      <WorkTypeSelector onTypeChange={onTypeChange} selectedType="DISSERTATION" />
    );
    expect(screen.getByText("workTypes.dissertation")).toHaveClass("active");
  });

  test("other buttons do not have active class when initial selectedType is set", () => {
    render(
      <WorkTypeSelector onTypeChange={onTypeChange} selectedType="EXTENSION" />
    );
    const buttons = screen.getAllByRole("button");
    const inactiveButtons = buttons.filter(
      (btn) => btn.textContent !== "workTypes.extension"
    );
    inactiveButtons.forEach((btn) => {
      expect(btn).not.toHaveClass("active");
    });
  });

  test("updates active state when selectedType prop changes via rerender", () => {
    const { rerender } = render(
      <WorkTypeSelector onTypeChange={onTypeChange} selectedType="ARTICLE" />
    );
    expect(screen.getByText("workTypes.article")).toHaveClass("active");

    rerender(
      <WorkTypeSelector onTypeChange={onTypeChange} selectedType="RESEARCH" />
    );
    expect(screen.getByText("workTypes.research")).toHaveClass("active");
    expect(screen.getByText("workTypes.article")).not.toHaveClass("active");
  });

  test("clears active selection when selectedType prop is reset to empty string", () => {
    const { rerender } = render(
      <WorkTypeSelector onTypeChange={onTypeChange} selectedType="ARTICLE" />
    );
    expect(screen.getByText("workTypes.article")).toHaveClass("active");

    rerender(<WorkTypeSelector onTypeChange={onTypeChange} selectedType="" />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).not.toHaveClass("active");
    });
  });

  test("does not throw when onTypeChange is not provided", () => {
    render(<WorkTypeSelector />);
    expect(() => {
      fireEvent.click(screen.getByText("workTypes.article"));
    }).not.toThrow();
  });

  test("all buttons have type='button' attribute", () => {
    render(<WorkTypeSelector onTypeChange={onTypeChange} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute("type", "button");
    });
  });
});
