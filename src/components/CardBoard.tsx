import { useFonts } from "expo-font";
import { type ComponentRef, type ReactNode, useRef, useState } from "react";
import {
  type LayoutRectangle,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { type DropArea, type Point, resolveDrop } from "../quiz/drop";
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

// 札置き場と回答エリア。タップで札を運び、長押ししてドラッグでも運ぶ。
// 札の位置は onLayout で集め、落とした位置と照らして運び先を決める（src/quiz/drop.ts）。
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
  const [dragFrom, setDragFrom] = useState<DropArea | null>(null);
  const areaRects = useRef<Record<DropArea, LayoutRectangle>>({
    pool: emptyRect,
    answer: emptyRect,
  });
  const cardRects = useRef(new Map<number, LayoutRectangle>());
  const boardRef = useRef<ComponentRef<typeof View>>(null);

  // 札 id を from から point（盤面の中の座標）に落としたときの処理。
  function drop(id: number, from: DropArea, point: Point) {
    setDragFrom(null);
    const origin = areaRects.current.answer;
    const action = resolveDrop({
      id,
      from,
      point,
      answerRect: areaRects.current.answer,
      poolRect: areaRects.current.pool,
      placed: placed.flatMap((card) => {
        const rect = cardRects.current.get(card.id);
        return rect
          ? [
              {
                id: card.id,
                rect: { ...rect, x: origin.x + rect.x, y: origin.y + rect.y },
              },
            ]
          : [];
      }),
    });
    if (action?.type === "place") {
      onPlace(action.id, action.at);
    } else if (action?.type === "move") {
      onMove(action.id, action.to);
    } else if (action?.type === "unplace") {
      onUnplace(action.id);
    }
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
        onLayout={(rect) => cardRects.current.set(card.id, rect)}
        onTap={() => (area === "pool" ? onPlace(card.id) : onUnplace(card.id))}
        onDragStart={() => setDragFrom(area)}
        onDrop={(windowPoint) => {
          // 指を離した位置は画面全体の座標なので、盤面の中の座標に直す。
          boardRef.current?.measureInWindow((x, y) => {
            drop(card.id, area, {
              x: windowPoint.x - x,
              y: windowPoint.y - y,
            });
          });
        }}
      />
    );
  }

  return (
    <View ref={boardRef} collapsable={false}>
      <View
        accessibilityLabel={answerLabel}
        onLayout={(event) => {
          areaRects.current.answer = event.nativeEvent.layout;
        }}
        style={[styles.answer, dragFrom === "answer" && styles.raised]}
      >
        {placed.map((card) => renderCard(card, "answer"))}
      </View>
      {between}
      {movable ? (
        <View
          accessibilityLabel={poolLabel}
          onLayout={(event) => {
            areaRects.current.pool = event.nativeEvent.layout;
          }}
          style={[styles.pool, dragFrom === "pool" && styles.raised]}
        >
          {pool.map((card) => renderCard(card, "pool"))}
        </View>
      ) : null}
    </View>
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
  onTap: () => void;
  onDragStart: () => void;
  // 指を離した位置（画面全体の座標）を渡す。
  onDrop: (windowPoint: Point) => void;
};

// 札1枚。ドラッグ中は、指に合わせて札自身が動く。離したら元の位置へ戻り、運び先は親が決める。
function DraggableCard({
  card,
  tone,
  onLayout,
  onTap,
  onDragStart,
  onDrop,
}: CardProps) {
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const lifted = useSharedValue(0);

  const pan = Gesture.Pan()
    // 少し長く押したときにドラッグを始める。それより短い操作はタップにする。
    .activateAfterLongPress(250)
    .onStart(() => {
      lifted.value = 1;
      runOnJS(onDragStart)();
    })
    .onUpdate((event) => {
      dx.value = event.translationX;
      dy.value = event.translationY;
    })
    .onEnd((event) => {
      runOnJS(onDrop)({ x: event.absoluteX, y: event.absoluteY });
    })
    .onFinalize(() => {
      lifted.value = 0;
      dx.value = withSpring(0);
      dy.value = withSpring(0);
    });

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: dx.value },
      { translateY: dy.value },
      { scale: lifted.value ? 1.08 : 1 },
    ],
    zIndex: lifted.value ? 20 : 0,
    opacity: lifted.value ? 0.9 : 1,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        onLayout={(event) => onLayout(event.nativeEvent.layout)}
        style={style}
      >
        <Pressable
          onPress={onTap}
          accessibilityRole="button"
          accessibilityLabel={card.text}
          style={[styles.card, toneStyles[tone]]}
        >
          <CardText card={card} tone={tone} />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  answer: {
    minHeight: 116,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 22,
    backgroundColor: colors.answerArea,
  },
  pool: {
    minHeight: 60,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 2,
  },
  raised: { zIndex: 10 },
  card: {
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
