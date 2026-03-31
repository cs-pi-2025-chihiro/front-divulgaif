/**
 * Tests for useChangePassword.
 *
 * The module exports only the `useChangePassword` hook built on top of
 * useMutation. These tests verify the onSuccess and onError callback behaviour
 * by capturing the mutation options through the mock.
 */

import React from "react";

// ─── Mocks ─────────────────────────────────────────────────────────────────
// All jest.mock() calls are hoisted automatically.

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
    i18n: { language: "pt" },
  }),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Capture options passed to useMutation so callbacks can be invoked in tests.
const capturedOptions = { current: {} };

jest.mock("@tanstack/react-query", () => ({
  useMutation: (options) => {
    capturedOptions.current = options;
    return { mutate: jest.fn(), isPending: false };
  },
}));

jest.mock("../../../services/utils/api", () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

jest.mock("../../../enums/endpoints", () => ({
  ENDPOINTS: { AUTH: { RESET_PASSWORD: "/auth/reset-password" } },
}));

// Import AFTER mocks.
import { useChangePassword } from "./useChangePassword";

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("useChangePassword", () => {
  let setSuccessResult;
  let setErrorResult;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    capturedOptions.current = {};
    setSuccessResult = jest.fn();
    setErrorResult = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const invokeHook = () =>
    useChangePassword(setSuccessResult, setErrorResult);

  it("returns the result of useMutation (has a mutate function)", () => {
    const result = invokeHook();
    expect(result).toBeDefined();
    expect(typeof result.mutate).toBe("function");
  });

  it("calls setSuccessResult with the success message on success", () => {
    invokeHook();
    capturedOptions.current.onSuccess({ some: "data" });
    expect(setSuccessResult).toHaveBeenCalledWith(
      "Senha alterada com sucesso! Redirecionando para o login..."
    );
    expect(setErrorResult).not.toHaveBeenCalled();
  });

  it("navigates to the login page after 2 seconds on success", () => {
    invokeHook();
    capturedOptions.current.onSuccess({});

    expect(mockNavigate).not.toHaveBeenCalled();

    jest.advanceTimersByTime(2000);

    expect(mockNavigate).toHaveBeenCalledWith("/pt/login");
  });

  it("does not navigate before the 2-second delay elapses", () => {
    invokeHook();
    capturedOptions.current.onSuccess({});

    jest.advanceTimersByTime(1999);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("calls setErrorResult with the server error message when available", () => {
    invokeHook();
    const error = {
      response: { data: { message: "Invalid or expired token" } },
      message: "Request failed",
    };
    capturedOptions.current.onError(error);
    expect(setErrorResult).toHaveBeenCalledWith("Invalid or expired token");
    expect(setSuccessResult).not.toHaveBeenCalled();
  });

  it("calls setErrorResult with the fallback message when server provides no message", () => {
    invokeHook();
    const error = { message: "Network Error" };
    capturedOptions.current.onError(error);
    expect(setErrorResult).toHaveBeenCalledWith(
      "Falha ao alterar senha. Por favor, tente novamente ou solicite um novo link."
    );
  });

  it("calls setErrorResult with the fallback when response data has no message field", () => {
    invokeHook();
    const error = { response: { data: {} }, message: "Something went wrong" };
    capturedOptions.current.onError(error);
    expect(setErrorResult).toHaveBeenCalledWith(
      "Falha ao alterar senha. Por favor, tente novamente ou solicite um novo link."
    );
  });

  it("does not call setSuccessResult on error", () => {
    invokeHook();
    capturedOptions.current.onError({ message: "fail" });
    expect(setSuccessResult).not.toHaveBeenCalled();
  });

  it("does not call setErrorResult on success", () => {
    invokeHook();
    capturedOptions.current.onSuccess({});
    expect(setErrorResult).not.toHaveBeenCalled();
  });

  it("does not navigate on error", () => {
    invokeHook();
    capturedOptions.current.onError({ message: "fail" });

    jest.runAllTimers();

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
