import { create } from "./create";
import { createSuap } from "./createSuap";

jest.mock("../utils/api", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

jest.mock("../../enums/endpoints", () => ({
  ENDPOINTS: {
    USERS: {
      CREATE: "/users",
    },
  },
}));

import api from "../utils/api";

describe("users services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    test("calls api.post with correct endpoint and user data", async () => {
      const userData = {
        name: "Alice",
        email: "alice@example.com",
        password: "secret123",
      };
      api.post.mockResolvedValue({ data: { id: 1 } });

      await create(userData);

      expect(api.post).toHaveBeenCalledWith("/users", {
        name: "Alice",
        email: "alice@example.com",
        password: "secret123",
      });
    });

    test("returns the api response", async () => {
      const mockResponse = { data: { id: 1, name: "Alice" } };
      api.post.mockResolvedValue(mockResponse);

      const result = await create({
        name: "Alice",
        email: "alice@example.com",
        password: "secret123",
      });

      expect(result).toBe(mockResponse);
    });

    test("propagates errors from api.post", async () => {
      const error = new Error("Email already registered");
      api.post.mockRejectedValue(error);

      await expect(
        create({ name: "Bob", email: "bob@example.com", password: "pass" })
      ).rejects.toThrow("Email already registered");
    });

    test("only sends name, email and password fields", async () => {
      api.post.mockResolvedValue({ data: {} });

      await create({
        name: "Test",
        email: "test@test.com",
        password: "pass",
        extraField: "should not be sent",
      });

      expect(api.post).toHaveBeenCalledWith("/users", {
        name: "Test",
        email: "test@test.com",
        password: "pass",
      });
    });
  });

  describe("createSuap", () => {
    test("calls api.post with correct endpoint and mapped fields", async () => {
      const suapData = {
        nome_registro: "João Silva",
        email: "joao@ifpr.edu.br",
        email_secundario: "joao@gmail.com",
        identificacao: "20210001",
        foto: "https://suap.ifpr.edu.br/foto.jpg",
        tipo_usuario: "Aluno",
      };
      api.post.mockResolvedValue({});

      await createSuap(suapData);

      expect(api.post).toHaveBeenCalledWith("/users", {
        name: "João Silva",
        email: "joao@ifpr.edu.br",
        secondaryEmail: "joao@gmail.com",
        ra: "20210001",
        avatarUrl: "https://suap.ifpr.edu.br/foto.jpg",
        userType: "Aluno",
      });
    });

    test("propagates errors from api.post", async () => {
      const error = new Error("Suap user creation failed");
      api.post.mockRejectedValue(error);

      await expect(
        createSuap({
          nome_registro: "Test",
          email: "test@test.com",
          email_secundario: "",
          identificacao: "123",
          foto: "",
          tipo_usuario: "Aluno",
        })
      ).rejects.toThrow("Suap user creation failed");
    });
  });
});
