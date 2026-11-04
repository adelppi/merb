import { describe, expect, it } from "vitest";
import { storageKey } from "./mistakes";
import { loadMistakes, saveMistakes } from "./storage";

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

describe("mistakes storage", () => {
  it("保存した記録を読み戻せる", async () => {
    const storage = memory();
    expect(await saveMistakes(storage, ["a", "b"])).toBe(true);
    expect(storage.data[storageKey]).toBe('["a","b"]');
    expect(await loadMistakes(storage)).toEqual(["a", "b"]);
  });

  it("保存がないときは空にする", async () => {
    expect(await loadMistakes(memory())).toEqual([]);
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
    expect(await loadMistakes(broken)).toEqual([]);
    expect(await saveMistakes(broken, ["a"])).toBe(false);
  });
});
