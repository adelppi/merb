"use client";

import {
  type CollisionDetection,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef, useState } from "react";
import type { Card } from "@/quiz/reducer";
import styles from "./quiz.module.css";

const poolId = "pool";
const answerId = "answer";

type From = typeof poolId | typeof answerId;

type Props = {
  // 回答エリアに並んだ札
  placed: Card[];
  // 札置き場の札
  pool: Card[];
  // true のときは札を運べない
  locked: boolean;
  answerLabel: string;
  poolLabel: string;
  onPlace: (id: number, at?: number) => void;
  onUnplace: (id: number) => void;
  onMove: (id: number, to: number) => void;
};

// 回答エリアと札置き場。札はタップかドラッグで運ぶ（docs/specs/quiz.md の「札を運ぶ」）。
export function CardBoard({
  placed,
  pool,
  locked,
  answerLabel,
  poolLabel,
  onPlace,
  onUnplace,
  onMove,
}: Props) {
  const sensors = useSensors(
    // マウスでは少し動かしたら、タッチでは少し長く押したらドラッグを始める。それより短い操作はタップにする。
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );
  const [active, setActive] = useState<Card | null>(null);
  // ドラッグを終えた直後の click をタップとして扱わないための印
  const dragging = useRef(false);

  const cardById = (id: number) =>
    [...placed, ...pool].find((card) => card.id === id) ?? null;

  const onDragStart = (event: DragStartEvent) => {
    dragging.current = true;
    setActive(cardById(cardIdOf(event.active.id)));
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActive(null);
    setTimeout(() => {
      dragging.current = false;
    });
    if (!over) {
      return;
    }
    const id = cardIdOf(active.id);
    const from = active.data.current?.from as From;
    const overIndex = placed.findIndex((card) => cardKey(card.id) === over.id);
    if (from === poolId) {
      if (overIndex >= 0) {
        onPlace(id, overIndex);
      } else if (over.id === answerId) {
        onPlace(id);
      }
    } else if (over.id === poolId) {
      onUnplace(id);
    } else if (overIndex >= 0) {
      onMove(id, overIndex);
    } else if (over.id === answerId) {
      onMove(id, placed.length - 1);
    }
  };

  const tap = (action: () => void) => () => {
    if (!dragging.current && !locked) {
      action();
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setActive(null);
        dragging.current = false;
      }}
    >
      <Area id={answerId} label={answerLabel}>
        <SortableContext
          items={placed.map((card) => cardKey(card.id))}
          strategy={rectSortingStrategy}
        >
          {placed.map((card) => (
            <PlacedCard
              key={card.id}
              card={card}
              locked={locked}
              onTap={tap(() => onUnplace(card.id))}
            />
          ))}
        </SortableContext>
      </Area>
      <Area id={poolId} label={poolLabel}>
        {pool.map((card) => (
          <PoolCard
            key={card.id}
            card={card}
            locked={locked}
            onTap={tap(() => onPlace(card.id))}
          />
        ))}
      </Area>
      {/* 札は落とした先にすぐ並べるので、落としたときのアニメーションはしない。 */}
      <DragOverlay dropAnimation={null}>
        {active ? <span className={styles.card}>{active.text}</span> : null}
      </DragOverlay>
    </DndContext>
  );
}

// 札が重なっていれば札を、なければ回答エリアか札置き場を、落とす先にする。
const collisionDetection: CollisionDetection = (args) => {
  const collisions = pointerWithin(args);
  const card = collisions.find(
    (collision) => collision.id !== poolId && collision.id !== answerId,
  );
  return card ? [card] : collisions;
};

function cardKey(id: number): string {
  return `card-${id}`;
}

function cardIdOf(key: string | number): number {
  return Number(String(key).replace("card-", ""));
}

function Area({
  id,
  label,
  children,
}: {
  id: From;
  label: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <section
      ref={setNodeRef}
      aria-label={label}
      className={id === poolId ? `${styles.area} ${styles.pool}` : styles.area}
    >
      {children}
    </section>
  );
}

type CardProps = { card: Card; locked: boolean; onTap: () => void };

function PoolCard({ card, locked, onTap }: CardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: cardKey(card.id),
    data: { from: poolId },
    disabled: locked,
  });
  return (
    <button
      type="button"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      disabled={locked}
      onClick={onTap}
      className={isDragging ? `${styles.card} ${styles.dragging}` : styles.card}
    >
      {card.text}
    </button>
  );
}

function PlacedCard({ card, locked, onTap }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: cardKey(card.id),
    data: { from: answerId },
    disabled: locked,
  });
  return (
    <button
      type="button"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      disabled={locked}
      onClick={onTap}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={isDragging ? `${styles.card} ${styles.dragging}` : styles.card}
    >
      {card.text}
    </button>
  );
}
