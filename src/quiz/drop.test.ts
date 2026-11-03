import { describe, expect, it } from "vitest";
import { type Rect, resolveDrop } from "./drop";

const answerRect: Rect = { x: 0, y: 0, width: 300, height: 100 };
const poolRect: Rect = { x: 0, y: 150, width: 300, height: 100 };
// 回答エリアに札が id 7、8、9 の順に並んでいる
const placed = [
  { id: 7, rect: { x: 10, y: 10, width: 60, height: 44 } },
  { id: 8, rect: { x: 80, y: 10, width: 60, height: 44 } },
  { id: 9, rect: { x: 150, y: 10, width: 60, height: 44 } },
];

const base = { answerRect, poolRect, placed };

describe("resolveDrop", () => {
  it("札置き場の札を回答エリアの札の左半分に落とすと、その札の前に入れる", () => {
    // 8 は x が 80 から 140 まで。中心は 110
    expect(
      resolveDrop({ ...base, id: 1, from: "pool", point: { x: 100, y: 30 } }),
    ).toEqual({ type: "place", id: 1, at: 1 });
  });

  it("札置き場の札を回答エリアの札の右半分に落とすと、その札の後ろに入れる", () => {
    expect(
      resolveDrop({ ...base, id: 1, from: "pool", point: { x: 120, y: 30 } }),
    ).toEqual({ type: "place", id: 1, at: 2 });
  });

  it("札置き場の札を回答エリアの札のないところに落とすと、末尾に入れる", () => {
    expect(
      resolveDrop({ ...base, id: 1, from: "pool", point: { x: 280, y: 80 } }),
    ).toEqual({ type: "place", id: 1, at: 3 });
  });

  it("同じ行の、札の隙間に落とすと、その隙間に入れる", () => {
    expect(
      resolveDrop({ ...base, id: 1, from: "pool", point: { x: 75, y: 30 } }),
    ).toEqual({ type: "place", id: 1, at: 1 });
  });

  it("下の行に札があるときは、上の行の右の空きに落とすと、その行の末尾に入れる", () => {
    const wrapped = [
      { id: 7, rect: { x: 10, y: 10, width: 60, height: 44 } },
      { id: 8, rect: { x: 80, y: 10, width: 60, height: 44 } },
      { id: 9, rect: { x: 10, y: 62, width: 60, height: 44 } },
    ];
    expect(
      resolveDrop({
        ...base,
        placed: wrapped,
        id: 1,
        from: "pool",
        point: { x: 250, y: 30 },
      }),
    ).toEqual({ type: "place", id: 1, at: 2 });
  });

  it("回答エリアの札を前の札の左半分に落とすと、その札の位置へ移す", () => {
    expect(
      resolveDrop({ ...base, id: 9, from: "answer", point: { x: 20, y: 30 } }),
    ).toEqual({ type: "move", id: 9, to: 0 });
  });

  it("回答エリアの札を後ろの札の左半分に落とすと、抜いたあとの並びでの位置へ移す", () => {
    // 7 を抜くと並びは 8、9。9 の左半分に落とすと 9 の前、つまり 1 番目へ移る
    expect(
      resolveDrop({ ...base, id: 7, from: "answer", point: { x: 160, y: 30 } }),
    ).toEqual({ type: "move", id: 7, to: 1 });
  });

  it("回答エリアの札を回答エリアの札のないところに落とすと、末尾へ移す", () => {
    expect(
      resolveDrop({ ...base, id: 7, from: "answer", point: { x: 280, y: 80 } }),
    ).toEqual({ type: "move", id: 7, to: 2 });
  });

  it("回答エリアの札を札置き場に落とすと、札置き場へ戻す", () => {
    expect(
      resolveDrop({ ...base, id: 8, from: "answer", point: { x: 50, y: 200 } }),
    ).toEqual({ type: "unplace", id: 8 });
  });

  it("札置き場の札を札置き場に落としても、何も変えない", () => {
    expect(
      resolveDrop({ ...base, id: 1, from: "pool", point: { x: 50, y: 200 } }),
    ).toBeNull();
  });

  it("回答エリアと札置き場のどちらの外に落としても、何も変えない", () => {
    expect(
      resolveDrop({ ...base, id: 1, from: "pool", point: { x: 50, y: 400 } }),
    ).toBeNull();
    expect(
      resolveDrop({ ...base, id: 8, from: "answer", point: { x: 50, y: 400 } }),
    ).toBeNull();
  });

  it("回答エリアが空なら、先頭に入れる", () => {
    expect(
      resolveDrop({
        ...base,
        placed: [],
        id: 1,
        from: "pool",
        point: { x: 50, y: 50 },
      }),
    ).toEqual({ type: "place", id: 1, at: 0 });
  });
});
