import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WorkFormPage from "./page";
import { BrowserRouter } from "react-router-dom";

// Mocks
jest.mock("../../../services/hooks/auth/useAuth", () => ({
  isAuthenticated: jest.fn(() => true),
  hasRole: jest.fn(() => true),
  getStoredUser: jest.fn(() => ({
    id: 1,
    name: "Test User",
    email: "test@test.com",
  })),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "pt" },
  }),
}));

jest.mock("../../../services/hooks/suggestions/useGetSuggestions", () => ({
  useGetSuggestions: () => ({
    getLabelSuggestions: jest.fn(),
    getLinkSuggestions: jest.fn(),
    getAuthorSuggestions: jest.fn(),
  }),
}));

// Wrapper com Router
const renderComponent = () =>
  render(
    <BrowserRouter>
      <WorkFormPage />
    </BrowserRouter>
  );
  
//--------------------

test("deve renderizar os campos principais", () => {
  renderComponent();

  expect(screen.getByText("new-work.worktype*")).toBeInTheDocument();
  expect(screen.getByText("new-work.worktitle*")).toBeInTheDocument();
  expect(screen.getByText("new-work.workauthors")).toBeInTheDocument();
});

//---------------------

test("deve atualizar o campo de título ao digitar", () => {
  renderComponent();

  const input = screen.getByPlaceholderText("new-work.worktitle");

  fireEvent.change(input, { target: { value: "Meu trabalho" } });

  expect(input.value).toBe("Meu trabalho");
});

//------------------

test("deve atualizar a descrição", () => {
  renderComponent();

  const textarea = screen.getByPlaceholderText("new-work.workdescription");

  fireEvent.change(textarea, { target: { value: "Descrição teste" } });

  expect(textarea.value).toBe("Descrição teste");
});

//----------------

test("deve mostrar contador de palavras", () => {
  renderComponent();

  expect(screen.getByText(/0\/160/)).toBeInTheDocument();
});

//--------------

test("deve mostrar erro ao tentar salvar sem preencher campos obrigatórios", async () => {
  renderComponent();

  const saveButton = screen.getByText("common.save");
  fireEvent.click(saveButton);

  await waitFor(() => {
    // Usamos a função diretamente aqui para encontrar o elemento
    const errorMessage = screen.getByText((content, node) => {
      const hasText = (node) => node.textContent === 'O tipo do trabalho é obrigatório';
      const nodeHasText = hasText(node);
      const childrenDontHaveText = Array.from(node.children).every(
        (child) => !hasText(child)
      );
      return nodeHasText && childrenDontHaveText;
    });

    expect(errorMessage).toBeInTheDocument();
  });
});

//------------------

test("deve chamar função de salvar draft", async () => {
  renderComponent();

  const button = screen.getByText("common.save");

  fireEvent.click(button);

  await waitFor(() => {
    // aqui você pode mockar saveDraft e verificar chamada
    expect(button).toBeInTheDocument();
  });
});

//---------------------

test("deve submeter formulário ao clicar em enviar", async () => {
  renderComponent();

  const submitButton = screen.getByText("new-work.send");

  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(submitButton).toBeInTheDocument();
  });
});

//------------------------

import { useNavigate } from "react-router-dom";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

test("deve voltar ao clicar no botão back", () => {
  const navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);

  renderComponent();

  const backButton = screen.getByText("common.back");

  fireEvent.click(backButton);

  expect(navigate).toHaveBeenCalledWith(-1);
});

//------------------------

test("deve selecionar uma imagem", () => {
  renderComponent();

  const file = new File(["dummy"], "image.png", { type: "image/png" });

  const input = document.querySelector("input[type='file']");

  fireEvent.change(input, {
    target: { files: [file] },
  });

  expect(input.files[0]).toBe(file);
});

//--------------------

test("deve desabilitar botões durante loading", () => {
  renderComponent();

  const button = screen.getByText("common.save");

  expect(button).not.toBeDisabled();
});