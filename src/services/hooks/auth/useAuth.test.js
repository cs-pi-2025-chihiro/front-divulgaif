import {
  getStoredUser,
  getStoredRoles,
  getAccessToken,
  hasRole,
  isAuthenticated,
  logout,
} from "./useAuth";

const mockClearFormData = jest.fn();

jest.mock("../../../storage/formCache.storage", () => ({
  __esModule: true,
  default: {
    getState: () => ({
      clearFormData: mockClearFormData,
    }),
  },
}));

describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("getStoredUser", () => {
    test("returns parsed user object when userData is in localStorage", () => {
      const user = { id: 1, name: "Alice" };
      localStorage.setItem("userData", JSON.stringify(user));
      expect(getStoredUser()).toEqual(user);
    });

    test("returns null when userData is not in localStorage", () => {
      expect(getStoredUser()).toBeNull();
    });

    test("returns null when userData is malformed JSON", () => {
      localStorage.setItem("userData", "not-valid-json{{{");
      expect(getStoredUser()).toBeNull();
    });
  });

  describe("getStoredRoles", () => {
    test("returns parsed roles array when userRoles is in localStorage", () => {
      const roles = ["IS_TEACHER", "IS_ADMIN"];
      localStorage.setItem("userRoles", JSON.stringify(roles));
      expect(getStoredRoles()).toEqual(roles);
    });

    test("returns empty array when userRoles is not in localStorage", () => {
      expect(getStoredRoles()).toEqual([]);
    });

    test("returns empty array when userRoles is malformed JSON", () => {
      localStorage.setItem("userRoles", "not-valid-json{{{");
      expect(getStoredRoles()).toEqual([]);
    });
  });

  describe("getAccessToken", () => {
    test("returns the access token when stored", () => {
      localStorage.setItem("accessToken", "my-token-123");
      expect(getAccessToken()).toBe("my-token-123");
    });

    test("returns null when no access token is stored", () => {
      expect(getAccessToken()).toBeNull();
    });
  });

  describe("hasRole", () => {
    test("returns true when user has the specified role", () => {
      localStorage.setItem(
        "userRoles",
        JSON.stringify(["IS_STUDENT", "IS_TEACHER"])
      );
      expect(hasRole("IS_TEACHER")).toBe(true);
    });

    test("returns false when user does not have the specified role", () => {
      localStorage.setItem("userRoles", JSON.stringify(["IS_STUDENT"]));
      expect(hasRole("IS_TEACHER")).toBe(false);
    });

    test("returns false when roles are empty", () => {
      localStorage.setItem("userRoles", JSON.stringify([]));
      expect(hasRole("IS_ADMIN")).toBe(false);
    });

    test("returns false when userRoles is not in localStorage", () => {
      expect(hasRole("IS_STUDENT")).toBe(false);
    });
  });

  describe("isAuthenticated", () => {
    test("returns true when access token is present", () => {
      localStorage.setItem("accessToken", "valid-token");
      expect(isAuthenticated()).toBe(true);
    });

    test("returns false when access token is absent", () => {
      expect(isAuthenticated()).toBe(false);
    });

    test("returns false when access token is empty string", () => {
      localStorage.setItem("accessToken", "");
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe("logout", () => {
    test("removes accessToken from localStorage", () => {
      localStorage.setItem("accessToken", "token");
      logout();
      expect(localStorage.getItem("accessToken")).toBeNull();
    });

    test("removes refreshToken from localStorage", () => {
      localStorage.setItem("refreshToken", "refresh-token");
      logout();
      expect(localStorage.getItem("refreshToken")).toBeNull();
    });

    test("removes userData from localStorage", () => {
      localStorage.setItem("userData", JSON.stringify({ id: 1 }));
      logout();
      expect(localStorage.getItem("userData")).toBeNull();
    });

    test("removes userRoles from localStorage", () => {
      localStorage.setItem("userRoles", JSON.stringify(["IS_STUDENT"]));
      logout();
      expect(localStorage.getItem("userRoles")).toBeNull();
    });

    test("calls clearFormData on the form cache store", () => {
      logout();
      expect(mockClearFormData).toHaveBeenCalledTimes(1);
    });

    test("clears all auth items at once", () => {
      localStorage.setItem("accessToken", "token");
      localStorage.setItem("refreshToken", "refresh-token");
      localStorage.setItem("userData", JSON.stringify({ id: 1 }));
      localStorage.setItem("userRoles", JSON.stringify(["IS_STUDENT"]));

      logout();

      expect(localStorage.getItem("accessToken")).toBeNull();
      expect(localStorage.getItem("refreshToken")).toBeNull();
      expect(localStorage.getItem("userData")).toBeNull();
      expect(localStorage.getItem("userRoles")).toBeNull();
      expect(mockClearFormData).toHaveBeenCalledTimes(1);
    });
  });
});
