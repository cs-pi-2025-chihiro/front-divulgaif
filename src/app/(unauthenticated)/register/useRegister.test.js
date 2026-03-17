import {
  validateRegistrationForm,
  prepareRegistrationData,
} from "./useRegister";

// Mock translation function that returns the key or fallback
const t = (key, fallback) => fallback || key;

describe("validateRegistrationForm", () => {
  it("returns an error when name is empty", () => {
    const formData = {
      name: "",
      email: "test@example.com",
      password: "abc123",
      confirmPassword: "abc123",
    };
    const errors = validateRegistrationForm(formData, t);
    expect(errors.name).toBeDefined();
    expect(errors.name).toBe("Nome é obrigatório");
  });

  it("returns an error when name is only whitespace", () => {
    const formData = {
      name: "   ",
      email: "test@example.com",
      password: "abc123",
      confirmPassword: "abc123",
    };
    const errors = validateRegistrationForm(formData, t);
    expect(errors.name).toBeDefined();
  });

  it("returns an error when email is empty", () => {
    const formData = {
      name: "Test User",
      email: "",
      password: "abc123",
      confirmPassword: "abc123",
    };
    const errors = validateRegistrationForm(formData, t);
    expect(errors.email).toBeDefined();
    expect(errors.email).toBe("Email é obrigatório");
  });

  it("returns an error when email is invalid", () => {
    const formData = {
      name: "Test User",
      email: "not-an-email",
      password: "abc123",
      confirmPassword: "abc123",
    };
    const errors = validateRegistrationForm(formData, t);
    expect(errors.email).toBeDefined();
    expect(errors.email).toBe("Email inválido");
  });

  it("returns an error when password is shorter than 6 characters", () => {
    const formData = {
      name: "Test User",
      email: "test@example.com",
      password: "abc",
      confirmPassword: "abc",
    };
    const errors = validateRegistrationForm(formData, t);
    expect(errors.password).toBeDefined();
    expect(errors.password).toBe("Senha deve ter no mínimo 6 caracteres");
  });

  it("returns an error when passwords do not match", () => {
    const formData = {
      name: "Test User",
      email: "test@example.com",
      password: "abc123",
      confirmPassword: "xyz789",
    };
    const errors = validateRegistrationForm(formData, t);
    expect(errors.confirmPassword).toBeDefined();
    expect(errors.confirmPassword).toBe("As senhas não coincidem");
  });

  it("returns no errors for valid data", () => {
    const formData = {
      name: "Test User",
      email: "test@example.com",
      password: "abc123",
      confirmPassword: "abc123",
    };
    const errors = validateRegistrationForm(formData, t);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("returns no errors for valid data without a password", () => {
    const formData = {
      name: "Test User",
      email: "test@example.com",
      password: "",
      confirmPassword: "",
    };
    const errors = validateRegistrationForm(formData, t);
    expect(errors.password).toBeUndefined();
    expect(errors.confirmPassword).toBeUndefined();
  });
});

describe("prepareRegistrationData", () => {
  it("trims name and email, sets userType to STUDENT, and removes undefined password", () => {
    const formData = {
      name: "  Test User  ",
      email: "  test@example.com  ",
      password: "",
    };
    const result = prepareRegistrationData(formData);
    expect(result.name).toBe("Test User");
    expect(result.email).toBe("test@example.com");
    expect(result.userType).toBe("STUDENT");
    expect(result.password).toBeUndefined();
    expect("password" in result).toBe(false);
  });

  it("includes password when it is provided", () => {
    const formData = {
      name: "Test User",
      email: "test@example.com",
      password: "securepass",
    };
    const result = prepareRegistrationData(formData);
    expect(result.password).toBe("securepass");
  });

  it("always sets userType to STUDENT", () => {
    const formData = {
      name: "Someone",
      email: "someone@example.com",
      password: "pass123",
    };
    const result = prepareRegistrationData(formData);
    expect(result.userType).toBe("STUDENT");
  });

  it("trims whitespace from name and email fields", () => {
    const formData = {
      name: "\t  Spaced Name\t  ",
      email: "  spaced@email.com  ",
      password: "pass123",
    };
    const result = prepareRegistrationData(formData);
    expect(result.name).toBe("Spaced Name");
    expect(result.email).toBe("spaced@email.com");
  });
});
