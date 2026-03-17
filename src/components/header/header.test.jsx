import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Header from "./header";
import { ROLES } from "../../enums/roles";

// Mock window.innerWidth for desktop tests
Object.defineProperty(window, "innerWidth", {
  writable: true,
  configurable: true,
  value: 1024,
});

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "pt" },
  }),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../services/hooks/auth/useAuth", () => ({
  isAuthenticated: jest.fn(),
  hasRole: jest.fn(),
  logout: jest.fn(),
}));

jest.mock("../../services/utils/utils", () => ({
  navigateTo: jest.fn(),
}));

jest.mock("../../constants", () => ({
  aboutWebsite: "https://about.test.com",
}));

jest.mock("../button", () => ({
  __esModule: true,
  default: ({ children, onClick, className }) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

jest.mock("../button/auth-button/auth-button", () => ({
  __esModule: true,
  default: ({ isAuthenticated, onLogin, onLogout }) => (
    <div data-testid="auth-button" data-is-authenticated={String(isAuthenticated)}>
      <button onClick={onLogin}>Login</button>
      <button onClick={onLogout}>Logout</button>
    </div>
  ),
}));

jest.mock("../drawer/drawer", () => ({
  __esModule: true,
  default: ({ isOpen, onClose, isAuthenticated }) =>
    isOpen ? <div data-testid="drawer">Drawer</div> : null,
}));

jest.mock("react-icons/fa", () => ({
  FaUser: () => <span>user</span>,
  FaBars: () => <span>bars</span>,
}));

// Mock CSS import
jest.mock("./header.css", () => ({}), { virtual: true });

import {
  isAuthenticated,
  hasRole,
  logout,
} from "../../services/hooks/auth/useAuth";
import { navigateTo } from "../../services/utils/utils";

const renderHeader = () =>
  render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isAuthenticated.mockReturnValue(false);
    hasRole.mockReturnValue(false);
    window.innerWidth = 1024;
  });

  it("renders the DivulgaIF title", () => {
    renderHeader();
    expect(screen.getByText("DivulgaIF")).toBeInTheDocument();
  });

  it("shows my works link when authenticated", () => {
    isAuthenticated.mockReturnValue(true);
    renderHeader();
    expect(screen.getByText("header.myWorks")).toBeInTheDocument();
  });

  it("hides my works link when not authenticated", () => {
    isAuthenticated.mockReturnValue(false);
    renderHeader();
    expect(screen.queryByText("header.myWorks")).not.toBeInTheDocument();
  });

  it("shows teacher links when authenticated and has TEACHER role", () => {
    isAuthenticated.mockReturnValue(true);
    hasRole.mockImplementation((role) => role === ROLES.TEACHER);
    renderHeader();
    expect(screen.getByText("header.rateWorks")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("hides teacher links when user is not a teacher", () => {
    isAuthenticated.mockReturnValue(true);
    hasRole.mockReturnValue(false);
    renderHeader();
    expect(screen.queryByText("header.rateWorks")).not.toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("calls navigateTo when clicking new work link", () => {
    renderHeader();
    const newWorkLink = screen.getByText("home.newWork");
    fireEvent.click(newWorkLink);
    expect(navigateTo).toHaveBeenCalledWith(
      "trabalho/novo",
      mockNavigate,
      "pt"
    );
  });

  it("calls logout function and navigates when logout is triggered", () => {
    isAuthenticated.mockReturnValue(true);
    renderHeader();
    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);
    expect(logout).toHaveBeenCalled();
    expect(navigateTo).toHaveBeenCalledWith("", mockNavigate, "pt");
  });

  it("does not show mobile menu button on desktop", () => {
    window.innerWidth = 1024;
    renderHeader();
    expect(screen.queryByText("bars")).not.toBeInTheDocument();
  });

  it("AuthButton receives correct isAuthenticated prop when not authenticated", () => {
    isAuthenticated.mockReturnValue(false);
    renderHeader();
    const authButton = screen.getByTestId("auth-button");
    expect(authButton).toHaveAttribute("data-is-authenticated", "false");
  });

  it("AuthButton receives correct isAuthenticated prop when authenticated", () => {
    isAuthenticated.mockReturnValue(true);
    renderHeader();
    const authButton = screen.getByTestId("auth-button");
    expect(authButton).toHaveAttribute("data-is-authenticated", "true");
  });
});
