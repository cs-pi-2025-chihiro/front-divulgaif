import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import FiltrarBuscaModal from "./filtrarBuscaModal";

jest.mock("i18next", () => ({
  t: (key, defaultValue) => defaultValue || key,
}));

jest.mock("../../../services/hooks/suggestions/useGetSuggestions", () => ({
  useGetSuggestions: () => ({
    getLabelSuggestions: jest.fn().mockResolvedValue([]),
  }),
}));

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onApplyFilters: jest.fn(),
  showStatus: false,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FiltrarBuscaModal - Renderização", () => {
  test("não renderiza quando isOpen é false", () => {
    render(<FiltrarBuscaModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("renderiza quando isOpen é true", () => {
    render(<FiltrarBuscaModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("renderiza seção de tipos de trabalho", () => {
    render(<FiltrarBuscaModal {...defaultProps} />);
    expect(screen.getByText(/workTypes\.article/i)).toBeInTheDocument();
    expect(screen.getByText(/workTypes\.research/i)).toBeInTheDocument();
  });

  test("renderiza seção de período", () => {
    render(<FiltrarBuscaModal {...defaultProps} />);
    expect(screen.getByLabelText(/filters\.startDate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filters\.endDate/i)).toBeInTheDocument();
  });

  test("renderiza seção de ordenação", () => {
    render(<FiltrarBuscaModal {...defaultProps} />);
    expect(screen.getByText(/filters\.recent/i)).toBeInTheDocument();
    expect(screen.getByText(/filters\.older/i)).toBeInTheDocument();
  });

  test("renderiza seção de paginação", () => {
    render(<FiltrarBuscaModal {...defaultProps} />);
    expect(screen.getByText(/filters\.eight/i)).toBeInTheDocument();
    expect(screen.getByText(/filters\.twelve/i)).toBeInTheDocument();
    expect(screen.getByText(/filters\.twentyfour/i)).toBeInTheDocument();
    expect(screen.getByText(/filters\.thirtysix/i)).toBeInTheDocument();
  });

  test("renderiza seção de status quando showStatus é true", () => {
    render(<FiltrarBuscaModal {...defaultProps} showStatus={true} />);
    expect(screen.getByText(/workStatus\.draft/i)).toBeInTheDocument();
    expect(screen.getByText(/workStatus\.submitted/i)).toBeInTheDocument();
  });

  test("não renderiza seção de status quando showStatus é false", () => {
    render(<FiltrarBuscaModal {...defaultProps} showStatus={false} />);
    expect(screen.queryByText(/workStatus\.draft/i)).not.toBeInTheDocument();
  });
});

describe("FiltrarBuscaModal - Interações de filtros", () => {
  test("toggle de tipo de trabalho ao clicar no botão", () => {
    render(<FiltrarBuscaModal {...defaultProps} />);
    const articleBtn = screen.getByText(/workTypes\.article/i);

    fireEvent.click(articleBtn);
    expect(articleBtn).toHaveClass("selected");

    fireEvent.click(articleBtn);
    expect(articleBtn).not.toHaveClass("selected");
  });

  test("toggle de status ao clicar no botão (showStatus=true)", () => {
    render(<FiltrarBuscaModal {...defaultProps} showStatus={true} />);
    const draftBtn = screen.getByText(/workStatus\.draft/i);

    fireEvent.click(draftBtn);
    expect(draftBtn).toHaveClass("selected");
  });

  test("seleciona ordenação desc", () => {
    render(<FiltrarBuscaModal {...defaultProps} />);
    const recentBtn = screen.getByText(/filters\.recent/i);

    fireEvent.click(recentBtn);
    expect(recentBtn).toHaveClass("selected");
  });

  test("seleciona ordenação asc", () => {
    render(<FiltrarBuscaModal {...defaultProps} />);
    const olderBtn = screen.getByText(/filters\.older/i);

    fireEvent.click(olderBtn);
    expect(olderBtn).toHaveClass("selected");
  });

  test("seleciona paginação ao clicar", () => {
    render(<FiltrarBuscaModal {...defaultProps} />);
    const eightBtn = screen.getByText(/filters\.eight/i);

    fireEvent.click(eightBtn);
    expect(eightBtn).toHaveClass("selected");
  });

  test("altera data de início", () => {
    render(<FiltrarBuscaModal {...defaultProps} />);
    const startDate = screen.getByLabelText(/filters\.startDate/i);

    fireEvent.change(startDate, { target: { name: "startDate", value: "2025-01-01" } });
    expect(startDate.value).toBe("2025-01-01");
  });

  test("altera data de fim", () => {
    render(<FiltrarBuscaModal {...defaultProps} />);
    const endDate = screen.getByLabelText(/filters\.endDate/i);

    fireEvent.change(endDate, { target: { name: "endDate", value: "2025-12-31" } });
    expect(endDate.value).toBe("2025-12-31");
  });
});

describe("FiltrarBuscaModal - Labels", () => {
  test("habilita botão de adicionar label quando há texto", () => {
    render(<FiltrarBuscaModal {...defaultProps} />);
    const labelInput = screen.getByPlaceholderText(/filters\.addLabel/i);
    const addBtn = screen.getByLabelText("Add label");

    expect(addBtn).toBeDisabled();
    fireEvent.change(labelInput, { target: { value: "TI" } });
    expect(addBtn).not.toBeDisabled();
  });

  test("adiciona label ao clicar no botão +", () => {
    render(<FiltrarBuscaModal {...defaultProps} />);
    const labelInput = screen.getByPlaceholderText(/filters\.addLabel/i);

    fireEvent.change(labelInput, { target: { value: "Inteligência Artificial" } });
    fireEvent.click(screen.getByLabelText("Add label"));

    expect(screen.getByText("Inteligência Artificial")).toBeInTheDocument();
  });

  test("não adiciona label duplicada", () => {
    render(<FiltrarBuscaModal {...defaultProps} />);
    const labelInput = screen.getByPlaceholderText(/filters\.addLabel/i);
    const addBtn = screen.getByLabelText("Add label");

    fireEvent.change(labelInput, { target: { value: "IA" } });
    fireEvent.click(addBtn);
    fireEvent.change(labelInput, { target: { value: "IA" } });
    fireEvent.click(addBtn);

    const iaItems = screen.getAllByText("IA");
    expect(iaItems).toHaveLength(1);
  });

  test("remove label ao clicar no botão de remoção", () => {
    render(<FiltrarBuscaModal {...defaultProps} />);
    const labelInput = screen.getByPlaceholderText(/filters\.addLabel/i);

    fireEvent.change(labelInput, { target: { value: "Remover" } });
    fireEvent.click(screen.getByLabelText("Add label"));

    expect(screen.getByText("Remover")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Remove Remover"));
    expect(screen.queryByText("Remover")).not.toBeInTheDocument();
  });

  test("limpa o input após adicionar label", () => {
    render(<FiltrarBuscaModal {...defaultProps} />);
    const labelInput = screen.getByPlaceholderText(/filters\.addLabel/i);

    fireEvent.change(labelInput, { target: { value: "Teste" } });
    fireEvent.click(screen.getByLabelText("Add label"));

    expect(labelInput.value).toBe("");
  });
});

describe("FiltrarBuscaModal - Ações do modal", () => {
  test("chama onApplyFilters e onClose ao clicar em Aplicar", () => {
    const onApplyFilters = jest.fn();
    const onClose = jest.fn();
    render(
      <FiltrarBuscaModal
        {...defaultProps}
        onApplyFilters={onApplyFilters}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByText(/filters\.apply/i));

    expect(onApplyFilters).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("chama onClose ao clicar em Voltar", () => {
    const onClose = jest.fn();
    render(<FiltrarBuscaModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText(/common\.back/i));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("limpa filtros e chama onApplyFilters ao clicar em Limpar Filtros", () => {
    const onApplyFilters = jest.fn();
    render(
      <FiltrarBuscaModal {...defaultProps} onApplyFilters={onApplyFilters} />
    );

    // Adiciona um filtro antes de limpar
    fireEvent.click(screen.getByText(/workTypes\.article/i));

    fireEvent.click(screen.getByText(/common\.clearFilters/i));

    expect(onApplyFilters).toHaveBeenCalledTimes(1);
    const clearedFilters = onApplyFilters.mock.calls[0][0];
    expect(clearedFilters.workType.article).toBe(false);
  });

  test("chama onClose ao clicar no overlay", () => {
    const onClose = jest.fn();
    const { container } = render(
      <FiltrarBuscaModal {...defaultProps} onClose={onClose} />
    );

    fireEvent.click(container.querySelector(".modal-overlay"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("fecha modal ao pressionar Escape", () => {
    const onClose = jest.fn();
    render(<FiltrarBuscaModal {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("passa os filtros selecionados ao aplicar", () => {
    const onApplyFilters = jest.fn();
    render(
      <FiltrarBuscaModal {...defaultProps} onApplyFilters={onApplyFilters} />
    );

    fireEvent.click(screen.getByText(/workTypes\.article/i));
    fireEvent.click(screen.getByText(/filters\.recent/i));
    fireEvent.click(screen.getByText(/filters\.apply/i));

    const appliedFilters = onApplyFilters.mock.calls[0][0];
    expect(appliedFilters.workType.article).toBe(true);
    expect(appliedFilters.order).toBe("desc");
  });
});
