import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import {
  NotificationProvider,
  useNotification,
} from "./NotificationProvider";

jest.useFakeTimers();

// Componente auxiliar para testar o hook useNotification
const TestConsumer = ({ action }) => {
  const notification = useNotification();
  return (
    <button onClick={() => action(notification)}>trigger</button>
  );
};

const renderWithProvider = (ui) => {
  return render(<NotificationProvider>{ui}</NotificationProvider>);
};

beforeEach(() => {
  jest.clearAllTimers();
});

describe("NotificationProvider - Renderização", () => {
  test("renderiza os filhos normalmente", () => {
    renderWithProvider(<div data-testid="child">Filho</div>);
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  test("não renderiza container de notificações quando não há notificações", () => {
    const { container } = renderWithProvider(<div />);
    expect(container.querySelector(".notification-container")).not.toBeInTheDocument();
  });
});

describe("useNotification - Erro fora do Provider", () => {
  test("lança erro quando usado fora do NotificationProvider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    const ComponenteSemProvider = () => {
      useNotification();
      return null;
    };

    expect(() => render(<ComponenteSemProvider />)).toThrow(
      "useNotification must be used within a NotificationProvider"
    );

    consoleError.mockRestore();
  });
});

describe("NotificationProvider - addNotification", () => {
  test("exibe notificação ao chamar addNotification", () => {
    renderWithProvider(
      <TestConsumer
        action={({ addNotification }) =>
          addNotification("Mensagem de teste", "info")
        }
      />
    );

    fireEvent.click(screen.getByText("trigger"));
    expect(screen.getByText("Mensagem de teste")).toBeInTheDocument();
  });

  test("exibe o container quando há notificações", () => {
    const { container } = renderWithProvider(
      <TestConsumer
        action={({ addNotification }) => addNotification("Teste", "info")}
      />
    );

    fireEvent.click(screen.getByText("trigger"));
    expect(container.querySelector(".notification-container")).toBeInTheDocument();
  });

  test("remove notificação automaticamente após a duração", async () => {
    renderWithProvider(
      <TestConsumer
        action={({ addNotification }) =>
          addNotification("Auto remove", "info", 3000)
        }
      />
    );

    fireEvent.click(screen.getByText("trigger"));
    expect(screen.getByText("Auto remove")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.queryByText("Auto remove")).not.toBeInTheDocument();
    });
  });

  test("não remove notificação quando duration é 0", () => {
    renderWithProvider(
      <TestConsumer
        action={({ addNotification }) =>
          addNotification("Persistente", "info", 0)
        }
      />
    );

    fireEvent.click(screen.getByText("trigger"));
    act(() => {
      jest.advanceTimersByTime(99999);
    });

    expect(screen.getByText("Persistente")).toBeInTheDocument();
  });
});

describe("NotificationProvider - showSuccess / showError / showWarning / showInfo", () => {
  test("showSuccess exibe notificação com tipo success", () => {
    const { container } = renderWithProvider(
      <TestConsumer
        action={({ showSuccess }) => showSuccess("Sucesso!")}
      />
    );

    fireEvent.click(screen.getByText("trigger"));
    expect(screen.getByText("Sucesso!")).toBeInTheDocument();
    expect(container.querySelector(".notification--success")).toBeInTheDocument();
  });

  test("showError exibe notificação com tipo error", () => {
    const { container } = renderWithProvider(
      <TestConsumer
        action={({ showError }) => showError("Erro!")}
      />
    );

    fireEvent.click(screen.getByText("trigger"));
    expect(screen.getByText("Erro!")).toBeInTheDocument();
    expect(container.querySelector(".notification--error")).toBeInTheDocument();
  });

  test("showWarning exibe notificação com tipo warning", () => {
    const { container } = renderWithProvider(
      <TestConsumer
        action={({ showWarning }) => showWarning("Aviso!")}
      />
    );

    fireEvent.click(screen.getByText("trigger"));
    expect(screen.getByText("Aviso!")).toBeInTheDocument();
    expect(container.querySelector(".notification--warning")).toBeInTheDocument();
  });

  test("showInfo exibe notificação com tipo info", () => {
    const { container } = renderWithProvider(
      <TestConsumer
        action={({ showInfo }) => showInfo("Info!")}
      />
    );

    fireEvent.click(screen.getByText("trigger"));
    expect(screen.getByText("Info!")).toBeInTheDocument();
    expect(container.querySelector(".notification--info")).toBeInTheDocument();
  });

  test("showError usa duração padrão de 8000ms", async () => {
    renderWithProvider(
      <TestConsumer
        action={({ showError }) => showError("Erro longo")}
      />
    );

    fireEvent.click(screen.getByText("trigger"));
    expect(screen.getByText("Erro longo")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(7999);
    });
    expect(screen.getByText("Erro longo")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    await waitFor(() => {
      expect(screen.queryByText("Erro longo")).not.toBeInTheDocument();
    });
  });
});

describe("NotificationProvider - removeNotification", () => {
  test("remove notificação ao clicar no botão fechar", () => {
    renderWithProvider(
      <TestConsumer
        action={({ addNotification }) => addNotification("Fechar teste", "info", 0)}
      />
    );

    fireEvent.click(screen.getByText("trigger"));
    expect(screen.getByText("Fechar teste")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Fechar notificação"));
    expect(screen.queryByText("Fechar teste")).not.toBeInTheDocument();
  });

  test("remove notificação ao chamar removeNotification manualmente", async () => {
    let savedNotification;
    renderWithProvider(
      <TestConsumer
        action={({ addNotification, removeNotification }) => {
          const id = addNotification("Manual remove", "info", 0);
          savedNotification = { id, removeNotification };
        }}
      />
    );

    fireEvent.click(screen.getByText("trigger"));
    expect(screen.getByText("Manual remove")).toBeInTheDocument();

    act(() => {
      savedNotification.removeNotification(savedNotification.id);
    });

    await waitFor(() => {
      expect(screen.queryByText("Manual remove")).not.toBeInTheDocument();
    });
  });
});

describe("NotificationProvider - múltiplas notificações", () => {
  test("exibe múltiplas notificações simultaneamente", () => {
    const MultiTrigger = () => {
      const { addNotification } = useNotification();
      return (
        <>
          <button onClick={() => addNotification("Notif 1", "info", 0)}>
            add1
          </button>
          <button onClick={() => addNotification("Notif 2", "success", 0)}>
            add2
          </button>
        </>
      );
    };

    renderWithProvider(<MultiTrigger />);

    fireEvent.click(screen.getByText("add1"));
    fireEvent.click(screen.getByText("add2"));

    expect(screen.getByText("Notif 1")).toBeInTheDocument();
    expect(screen.getByText("Notif 2")).toBeInTheDocument();
  });
});
