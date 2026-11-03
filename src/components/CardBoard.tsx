import { useFonts } from "expo-font";
import {
  type ComponentRef,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { type LayoutRectangle, StyleSheet, Text, View } from "react-native";
import {
  GestureDetector,
  useExclusiveGestures,
  usePanGesture,
  useTapGesture,
} from "react-native-gesture-handler";
import Animated, {
  LinearTransition,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  type DropAction,
  type DropArea,
  type Point,
  resolveDrop,
} from "../quiz/drop";
import type { Card } from "../quiz/reducer";
import { colors } from "./theme";

// 札の文字は KaTeX の書体で出す。英字1文字は斜体、ほかは立体（docs/specs/quiz.md）。
const fonts = {
  KaTeX_Main: require("katex/dist/fonts/KaTeX_Main-Regular.ttf"),
  KaTeX_Math: require("katex/dist/fonts/KaTeX_Math-Italic.ttf"),
};

export function cardFontFamily(text: string): string {
  return /^[A-Za-z]$/.test(text) ? "KaTeX_Math" : "KaTeX_Main";
}

type Props = {
  // 札置き場の札（混ぜたときの順）
  pool: Card[];
  // 回答エリアの札（並んだ順）
  placed: Card[];
  // 札置き場を出し、札を運べるか。false なら札置き場を出さず、回答エリアの札も運べない。
  movable: boolean;
  // 回答エリアの札を緑で出すか（正解のとき）。それ以外は藍で出す。
  placedGreen: boolean;
  // 回答エリアの読み上げ用の名前と、札置き場の読み上げ用の名前
  answerLabel: string;
  poolLabel: string;
  // 回答エリアと札置き場のあいだに出すもの（「不正解」など）
  between?: ReactNode;
  // 札置き場の札を回答エリアの at 番目へ運ぶ。at がなければ末尾。
  onPlace: (id: number, at?: number) => void;
  // 回答エリアの札を札置き場へ戻す。
  onUnplace: (id: number) => void;
  // 回答エリアの中で札を to 番目へ移す。to は、その札を抜いたあとの並びでの位置。
  onMove: (id: number, to: number) => void;
};

const emptyRect: LayoutRectangle = { x: 0, y: 0, width: 0, height: 0 };

// 札を動かしている間の状態。action は、いま指を離したときの運び先。
type Drag = {
  id: number;
  from: DropArea;
  // 持ち上げた札の、元の場所での位置と大きさ
  frame: LayoutRectangle;
  action: DropAction | null;
};

// 空きの枠を出す位置。回答エリアで、持ち上げた札を除いた並びの何番目か。
function slotOf(action: DropAction | null): number | null {
  if (action?.type === "place") return action.at;
  if (action?.type === "move") return action.to;
  return null;
}

function sameAction(a: DropAction | null, b: DropAction | null): boolean {
  return a?.type === b?.type && slotOf(a) === slotOf(b);
}

// 札置き場と回答エリア。札を動かし、落とした位置へ運ぶ。
// 動かしている間は、落ちる位置に空きの枠を出し、ほかの札はその位置を空けて動く。
// 運び先は、動かし始めたときの札の位置を元に決める（src/quiz/drop.ts）。
export function CardBoard({
  pool,
  placed,
  movable,
  placedGreen,
  answerLabel,
  poolLabel,
  between,
  onPlace,
  onUnplace,
  onMove,
}: Props) {
  const [fontsLoaded] = useFonts(fonts);
  const [drag, setDrag] = useState<Drag | null>(null);
  const areaRects = useRef<Record<DropArea, LayoutRectangle>>({
    pool: emptyRect,
    answer: emptyRect,
  });
  const cardRects = useRef(new Map<number, LayoutRectangle>());
  const boardRef = useRef<ComponentRef<typeof View>>(null);
  // 動かし始めたときの盤面の位置（画面全体の座標）と、札の位置
  const boardOrigin = useRef<Point | null>(null);
  const frozen = useRef<Omit<
    Parameters<typeof resolveDrop>[0],
    "id" | "from" | "point"
  > | null>(null);
  const current = useRef<Drag | null>(null);
  const dragDx = useSharedValue(0);
  const dragDy = useSharedValue(0);

  function actionAt(windowPoint: Point): DropAction | null {
    const origin = boardOrigin.current;
    const base = frozen.current;
    const dragging = current.current;
    if (!origin || !base || !dragging) {
      return null;
    }
    return resolveDrop({
      ...base,
      id: dragging.id,
      from: dragging.from,
      point: { x: windowPoint.x - origin.x, y: windowPoint.y - origin.y },
    });
  }

  function startDrag(card: Card, from: DropArea) {
    const answer = areaRects.current.answer;
    boardOrigin.current = null;
    boardRef.current?.measureInWindow((x, y) => {
      boardOrigin.current = { x, y };
    });
    frozen.current = {
      answerRect: answer,
      poolRect: areaRects.current.pool,
      placed: placed.flatMap((item) => {
        const rect = cardRects.current.get(item.id);
        return rect
          ? [
              {
                id: item.id,
                rect: { ...rect, x: answer.x + rect.x, y: answer.y + rect.y },
              },
            ]
          : [];
      }),
    };
    const next: Drag = {
      id: card.id,
      from,
      frame: cardRects.current.get(card.id) ?? emptyRect,
      action: null,
    };
    current.current = next;
    setDrag(next);
  }

  function moveDrag(windowPoint: Point) {
    const dragging = current.current;
    if (!dragging) return;
    const action = actionAt(windowPoint);
    if (sameAction(dragging.action, action)) {
      dragging.action = action;
      return;
    }
    const next = { ...dragging, action };
    current.current = next;
    setDrag(next);
  }

  // 指を離したとき。
  function endDrag(windowPoint: Point) {
    const action = actionAt(windowPoint);
    current.current = null;
    setDrag(null);
    if (action?.type === "place") {
      onPlace(action.id, action.at);
    } else if (action?.type === "move") {
      onMove(action.id, action.to);
    } else if (action?.type === "unplace") {
      onUnplace(action.id);
    }
  }

  function cancelDrag() {
    current.current = null;
    setDrag(null);
  }

  if (!fontsLoaded) {
    return null;
  }

  function renderCard(card: Card, area: DropArea) {
    const tone = area === "pool" ? "pool" : placedGreen ? "green" : "indigo";
    if (!movable) {
      return (
        <CardFace
          key={card.id}
          card={card}
          tone={tone}
          onLayout={(rect) => cardRects.current.set(card.id, rect)}
        />
      );
    }
    return (
      <DraggableCard
        key={card.id}
        card={card}
        tone={tone}
        testID={area === "answer" ? "answer-card" : "pool-card"}
        frame={drag?.id === card.id ? drag.frame : null}
        dx={dragDx}
        dy={dragDy}
        onLayout={(rect) => cardRects.current.set(card.id, rect)}
        onTap={() => (area === "pool" ? onPlace(card.id) : onUnplace(card.id))}
        onDragStart={() => startDrag(card, area)}
        onDragMove={moveDrag}
        onDrop={endDrag}
        onCancel={cancelDrag}
      />
    );
  }

  // 札の並びは、動かしている間も変えない。並びを変えると、持ち上げた札の View が付け替えられ、
  // ドラッグが途切れる。落ちる位置の空きは、各札の前に置いた枠の幅を広げて作る。
  const slot = slotOf(drag?.action ?? null);
  const lifted = [...placed, ...pool].find((card) => card.id === drag?.id);
  let slotIndex = 0;

  return (
    <View ref={boardRef} collapsable={false}>
      <View
        accessibilityLabel={answerLabel}
        onLayout={(event) => {
          areaRects.current.answer = event.nativeEvent.layout;
        }}
        style={[styles.answer]}
      >
        {placed.flatMap((card) => {
          if (card.id === drag?.id) {
            return [renderCard(card, "answer")];
          }
          const index = slotIndex++;
          return [
            <Slot
              key={`slot-${index}`}
              size={slot === index ? drag?.frame : null}
            />,
            renderCard(card, "answer"),
          ];
        })}
        <Slot
          key={`slot-${slotIndex}`}
          size={slot === slotIndex ? drag?.frame : null}
        />
      </View>
      {between}
      {movable ? (
        <View
          accessibilityLabel={poolLabel}
          onLayout={(event) => {
            areaRects.current.pool = event.nativeEvent.layout;
          }}
          style={[styles.pool]}
        >
          {pool.map((card) => renderCard(card, "pool"))}
        </View>
      ) : null}
      {drag && lifted ? (
        <Ghost
          card={lifted}
          tone={
            drag.from === "pool" ? "pool" : placedGreen ? "green" : "indigo"
          }
          rect={{
            ...drag.frame,
            x: areaRects.current[drag.from].x + drag.frame.x,
            y: areaRects.current[drag.from].y + drag.frame.y,
          }}
          dx={dragDx}
          dy={dragDy}
        />
      ) : null}
    </View>
  );
}

// 札が落ちる位置を示す空きの枠。size が null のときは、幅を 0 にして場所を取らない。
function Slot({ size }: { size: LayoutRectangle | null | undefined }) {
  const shown = useSharedValue(0);
  const visible = size ? 1 : 0;
  useEffect(() => {
    shown.value = withTiming(visible, { duration: 120 });
  }, [visible, shown]);
  const style = useAnimatedStyle(() => ({ opacity: 0.45 * shown.value }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.slot,
        size ? { width: size.width, height: size.height } : styles.slotHidden,
        style,
      ]}
    />
  );
}

type Tone = "pool" | "indigo" | "green";

type FaceProps = {
  card: Card;
  tone: Tone;
  onLayout: (rect: LayoutRectangle) => void;
};

// 札の見た目だけ。札を運べないときに使う。
function CardFace({ card, tone, onLayout }: FaceProps) {
  return (
    <View
      accessible
      accessibilityLabel={card.text}
      onLayout={(event) => onLayout(event.nativeEvent.layout)}
      style={[styles.card, toneStyles[tone]]}
    >
      <CardText card={card} tone={tone} />
    </View>
  );
}

function CardText({ card, tone }: { card: Card; tone: Tone }) {
  return (
    <Text
      style={[
        styles.cardText,
        { fontFamily: cardFontFamily(card.text) },
        tone === "pool" ? styles.poolText : styles.placedText,
      ]}
    >
      {card.text}
    </Text>
  );
}

type CardProps = FaceProps & {
  // 操作テストが札を探すための識別子
  testID: string;
  // 持ち上げているときの、元の場所での位置と大きさ。持ち上げていなければ null。
  frame: LayoutRectangle | null;
  // 指の動き。持ち上げた札の見た目（Ghost）が、この値に合わせて動く。
  dx: SharedValue<number>;
  dy: SharedValue<number>;
  onTap: () => void;
  onDragStart: () => void;
  // 指の位置（画面全体の座標）を渡す。
  onDragMove: (windowPoint: Point) => void;
  // 指を離した位置（画面全体の座標）を渡す。
  onDrop: (windowPoint: Point) => void;
  onCancel: () => void;
};

// 札1枚。持ち上げると、元の場所では場所を取らず、見えなくなる。
// 指に付いて動く見た目は Ghost が出す。ドラッグ中に zIndex を変えたり、札の View を並べ替えたりすると、
// ジェスチャーが途切れるので、この札の View は動かさない。
function DraggableCard({
  card,
  tone,
  testID,
  frame,
  dx,
  dy,
  onLayout,
  onTap,
  onDragStart,
  onDragMove,
  onDrop,
  onCancel,
}: CardProps) {
  const pan = usePanGesture({
    // 少し動かしたらドラッグを始める。動かさずに離した操作はタップにする。
    minDistance: 6,
    onActivate: () => {
      dx.value = 0;
      dy.value = 0;
      runOnJS(onDragStart)();
    },
    onUpdate: (event) => {
      dx.value = event.translationX;
      dy.value = event.translationY;
      runOnJS(onDragMove)({ x: event.absoluteX, y: event.absoluteY });
    },
    onDeactivate: (event) => {
      if (event.canceled) {
        runOnJS(onCancel)();
      } else {
        runOnJS(onDrop)({ x: event.absoluteX, y: event.absoluteY });
      }
    },
  });
  // 動かさずに離したときは、タップとして運ぶ。
  const tap = useTapGesture({
    onDeactivate: (event) => {
      if (!event.canceled) {
        runOnJS(onTap)();
      }
    },
  });
  const gesture = useExclusiveGestures(pan, tap);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessible
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={card.text}
        onAccessibilityTap={onTap}
        onLayout={(event) => onLayout(event.nativeEvent.layout)}
        layout={LinearTransition.duration(180)}
        style={[
          styles.card,
          toneStyles[tone],
          frame && {
            position: "absolute",
            left: frame.x,
            top: frame.y,
            width: frame.width,
            height: frame.height,
            opacity: 0,
          },
        ]}
      >
        <CardText card={card} tone={tone} />
      </Animated.View>
    </GestureDetector>
  );
}

// 指に付いて動く、持ち上げた札の見た目。盤面の最後に置き、いちばん手前に出す。
function Ghost({
  card,
  tone,
  rect,
  dx,
  dy,
}: {
  card: Card;
  tone: Tone;
  // 盤面の中での、持ち上げた札の元の位置と大きさ
  rect: LayoutRectangle;
  dx: SharedValue<number>;
  dy: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: dx.value },
      { translateY: dy.value },
      { scale: 1.08 },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.card,
        toneStyles[tone],
        styles.ghost,
        {
          position: "absolute",
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: rect.height,
        },
        style,
      ]}
    >
      <CardText card={card} tone={tone} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  answer: {
    minHeight: 116,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
    padding: 12,
    paddingRight: 4,
    paddingBottom: 4,
    borderRadius: 22,
    backgroundColor: colors.answerArea,
  },
  pool: {
    minHeight: 60,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
    marginTop: 16,
    paddingLeft: 2,
  },
  ghost: {
    margin: 0,
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  slot: {
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.indigo,
  },
  slotHidden: {
    width: 0,
    height: 0,
    marginRight: 0,
    marginBottom: 0,
    borderWidth: 0,
  },
  card: {
    marginRight: 8,
    marginBottom: 8,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
  },
  cardText: { fontSize: 18 },
  poolText: { color: colors.text },
  placedText: { color: "#ffffff" },
});

const toneStyles = StyleSheet.create({
  pool: {
    backgroundColor: colors.surface,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
  },
  indigo: { backgroundColor: colors.indigo },
  green: { backgroundColor: colors.green },
});
