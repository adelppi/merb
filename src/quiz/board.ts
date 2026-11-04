// 札を並べる盤面の計算。札の位置と並びは、ここの関数で求める。
// これらの関数は、UI スレッドの worklet からも呼ぶので、'worklet' を付けてあり、副作用を持たない。
// docs/specs/quiz.md の「札を運ぶ」の節に当たる。しくみは D-0023 を参照。

export const CARD_HEIGHT = 44;
export const CARD_GAP = 8;
export const ROW_HEIGHT = CARD_HEIGHT + CARD_GAP;

export type Pos = { x: number; y: number };

// 札ごとの「回答エリアの何番目か」。札置き場にある札は -1。
export type Orders = number[];

// 回答エリアに並んでいる札の番号（札の配列の添字）を、並んだ順に返す。
export function placedList(orders: Orders): number[] {
  "worklet";
  const list: number[] = [];
  for (let i = 0; i < orders.length; i++) {
    if (orders[i] >= 0) {
      list.push(i);
    }
  }
  return list.sort((a, b) => orders[a] - orders[b]);
}

// 回答エリアに並んだ札の番号の並びから、札ごとの並びの番号を作る。並んでいない札は -1 にする。
export function ordersFromList(count: number, list: number[]): Orders {
  "worklet";
  const orders: Orders = [];
  for (let i = 0; i < count; i++) {
    orders.push(-1);
  }
  for (let position = 0; position < list.length; position++) {
    orders[list[position]] = position;
  }
  return orders;
}

// 回答エリアに並んだ札の位置（回答エリアの余白の内側での、札の左上）を求める。
// 左から右へ並べ、札が収まらなくなったら次の行へ折り返す。並んでいない札の位置は {0, 0}。
export function layoutAnswer(
  orders: Orders,
  widths: number[],
  contentWidth: number,
): Pos[] {
  "worklet";
  const positions: Pos[] = orders.map(() => ({ x: 0, y: 0 }));
  let x = 0;
  let row = 0;
  for (const index of placedList(orders)) {
    const width = widths[index] ?? 0;
    if (x > 0 && x + width > contentWidth) {
      row += 1;
      x = 0;
    }
    positions[index] = { x, y: row * ROW_HEIGHT };
    x += width + CARD_GAP;
  }
  return positions;
}

// 札を並べたときの行の数。
export function countRows(
  order: number[],
  widths: number[],
  contentWidth: number,
): number {
  "worklet";
  const orders = ordersFromList(widths.length, order);
  const positions = layoutAnswer(orders, widths, contentWidth);
  let rows = 0;
  for (const index of order) {
    rows = Math.max(rows, positions[index].y / ROW_HEIGHT + 1);
  }
  return rows;
}

// 指より前にある札の数。入る位置の番号になる。
// y 座標が指に最も近い行を指のある行とし、それより上の行の札と、その行で中心が指より左にある札を、前にある札とみなす。
// rects は、指を除いた回答エリアの札の位置と幅。finger は回答エリアの余白の内側での指の位置。
// ownY は、ドラッグしている札がいる行の y 座標。回答エリアの外から運んできた札にはない。
export function slotIndex(
  rects: { x: number; y: number; width: number }[],
  finger: Pos,
  ownY?: number,
): number {
  "worklet";
  let row = ownY;
  for (const rect of rects) {
    if (
      row === undefined ||
      Math.abs(rect.y + CARD_HEIGHT / 2 - finger.y) <
        Math.abs(row + CARD_HEIGHT / 2 - finger.y)
    ) {
      row = rect.y;
    }
  }
  let count = 0;
  for (const rect of rects) {
    if (
      rect.y < (row as number) ||
      (rect.y === row && rect.x + rect.width / 2 < finger.x)
    ) {
      count += 1;
    }
  }
  return count;
}

// 札を指で動かしているときの、札ごとの並びの番号。
// overAnswer が true なら、指の位置に合わせて入る位置を決める。false なら札置き場へ戻す。
// 並びが変わらないときは、同じ配列を返す。
export function dragOrders(
  orders: Orders,
  widths: number[],
  contentWidth: number,
  dragged: number,
  finger: Pos,
  overAnswer: boolean,
): Orders {
  "worklet";
  const others = placedList(orders).filter((index) => index !== dragged);
  if (!overAnswer) {
    return orders[dragged] === -1
      ? orders
      : ordersFromList(orders.length, others);
  }
  const positions = layoutAnswer(orders, widths, contentWidth);
  const at = slotIndex(
    others.map((index) => ({
      x: positions[index].x,
      y: positions[index].y,
      width: widths[index] ?? 0,
    })),
    finger,
    orders[dragged] === -1 ? undefined : positions[dragged].y,
  );
  if (orders[dragged] === at) {
    return orders;
  }
  const next = others.slice();
  next.splice(at, 0, dragged);
  return ordersFromList(orders.length, next);
}

// タップしたときの、札ごとの並びの番号。札置き場の札は回答エリアの末尾へ、回答エリアの札は札置き場へ運ぶ。
export function toggleOrders(orders: Orders, index: number): Orders {
  "worklet";
  const list = placedList(orders).filter((i) => i !== index);
  if (orders[index] === -1) {
    list.push(index);
  }
  return ordersFromList(orders.length, list);
}

// 運んだあとに reducer へ知らせる動き。
// place: 札置き場から回答エリアの at 番目へ、unplace: 回答エリアから札置き場へ、move: 回答エリアの中で at 番目へ。
export type Move =
  | { type: "place"; at: number }
  | { type: "unplace" }
  | { type: "move"; at: number };

// 札 index が、並び before から after へ運ばれたときの動き。運ばれていなければ null。
export function moveOf(
  before: Orders,
  after: Orders,
  index: number,
): Move | null {
  "worklet";
  if (before[index] === -1 && after[index] >= 0) {
    return { type: "place", at: after[index] };
  }
  if (before[index] >= 0 && after[index] === -1) {
    return { type: "unplace" };
  }
  if (before[index] >= 0 && before[index] !== after[index]) {
    return { type: "move", at: after[index] };
  }
  return null;
}

// 回答エリアに札をすべて並べたときの、行の数の見積もり。
// 並べ方によって行の数が変わるので、札置き場の順、幅の広い順、幅の狭い順のうち、いちばん多いものを使う。
export function maxRows(widths: number[], contentWidth: number): number {
  "worklet";
  const byIndex = widths.map((_, index) => index);
  const wide = byIndex.slice().sort((a, b) => widths[b] - widths[a]);
  const narrow = byIndex.slice().sort((a, b) => widths[a] - widths[b]);
  return Math.max(
    countRows(byIndex, widths, contentWidth),
    countRows(wide, widths, contentWidth),
    countRows(narrow, widths, contentWidth),
  );
}
