/**
 * Tests for useForgotPassword.
 *
 * The module exports only the `useForgotPassword` hook, which internally uses
 * useMutation from @tanstack/react-query. There are no pure/exported utility
 * functions to test in isolation.
 *
 * These tests verify the hook behaviour by mocking useMutation and capturing
 * the options (onSuccess/onError) that the hook passes to it.
 */

import React from "react";

// ─── Mocks ─────────────────────────────────────────────────────────────────
// All jest.mock() calls are hoisted to the top of the file automatically.

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
  }),
}));

// We capture the mutation options inside the mock so tests can invoke the
// callbacks directly without needing renderHook / QueryClientProvider.
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
  ENDPOINTS: { AUTH: { FORGOT_PASSWORD: "/auth/forgot-password" } },
}));

// Import AFTER mocks so the module picks up the mocked dependencies.
import { useForgotPassword } from "./useForgotPassword";

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("useForgotPassword", () => {
  let setSuccessResult;
  let setErrorResult;

  beforeEach(() => {
    capturedOptions.current = {};
    setSuccessResult = jest.fn();
    setErrorResult = jest.fn();
  });

  // Calling the hook synchronously registers the mutation options.
  const invokeHook = () =>
    useForgotPassword(setSuccessResult, setErrorResult);

  it("returns the result of useMutation (has a mutate function)", () => {
    const result = invokeHook();
    expect(result).toBeDefined();
    expect(typeof result.mutate).toBe("function");
  });

  it("calls setSuccessResult with the success message on success", () => {
    invokeHook();
    capturedOptions.current.onSuccess({ some: "data" });
    expect(setSuccessResult).toHaveBeenCalledWith(
      "Email de recuperação enviado com sucesso! Verifique sua caixa de entrada."
    );
    expect(setErrorResult).not.toHaveBeenCalled();
  });

  it("calls setErrorResult with the server message when available on error", () => {
    invokeHook();
    const error = {
      response: { data: { message: "User not found" } },
      message: "Request failed",
    };
    capturedOptions.current.onError(error);
    expect(setErrorResult).toHaveBeenCalledWith("User not found");
    expect(setSuccessResult).not.toHaveBeenCalled();
  });

  it("calls setErrorResult with the fallback message when server provides no message", () => {
    invokeHook();
    const error = { message: "Network Error" };
    capturedOptions.current.onError(error);
    expect(setErrorResult).toHaveBeenCalledWith(
      "Falha ao enviar email de recuperação. Por favor, tente novamente."
    );
  });

  it("calls setErrorResult with the fallback when response data has no message field", () => {
    invokeHook();
    const error = { response: { data: {} }, message: "Something went wrong" };
    capturedOptions.current.onError(error);
    expect(setErrorResult).toHaveBeenCalledWith(
      "Falha ao enviar email de recuperação. Por favor, tente novamente."
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
});
