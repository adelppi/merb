import { describe, expect, it } from "vitest";
import { storageKey } from "./locale";
import { type LocaleStorage, loadLocale, saveLocale } from "./storage";

function memoryStorage(initial: Record<string, string> = {}): LocaleStorage {
  const data = new Map(Object.entries(initial));
  return {
    getItem: async (key) => data.get(key) ?? null,
    setItem: async (key, value) => {
      data.set(key, value);
    },
  };
}

const broken: LocaleStorage = {
  getItem: async () => {
    throw new Error("読めない");
  },
  setItem: async () => {
    throw new Error("書けない");
  },
};

describe("言語の保存と読み出し", () => {
  it("保存がなければ日本語", async () => {
    expect(await loadLocale(memoryStorage())).toBe("ja");
  });

  it("保存した言語を読める", async () => {
    const storage = memoryStorage();
    expect(await saveLocale(storage, "en")).toBe(true);
    expect(await loadLocale(storage)).toBe("en");
    await saveLocale(storage, "ja");
    expect(await loadLocale(storage)).toBe("ja");
  });

  it("キー merb.locale に言語の値を保存する", async () => {
    const saved: Record<string, string> = {};
    await saveLocale(
      {
        getItem: async () => null,
        setItem: async (key, value) => {
          saved[key] = value;
        },
      },
      "en",
    );
    expect(saved).toEqual({ "merb.locale": "en" });
    expect(storageKey).toBe("merb.locale");
  });

  it("日本語と英語のどちらでもない値は日本語", async () => {
    for (const value of ["fr", "", "EN", "ja "]) {
      expect(await loadLocale(memoryStorage({ [storageKey]: value }))).toBe(
        "ja",
      );
    }
  });

  it("読めないときは日本語", async () => {
    expect(await loadLocale(broken)).toBe("ja");
  });

  it("保存できなくても例外を出さず、失敗を返す", async () => {
    expect(await saveLocale(broken, "en")).toBe(false);
  });
});
