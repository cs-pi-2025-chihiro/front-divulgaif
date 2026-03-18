const { securityManifest } = require("../src/testes/security/security-manifest");

function inferExpectedCategory(test) {
  const text = `${test.name} ${test.subcategory}`.toLowerCase();

  if (
    text.includes("xss") ||
    text.includes("html injection") ||
    text.includes("stored xss") ||
    text.includes("injection")
  ) {
    return "OWASP A03:2021 - Injection";
  }

  if (
    text.includes("navigation") ||
    text.includes("parameter tampering") ||
    text.includes("access control")
  ) {
    return "OWASP A01:2021 - Broken Access Control";
  }

  if (
    text.includes("robustness") ||
    text.includes("null handling") ||
    text.includes("ui robustness")
  ) {
    return "OWASP A04:2021 - Insecure Design";
  }

  return null;
}

function generateSummary() {
  console.log("\n=== RESUMO DE TESTES DE SEGURANÇA (OWASP) ===\n");

  const fileStats = {};
  const categoryStats = {};

  securityManifest.forEach((test) => {
    fileStats[test.targetFile] = (fileStats[test.targetFile] || 0) + 1;
    categoryStats[test.category] = (categoryStats[test.category] || 0) + 1;
  });

  console.log("Arquivos com mais testes:");
  Object.entries(fileStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([file, count]) => {
      console.log(`- ${file} -> ${count} teste(s)`);
    });

  console.log("\nCobertura por categoria OWASP:");
  Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`- ${category} -> ${count} teste(s)`);
  });

  console.log("\nValidação de classificação:");
  securityManifest.forEach((test) => {
    const expected = inferExpectedCategory(test);

    if (!expected) {
      console.log(`- [${test.id}] sem regra de validação automática`);
      return;
    }

    if (expected === test.category) {
      console.log(`- [${test.id}] OK -> ${test.category}`);
    } else {
      console.log(
        `- [${test.id}] ALERTA -> classificado como "${test.category}", mas parece "${expected}"`
      );
    }
  });

  console.log("\nLista completa de testes:");
  securityManifest.forEach((test) => {
    console.log(
      `- [${test.id}] ${test.name} | ${test.category} | ${test.targetFile}`
    );
  });
}

generateSummary();