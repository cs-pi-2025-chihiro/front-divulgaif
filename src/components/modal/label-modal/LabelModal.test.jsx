import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LabelModal from "./LabelModal";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, defaultValue) => defaultValue || key,
  }),
}));

describe("LabelModal", () => {
  const onClose = jest.fn();
  const onSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("não renderiza quando isOpen é false", () => {
    render(
      <LabelModal isOpen={false} onClose={onClose} onSave={onSave} />
    );
    expect(screen.queryByText("Create New Label")).not.toBeInTheDocument();
  });

  test("renderiza com título de criação por padrão", () => {
    render(
      <LabelModal isOpen={true} onClose={onClose} onSave={onSave} />
    );
    expect(screen.getByText("Create New Label")).toBeInTheDocument();
  });

  test("renderiza com título de edição no modo edit", () => {
    render(
      <LabelModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        mode="edit"
        labelData={{ id: 1, name: "Existente" }}
      />
    );
    expect(screen.getByText("Edit Label")).toBeInTheDocument();
  });

  test("preenche o campo com labelData no modo edit", () => {
    render(
      <LabelModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        mode="edit"
        labelData={{ id: 1, name: "Minha Label" }}
      />
    );
    expect(screen.getByDisplayValue("Minha Label")).toBeInTheDocument();
  });

  test("limpa o campo no modo create ao abrir", () => {
    render(
      <LabelModal isOpen={true} onClose={onClose} onSave={onSave} mode="create" />
    );
    const input = screen.getByPlaceholderText("Enter label name");
    expect(input.value).toBe("");
  });

  test("exibe erro quando tenta salvar com nome vazio", () => {
    render(
      <LabelModal isOpen={true} onClose={onClose} onSave={onSave} />
    );
    fireEvent.click(screen.getByText("Save"));
    expect(screen.getByText("Label name cannot be empty.")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  test("chama onSave com nome no modo create", () => {
    render(
      <LabelModal isOpen={true} onClose={onClose} onSave={onSave} />
    );
    const input = screen.getByPlaceholderText("Enter label name");
    fireEvent.change(input, { target: { value: "Nova Label" } });
    fireEvent.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalledWith({ name: "Nova Label" });
  });

  test("chama onSave com id e nome no modo edit", () => {
    render(
      <LabelModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        mode="edit"
        labelData={{ id: 42, name: "Antiga" }}
      />
    );
    const input = screen.getByDisplayValue("Antiga");
    fireEvent.change(input, { target: { value: "Atualizada" } });
    fireEvent.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalledWith({ id: 42, name: "Atualizada" });
  });

  test("chama onClose ao clicar em Cancelar", () => {
    render(
      <LabelModal isOpen={true} onClose={onClose} onSave={onSave} />
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("limpa o erro ao digitar novo nome após erro", () => {
    render(
      <LabelModal isOpen={true} onClose={onClose} onSave={onSave} />
    );
    fireEvent.click(screen.getByText("Save"));
    expect(screen.getByText("Label name cannot be empty.")).toBeInTheDocument();

    const input = screen.getByPlaceholderText("Enter label name");
    fireEvent.change(input, { target: { value: "Label Válida" } });
    fireEvent.click(screen.getByText("Save"));
    expect(screen.queryByText("Label name cannot be empty.")).not.toBeInTheDocument();
  });

  test("remove espaços extras do nome ao salvar", () => {
    render(
      <LabelModal isOpen={true} onClose={onClose} onSave={onSave} />
    );
    const input = screen.getByPlaceholderText("Enter label name");
    fireEvent.change(input, { target: { value: "  Label com espaço  " } });
    fireEvent.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalledWith({ name: "Label com espaço" });
  });
});
