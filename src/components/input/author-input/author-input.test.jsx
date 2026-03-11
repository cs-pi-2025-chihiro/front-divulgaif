import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AuthorInput from "./author-input";

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
  { id: 1, name: "Ana Lima", email: "ana@ifpr.edu.br" },
  { id: 2, name: "Bruno Costa", email: "bruno@ifpr.edu.br" },
];

const defaultProps = {
  authors: [],
  setAuthors: jest.fn(),
  getSuggestions: mockGetSuggestions,
  currentUser: null,
  mode: "view",
};

// Helpers para os inputs do formulário de novo autor (sem aria-label/htmlFor)
const getSearchInput = () => screen.getByPlaceholderText("new-work.searchAuthor");
const getNameInput = () => screen.getAllByRole("textbox")[1];
const getEmailInput = () => screen.getAllByRole("textbox")[2];

beforeEach(() => {
  jest.clearAllMocks();
  window.alert = jest.fn();
  mockGetSuggestions.mockResolvedValue(suggestions);
});

describe("AuthorInput - Renderização", () => {
  test("renderiza o input de busca", () => {
    render(<AuthorInput {...defaultProps} />);
    expect(getSearchInput()).toBeInTheDocument();
  });

  test("renderiza os autores existentes como tags", () => {
    const authors = [
      { id: 1, name: "Ana Lima", email: "ana@ifpr.edu.br" },
      { id: 2, name: "Bruno Costa", email: "bruno@ifpr.edu.br" },
    ];
    render(<AuthorInput {...defaultProps} authors={authors} />);
    expect(screen.getByText("Ana Lima")).toBeInTheDocument();
    expect(screen.getByText("Bruno Costa")).toBeInTheDocument();
  });

  test("renderiza o formulário de novo autor", () => {
    render(<AuthorInput {...defaultProps} />);
    expect(getNameInput()).toBeInTheDocument();
    expect(getEmailInput()).toBeInTheDocument();
    expect(screen.getByText("new-work.student")).toBeInTheDocument();
    expect(screen.getByText("new-work.teacher")).toBeInTheDocument();
  });
});

describe("AuthorInput - Sugestões", () => {
  test("busca sugestões quando input tem 2+ caracteres", async () => {
    render(<AuthorInput {...defaultProps} />);
    const input = getSearchInput();

    await act(async () => {
      fireEvent.change(input, { target: { value: "an" } });
    });

    await waitFor(() => {
      expect(mockGetSuggestions).toHaveBeenCalledWith("an");
    });
  });

  test("não busca sugestões quando input tem menos de 2 caracteres", async () => {
    render(<AuthorInput {...defaultProps} />);
    const input = getSearchInput();

    await act(async () => {
      fireEvent.change(input, { target: { value: "a" } });
    });

    expect(mockGetSuggestions).not.toHaveBeenCalled();
  });

  test("exibe sugestões retornadas pela API", async () => {
    render(<AuthorInput {...defaultProps} />);
    const input = getSearchInput();

    await act(async () => {
      fireEvent.change(input, { target: { value: "an" } });
    });

    await waitFor(() => {
      expect(screen.getByText("Ana Lima (ana@ifpr.edu.br)")).toBeInTheDocument();
    });
  });

  test("filtra sugestões de autores já adicionados", async () => {
    const authors = [{ id: 1, name: "Ana Lima", email: "ana@ifpr.edu.br" }];
    render(<AuthorInput {...defaultProps} authors={authors} />);

    await act(async () => {
      fireEvent.change(getSearchInput(), { target: { value: "an" } });
    });

    await waitFor(() => {
      expect(screen.queryByText("Ana Lima (ana@ifpr.edu.br)")).not.toBeInTheDocument();
      expect(screen.getByText("Bruno Costa (bruno@ifpr.edu.br)")).toBeInTheDocument();
    });
  });

  test("limpa sugestões quando API falha", async () => {
    mockGetSuggestions.mockRejectedValueOnce(new Error("API error"));
    render(<AuthorInput {...defaultProps} />);

    await act(async () => {
      fireEvent.change(getSearchInput(), { target: { value: "an" } });
    });

    await waitFor(() => {
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });

  test("adiciona autor ao clicar na sugestão", async () => {
    const setAuthors = jest.fn();
    render(<AuthorInput {...defaultProps} setAuthors={setAuthors} />);

    await act(async () => {
      fireEvent.change(getSearchInput(), { target: { value: "an" } });
    });

    await waitFor(() => {
      expect(screen.getByText("Ana Lima (ana@ifpr.edu.br)")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Ana Lima (ana@ifpr.edu.br)"));
    expect(setAuthors).toHaveBeenCalledWith([suggestions[0]]);
  });
});

describe("AuthorInput - Remoção de autores", () => {
  test("remove autor ao clicar no botão de remover", () => {
    const setAuthors = jest.fn();
    const authors = [{ id: 1, name: "Ana Lima", email: "ana@ifpr.edu.br" }];
    render(<AuthorInput {...defaultProps} authors={authors} setAuthors={setAuthors} />);

    fireEvent.click(screen.getByRole("button", { name: "×" }));
    expect(setAuthors).toHaveBeenCalledWith([]);
  });

  test("não remove o currentUser nos modos create e edit", () => {
    const setAuthors = jest.fn();
    const currentUser = { id: 1, name: "Ana Lima" };
    const authors = [{ id: 1, name: "Ana Lima", email: "ana@ifpr.edu.br" }];

    render(
      <AuthorInput
        {...defaultProps}
        authors={authors}
        setAuthors={setAuthors}
        currentUser={currentUser}
        mode="create"
      />
    );

    const removeButton = screen.getByRole("button", { name: "×" });
    expect(removeButton).toBeDisabled();
    fireEvent.click(removeButton);
    expect(setAuthors).not.toHaveBeenCalled();
  });

  test("permite remover outros autores no modo edit", () => {
    const setAuthors = jest.fn();
    const currentUser = { id: 1 };
    const authors = [
      { id: 1, name: "Eu Mesmo" },
      { id: 2, name: "Outro Autor" },
    ];

    render(
      <AuthorInput
        {...defaultProps}
        authors={authors}
        setAuthors={setAuthors}
        currentUser={currentUser}
        mode="edit"
      />
    );

    const buttons = screen.getAllByRole("button", { name: "×" });
    fireEvent.click(buttons[1]);
    expect(setAuthors).toHaveBeenCalledWith([authors[0]]);
  });
});

describe("AuthorInput - Adicionar manualmente", () => {
  test("adiciona autor com todos os campos preenchidos", () => {
    const setAuthors = jest.fn();
    render(<AuthorInput {...defaultProps} setAuthors={setAuthors} />);

    fireEvent.change(getNameInput(), { target: { value: "Carlos Pereira" } });
    fireEvent.change(getEmailInput(), { target: { value: "carlos@ifpr.edu.br" } });
    fireEvent.click(screen.getByText("new-work.student"));
    fireEvent.click(screen.getByText("new-work.add"));

    expect(setAuthors).toHaveBeenCalledWith([
      { name: "Carlos Pereira", email: "carlos@ifpr.edu.br", type: "student" },
    ]);
  });

  test("exibe alerta quando tipo não é selecionado", () => {
    render(<AuthorInput {...defaultProps} />);

    fireEvent.change(getNameInput(), { target: { value: "Carlos" } });
    fireEvent.change(getEmailInput(), { target: { value: "carlos@ifpr.edu.br" } });
    fireEvent.click(screen.getByText("new-work.add"));

    expect(window.alert).toHaveBeenCalled();
  });

  test("exibe alerta quando nome ou email não são fornecidos", () => {
    render(<AuthorInput {...defaultProps} />);

    fireEvent.click(screen.getByText("new-work.student"));
    fireEvent.click(screen.getByText("new-work.add"));

    expect(window.alert).toHaveBeenCalled();
  });

  test("exibe alerta para email duplicado", () => {
    const authors = [{ id: 1, name: "Ana", email: "duplicado@ifpr.edu.br" }];
    render(<AuthorInput {...defaultProps} authors={authors} />);

    fireEvent.change(getNameInput(), { target: { value: "Ana Dupla" } });
    fireEvent.change(getEmailInput(), { target: { value: "duplicado@ifpr.edu.br" } });
    fireEvent.click(screen.getByText("new-work.student"));
    fireEvent.click(screen.getByText("new-work.add"));

    expect(window.alert).toHaveBeenCalled();
  });
});
