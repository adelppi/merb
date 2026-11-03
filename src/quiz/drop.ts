// 札をドラッグして落としたときの運び先を決める。座標は、札を並べる盤面（回答エリアと札置き場を含む View）の中のものを使う。
// docs/specs/quiz.md の「札を運ぶ」の節に当たる。

export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; width: number; height: number };

export type DropArea = "pool" | "answer";

export type DropAction =
  // 札置き場の札を回答エリアの at 番目へ入れる
  | { type: "place"; id: number; at: number }
  // 回答エリアの中で札を to 番目へ移す（to は、その札を抜いたあとの並びでの位置）
  | { type: "move"; id: number; to: number }
  // 回答エリアの札を札置き場へ戻す
  | { type: "unplace"; id: number };

export function contains(rect: Rect, point: Point): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

type Input = {
  // ドラッグした札の id と、その札がいた場所
  id: number;
  from: DropArea;
  // 指を離した位置
  point: Point;
  answerRect: Rect;
  poolRect: Rect;
  // 回答エリアにいまある札の id と位置（並んだ順。ドラッグした札を含んでよい）
  placed: { id: number; rect: Rect }[];
};

// 落とした位置から、札をどう運ぶかを返す。何も変えないときは null を返す。
// 回答エリアの札の上に落とすとその札の前へ、札のないところに落とすと末尾へ入れる。
// 札置き場の中では並べ替えず、札置き場の札を札置き場に落としても何も変えない。
export function resolveDrop({
  id,
  from,
  point,
  answerRect,
  poolRect,
  placed,
}: Input): DropAction | null {
  if (contains(answerRect, point)) {
    const others = placed.filter((card) => card.id !== id);
    const target = others.findIndex((card) => contains(card.rect, point));
    const at = target < 0 ? others.length : target;
    return from === "pool"
      ? { type: "place", id, at }
      : { type: "move", id, to: at };
  }
  if (from === "answer" && contains(poolRect, point)) {
    return { type: "unplace", id };
  }
  return null;
}
