import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "./modal";

describe("Modal", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("não renderiza quando isOpen é false", () => {
    render(
      <Modal isOpen={false} onClose={onClose} title="Título">
        Conteúdo
      </Modal>
    );
    expect(screen.queryByText("Título")).not.toBeInTheDocument();
  });

  test("renderiza quando isOpen é true", () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Título">
        Conteúdo
      </Modal>
    );
    expect(screen.getByText("Título")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo")).toBeInTheDocument();
  });

  test("renderiza o título corretamente", () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Meu Título">
        Conteúdo
      </Modal>
    );
    expect(screen.getByRole("heading", { name: "Meu Título" })).toBeInTheDocument();
  });

  test("não renderiza o h2 quando title não é fornecido", () => {
    render(
      <Modal isOpen={true} onClose={onClose}>
        Conteúdo
      </Modal>
    );
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  test("renderiza o footer quando fornecido", () => {
    render(
      <Modal isOpen={true} onClose={onClose} footer={<button>Salvar</button>}>
        Conteúdo
      </Modal>
    );
    expect(screen.getByText("Salvar")).toBeInTheDocument();
  });

  test("não renderiza o footer quando não fornecido", () => {
    const { container } = render(
      <Modal isOpen={true} onClose={onClose}>
        Conteúdo
      </Modal>
    );
    expect(container.querySelector(".modal-footer")).not.toBeInTheDocument();
  });

  test("chama onClose ao pressionar Escape", () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Título">
        Conteúdo
      </Modal>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("não chama onClose ao pressionar outra tecla", () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Título">
        Conteúdo
      </Modal>
    );
    fireEvent.keyDown(document, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
  });

  test("chama onClose ao clicar no overlay quando closeOnOutsideClick é true", () => {
    const { container } = render(
      <Modal isOpen={true} onClose={onClose} closeOnOutsideClick={true}>
        Conteúdo
      </Modal>
    );
    fireEvent.click(container.querySelector(".modal-overlay"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("não chama onClose ao clicar no overlay quando closeOnOutsideClick é false", () => {
    const { container } = render(
      <Modal isOpen={true} onClose={onClose} closeOnOutsideClick={false}>
        Conteúdo
      </Modal>
    );
    fireEvent.click(container.querySelector(".modal-overlay"));
    expect(onClose).not.toHaveBeenCalled();
  });

  test("chama onClose ao clicar no botão de fechar", () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Título">
        Conteúdo
      </Modal>
    );
    fireEvent.click(screen.getByText("×"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("aplica a classe de largura correta", () => {
    const { container } = render(
      <Modal isOpen={true} onClose={onClose} width="large">
        Conteúdo
      </Modal>
    );
    expect(container.querySelector(".modal-large")).toBeInTheDocument();
  });

  test("aplica largura 'medium' por padrão", () => {
    const { container } = render(
      <Modal isOpen={true} onClose={onClose}>
        Conteúdo
      </Modal>
    );
    expect(container.querySelector(".modal-medium")).toBeInTheDocument();
  });

  test("define overflow hidden no body quando aberto", () => {
    render(
      <Modal isOpen={true} onClose={onClose}>
        Conteúdo
      </Modal>
    );
    expect(document.body.style.overflow).toBe("hidden");
  });

  test("restaura overflow do body quando fechado", () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={onClose}>
        Conteúdo
      </Modal>
    );
    rerender(
      <Modal isOpen={false} onClose={onClose}>
        Conteúdo
      </Modal>
    );
    expect(document.body.style.overflow).toBe("auto");
  });
});
