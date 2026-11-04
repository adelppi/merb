import { useFonts } from "expo-font";
import {
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  GestureDetector,
  useExclusiveGestures,
  usePanGesture,
  useTapGesture,
} from "react-native-gesture-handler";
import Animated, {
  type AnimatedRef,
  measure,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN, scheduleOnUI } from "react-native-worklets";
import {
  AREA_PADDING,
  CARD_HEIGHT,
  dragOrders,
  fitBoard,
  layoutAnswer,
  moveOf,
  type Orders,
  type Pos,
  toggleOrders,
  warmUpBoard,
} from "../quiz/board";
import type { Card } from "../quiz/reducer";
import { colors } from "./theme";

// 札を並べる盤面。札の位置と並べ替えは、UI スレッドの共有値で決め、指の動きのたびに React を再描画しない。
// しくみは、jamsch/react-native-duo-drag-drop（MIT）と、その元になった William Candillon の動画の作りに基づく
// （docs/decisions/D-0023-drag-rework.md）。

// 札の文字は KaTeX の書体で出す。英字1文字は斜体、ほかは立体（docs/specs/quiz.md）。
const fonts = {
  KaTeX_Main: require("katex/dist/fonts/KaTeX_Main-Regular.ttf"),
  KaTeX_Math: require("katex/dist/fonts/KaTeX_Math-Italic.ttf"),
};

export function cardFontFamily(text: string): string {
  return /^[A-Za-z]$/.test(text) ? "KaTeX_Math" : "KaTeX_Main";
}

// 動かし始める距離
const DRAG_DISTANCE = 6;
// 札の角丸、左右の余白、文字の大きさ。札を縮めるときは、割合を掛ける。
const CARD_RADIUS = 12;
const CARD_PADDING = 16;
const CARD_FONT_SIZE = 18;
// 札が位置を変える時間と、札の色が変わる時間
const MOVE_DURATION = 160;
const COLOR_DURATION = 100;

type Props = {
  // 混ぜたあとの札。札置き場の元の位置は、この順で決まる。
  cards: Card[];
  // 回答エリアの札の id（並んだ順）。札を探すための識別子にだけ使う。
  placedIds: number[];
  // 札を運べるか。false なら札置き場を出さず、札も運べない。
  movable: boolean;
  // 回答エリアの札を緑で出すか（正解のとき）。それ以外は藍で出す。
  placedGreen: boolean;
  // 赤で出す回答エリアの札の id（不正解のとき、間違った札）
  wrongIds: number[];
  // 回答エリアの読み上げ用の名前と、札置き場の読み上げ用の名前
  answerLabel: string;
  poolLabel: string;
  // 回答エリアと札置き場のあいだに出すもの（「不正解」など）
  between?: ReactNode;
  // 札置き場の札を回答エリアの at 番目へ運んだ。
  onPlace: (id: number, at: number) => void;
  // 回答エリアの札を札置き場へ戻した。
  onUnplace: (id: number) => void;
  // 回答エリアの中で札を to 番目へ移した。to は、その札を抜いたあとの並びでの位置。
  onMove: (id: number, to: number) => void;
};

// 札の位置を決める共有値。どれも UI スレッドで読み書きする。
type Board = {
  // 札ごとの「回答エリアの何番目か」。札置き場にある札は -1。
  orders: SharedValue<Orders>;
  // 札ごとの幅と、札置き場の元の位置（札置き場の中での左上）
  widths: SharedValue<number[]>;
  bank: SharedValue<Pos[]>;
  // 回答エリアに並んだ札の位置（回答エリアの余白の内側での左上）
  layout: SharedValue<Pos[]>;
  // 回答エリアの余白の内側の幅
  contentWidth: SharedValue<number>;
  // 札を縮める割合
  scale: SharedValue<number>;
  // 札置き場の上端（盤面の中での位置）と、回答エリアの下端
  poolTop: SharedValue<number>;
  answerBottom: SharedValue<number>;
  // いま指で動かしている札の番号。なければ -1。
  active: SharedValue<number>;
  // 動かしている札の左上（盤面の中での位置）
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  // 動かし始めたときの、札の並びの番号と、盤面の位置（画面全体の座標）、札をつかんだ位置
  startOrder: SharedValue<number>;
  originX: SharedValue<number>;
  originY: SharedValue<number>;
  grabX: SharedValue<number>;
  grabY: SharedValue<number>;
  // 札の幅と元の位置を測り終えたか
  ready: SharedValue<boolean>;
};

function useBoard(count: number): Board {
  const orders = useSharedValue<Orders>(Array(count).fill(-1));
  const widths = useSharedValue<number[]>(Array(count).fill(0));
  const bank = useSharedValue<Pos[]>(
    Array.from({ length: count }, () => ({ x: 0, y: 0 })),
  );
  const contentWidth = useSharedValue(0);
  const scale = useSharedValue(1);
  const layout = useDerivedValue(() =>
    layoutAnswer(orders.value, widths.value, contentWidth.value, scale.value),
  );
  // 共有値は作り直されないので、最初の入れ物を使い続ける。札の部品の memo が効くようにするため。
  return useRef({
    orders,
    widths,
    bank,
    layout,
    contentWidth,
    scale,
    poolTop: useSharedValue(0),
    answerBottom: useSharedValue(0),
    active: useSharedValue(-1),
    dragX: useSharedValue(0),
    dragY: useSharedValue(0),
    startOrder: useSharedValue(-1),
    originX: useSharedValue(0),
    originY: useSharedValue(0),
    grabX: useSharedValue(0),
    grabY: useSharedValue(0),
    ready: useSharedValue(false),
  }).current;
}

export function CardBoard(props: Props) {
  const [fontsLoaded] = useFonts(fonts);
  if (!fontsLoaded) {
    return null;
  }
  // 次の問題へ進むときは、呼び出し側が key を変えて、共有値を作り直す。
  return <Loaded {...props} />;
}

function Loaded({
  cards,
  placedIds,
  movable,
  placedGreen,
  wrongIds,
  answerLabel,
  poolLabel,
  between,
  onPlace,
  onUnplace,
  onMove,
}: Props) {
  const board = useBoard(cards.length);
  const boardRef = useAnimatedRef<View>();
  // 縮める前の札の幅。見えない札で測る。
  const [natural, setNatural] = useState<number[] | null>(null);
  const measuring = useRef<number[]>([]);
  // 盤面に使える幅と高さ
  const [space, setSpace] = useState({ width: 0, height: 0 });
  const answerColor = placedGreen ? colors.green : colors.indigo;
  // 札の部品を再描画しないよう、commit は作り直さず、最新の値をここから読む。
  const latest = useRef({ cards, onPlace, onUnplace, onMove });
  latest.current = { cards, onPlace, onUnplace, onMove };

  const fit = useMemo(
    () =>
      natural === null || space.width === 0
        ? null
        : fitBoard(natural, space.width, space.height),
    [natural, space],
  );
  const scale = fit?.scale ?? 1;

  useEffect(() => {
    if (fit === null) {
      return;
    }
    board.scale.value = fit.scale;
    board.widths.value = fit.widths;
    board.bank.value = fit.bank;
    board.contentWidth.value = fit.contentWidth;
    board.answerBottom.value = fit.answerHeight;
    // 札が初めの位置へ飛んでくるように見えないよう、次の描画まで待ってから見せる。
    requestAnimationFrame(() => {
      board.ready.value = true;
    });
    scheduleOnUI(warmUpBoard, cards.length);
  }, [board, fit, cards.length]);

  const commit = useCallback(
    (type: "place" | "unplace" | "move", index: number, at: number) => {
      const { cards, onPlace, onUnplace, onMove } = latest.current;
      const id = cards[index]?.id;
      if (id === undefined) {
        return;
      }
      if (type === "place") {
        onPlace(id, at);
      } else if (type === "unplace") {
        onUnplace(id);
      } else {
        onMove(id, at);
      }
    },
    [],
  );

  return (
    <View
      style={styles.space}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setSpace({ width, height });
      }}
    >
      <View ref={boardRef} collapsable={false}>
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.measure}
        >
          {natural === null
            ? cards.map((card, index) => (
                <MeasureCard
                  key={card.id}
                  card={card}
                  onWidth={(width) => {
                    measuring.current[index] = width;
                    const widths = measuring.current;
                    if (cards.every((_, i) => widths[i] !== undefined)) {
                      setNatural(widths.slice());
                    }
                  }}
                />
              ))
            : null}
        </View>
        <View
          accessibilityLabel={answerLabel}
          style={[styles.answer, { height: fit?.answerHeight ?? 0 }]}
        />
        {between}
        {movable ? (
          <View
            accessibilityLabel={poolLabel}
            onLayout={(event) => {
              board.poolTop.value = event.nativeEvent.layout.y;
            }}
            style={[styles.pool, { height: fit?.poolHeight ?? 0 }]}
          >
            {fit?.bank.map((position, index) => (
              <View
                key={cards[index]?.id}
                style={[
                  styles.slot,
                  {
                    left: position.x,
                    top: position.y,
                    width: fit.widths[index],
                    height: CARD_HEIGHT * scale,
                    borderRadius: CARD_RADIUS * scale,
                  },
                ]}
              />
            ))}
          </View>
        ) : null}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {cards.map((card, index) => (
            <Marker key={card.id} index={index} board={board} scale={scale} />
          ))}
          {cards.map((card, index) => (
            <Word
              key={card.id}
              index={index}
              card={card}
              board={board}
              scale={scale}
              boardRef={boardRef}
              movable={movable}
              answerColor={
                wrongIds.includes(card.id) ? colors.red : answerColor
              }
              testID={placedIds.includes(card.id) ? "answer-card" : "pool-card"}
              onCommit={commit}
            />
          ))}
          {cards.map((card, index) => (
            <Ghost
              key={card.id}
              index={index}
              card={card}
              board={board}
              scale={scale}
              answerColor={
                wrongIds.includes(card.id) ? colors.red : answerColor
              }
            />
          ))}
        </View>
      </View>
    </View>
  );
}

// 札の縮める前の幅を測るための、見えない札。
function MeasureCard({
  card,
  onWidth,
}: {
  card: Card;
  onWidth: (width: number) => void;
}) {
  return (
    <View
      onLayout={(event) => onWidth(event.nativeEvent.layout.width)}
      style={styles.measureCard}
    >
      <Text
        numberOfLines={1}
        style={[styles.cardText, { fontFamily: cardFontFamily(card.text) }]}
      >
        {card.text}
      </Text>
    </View>
  );
}

// 札の中身。回答エリアにある間は色を変える。
function Face({
  index,
  card,
  board,
  scale,
  answerColor,
  lifted,
}: {
  index: number;
  card: Card;
  board: Board;
  scale: number;
  answerColor: string;
  lifted?: boolean;
}) {
  // 札の並びが変わるたびではなく、この札が運ばれたときだけ色を動かす。
  const placed = useDerivedValue(() => (board.orders.value[index] ?? -1) >= 0);
  const style = useAnimatedStyle(() => ({
    backgroundColor: withTiming(placed.value ? answerColor : colors.surface, {
      duration: COLOR_DURATION,
    }),
    shadowOpacity: lifted ? 0.3 : placed.value ? 0 : 0.12,
  }));
  const textStyle = useAnimatedStyle(() => ({
    color: withTiming(placed.value ? "#ffffff" : colors.text, {
      duration: COLOR_DURATION,
    }),
  }));
  return (
    <Animated.View
      style={[
        styles.card,
        {
          height: CARD_HEIGHT * scale,
          paddingHorizontal: CARD_PADDING * scale,
          borderRadius: CARD_RADIUS * scale,
        },
        styles.face,
        lifted && styles.lifted,
        style,
      ]}
    >
      <Animated.Text
        numberOfLines={1}
        ellipsizeMode="clip"
        style={[
          {
            fontFamily: cardFontFamily(card.text),
            fontSize: CARD_FONT_SIZE * scale,
          },
          textStyle,
        ]}
      >
        {card.text}
      </Animated.Text>
    </Animated.View>
  );
}

// 札の、盤面の中での位置（左上）。札置き場にあれば元の位置、回答エリアにあれば並んだ位置。
function useTarget(index: number, board: Board) {
  const targetX = useDerivedValue(() => {
    const order = board.orders.value[index] ?? -1;
    return order === -1
      ? (board.bank.value[index]?.x ?? 0)
      : AREA_PADDING + (board.layout.value[index]?.x ?? 0);
  });
  const targetY = useDerivedValue(() => {
    const order = board.orders.value[index] ?? -1;
    return order === -1
      ? board.poolTop.value + (board.bank.value[index]?.y ?? 0)
      : AREA_PADDING + (board.layout.value[index]?.y ?? 0);
  });
  return { targetX, targetY };
}

// 札1枚。動かしている間は Ghost が指に付いて動き、この札は隠す。
// 位置のアニメーションは目標の位置が変わった札でだけ始め、動かない札に計算をさせない。
const Word = memo(function Word({
  index,
  card,
  board,
  scale,
  boardRef,
  movable,
  answerColor,
  testID,
  onCommit,
}: {
  index: number;
  card: Card;
  board: Board;
  scale: number;
  boardRef: AnimatedRef<View>;
  movable: boolean;
  answerColor: string;
  testID: string;
  onCommit: (
    type: "place" | "unplace" | "move",
    index: number,
    at: number,
  ) => void;
}) {
  const { targetX, targetY } = useTarget(index, board);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  useAnimatedReaction(
    () => ({
      active: board.active.value === index,
      ready: board.ready.value,
      x: targetX.value,
      y: targetY.value,
    }),
    (now, previous) => {
      if (now.active) {
        return;
      }
      if (!now.ready) {
        x.value = now.x;
        y.value = now.y;
        return;
      }
      if (previous?.active) {
        // 指を離した位置から、目標の位置へ動かす。
        x.value = board.dragX.value;
        y.value = board.dragY.value;
      } else if (previous && previous.x === now.x && previous.y === now.y) {
        return;
      }
      x.value = withTiming(now.x, { duration: MOVE_DURATION });
      y.value = withTiming(now.y, { duration: MOVE_DURATION });
    },
  );

  // 運んだことを reducer へ知らせる。before と after は、運ぶ前と運んだあとの並び。
  function report(before: Orders, after: Orders) {
    "worklet";
    const move = moveOf(before, after, index);
    if (move) {
      scheduleOnRN(
        onCommit,
        move.type,
        index,
        move.type === "unplace" ? 0 : move.at,
      );
    }
  }

  function toggle() {
    "worklet";
    const before = board.orders.value;
    const after = toggleOrders(before, index);
    board.orders.value = after;
    report(before, after);
  }

  const pan = usePanGesture({
    enabled: movable,
    maxPointers: 1,
    minDistance: DRAG_DISTANCE,
    onActivate: (event) => {
      const origin = measure(boardRef);
      if (!origin || board.active.value !== -1) {
        return;
      }
      board.originX.value = origin.pageX;
      board.originY.value = origin.pageY;
      board.grabX.value = event.absoluteX - origin.pageX - x.value;
      board.grabY.value = event.absoluteY - origin.pageY - y.value;
      board.dragX.value = x.value;
      board.dragY.value = y.value;
      board.startOrder.value = board.orders.value[index];
      board.active.value = index;
    },
    onUpdate: (event) => {
      if (board.active.value !== index) {
        return;
      }
      const fingerX = event.absoluteX - board.originX.value;
      const fingerY = event.absoluteY - board.originY.value;
      board.dragX.value = fingerX - board.grabX.value;
      board.dragY.value = fingerY - board.grabY.value;
      const before = board.orders.value;
      const after = dragOrders(
        before,
        board.widths.value,
        board.contentWidth.value,
        index,
        { x: fingerX - AREA_PADDING, y: fingerY - AREA_PADDING },
        fingerY < board.answerBottom.value,
        board.scale.value,
      );
      if (after !== before) {
        board.orders.value = after;
      }
    },
    onDeactivate: () => {
      if (board.active.value !== index) {
        return;
      }
      board.active.value = -1;
      // 動かし始めたときの番号と、いまの番号を比べて、どこへ運んだかを知らせる。
      const before = board.orders.value.slice();
      before[index] = board.startOrder.value;
      report(before, board.orders.value);
    },
  });
  // 動かさずに離したときは、タップとして運ぶ。
  const tap = useTapGesture({
    enabled: movable,
    onDeactivate: (event) => {
      if (!event.canceled) {
        toggle();
      }
    },
  });
  const gesture = useExclusiveGestures(pan, tap);

  const style = useAnimatedStyle(() => {
    const placed = (board.orders.value[index] ?? -1) >= 0;
    const hidden =
      board.active.value === index ||
      !board.ready.value ||
      (!movable && !placed);
    return {
      width: board.widths.value[index] ?? 0,
      opacity: hidden ? 0 : 1,
      transform: [{ translateX: x.value }, { translateY: y.value }],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessible
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={card.text}
        onAccessibilityTap={() => scheduleOnUI(toggle)}
        style={[styles.layer, { height: CARD_HEIGHT * scale }, style]}
      >
        <Face
          index={index}
          card={card}
          board={board}
          scale={scale}
          answerColor={answerColor}
        />
      </Animated.View>
    </GestureDetector>
  );
});

// 動かしている札の見た目。ほかの札より手前に出すため、盤面の最後に置く。
const Ghost = memo(function Ghost({
  index,
  card,
  board,
  scale,
  answerColor,
}: {
  index: number;
  card: Card;
  board: Board;
  scale: number;
  answerColor: string;
}) {
  const style = useAnimatedStyle(() => ({
    width: board.widths.value[index] ?? 0,
    opacity: board.active.value === index ? 1 : 0,
    transform: [
      { translateX: board.dragX.value },
      { translateY: board.dragY.value },
      { scale: 1.08 },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.layer, { height: CARD_HEIGHT * scale }, style]}
    >
      <Face
        index={index}
        card={card}
        board={board}
        scale={scale}
        answerColor={answerColor}
        lifted
      />
    </Animated.View>
  );
});

// 動かしている札が入る位置を示す、点線の空きの枠。動かしている札の枠だけをアニメーションで動かす。
const Marker = memo(function Marker({
  index,
  board,
  scale,
}: {
  index: number;
  board: Board;
  scale: number;
}) {
  const style = useAnimatedStyle(() => {
    const shown =
      board.active.value === index && (board.orders.value[index] ?? -1) >= 0;
    const position = board.layout.value[index] ?? { x: 0, y: 0 };
    const moveX = AREA_PADDING + position.x;
    const moveY = AREA_PADDING + position.y;
    return {
      width: board.widths.value[index] ?? 0,
      opacity: shown ? 0.5 : 0,
      transform: [
        {
          translateX: shown
            ? withTiming(moveX, { duration: MOVE_DURATION })
            : moveX,
        },
        {
          translateY: shown
            ? withTiming(moveY, { duration: MOVE_DURATION })
            : moveY,
        },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.layer,
        styles.marker,
        { height: CARD_HEIGHT * scale, borderRadius: CARD_RADIUS * scale },
        style,
      ]}
    />
  );
});

const styles = StyleSheet.create({
  // 盤面に使える場所。問題文と数式の下から、下のボタンの上まで広がる。
  space: { flex: 1 },
  answer: {
    borderRadius: 22,
    backgroundColor: colors.answerArea,
  },
  pool: {
    marginTop: 16,
  },
  // 盤面の上に絶対位置で置く札や枠。位置は transform で決める。
  layer: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  measure: { position: "absolute", opacity: 0 },
  measureCard: {
    position: "absolute",
    paddingHorizontal: CARD_PADDING,
  },
  card: { justifyContent: "center" },
  cardText: { fontSize: CARD_FONT_SIZE },
  slot: {
    position: "absolute",
    backgroundColor: colors.separator,
  },
  face: {
    shadowColor: "#000000",
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
  },
  lifted: {
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  marker: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.indigo,
  },
});
