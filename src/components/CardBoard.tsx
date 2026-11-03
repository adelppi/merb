import { useFonts } from "expo-font";
import { type ComponentRef, useRef, useState } from "react";
import { type LayoutRectangle, Pressable, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { Card } from "../quiz/reducer";

// 札の文字は KaTeX の書体で出す。英字1文字は斜体、ほかは立体（docs/specs/quiz.md）。
const fonts = {
  KaTeX_Main: require("katex/dist/fonts/KaTeX_Main-Regular.ttf"),
  KaTeX_Math: require("katex/dist/fonts/KaTeX_Math-Italic.ttf"),
};

export function cardFontFamily(text: string): string {
  return /^[A-Za-z]$/.test(text) ? "KaTeX_Math" : "KaTeX_Main";
}

type Area = "pool" | "answer";

type Props = {
  // 札置き場の札（混ぜたときの順）
  pool: Card[];
  // 回答エリアの札（並んだ順）
  placed: Card[];
  // 札置き場の札を回答エリアの at 番目へ運ぶ。at がなければ末尾。
  onPlace: (id: number, at?: number) => void;
  // 回答エリアの札を札置き場へ戻す。
  onUnplace: (id: number) => void;
  // 回答エリアの中で札を to 番目へ移す。to は、その札を抜いたあとの並びでの位置。
  onMove: (id: number, to: number) => void;
};

type Point = { x: number; y: number };

function contains(rect: LayoutRectangle, point: Point): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

// 札置き場と回答エリア。タップで札を運び、長押ししてドラッグでも運ぶ。
// 札の位置は onLayout で集め、落とした位置と照らして運び先を決める。
export function CardBoard({ pool, placed, onPlace, onUnplace, onMove }: Props) {
  const [fontsLoaded] = useFonts(fonts);
  const [dragFrom, setDragFrom] = useState<Area | null>(null);
  const areaRects = useRef<Record<Area, LayoutRectangle>>({
    pool: { x: 0, y: 0, width: 0, height: 0 },
    answer: { x: 0, y: 0, width: 0, height: 0 },
  });
  const cardRects = useRef(new Map<number, LayoutRectangle>());
  const boardRef = useRef<ComponentRef<typeof View>>(null);

  // 札のid から、いまの座標（盤面全体の中）を返す。
  function boardRect(id: number, area: Area): LayoutRectangle | undefined {
    const rect = cardRects.current.get(id);
    const origin = areaRects.current[area];
    return rect && { ...rect, x: origin.x + rect.x, y: origin.y + rect.y };
  }

  // 札 id を area から (x, y)（盤面全体の中の座標）に落としたときの処理。
  function drop(id: number, from: Area, point: Point) {
    setDragFrom(null);
    if (contains(areaRects.current.answer, point)) {
      // 札の上に落としたらその札の前へ、札のないところなら末尾へ。
      const others = placed.filter((card) => card.id !== id);
      const target = others.findIndex((card) => {
        const rect = boardRect(card.id, "answer");
        return rect !== undefined && contains(rect, point);
      });
      const at = target < 0 ? others.length : target;
      if (from === "pool") {
        onPlace(id, at);
      } else {
        onMove(id, at);
      }
    } else if (from === "answer" && contains(areaRects.current.pool, point)) {
      onUnplace(id);
    }
  }

  if (!fontsLoaded) {
    return null;
  }

  function renderArea(area: Area, cards: Card[]) {
    return (
      <View
        onLayout={(event) => {
          areaRects.current[area] = event.nativeEvent.layout;
        }}
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          minHeight: 64,
          padding: 8,
          borderWidth: 1,
          borderRadius: 8,
          borderStyle: area === "answer" ? "solid" : "dashed",
          borderColor: "#888888",
          zIndex: dragFrom === area ? 10 : 0,
        }}
      >
        {cards.map((card) => (
          <DraggableCard
            key={card.id}
            card={card}
            onLayout={(rect) => cardRects.current.set(card.id, rect)}
            onTap={() =>
              area === "pool" ? onPlace(card.id) : onUnplace(card.id)
            }
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
        ))}
      </View>
    );
  }

  return (
    <View ref={boardRef} collapsable={false} style={{ gap: 16 }}>
      {renderArea("answer", placed)}
      {renderArea("pool", pool)}
    </View>
  );
}

type CardProps = {
  card: Card;
  onLayout: (rect: LayoutRectangle) => void;
  onTap: () => void;
  onDragStart: () => void;
  // 指を離した位置（画面全体の座標）を渡す。
  onDrop: (windowPoint: Point) => void;
};

// 札1枚。ドラッグ中は、指に合わせて札自身が動く。離したら元の位置へ戻り、運び先は親が決める。
function DraggableCard({
  card,
  onLayout,
  onTap,
  onDragStart,
  onDrop,
}: CardProps) {
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const lifted = useSharedValue(0);

  const pan = Gesture.Pan()
    // タッチでは少し長く押したときにドラッグを始める。それより短い操作はタップにする。
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
      { scale: lifted.value ? 1.1 : 1 },
    ],
    zIndex: lifted.value ? 20 : 0,
    opacity: lifted.value ? 0.85 : 1,
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
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderWidth: 1,
            borderRadius: 6,
            borderColor: "#444444",
            backgroundColor: "#ffffff",
          }}
        >
          <Text style={{ fontFamily: cardFontFamily(card.text), fontSize: 20 }}>
            {card.text}
          </Text>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}
