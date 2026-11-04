import { describe, expect, it } from "vitest";
import {
  loadSelection,
  parseSelection,
  saveSelection,
  selectionKey,
} from "./selection-storage";

function memory(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: async (key: string) => data[key] ?? null,
    setItem: async (key: string, value: string) => {
      data[key] = value;
    },
  };
}

const available = ["numbers", "fractions", "calculus"] as const;

describe("parseSelection", () => {
  it("分類の表の順に並べ、重なったものを除く", () => {
    expect(
      parseSelection('["calculus","numbers","calculus"]', available),
    ).toEqual(["numbers", "calculus"]);
  });

  it("分類の id でないものと、問題がない分類を除く", () => {
    expect(
      parseSelection('["numbers","foo",1,null,"relations"]', available),
    ).toEqual(["numbers"]);
  });

  it("読めない値は、どの分類も選んでいない状態にする", () => {
    expect(parseSelection(null, available)).toEqual([]);
    expect(parseSelection("{", available)).toEqual([]);
    expect(parseSelection('{"a":1}', available)).toEqual([]);
    expect(parseSelection('"numbers"', available)).toEqual([]);
  });
});

describe("selection storage", () => {
  it("保存した分類を読み戻せる", async () => {
    const storage = memory();
    expect(await saveSelection(storage, ["numbers", "calculus"])).toBe(true);
    expect(storage.data[selectionKey]).toBe('["numbers","calculus"]');
    expect(await loadSelection(storage, available)).toEqual([
      "numbers",
      "calculus",
    ]);
  });

  it("保存がないときは、どの分類も選んでいない状態にする", async () => {
    expect(await loadSelection(memory(), available)).toEqual([]);
  });

  it("読み出しと保存が失敗しても例外を出さない", async () => {
    const broken = {
      getItem: async () => {
        throw new Error("x");
      },
      setItem: async () => {
        throw new Error("x");
      },
    };
    expect(await loadSelection(broken, available)).toEqual([]);
    expect(await saveSelection(broken, ["numbers"])).toBe(false);
  });
});
