import {
  countWords,
  validateField,
  validateForm,
  validateCPF,
  formatCPF,
  validateEmail,
} from "./validation";

describe("validation", () => {
  let t;

  beforeEach(() => {
    jest.clearAllMocks();
    t = jest.fn().mockReturnValue("");
  });

  describe("countWords", () => {
    test("returns 0 for empty string", () => {
      expect(countWords("")).toBe(0);
    });

    test("returns 0 for null", () => {
      expect(countWords(null)).toBe(0);
    });

    test("returns 0 for undefined", () => {
      expect(countWords(undefined)).toBe(0);
    });

    test("returns 0 for whitespace-only string", () => {
      expect(countWords("   ")).toBe(0);
    });

    test("counts single word", () => {
      expect(countWords("hello")).toBe(1);
    });

    test("counts multiple words", () => {
      expect(countWords("hello world foo")).toBe(3);
    });

    test("ignores leading and trailing whitespace", () => {
      expect(countWords("  hello world  ")).toBe(2);
    });

    test("handles multiple spaces between words", () => {
      expect(countWords("hello   world")).toBe(2);
    });

    test("handles newlines and tabs as whitespace", () => {
      expect(countWords("hello\nworld\tfoo")).toBe(3);
    });
  });

  describe("validateField", () => {
    describe("workType field", () => {
      test("returns error when workType is missing", () => {
        const errors = validateField("workType", null, t);
        expect(errors.workType).toBeDefined();
        expect(t).toHaveBeenCalledWith("errors.workTypeRequired");
      });

      test("returns error when workType is empty string", () => {
        const errors = validateField("workType", "", t);
        expect(errors.workType).toBeDefined();
      });

      test("returns no error when workType is provided", () => {
        const errors = validateField("workType", "ARTICLE", t);
        expect(errors.workType).toBeUndefined();
      });
    });

    describe("title field", () => {
      test("returns error when title is empty", () => {
        const errors = validateField("title", "", t);
        expect(errors.title).toBeDefined();
        expect(t).toHaveBeenCalledWith("errors.titleRequired");
      });

      test("returns error when title is null", () => {
        const errors = validateField("title", null, t);
        expect(errors.title).toBeDefined();
      });

      test("returns error when title is too short (< 3 chars)", () => {
        const errors = validateField("title", "ab", t);
        expect(errors.title).toBeDefined();
        expect(t).toHaveBeenCalledWith("errors.titleTooShort");
      });

      test("returns error when title is too long (> 200 chars)", () => {
        const longTitle = "a".repeat(201);
        const errors = validateField("title", longTitle, t);
        expect(errors.title).toBeDefined();
        expect(t).toHaveBeenCalledWith("errors.titleTooLong");
      });

      test("returns no error for valid title", () => {
        const errors = validateField("title", "Valid Title", t);
        expect(errors.title).toBeUndefined();
      });

      test("returns no error for title of exactly 3 chars", () => {
        const errors = validateField("title", "abc", t);
        expect(errors.title).toBeUndefined();
      });

      test("returns no error for title of exactly 200 chars", () => {
        const errors = validateField("title", "a".repeat(200), t);
        expect(errors.title).toBeUndefined();
      });
    });

    describe("description field", () => {
      test("returns no error when description is within 160 words", () => {
        const text = Array(160).fill("word").join(" ");
        const errors = validateField("description", text, t);
        expect(errors.description).toBeUndefined();
      });

      test("returns error when description exceeds 160 words", () => {
        const text = Array(161).fill("word").join(" ");
        const errors = validateField("description", text, t);
        expect(errors.description).toBeDefined();
        expect(t).toHaveBeenCalledWith("errors.descriptionTooLong");
      });

      test("returns no error for empty description", () => {
        const errors = validateField("description", "", t);
        expect(errors.description).toBeUndefined();
      });
    });

    describe("content field", () => {
      test("returns no error when content is within 300 words", () => {
        const text = Array(300).fill("word").join(" ");
        const errors = validateField("content", text, t);
        expect(errors.content).toBeUndefined();
      });

      test("returns error when content exceeds 300 words", () => {
        const text = Array(301).fill("word").join(" ");
        const errors = validateField("content", text, t);
        expect(errors.content).toBeDefined();
        expect(t).toHaveBeenCalledWith("errors.contentTooLong");
      });

      test("returns no error for empty content", () => {
        const errors = validateField("content", "", t);
        expect(errors.content).toBeUndefined();
      });
    });

    describe("unknown field", () => {
      test("returns empty errors object for unknown field", () => {
        const errors = validateField("unknownField", "value", t);
        expect(errors).toEqual({});
      });
    });
  });

  describe("validateForm", () => {
    const validData = {
      workType: "ARTICLE",
      title: "Valid Title",
      authors: [{ name: "Author One" }],
      description: "",
      abstractText: "",
      links: [],
    };

    test("returns empty errors for valid data", () => {
      const errors = validateForm(validData, t);
      expect(errors).toEqual({});
    });

    test("returns error when workType is missing", () => {
      const data = { ...validData, workType: null };
      const errors = validateForm(data, t);
      expect(errors.workType).toBeDefined();
    });

    test("returns error when title is empty", () => {
      const data = { ...validData, title: "" };
      const errors = validateForm(data, t);
      expect(errors.title).toBeDefined();
    });

    test("returns error when title is too short", () => {
      const data = { ...validData, title: "ab" };
      const errors = validateForm(data, t);
      expect(errors.title).toBeDefined();
    });

    test("returns error when title is too long", () => {
      const data = { ...validData, title: "a".repeat(201) };
      const errors = validateForm(data, t);
      expect(errors.title).toBeDefined();
    });

    test("returns error when authors array is empty", () => {
      const data = { ...validData, authors: [] };
      const errors = validateForm(data, t);
      expect(errors.authors).toBeDefined();
    });

    test("returns error when authors is null", () => {
      const data = { ...validData, authors: null };
      const errors = validateForm(data, t);
      expect(errors.authors).toBeDefined();
    });

    test("returns error when description exceeds 160 words", () => {
      const data = {
        ...validData,
        description: Array(161).fill("word").join(" "),
      };
      const errors = validateForm(data, t);
      expect(errors.description).toBeDefined();
    });

    test("returns error when abstractText exceeds 300 words", () => {
      const data = {
        ...validData,
        abstractText: Array(301).fill("word").join(" "),
      };
      const errors = validateForm(data, t);
      expect(errors.abstractText).toBeDefined();
    });

    test("returns error for invalid link URL", () => {
      const data = {
        ...validData,
        links: [{ url: "not-a-valid-url" }],
      };
      const errors = validateForm(data, t);
      expect(errors.links).toBeDefined();
    });

    test("does not return link error for valid URL", () => {
      const data = {
        ...validData,
        links: [{ url: "https://example.com" }],
      };
      const errors = validateForm(data, t);
      expect(errors.links).toBeUndefined();
    });

    test("does not return link error when links array is empty", () => {
      const errors = validateForm(validData, t);
      expect(errors.links).toBeUndefined();
    });

    test("can return multiple errors at once", () => {
      const data = {
        workType: null,
        title: "",
        authors: [],
        description: "",
        abstractText: "",
        links: [],
      };
      const errors = validateForm(data, t);
      expect(errors.workType).toBeDefined();
      expect(errors.title).toBeDefined();
      expect(errors.authors).toBeDefined();
    });
  });

  describe("validateCPF", () => {
    test("returns true for empty CPF (no digits)", () => {
      expect(validateCPF("")).toBe(true);
    });

    test("returns true for CPF with only non-digit characters that strip to empty", () => {
      expect(validateCPF("...---")).toBe(true);
    });

    test("returns true for valid 11-digit CPF", () => {
      expect(validateCPF("123.456.789-09")).toBe(true);
    });

    test("returns true for 11-digit CPF without formatting", () => {
      expect(validateCPF("12345678909")).toBe(true);
    });

    test("returns false for CPF with fewer than 11 digits", () => {
      expect(validateCPF("1234567890")).toBe(false);
    });

    test("returns false for CPF with more than 11 digits", () => {
      expect(validateCPF("123456789012")).toBe(false);
    });
  });

  describe("formatCPF", () => {
    test("formats up to 3 digits with no separators", () => {
      expect(formatCPF("123")).toBe("123");
    });

    test("formats 4 to 6 digits as xxx.xxx", () => {
      expect(formatCPF("123456")).toBe("123.456");
    });

    test("formats 7 to 9 digits as xxx.xxx.xxx", () => {
      expect(formatCPF("123456789")).toBe("123.456.789");
    });

    test("formats 11 digits as xxx.xxx.xxx-xx", () => {
      expect(formatCPF("12345678909")).toBe("123.456.789-09");
    });

    test("strips non-digit characters before formatting", () => {
      expect(formatCPF("123.456.789-09")).toBe("123.456.789-09");
    });

    test("formats partial input of 4 digits", () => {
      expect(formatCPF("1234")).toBe("123.4");
    });

    test("formats partial input of 7 digits", () => {
      expect(formatCPF("1234567")).toBe("123.456.7");
    });
  });

  describe("validateEmail", () => {
    test("returns true for valid email", () => {
      expect(validateEmail("user@example.com")).toBe(true);
    });

    test("returns true for email with subdomain", () => {
      expect(validateEmail("user@mail.example.org")).toBe(true);
    });

    test("returns false for email without @", () => {
      expect(validateEmail("userexample.com")).toBe(false);
    });

    test("returns false for email without domain extension", () => {
      expect(validateEmail("user@example")).toBe(false);
    });

    test("returns false for email with leading space", () => {
      expect(validateEmail(" user@example.com")).toBe(false);
    });

    test("returns false for empty string", () => {
      expect(validateEmail("")).toBe(false);
    });
  });
});
