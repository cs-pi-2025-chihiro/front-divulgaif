import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import LinkInput from "./link-input";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, defaultValue) => defaultValue || key,
  }),
}));

jest.mock("@uidotdev/usehooks", () => ({
  useDebounce: (value) => value,
}));

const mockGetSuggestions = jest.fn();

const suggestions = [
  { id: 1, url: "https://github.com/projeto" },
  { id: 2, url: "https://docs.exemplo.com" },
];

const defaultProps = {
  links: [],
  setLinks: jest.fn(),
  getSuggestions: mockGetSuggestions,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSuggestions.mockResolvedValue(suggestions);
});

describe("LinkInput - Renderização", () => {
  test("renderiza o input de busca", () => {
    render(<LinkInput {...defaultProps} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  test("renderiza links existentes como tags com URL", () => {
    const links = [
      { id: 1, url: "https://github.com/projeto" },
      { id: 2, url: "https://docs.exemplo.com" },
    ];
    render(<LinkInput {...defaultProps} links={links} />);
    expect(screen.getByText("https://github.com/projeto")).toBeInTheDocument();
    expect(screen.getByText("https://docs.exemplo.com")).toBeInTheDocument();
  });

  test("renderiza links como elementos âncora", () => {
    const links = [{ id: 1, url: "https://github.com/projeto" }];
    render(<LinkInput {...defaultProps} links={links} />);
    const anchor = screen.getByRole("link", { name: "https://github.com/projeto" });
    expect(anchor).toHaveAttribute("href", "https://github.com/projeto");
    expect(anchor).toHaveAttribute("target", "_blank");
  });

  test("renderiza botão de adicionar (+)", () => {
    render(<LinkInput {...defaultProps} />);
    expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
  });

  test("renderiza botões de remoção para cada link", () => {
    const links = [
      { id: 1, url: "https://a.com" },
      { id: 2, url: "https://b.com" },
    ];
    render(<LinkInput {...defaultProps} links={links} />);
    const removeButtons = screen.getAllByRole("button", { name: "×" });
    expect(removeButtons).toHaveLength(2);
  });
});

describe("LinkInput - Sugestões", () => {
  test("busca sugestões quando input tem 2+ caracteres", async () => {
    render(<LinkInput {...defaultProps} />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "ht" } });
    });

    await waitFor(() => {
      expect(mockGetSuggestions).toHaveBeenCalledWith("ht");
    });
  });

  test("não busca sugestões com menos de 2 caracteres", async () => {
    render(<LinkInput {...defaultProps} />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "h" } });
    });

    expect(mockGetSuggestions).not.toHaveBeenCalled();
  });

  test("exibe sugestões retornadas", async () => {
    render(<LinkInput {...defaultProps} />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "ht" } });
    });

    await waitFor(() => {
      expect(screen.getByText("https://github.com/projeto")).toBeInTheDocument();
    });
  });

  test("filtra sugestões de links já adicionados", async () => {
    const links = [{ id: 1, url: "https://github.com/projeto" }];
    render(<LinkInput {...defaultProps} links={links} />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "ht" } });
    });

    await waitFor(() => {
      // github link já está na lista, não deve aparecer nas sugestões
      const allItems = screen.getAllByText("https://github.com/projeto");
      expect(allItems).toHaveLength(1);
      expect(screen.getByText("https://docs.exemplo.com")).toBeInTheDocument();
    });
  });

  test("adiciona link ao clicar na sugestão", async () => {
    const setLinks = jest.fn();
    render(<LinkInput {...defaultProps} setLinks={setLinks} />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "ht" } });
    });

    await waitFor(() => {
      expect(screen.getByText("https://github.com/projeto")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("https://github.com/projeto"));
    expect(setLinks).toHaveBeenCalledWith([suggestions[0]]);
  });

  test("limpa sugestões quando API falha", async () => {
    mockGetSuggestions.mockRejectedValueOnce(new Error("Erro"));
    render(<LinkInput {...defaultProps} />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "ht" } });
    });

    await waitFor(() => {
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });
});

describe("LinkInput - Adicionar manualmente", () => {
  test("adiciona link manualmente ao clicar no botão +", () => {
    const setLinks = jest.fn();
    render(<LinkInput {...defaultProps} setLinks={setLinks} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "https://meu-link.com" } });
    fireEvent.click(screen.getByRole("button", { name: "+" }));

    expect(setLinks).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ url: "https://meu-link.com" }),
      ])
    );
  });

  test("não adiciona link vazio", () => {
    const setLinks = jest.fn();
    render(<LinkInput {...defaultProps} setLinks={setLinks} />);

    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(setLinks).not.toHaveBeenCalled();
  });

  test("não adiciona URL duplicada (case insensitive)", () => {
    const links = [{ id: 1, url: "https://meu-link.com" }];
    const setLinks = jest.fn();
    render(<LinkInput {...defaultProps} links={links} setLinks={setLinks} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "https://meu-link.com" } });
    fireEvent.click(screen.getByRole("button", { name: "+" }));

    expect(setLinks).not.toHaveBeenCalled();
  });

  test("limpa o input após adicionar manualmente", () => {
    render(<LinkInput {...defaultProps} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "https://novo.com" } });
    fireEvent.click(screen.getByRole("button", { name: "+" }));

    expect(input.value).toBe("");
  });
});

describe("LinkInput - Remoção", () => {
  test("remove link ao clicar no botão de remoção", () => {
    const setLinks = jest.fn();
    const links = [{ id: 1, url: "https://remover.com" }];
    render(<LinkInput {...defaultProps} links={links} setLinks={setLinks} />);

    fireEvent.click(screen.getByRole("button", { name: "×" }));
    expect(setLinks).toHaveBeenCalledWith([]);
  });
});
