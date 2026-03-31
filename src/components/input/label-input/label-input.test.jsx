import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import LabelInput from "./label-input";

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
  { id: 1, name: "Machine Learning" },
  { id: 2, name: "Banco de Dados" },
];

const defaultProps = {
  labels: [],
  setLabels: jest.fn(),
  getSuggestions: mockGetSuggestions,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSuggestions.mockResolvedValue(suggestions);
});

describe("LabelInput - Renderização", () => {
  test("renderiza o input de busca", () => {
    render(<LabelInput {...defaultProps} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  test("renderiza labels existentes como tags", () => {
    const labels = [
      { id: 1, name: "Machine Learning" },
      { id: 2, name: "Banco de Dados" },
    ];
    render(<LabelInput {...defaultProps} labels={labels} />);
    expect(screen.getByText("Machine Learning")).toBeInTheDocument();
    expect(screen.getByText("Banco de Dados")).toBeInTheDocument();
  });

  test("renderiza botão de adicionar (+)", () => {
    render(<LabelInput {...defaultProps} />);
    expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
  });

  test("renderiza botão de remoção para cada label", () => {
    const labels = [
      { id: 1, name: "ML" },
      { id: 2, name: "IA" },
    ];
    render(<LabelInput {...defaultProps} labels={labels} />);
    const removeButtons = screen.getAllByRole("button", { name: "×" });
    expect(removeButtons).toHaveLength(2);
  });
});

describe("LabelInput - Sugestões", () => {
  test("busca sugestões quando input tem 2+ caracteres", async () => {
    render(<LabelInput {...defaultProps} />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "ma" } });
    });

    await waitFor(() => {
      expect(mockGetSuggestions).toHaveBeenCalledWith("ma");
    });
  });

  test("não busca sugestões com menos de 2 caracteres", async () => {
    render(<LabelInput {...defaultProps} />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "m" } });
    });

    expect(mockGetSuggestions).not.toHaveBeenCalled();
  });

  test("exibe sugestões retornadas", async () => {
    render(<LabelInput {...defaultProps} />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "ma" } });
    });

    await waitFor(() => {
      expect(screen.getByText("Machine Learning")).toBeInTheDocument();
    });
  });

  test("filtra sugestões de labels já adicionadas", async () => {
    const labels = [{ id: 1, name: "Machine Learning" }];
    render(<LabelInput {...defaultProps} labels={labels} />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "ma" } });
    });

    await waitFor(() => {
      // Machine Learning já está adicionada, deve aparecer só no tag, não na sugestão
      const allItems = screen.getAllByText("Machine Learning");
      // Apenas a tag existente deve estar visível, sem duplicar na lista
      expect(allItems).toHaveLength(1);
      expect(screen.getByText("Banco de Dados")).toBeInTheDocument();
    });
  });

  test("adiciona label ao clicar na sugestão", async () => {
    const setLabels = jest.fn();
    render(<LabelInput {...defaultProps} setLabels={setLabels} />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "ma" } });
    });

    await waitFor(() => {
      expect(screen.getByText("Machine Learning")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Machine Learning"));
    expect(setLabels).toHaveBeenCalledWith([suggestions[0]]);
  });

  test("limpa o input após adicionar por sugestão", async () => {
    render(<LabelInput {...defaultProps} />);
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

  test("limpa sugestões quando API falha", async () => {
    mockGetSuggestions.mockRejectedValueOnce(new Error("Erro"));
    render(<LabelInput {...defaultProps} />);
    const input = screen.getByRole("textbox");

    await act(async () => {
      fireEvent.change(input, { target: { value: "ma" } });
    });

    await waitFor(() => {
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });
});

describe("LabelInput - Adicionar manualmente", () => {
  test("adiciona label manualmente ao clicar no botão +", () => {
    const setLabels = jest.fn();
    render(<LabelInput {...defaultProps} setLabels={setLabels} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "Nova Label" } });
    fireEvent.click(screen.getByRole("button", { name: "+" }));

    expect(setLabels).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: "Nova Label" }),
      ])
    );
  });

  test("não adiciona label vazia", () => {
    const setLabels = jest.fn();
    render(<LabelInput {...defaultProps} setLabels={setLabels} />);

    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(setLabels).not.toHaveBeenCalled();
  });

  test("não adiciona label duplicada (case insensitive)", () => {
    const labels = [{ id: 1, name: "Machine Learning" }];
    const setLabels = jest.fn();
    render(<LabelInput {...defaultProps} labels={labels} setLabels={setLabels} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "machine learning" } });
    fireEvent.click(screen.getByRole("button", { name: "+" }));

    expect(setLabels).not.toHaveBeenCalled();
  });

  test("limpa o input após adicionar manualmente", () => {
    render(<LabelInput {...defaultProps} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "Nova Label" } });
    fireEvent.click(screen.getByRole("button", { name: "+" }));

    expect(input.value).toBe("");
  });
});

describe("LabelInput - Remoção", () => {
  test("remove label ao clicar no botão de remoção", () => {
    const setLabels = jest.fn();
    const labels = [{ id: 1, name: "ML" }];
    render(
      <LabelInput {...defaultProps} labels={labels} setLabels={setLabels} />
    );

    fireEvent.click(screen.getByRole("button", { name: "×" }));
    expect(setLabels).toHaveBeenCalledWith([]);
  });
});
