// 0 以上 1 未満の数を返す関数。テストでは決まった値を返す関数を渡す。
export type Random = () => number;

// Fisher–Yates で混ぜた新しい配列を返す。渡した配列は変えない。
export function shuffle<T>(items: readonly T[], random: Random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
