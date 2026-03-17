import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import StudentRoute from "./StudentRoute";
import { isAuthenticated, hasRole } from "../services/hooks/auth/useAuth";

jest.mock("../services/hooks/auth/useAuth", () => ({
  isAuthenticated: jest.fn(),
  hasRole: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: { language: "pt" },
    t: (key) => key,
  }),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Outlet: () => <div>outlet content</div>,
}));

const renderWithRouter = (component) =>
  render(
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      {component}
    </BrowserRouter>
  );

describe("StudentRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("redirects when not authenticated", () => {
    isAuthenticated.mockReturnValue(false);
    hasRole.mockReturnValue(false);

    renderWithRouter(<StudentRoute />);

    expect(screen.queryByText("outlet content")).not.toBeInTheDocument();
  });

  test("redirects when authenticated but no STUDENT role", () => {
    isAuthenticated.mockReturnValue(true);
    hasRole.mockReturnValue(false);

    renderWithRouter(<StudentRoute />);

    expect(screen.queryByText("outlet content")).not.toBeInTheDocument();
  });

  test("renders Outlet when authenticated with STUDENT role", () => {
    isAuthenticated.mockReturnValue(true);
    hasRole.mockImplementation((role) => role === "IS_STUDENT");

    renderWithRouter(<StudentRoute />);

    expect(screen.getByText("outlet content")).toBeInTheDocument();
  });
});
