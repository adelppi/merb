import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CardBoard } from "./card-board";
import styles from "./quiz.module.css";

function render() {
  return renderToString(
    createElement(CardBoard, {
      placed: [{ id: 0, text: "x" }],
      pool: [
        { id: 1, text: "to" },
        { id: 2, text: "F" },
        { id: 3, text: "the square root of" },
      ],
      locked: false,
      answerLabel: "回答エリア",
      poolLabel: "札置き場",
      onPlace: () => {},
      onUnplace: () => {},
      onMove: () => {},
    }),
  );
}

// 札のボタンの class と、ボタンの中の文字を、並んだ順に取り出す。
function buttons(html: string) {
  return [
    ...html.matchAll(/<button[^>]*class="([^"]*)"[^>]*>([^<]*)<\/button>/g),
  ].map(([, className, text]) => ({ classes: className.split(" "), text }));
}

describe("CardBoard", () => {
  it("英字1文字の札は斜体の class で、ほかの札は立体の class で出す", () => {
    const cards = buttons(render());
    expect(cards.map((card) => card.text)).toEqual([
      "x",
      "to",
      "F",
      "the square root of",
    ]);
    for (const card of cards) {
      const letter = card.text.length === 1;
      expect(card.classes).toContain(styles.card);
      expect(card.classes.includes(styles.letter)).toBe(letter);
      expect(card.classes.includes(styles.word)).toBe(!letter);
    }
  });
});
