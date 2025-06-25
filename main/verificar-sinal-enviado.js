const sinais = Array.from(uniqueMatchesMap.values());

// 🔒 Caminho para armazenar os sinais já enviados
const enviadosPath = "./sinais_enviados.json";

// 🔄 Carrega os sinais enviados anteriormente
let sinaisEnviados = [];
if (fs.existsSync(enviadosPath)) {
  const dados = fs.readFileSync(enviadosPath, "utf-8");
  sinaisEnviados = JSON.parse(dados);
}

// 🔑 Gera chave única para cada sinal
const gerarChaveUnica = (sinal) =>
  `${sinal.times}-${sinal.hMin}-${sinal.league}`;

// 🧠 Set com as chaves já enviadas
const chavesEnviadas = new Set(sinaisEnviados.map(gerarChaveUnica));

// 🆕 Filtra somente os sinais novos que ainda não foram enviados
const novosSinais = sinais.filter(
  (sinal) => !chavesEnviadas.has(gerarChaveUnica(sinal))
);

// 💾 Atualiza os arquivos
if (novosSinais.length > 0) {
  console.log("🎯 Novos sinais únicos encontrados:", novosSinais);

  // Salva sinais atuais no sinais.json
  fs.writeFileSync("./sinais.json", JSON.stringify(novosSinais, null, 2));

  // Atualiza lista de todos já enviados
  const atualizados = [...sinaisEnviados, ...novosSinais];
  fs.writeFileSync(enviadosPath, JSON.stringify(atualizados, null, 2));

  console.log("💾 Arquivo sinais_enviados.json atualizado.");
} else {
  console.log("✅ Nenhum novo sinal para enviar.");
}
