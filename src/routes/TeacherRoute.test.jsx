import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import TeacherRoute from "./TeacherRoute";
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

describe("TeacherRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("redirects when not authenticated", () => {
    isAuthenticated.mockReturnValue(false);
    hasRole.mockReturnValue(false);

    renderWithRouter(<TeacherRoute />);

    expect(screen.queryByText("outlet content")).not.toBeInTheDocument();
  });

  test("redirects when authenticated but no TEACHER role", () => {
    isAuthenticated.mockReturnValue(true);
    hasRole.mockReturnValue(false);

    renderWithRouter(<TeacherRoute />);

    expect(screen.queryByText("outlet content")).not.toBeInTheDocument();
  });

  test("renders Outlet when authenticated with TEACHER role", () => {
    isAuthenticated.mockReturnValue(true);
    hasRole.mockImplementation((role) => role === "IS_TEACHER");

    renderWithRouter(<TeacherRoute />);

    expect(screen.getByText("outlet content")).toBeInTheDocument();
  });
});
