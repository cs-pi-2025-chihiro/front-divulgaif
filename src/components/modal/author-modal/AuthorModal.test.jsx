import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AuthorModal from "./AuthorModal";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, defaultValue) => defaultValue || key,
  }),
}));

describe("AuthorModal", () => {
  const onClose = jest.fn();
  const onSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("não renderiza quando isOpen é false", () => {
    render(
      <AuthorModal isOpen={false} onClose={onClose} onSave={onSave} />
    );
    expect(screen.queryByText("Create New Author")).not.toBeInTheDocument();
  });

  test("renderiza com título de criação por padrão", () => {
    render(
      <AuthorModal isOpen={true} onClose={onClose} onSave={onSave} />
    );
    expect(screen.getByText("Create New Author")).toBeInTheDocument();
  });

  test("renderiza com título de edição no modo edit", () => {
    render(
      <AuthorModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        mode="edit"
        authorData={{ id: 1, name: "Autor", email: "autor@email.com" }}
      />
    );
    expect(screen.getByText("Edit Author")).toBeInTheDocument();
  });

  test("preenche os campos com authorData no modo edit", () => {
    render(
      <AuthorModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        mode="edit"
        authorData={{ id: 1, name: "João Silva", email: "joao@ifpr.edu.br" }}
      />
    );
    expect(screen.getByDisplayValue("João Silva")).toBeInTheDocument();
    expect(screen.getByDisplayValue("joao@ifpr.edu.br")).toBeInTheDocument();
  });

  test("limpa os campos no modo create ao abrir", () => {
    render(
      <AuthorModal isOpen={true} onClose={onClose} onSave={onSave} mode="create" />
    );
    expect(screen.getByPlaceholderText("Enter author name").value).toBe("");
    expect(screen.getByPlaceholderText("Enter author email").value).toBe("");
  });

  test("exibe erro quando nome está vazio", () => {
    render(
      <AuthorModal isOpen={true} onClose={onClose} onSave={onSave} />
    );
    fireEvent.click(screen.getByText("Save"));
    expect(screen.getByText("Author name cannot be empty.")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  test("exibe erro quando email está vazio", () => {
    render(
      <AuthorModal isOpen={true} onClose={onClose} onSave={onSave} />
    );
    const nameInput = screen.getByPlaceholderText("Enter author name");
    fireEvent.change(nameInput, { target: { value: "João" } });
    fireEvent.click(screen.getByText("Save"));
    expect(screen.getByText("Author email cannot be empty.")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  test("exibe erro quando email é inválido", () => {
    render(
      <AuthorModal isOpen={true} onClose={onClose} onSave={onSave} />
    );
    fireEvent.change(screen.getByPlaceholderText("Enter author name"), {
      target: { value: "João" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter author email"), {
      target: { value: "email-invalido" },
    });
    fireEvent.click(screen.getByText("Save"));
    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  test("chama onSave com nome e email no modo create", () => {
    render(
      <AuthorModal isOpen={true} onClose={onClose} onSave={onSave} />
    );
    fireEvent.change(screen.getByPlaceholderText("Enter author name"), {
      target: { value: "João Silva" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter author email"), {
      target: { value: "joao@ifpr.edu.br" },
    });
    fireEvent.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalledWith({
      name: "João Silva",
      email: "joao@ifpr.edu.br",
    });
  });

  test("chama onSave com id no modo edit", () => {
    render(
      <AuthorModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        mode="edit"
        authorData={{ id: 7, name: "Antigo", email: "antigo@ifpr.edu.br" }}
      />
    );
    fireEvent.change(screen.getByDisplayValue("Antigo"), {
      target: { value: "Novo Nome" },
    });
    fireEvent.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalledWith({
      id: 7,
      name: "Novo Nome",
      email: "antigo@ifpr.edu.br",
    });
  });

  test("chama onClose ao clicar em Cancelar", () => {
    render(
      <AuthorModal isOpen={true} onClose={onClose} onSave={onSave} />
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("remove espaços extras ao salvar", () => {
    render(
      <AuthorModal isOpen={true} onClose={onClose} onSave={onSave} />
    );
    fireEvent.change(screen.getByPlaceholderText("Enter author name"), {
      target: { value: "  João  " },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter author email"), {
      target: { value: "  joao@ifpr.edu.br  " },
    });
    fireEvent.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalledWith({
      name: "João",
      email: "joao@ifpr.edu.br",
    });
  });
});
