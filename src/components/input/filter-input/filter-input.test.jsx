import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import FilterInput from "./filter-input";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, defaultValue) => defaultValue || key,
  }),
}));

const mockGetSuggestions = jest.fn();

const suggestions = [
  { id: 10, name: "Machine Learning" },
  { id: 11, name: "Inteligência Artificial" },
];

const defaultProps = {
  selectedFilters: [],
  setSelectedFilters: jest.fn(),
  getSuggestions: mockGetSuggestions,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSuggestions.mockResolvedValue(suggestions);
});

describe("FilterInput - Renderização", () => {
  test("renderiza o input de busca", () => {
    render(<FilterInput {...defaultProps} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  test("renderiza os filtros selecionados como tags", () => {
    const selectedFilters = [
      { id: 1, name: "Ciência" },
      { id: 2, name: "Tecnologia" },
    ];
    render(<FilterInput {...defaultProps} selectedFilters={selectedFilters} />);
    expect(screen.getByText("Ciência")).toBeInTheDocument();
    expect(screen.getByText("Tecnologia")).toBeInTheDocument();
  });

  test("renderiza botão de remoção para cada filtro", () => {
    const selectedFilters = [
      { id: 1, name: "Ciência" },
      { id: 2, name: "Tecnologia" },
    ];
    render(<FilterInput {...defaultProps} selectedFilters={selectedFilters} />);
    const removeButtons = screen.getAllByRole("button", { name: "×" });
    expect(removeButtons).toHaveLength(2);
  });
});

describe("FilterInput - Busca de sugestões", () => {
  test("busca sugestões quando input tem 2+ caracteres", async () => {
    render(<FilterInput {...defaultProps} />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "ma" } });
    });

    await waitFor(() => {
      expect(mockGetSuggestions).toHaveBeenCalledWith("ma");
    });
  });

  test("não busca sugestões com menos de 2 caracteres", async () => {
    render(<FilterInput {...defaultProps} />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "m" } });
    });

    expect(mockGetSuggestions).not.toHaveBeenCalled();
  });

  test("exibe sugestões retornadas", async () => {
    render(<FilterInput {...defaultProps} />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "ma" } });
    });

    await waitFor(() => {
      expect(screen.getByText("Machine Learning")).toBeInTheDocument();
      expect(screen.getByText("Inteligência Artificial")).toBeInTheDocument();
    });
  });

  test("filtra sugestões já selecionadas", async () => {
    const selectedFilters = [{ id: 10, name: "Machine Learning" }];
    render(<FilterInput {...defaultProps} selectedFilters={selectedFilters} />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "ma" } });
    });

    await waitFor(() => {
      const suggestionsList = screen.getByRole("list");
      const listItems = suggestionsList.querySelectorAll("li");
      const suggestionTexts = Array.from(listItems).map(
        (item) => item.textContent,
      );

      // Machine Learning não deve estar na lista de sugestões (já está selecionado)
      expect(suggestionTexts).not.toContain("Machine Learning");
      // Mas Inteligência Artificial deve estar
      expect(suggestionTexts).toContain("Inteligência Artificial");
    });
  });

  test("limpa sugestões quando API falha", async () => {
    mockGetSuggestions.mockRejectedValueOnce(new Error("Erro de rede"));
    render(<FilterInput {...defaultProps} />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "ma" } });
    });

    await waitFor(() => {
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });

  test("exibe indicador de carregamento durante busca", async () => {
    let resolvePromise;
    mockGetSuggestions.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );

    render(<FilterInput {...defaultProps} />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "ma" } });
    });

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();

    await act(async () => {
      resolvePromise(suggestions);
    });
  });
});

describe("FilterInput - Seleção e remoção", () => {
  test("adiciona filtro ao clicar na sugestão", async () => {
    const setSelectedFilters = jest.fn();
    render(
      <FilterInput {...defaultProps} setSelectedFilters={setSelectedFilters} />,
    );
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "ma" } });
    });

    await waitFor(() => {
      expect(screen.getByText("Machine Learning")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Machine Learning"));
    expect(setSelectedFilters).toHaveBeenCalledWith([suggestions[0]]);
  });

  test("limpa o input ao adicionar filtro de sugestão", async () => {
    render(<FilterInput {...defaultProps} />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "ma" } });
    });

    await waitFor(() => {
      expect(screen.getByText("Machine Learning")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Machine Learning"));
    expect(input.value).toBe("");
  });

  test("remove filtro ao clicar no botão de remoção", () => {
    const setSelectedFilters = jest.fn();
    const selectedFilters = [{ id: 1, name: "Ciência" }];
    render(
      <FilterInput
        {...defaultProps}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "×" }));
    expect(setSelectedFilters).toHaveBeenCalledWith([]);
  });
});
