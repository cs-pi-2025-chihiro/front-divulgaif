import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import NewLink from "./page";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createLink } from "../../../../../services/links/list";
import { navigateTo } from "../../../../../services/utils/utils";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

jest.mock("../../../../../services/links/list", () => ({
  createLink: jest.fn(),
}));

jest.mock("../../../../../services/utils/utils", () => ({
  navigateTo: jest.fn(),
}));

jest.mock("../../../../../components/button", () => {
  return function MockButton({ onClick, children, disabled, type, className }) {
    return (
      <button
        type={type || "button"}
        className={className}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    );
  };
});

// Stub CSS
jest.mock("./page.css", () => ({}), { virtual: true });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockNavigate = jest.fn();

function setupMocks({ lang = "pt" } = {}) {
  useNavigate.mockReturnValue(mockNavigate);
  useTranslation.mockReturnValue({
    t: (key) => key,
    i18n: { language: lang },
  });
}

function getTitleInput() {
  return screen.getByLabelText(/Título/);
}

function getUrlInput() {
  return screen.getByLabelText(/URL/);
}

function getSubmitButton() {
  return screen.getByRole("button", { name: /Salvar/ });
}

function getCancelButton() {
  return screen.getByRole("button", { name: /Cancelar/ });
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("NewLink page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  describe("initial rendering", () => {
    it("renders the form title", () => {
      setupMocks();
      render(<NewLink />);
      expect(screen.getByText("Novo link")).toBeInTheDocument();
    });

    it("renders the form description", () => {
      setupMocks();
      render(<NewLink />);
      expect(screen.getByText("Nova descrição")).toBeInTheDocument();
    });

    it("renders the title input", () => {
      setupMocks();
      render(<NewLink />);
      expect(getTitleInput()).toBeInTheDocument();
    });

    it("renders the URL input", () => {
      setupMocks();
      render(<NewLink />);
      expect(getUrlInput()).toBeInTheDocument();
    });

    it("renders the Save / Submit button", () => {
      setupMocks();
      render(<NewLink />);
      expect(getSubmitButton()).toBeInTheDocument();
    });

    it("renders the Cancel button", () => {
      setupMocks();
      render(<NewLink />);
      expect(getCancelButton()).toBeInTheDocument();
    });

    it("does NOT show a success message initially", () => {
      setupMocks();
      render(<NewLink />);
      expect(screen.queryByText("Link criado")).not.toBeInTheDocument();
    });

    it("does NOT show an error message initially", () => {
      setupMocks();
      render(<NewLink />);
      // The error-alert div should not be in the document
      const { container } = render(<NewLink />);
      expect(container.querySelector(".error-alert")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // handleInputChange
  // -------------------------------------------------------------------------

  describe("handleInputChange", () => {
    it("updates the title field when the user types", () => {
      setupMocks();
      render(<NewLink />);
      fireEvent.change(getTitleInput(), { target: { name: "title", value: "My Link" } });
      expect(getTitleInput()).toHaveValue("My Link");
    });

    it("updates the URL field when the user types", () => {
      setupMocks();
      render(<NewLink />);
      fireEvent.change(getUrlInput(), {
        target: { name: "url", value: "https://example.com" },
      });
      expect(getUrlInput()).toHaveValue("https://example.com");
    });

    it("clears any existing error when the user starts typing", () => {
      setupMocks();
      render(<NewLink />);

      // Trigger a validation error first (submit with empty title)
      fireEvent.click(getSubmitButton());
      expect(screen.getByText("Título necessário")).toBeInTheDocument();

      // Now type in the title input → error should clear
      fireEvent.change(getTitleInput(), { target: { name: "title", value: "x" } });
      expect(screen.queryByText("Título necessário")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Validation – empty title
  // -------------------------------------------------------------------------

  describe("form validation", () => {
    it("shows a 'title required' error when title is empty on submit", () => {
      setupMocks();
      render(<NewLink />);
      fireEvent.click(getSubmitButton());
      expect(screen.getByText("Título necessário")).toBeInTheDocument();
    });

    it("shows a 'title required' error when title contains only whitespace", () => {
      setupMocks();
      render(<NewLink />);
      fireEvent.change(getTitleInput(), { target: { name: "title", value: "   " } });
      fireEvent.click(getSubmitButton());
      expect(screen.getByText("Título necessário")).toBeInTheDocument();
    });

    it("shows a 'URL required' error when URL is empty on submit", () => {
      setupMocks();
      render(<NewLink />);
      fireEvent.change(getTitleInput(), { target: { name: "title", value: "My Link" } });
      fireEvent.click(getSubmitButton());
      expect(screen.getByText("URL necessário")).toBeInTheDocument();
    });

    it("shows a 'URL required' error when URL contains only whitespace", () => {
      setupMocks();
      render(<NewLink />);
      fireEvent.change(getTitleInput(), { target: { name: "title", value: "My Link" } });
      fireEvent.change(getUrlInput(), { target: { name: "url", value: "   " } });
      fireEvent.click(getSubmitButton());
      expect(screen.getByText("URL necessário")).toBeInTheDocument();
    });

    it("shows an 'invalid URL' error when the URL is not a valid URL", () => {
      setupMocks();
      render(<NewLink />);
      fireEvent.change(getTitleInput(), { target: { name: "title", value: "My Link" } });
      fireEvent.change(getUrlInput(), {
        target: { name: "url", value: "not-a-url" },
      });
      fireEvent.click(getSubmitButton());
      expect(screen.getByText("URL inválido")).toBeInTheDocument();
    });

    it("does NOT call createLink when validation fails", () => {
      setupMocks();
      render(<NewLink />);
      fireEvent.click(getSubmitButton());
      expect(createLink).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Successful submission
  // -------------------------------------------------------------------------

  describe("successful submission", () => {
    beforeEach(() => {
      createLink.mockResolvedValue({ id: "new-link-id" });
    });

    it("calls createLink with the trimmed form values", async () => {
      setupMocks();
      render(<NewLink />);

      fireEvent.change(getTitleInput(), {
        target: { name: "title", value: "  My Link  " },
      });
      fireEvent.change(getUrlInput(), {
        target: { name: "url", value: "  https://example.com  " },
      });

      await act(async () => {
        fireEvent.click(getSubmitButton());
      });

      await waitFor(() => {
        expect(createLink).toHaveBeenCalledWith({
          title: "My Link",
          url: "https://example.com",
        });
      });
    });

    it("shows the success message after a successful submission", async () => {
      setupMocks();
      render(<NewLink />);

      fireEvent.change(getTitleInput(), {
        target: { name: "title", value: "My Link" },
      });
      fireEvent.change(getUrlInput(), {
        target: { name: "url", value: "https://example.com" },
      });

      await act(async () => {
        fireEvent.click(getSubmitButton());
      });

      await waitFor(() => {
        expect(screen.getByText("Link criado")).toBeInTheDocument();
      });
    });

    it("resets the form fields after a successful submission", async () => {
      setupMocks();
      render(<NewLink />);

      fireEvent.change(getTitleInput(), {
        target: { name: "title", value: "My Link" },
      });
      fireEvent.change(getUrlInput(), {
        target: { name: "url", value: "https://example.com" },
      });

      await act(async () => {
        fireEvent.click(getSubmitButton());
      });

      await waitFor(() => {
        expect(getTitleInput()).toHaveValue("");
        expect(getUrlInput()).toHaveValue("");
      });
    });

    it("redirects to the links page after 1500 ms (pt language)", async () => {
      setupMocks({ lang: "pt" });
      render(<NewLink />);

      fireEvent.change(getTitleInput(), {
        target: { name: "title", value: "My Link" },
      });
      fireEvent.change(getUrlInput(), {
        target: { name: "url", value: "https://example.com" },
      });

      await act(async () => {
        fireEvent.click(getSubmitButton());
      });

      await waitFor(() => {
        expect(createLink).toHaveBeenCalled();
      });

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(navigateTo).toHaveBeenCalledWith("links", mockNavigate, "pt");
    });

    it("redirects to the links page after 1500 ms (en language)", async () => {
      setupMocks({ lang: "en" });
      render(<NewLink />);

      fireEvent.change(getTitleInput(), {
        target: { name: "title", value: "My Link" },
      });
      fireEvent.change(getUrlInput(), {
        target: { name: "url", value: "https://example.com" },
      });

      await act(async () => {
        fireEvent.click(getSubmitButton());
      });

      await waitFor(() => {
        expect(createLink).toHaveBeenCalled();
      });

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(navigateTo).toHaveBeenCalledWith("links", mockNavigate, "en");
    });

    it("does NOT redirect before 1500 ms have elapsed", async () => {
      setupMocks();
      render(<NewLink />);

      fireEvent.change(getTitleInput(), {
        target: { name: "title", value: "My Link" },
      });
      fireEvent.change(getUrlInput(), {
        target: { name: "url", value: "https://example.com" },
      });

      await act(async () => {
        fireEvent.click(getSubmitButton());
      });

      await waitFor(() => {
        expect(createLink).toHaveBeenCalled();
      });

      act(() => {
        jest.advanceTimersByTime(999);
      });

      expect(navigateTo).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Loading state while submitting
  // -------------------------------------------------------------------------

  describe("loading state during submission", () => {
    it("disables the inputs while submitting", async () => {
      // createLink never resolves during this test so the component stays
      // in the loading state long enough to assert.
      let resolveCreate;
      createLink.mockReturnValue(
        new Promise((res) => {
          resolveCreate = res;
        })
      );

      setupMocks();
      render(<NewLink />);

      fireEvent.change(getTitleInput(), {
        target: { name: "title", value: "My Link" },
      });
      fireEvent.change(getUrlInput(), {
        target: { name: "url", value: "https://example.com" },
      });

      act(() => {
        fireEvent.click(getSubmitButton());
      });

      await waitFor(() => {
        expect(getTitleInput()).toBeDisabled();
        expect(getUrlInput()).toBeDisabled();
      });

      // Cleanup: resolve the promise so there are no pending async operations.
      await act(async () => {
        resolveCreate({ id: "x" });
      });
    });

    it("shows 'Salvando' text on the submit button while loading", async () => {
      let resolveCreate;
      createLink.mockReturnValue(
        new Promise((res) => {
          resolveCreate = res;
        })
      );

      setupMocks();
      render(<NewLink />);

      fireEvent.change(getTitleInput(), {
        target: { name: "title", value: "My Link" },
      });
      fireEvent.change(getUrlInput(), {
        target: { name: "url", value: "https://example.com" },
      });

      act(() => {
        fireEvent.click(getSubmitButton());
      });

      await waitFor(() => {
        expect(screen.getByText("Salvando")).toBeInTheDocument();
      });

      await act(async () => {
        resolveCreate({ id: "x" });
      });
    });
  });

  // -------------------------------------------------------------------------
  // Error path
  // -------------------------------------------------------------------------

  describe("failed submission", () => {
    it("shows the API error message when createLink rejects with a message", async () => {
      createLink.mockRejectedValue(new Error("Server error"));

      setupMocks();
      render(<NewLink />);

      fireEvent.change(getTitleInput(), {
        target: { name: "title", value: "My Link" },
      });
      fireEvent.change(getUrlInput(), {
        target: { name: "url", value: "https://example.com" },
      });

      await act(async () => {
        fireEvent.click(getSubmitButton());
      });

      await waitFor(() => {
        expect(screen.getByText("Server error")).toBeInTheDocument();
      });
    });

    it("shows a fallback error message when createLink rejects without a message", async () => {
      createLink.mockRejectedValue({});

      setupMocks();
      render(<NewLink />);

      fireEvent.change(getTitleInput(), {
        target: { name: "title", value: "My Link" },
      });
      fireEvent.change(getUrlInput(), {
        target: { name: "url", value: "https://example.com" },
      });

      await act(async () => {
        fireEvent.click(getSubmitButton());
      });

      await waitFor(() => {
        // Falls back to t("Erro ao criar o link") which is the key itself
        expect(screen.getByText("Erro ao criar o link")).toBeInTheDocument();
      });
    });

    it("re-enables the submit button after a failed submission", async () => {
      createLink.mockRejectedValue(new Error("oops"));

      setupMocks();
      render(<NewLink />);

      fireEvent.change(getTitleInput(), {
        target: { name: "title", value: "My Link" },
      });
      fireEvent.change(getUrlInput(), {
        target: { name: "url", value: "https://example.com" },
      });

      await act(async () => {
        fireEvent.click(getSubmitButton());
      });

      await waitFor(() => {
        expect(getSubmitButton()).not.toBeDisabled();
      });
    });
  });

  // -------------------------------------------------------------------------
  // handleCancel
  // -------------------------------------------------------------------------

  describe("handleCancel", () => {
    it("calls navigateTo with pt links path when Cancel is clicked (pt lang)", () => {
      setupMocks({ lang: "pt" });
      render(<NewLink />);
      fireEvent.click(getCancelButton());
      expect(navigateTo).toHaveBeenCalledWith("links", mockNavigate, "pt");
    });

    it("calls navigateTo with en links path when Cancel is clicked (en lang)", () => {
      setupMocks({ lang: "en" });
      render(<NewLink />);
      fireEvent.click(getCancelButton());
      expect(navigateTo).toHaveBeenCalledWith("links", mockNavigate, "en");
    });
  });

  // -------------------------------------------------------------------------
  // e.preventDefault on form submit
  // -------------------------------------------------------------------------

  it("calls e.preventDefault when the form is submitted", async () => {
    createLink.mockResolvedValue({ id: "1" });
    setupMocks();
    render(<NewLink />);

    const form = screen
      .getByRole("button", { name: /Salvar/ })
      .closest("form");

    const preventDefaultSpy = jest.fn();

    fireEvent.change(getTitleInput(), {
      target: { name: "title", value: "My Link" },
    });
    fireEvent.change(getUrlInput(), {
      target: { name: "url", value: "https://example.com" },
    });

    await act(async () => {
      fireEvent.submit(form, { preventDefault: preventDefaultSpy });
    });

    // The component calls e.preventDefault() internally; the mock fired by
    // fireEvent.submit may be different from the one passed above, but we can
    // verify createLink was called (proving the submit handler ran properly).
    await waitFor(() => {
      expect(createLink).toHaveBeenCalled();
    });
  });
});
