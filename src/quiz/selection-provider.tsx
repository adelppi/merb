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
import { bundledQuestionFiles } from "../questions/bundled";
import type { CategoryId } from "../questions/schema";
import { availableCategories } from "./categories";
import { loadSelection, saveSelection } from "./selection-storage";

type Selection = {
  selected: readonly CategoryId[];
  // 選んだ分類を変えて保存する。
  change: (next: (current: readonly CategoryId[]) => CategoryId[]) => void;
};

const SelectionContext = createContext<Selection | null>(null);

// 端末に保存した分類を読み、選んだ分類と、変える関数を子に渡す。読み終えるまでは何も出さない。
export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<readonly CategoryId[] | null>(null);
  // 続けて呼んでも取りこぼさないよう、最新の選択を持つ。
  const latest = useRef<readonly CategoryId[]>([]);

  useEffect(() => {
    let active = true;
    loadSelection(
      AsyncStorage,
      availableCategories(bundledQuestionFiles()),
    ).then((loaded) => {
      if (active) {
        latest.current = loaded;
        setSelected(loaded);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const change = useCallback<Selection["change"]>((next) => {
    const value = next(latest.current);
    latest.current = value;
    setSelected(value);
    void saveSelection(AsyncStorage, value);
  }, []);

  const value = useMemo<Selection | null>(
    () => (selected === null ? null : { selected, change }),
    [selected, change],
  );

  if (value === null) return null;
  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

// 選んだ分類を返す。SelectionProvider の中で使う。
export function useSelection(): Selection {
  const value = useContext(SelectionContext);
  if (value === null) throw new Error("SelectionProvider の外では使えません");
  return value;
}
