const securityManifest = [
  {
    id: "SEC-001",
    name: "XSS refletido no campo de busca",
    category: "OWASP A03:2021 - Injection",
    subcategory: "XSS",
    targetFile: "src/app/(authenticated)/student/my-works/page.jsx",
    type: "input-validation"
  },
  {
    id: "SEC-002",
    name: "HTML Injection no campo de busca",
    category: "OWASP A03:2021 - Injection",
    subcategory: "HTML Injection",
    targetFile: "src/app/(authenticated)/student/my-works/page.jsx",
    type: "input-validation"
  },
  {
    id: "SEC-003",
    name: "Conteúdo malicioso vindo da API renderizado com segurança",
    category: "OWASP A03:2021 - Injection",
    subcategory: "Stored XSS / HTML Injection",
    targetFile: "src/app/(authenticated)/student/my-works/page.jsx",
    type: "render-validation"
  },
  {
    id: "SEC-004",
    name: "Aplicação segura de filtros maliciosos",
    category: "OWASP A01:2021 - Broken Access Control",
    subcategory: "Parameter Tampering",
    targetFile: "src/app/(authenticated)/student/my-works/page.jsx",
    type: "logic-test"
  },
  {
    id: "SEC-005",
    name: "Fechamento seguro do modal ao clicar fora",
    category: "OWASP A04:2021 - Insecure Design",
    subcategory: "UI Robustness",
    targetFile: "src/app/(authenticated)/student/my-works/page.jsx",
    type: "ui-security"
  },
  {
    id: "SEC-006",
    name: "Navegação segura para rota interna em português",
    category: "OWASP A01:2021 - Broken Access Control",
    subcategory: "Insecure Navigation",
    targetFile: "src/app/(authenticated)/student/my-works/page.jsx",
    type: "navigation-security"
  },
  {
    id: "SEC-007",
    name: "Navegação segura para rota interna em inglês",
    category: "OWASP A01:2021 - Broken Access Control",
    subcategory: "Insecure Navigation",
    targetFile: "src/app/(authenticated)/student/my-works/page.jsx",
    type: "navigation-security"
  },
  {
    id: "SEC-008",
    name: "Resiliência a dados nulos ou indefinidos vindos do hook",
    category: "OWASP A04:2021 - Insecure Design",
    subcategory: "Robustness / Null Handling",
    targetFile: "src/app/(authenticated)/student/my-works/page.jsx",
    type: "robustness-test"
  }
];

module.exports = { securityManifest };