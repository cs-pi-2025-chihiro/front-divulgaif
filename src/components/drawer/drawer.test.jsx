import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Drawer from "./drawer";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: { language: "pt" },
    t: (key) => key,
  }),
}));

jest.mock("i18next", () => ({
  t: (key) => key,
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

jest.mock("../../services/hooks/auth/useAuth", () => ({
  hasRole: jest.fn(),
  logout: jest.fn(),
}));

jest.mock("../../services/utils/utils", () => ({
  navigateTo: jest.fn(),
}));

jest.mock("../../constants", () => ({
  aboutWebsite: "https://example.com/about",
  PAGE_SIZE: 8,
}));

jest.mock("react-icons/fa", () => ({
  FaTimes: () => <span data-testid="icon-times">X</span>,
  FaSignOutAlt: () => <span data-testid="icon-signout">logout icon</span>,
  FaChartBar: () => <span data-testid="icon-chartbar">chart icon</span>,
}));

import { hasRole, logout } from "../../services/hooks/auth/useAuth";
import { navigateTo } from "../../services/utils/utils";

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  isAuthenticated: false,
};

describe("Drawer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    hasRole.mockReturnValue(false);
  });

  test("returns null when isOpen=false", () => {
    const { container } = render(
      <Drawer {...defaultProps} isOpen={false} />
    );

    expect(container.firstChild).toBeNull();
  });

  test("shows Menu title when isOpen=true", () => {
    render(<Drawer {...defaultProps} isOpen={true} />);

    expect(screen.getByText("Menu")).toBeInTheDocument();
  });

  test("shows logout link when isAuthenticated=true", () => {
    render(<Drawer {...defaultProps} isAuthenticated={true} />);

    expect(screen.getByText("common.logout")).toBeInTheDocument();
  });

  test("hides logout link when isAuthenticated=false", () => {
    render(<Drawer {...defaultProps} isAuthenticated={false} />);

    expect(screen.queryByText("common.logout")).not.toBeInTheDocument();
  });

  test("shows teacher links when hasRole(TEACHER)=true and isAuthenticated=true", () => {
    hasRole.mockReturnValue(true);

    render(<Drawer {...defaultProps} isAuthenticated={true} />);

    expect(screen.getByText("header.rateWorks")).toBeInTheDocument();
    expect(screen.getByText("header.dashboard")).toBeInTheDocument();
  });

  test("hides teacher links when hasRole(TEACHER)=false", () => {
    hasRole.mockReturnValue(false);

    render(<Drawer {...defaultProps} isAuthenticated={true} />);

    expect(screen.queryByText("header.rateWorks")).not.toBeInTheDocument();
    expect(screen.queryByText("header.dashboard")).not.toBeInTheDocument();
  });

  test("clicking close button calls onClose", () => {
    const onClose = jest.fn();
    render(<Drawer {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByTestId("icon-times").closest("button");
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  test("clicking overlay calls onClose", () => {
    const onClose = jest.fn();
    const { container } = render(<Drawer {...defaultProps} onClose={onClose} />);

    // The DrawerOverlay is the first div rendered inside the fragment
    const allDivs = container.querySelectorAll("div");
    fireEvent.click(allDivs[0]);

    expect(onClose).toHaveBeenCalled();
  });

  test("clicking main search navigates and calls onClose", () => {
    const onClose = jest.fn();
    render(<Drawer {...defaultProps} onClose={onClose} />);

    const mainSearchLink = screen.getByText("header.mainSearch");
    fireEvent.click(mainSearchLink);

    expect(navigateTo).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
