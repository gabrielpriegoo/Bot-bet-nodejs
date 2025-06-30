async function StrategyColumnsUsecase(results) {
  const linha0 = results[0];
  const linha4 = results[4];

  if (!linha0 || !linha4) {
    console.log("❌ Linhas necessárias não existem.");
    process.exit(1);
  }

  // 1. Jogos com >= 5 gols na linha 4
  const resultInGames = linha4.data.filter((item) => {
    const [score1, score2] = item.placar.split("-").map(Number);
    const totalGoals = score1 + score2;
    return totalGoals >= 5;
  });

  // 2. Jogos futuros na linha 0
  const jogosFuturos = linha0.data.filter((item) => {
    return item.status === "" && item.placar === "";
  });

  // 3. Verifica matches baseados no hMin
  let matches = jogosFuturos.filter((futuro) =>
    resultInGames.some((passado) => passado.hMin === futuro.hMin)
  );

  // 4. Remove duplicatas por chave única
  const uniqueMatchesMap = new Map();

  matches.forEach((jogo) => {
    const chaveUnica = `${jogo.times}-${jogo.hMin}-${jogo.league}`;
    if (!uniqueMatchesMap.has(chaveUnica)) {
      uniqueMatchesMap.set(chaveUnica, jogo);
    }
  });

  const sinais = Array.from(uniqueMatchesMap.values());

  return sinais;
}

module.exports = {
  StrategyColumnsUsecase,
};
