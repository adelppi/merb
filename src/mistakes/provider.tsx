import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { addMistake, removeMistake } from "./mistakes";
import { loadMistakes, saveMistakes } from "./storage";

type Mistakes = {
  ids: readonly string[];
  add: (id: string) => void;
  remove: (id: string) => void;
};

const MistakesContext = createContext<Mistakes | null>(null);

// 端末に保存した記録を読み、記録と、足す・消す関数を子に渡す。読み終えるまでは何も出さない。
export function MistakesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<readonly string[] | null>(null);
  // 足す・消すを続けて呼んでも取りこぼさないよう、最新の記録を持つ。
  const latest = useRef<readonly string[]>([]);

  useEffect(() => {
    let active = true;
    loadMistakes(AsyncStorage).then((loaded) => {
      if (active) {
        latest.current = loaded;
        setIds(loaded);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback((change: (ids: readonly string[]) => string[]) => {
    const next = change(latest.current);
    if (next.length === latest.current.length) {
      return;
    }
    latest.current = next;
    setIds(next);
    void saveMistakes(AsyncStorage, next);
  }, []);

  const add = useCallback(
    (id: string) => update((current) => addMistake(current, id)),
    [update],
  );
  const remove = useCallback(
    (id: string) => update((current) => removeMistake(current, id)),
    [update],
  );
  const value = useMemo<Mistakes | null>(
    () => (ids === null ? null : { ids, add, remove }),
    [ids, add, remove],
  );

  if (value === null) return null;
  return (
    <MistakesContext.Provider value={value}>
      {children}
    </MistakesContext.Provider>
  );
}

// 間違えた問題の記録を返す。MistakesProvider の中で使う。
export function useMistakes(): Mistakes {
  const value = useContext(MistakesContext);
  if (value === null) throw new Error("MistakesProvider の外では使えません");
  return value;
}
