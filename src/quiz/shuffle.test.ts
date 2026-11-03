import { describe, expect, it } from "vitest";
import { shuffle } from "./shuffle";

// 決まった値を順に返す乱数
function sequence(...values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("shuffle", () => {
  it("渡した乱数で結果が決まる", () => {
    const items = ["a", "b", "c", "d"];
    expect(shuffle(items, sequence(0, 0, 0))).toEqual(["b", "c", "d", "a"]);
    expect(shuffle(items, sequence(0.99, 0.99, 0.99))).toEqual(items);
    expect(shuffle(items, sequence(0.5, 0.2))).toEqual(
      shuffle(items, sequence(0.5, 0.2)),
    );
  });

  it("札をなくしたり増やしたりせず、渡した配列を変えない", () => {
    const items = ["x", "to", "the", "the", "fifth"];
    const copy = [...items];
    const result = shuffle(items, Math.random);
    expect([...result].sort()).toEqual([...items].sort());
    expect(items).toEqual(copy);
  });
});
