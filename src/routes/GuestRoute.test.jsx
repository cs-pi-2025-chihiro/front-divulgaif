import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import GuestRoute from "./GuestRoute";
import { isAuthenticated } from "../services/hooks/auth/useAuth";

jest.mock("../services/hooks/auth/useAuth", () => ({
  isAuthenticated: jest.fn(),
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

describe("GuestRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("redirects to /pt when authenticated", () => {
    isAuthenticated.mockReturnValue(true);

    renderWithRouter(<GuestRoute />);

    expect(screen.queryByText("outlet content")).not.toBeInTheDocument();
  });

  test("renders Outlet when not authenticated", () => {
    isAuthenticated.mockReturnValue(false);

    renderWithRouter(<GuestRoute />);

    expect(screen.getByText("outlet content")).toBeInTheDocument();
  });
});
