import { describe, expect, it } from "vitest";
import {
  dragOrders,
  layoutAnswer,
  maxRows,
  moveOf,
  ordersFromList,
  placedList,
  slotIndex,
  toggleOrders,
} from "./board";

// 幅 60 の札が 4 枚。回答エリアの内側の幅は 200（1 行に 3 枚入る）
const widths = [60, 60, 60, 60];
const contentWidth = 200;

describe("placedList / ordersFromList", () => {
  it("回答エリアの札を、並んだ順の番号で返す", () => {
    expect(placedList([-1, 1, -1, 0])).toEqual([3, 1]);
  });

  it("番号の並びから、札ごとの並びの番号を作る", () => {
    expect(ordersFromList(4, [3, 1])).toEqual([-1, 1, -1, 0]);
  });
});

describe("layoutAnswer", () => {
  it("札を左から並べ、収まらなくなったら次の行へ折り返す", () => {
    const positions = layoutAnswer([0, 1, 2, 3], widths, contentWidth);
    expect(positions[0]).toEqual({ x: 0, y: 0 });
    expect(positions[1]).toEqual({ x: 68, y: 0 });
    expect(positions[2]).toEqual({ x: 136, y: 0 });
    expect(positions[3]).toEqual({ x: 0, y: 52 });
  });

  it("札置き場の札は並べない", () => {
    const positions = layoutAnswer([-1, 0, -1, -1], widths, contentWidth);
    expect(positions[1]).toEqual({ x: 0, y: 0 });
  });
});

describe("slotIndex", () => {
  const rects = [
    { x: 0, y: 0, width: 60 },
    { x: 68, y: 0, width: 60 },
  ];

  it("札の左半分に指があると、その札の前に入る", () => {
    expect(slotIndex(rects, { x: 80, y: 20 })).toBe(1);
  });

  it("札の右半分に指があると、その札の後ろに入る", () => {
    expect(slotIndex(rects, { x: 110, y: 20 })).toBe(2);
  });

  it("札の隙間に指があると、その隙間に入る", () => {
    expect(slotIndex(rects, { x: 64, y: 20 })).toBe(1);
  });

  it("上の行の右の空きに指があると、その行の末尾に入る", () => {
    const wrapped = [...rects, { x: 0, y: 52, width: 60 }];
    expect(slotIndex(wrapped, { x: 190, y: 20 })).toBe(2);
  });

  it("札の下に指があっても、x 座標で入る位置が決まる", () => {
    expect(slotIndex(rects, { x: 10, y: 90 })).toBe(0);
    expect(slotIndex(rects, { x: 80, y: 90 })).toBe(1);
    expect(slotIndex(rects, { x: 190, y: 90 })).toBe(2);
  });

  it("札の上に指があっても、x 座標で入る位置が決まる", () => {
    expect(slotIndex(rects, { x: 80, y: -10 })).toBe(1);
    expect(slotIndex(rects, { x: 190, y: -10 })).toBe(2);
  });

  it("行の間に指があると、近い行で決まる", () => {
    const wrapped = [
      ...rects,
      { x: 0, y: 104, width: 60 },
      { x: 68, y: 104, width: 60 },
    ];
    expect(slotIndex(wrapped, { x: 80, y: 40 })).toBe(1);
    expect(slotIndex(wrapped, { x: 80, y: 130 })).toBe(3);
  });

  it("ドラッグしている札だけの行に指があると、上の行の札をすべて数える", () => {
    expect(slotIndex(rects, { x: 10, y: 70 }, 52)).toBe(2);
  });

  it("札が1枚もないと、先頭に入る", () => {
    expect(slotIndex([], { x: 10, y: 10 })).toBe(0);
  });
});

describe("dragOrders", () => {
  const finger = { x: 10, y: 10 };

  it("札置き場の札を回答エリアの上へ動かすと、指の位置に入る", () => {
    // 札 1 が回答エリアにいる。札 0 を、札 1 の左半分へ
    const orders = [-1, 0, -1, -1];
    expect(dragOrders(orders, widths, contentWidth, 0, finger, true)).toEqual([
      0, 1, -1, -1,
    ]);
  });

  it("回答エリアの札を別の札の右へ動かすと、並びが変わる", () => {
    const orders = [0, 1, 2, -1];
    const next = dragOrders(
      orders,
      widths,
      contentWidth,
      0,
      { x: 170, y: 10 },
      true,
    );
    expect(placedList(next)).toEqual([1, 2, 0]);
  });

  it("入る位置が変わらないときは、同じ配列を返す", () => {
    const orders = [0, 1, -1, -1];
    expect(dragOrders(orders, widths, contentWidth, 0, finger, true)).toBe(
      orders,
    );
  });

  it("回答エリアの札を札置き場の側へ動かすと、札置き場へ戻る", () => {
    const orders = [0, 1, -1, -1];
    expect(dragOrders(orders, widths, contentWidth, 0, finger, false)).toEqual([
      -1, 0, -1, -1,
    ]);
  });

  it("札置き場の札を札置き場の側で動かしても、並びは変わらない", () => {
    const orders = [-1, 0, -1, -1];
    expect(dragOrders(orders, widths, contentWidth, 2, finger, false)).toBe(
      orders,
    );
  });
});

describe("dragOrders の行の決め方", () => {
  it("回答エリアの札の下で指を動かすと、x 座標で入る位置が変わる", () => {
    const orders = [0, 1, -1];
    const next = dragOrders(
      orders,
      [60, 60, 60],
      300,
      2,
      { x: 10, y: 90 },
      true,
    );
    expect(next).toEqual([1, 2, 0]);
  });

  it("札を押し出しても、指を動かさなければ並びが行き来しない", () => {
    const widths = [100, 100, 100, 100];
    const contentWidth = 320;
    const finger = { x: 60, y: 70 };
    const first = dragOrders(
      [0, 1, 2, -1],
      widths,
      contentWidth,
      3,
      finger,
      true,
    );
    const second = dragOrders(first, widths, contentWidth, 3, finger, true);
    const third = dragOrders(second, widths, contentWidth, 3, finger, true);
    expect(third).toEqual(second);
  });
});

describe("toggleOrders", () => {
  it("札置き場の札は、回答エリアの末尾へ運ぶ", () => {
    expect(toggleOrders([-1, 0, -1, -1], 2)).toEqual([-1, 0, 1, -1]);
  });

  it("回答エリアの札は、札置き場へ戻し、残りの番号を詰める", () => {
    expect(toggleOrders([0, 1, 2, -1], 1)).toEqual([0, -1, 1, -1]);
  });
});

describe("moveOf", () => {
  it("札置き場から回答エリアへ運ぶと place", () => {
    expect(moveOf([-1, 0], [1, 0], 0)).toEqual({ type: "place", at: 1 });
  });

  it("回答エリアから札置き場へ運ぶと unplace", () => {
    expect(moveOf([0, 1], [-1, 0], 0)).toEqual({ type: "unplace" });
  });

  it("回答エリアの中で運ぶと move", () => {
    expect(moveOf([0, 1], [1, 0], 0)).toEqual({ type: "move", at: 1 });
  });

  it("どこにも運んでいなければ null", () => {
    expect(moveOf([0, 1], [0, 1], 0)).toBeNull();
    expect(moveOf([-1, 0], [-1, 0], 0)).toBeNull();
  });
});

describe("maxRows", () => {
  it("札をすべて並べたときの行の数を見積もる", () => {
    expect(maxRows(widths, contentWidth)).toBe(2);
  });

  it("札が 1 枚なら 1 行", () => {
    expect(maxRows([60], contentWidth)).toBe(1);
  });
});
