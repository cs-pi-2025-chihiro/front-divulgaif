# Guia de Testes Unitários com Jest

## 📋 Visão Geral

Este projeto está configurado com Jest e React Testing Library para testes unitários de componentes React.

## 🔧 Configuração

### Dependências Instaladas

- `react-scripts`: Gerencia o Jest e a configuração base
- `@testing-library/react`: Utilitários para testar componentes React
- `@testing-library/jest-dom`: Matchers customizados para Jest (como `.toBeInTheDocument()`)
- `@testing-library/user-event`: Simulação de interações do usuário

### Arquivo de Configuração

O arquivo `src/app/setupTests.js` é executado automaticamente antes dos testes e inclui:

- Importação do `@testing-library/jest-dom`
- Mocks globais para `window.matchMedia`, `IntersectionObserver`, `ResizeObserver` e `window.scrollTo`

## 🚀 Executando os Testes

### Comandos Disponíveis

```bash
# Modo interativo (watch mode) - padrão
npm test

# Com cobertura de código
npm run test:coverage

# Modo watch explícito
npm run test:watch

# Para CI/CD (executa uma vez e gera relatório de cobertura)
npm run test:ci
```

## ✍️ Escrevendo Testes

### Estrutura Básica

```javascript
import { render, screen, fireEvent } from "@testing-library/react";
import MyComponent from "./MyComponent";

describe("MyComponent", () => {
  test("renders component correctly", () => {
    render(<MyComponent />);
    const element = screen.getByText(/hello/i);
    expect(element).toBeInTheDocument();
  });

  test("handles user interaction", () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Organização de Testes

Você pode organizar seus testes de duas formas:

1. **Ao lado do componente:**

   ```
   components/
     button/
       button.jsx
       button.test.js  ← Teste aqui
   ```

2. **Em pasta **tests**:**
   ```
   components/
     button/
       button.jsx
       __tests__/
         button.test.js  ← Teste aqui
   ```

Jest reconhece automaticamente arquivos com estas extensões:

- `*.test.js`
- `*.test.jsx`
- `*.spec.js`
- `*.spec.jsx`

## 🧪 Exemplo Prático

Veja `src/components/button/button.test.js` para um exemplo completo de testes que incluem:

- Renderização básica
- Eventos de clique
- Estados desabilitados
- Classes CSS dinâmicas
- Acessibilidade (ARIA)
- Eventos de teclado

## 📊 Cobertura de Código

A configuração atual exige:

- 70% de cobertura em branches
- 70% de cobertura em funções
- 70% de cobertura em linhas
- 70% de cobertura em statements

Arquivos excluídos da cobertura:

- `src/index.js`
- `src/app/reportWebVitals.js`
- Todos os arquivos de teste (`*.test.js`, `*.test.jsx`)
- Pasta `__tests__/`

## 🎯 Melhores Práticas

1. **Teste comportamento, não implementação**
   - Foque no que o usuário vê e interage
   - Evite testar detalhes internos de implementação

2. **Use consultas semânticas**
   - Prefira `getByRole`, `getByLabelText`, `getByText`
   - Evite `querySelector` ou seletores CSS

3. **Mantenha testes simples e focados**
   - Um conceito por teste
   - Nomes descritivos e claros

4. **Mock apenas quando necessário**
   - Use mocks para APIs externas
   - Evite mockar componentes filhos desnecessariamente

5. **Teste casos de erro**
   - Estados vazios
   - Dados inválidos
   - Erros de rede

## 🔍 Queries Mais Comuns

```javascript
// Por role (preferido)
screen.getByRole("button", { name: /submit/i });

// Por label
screen.getByLabelText(/username/i);

// Por texto
screen.getByText(/hello world/i);

// Por placeholder
screen.getByPlaceholderText(/enter email/i);

// Por test ID (último recurso)
screen.getByTestId("custom-element");
```

## 🛠️ Utilitários de Teste

```javascript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Renderizar componente
render(<MyComponent />);

// Simular eventos
fireEvent.click(button);
fireEvent.change(input, { target: { value: "text" } });

// Interações mais realistas do usuário
await userEvent.type(input, "hello");
await userEvent.click(button);

// Esperar por mudanças assíncronas
await waitFor(() => {
  expect(screen.getByText(/loaded/i)).toBeInTheDocument();
});
```

## 📚 Recursos Adicionais

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🤝 Contribuindo

Ao adicionar novos componentes, sempre inclua testes:

1. Crie o arquivo de teste ao lado do componente
2. Teste renderização básica
3. Teste interações do usuário
4. Teste casos extremos
5. Execute `npm run test:coverage` para verificar cobertura
