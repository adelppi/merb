"use client";

import Form from "next/form";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { type CategoryId, categoryIds } from "@/questions/schema";
import { categoryParam, parseCategories } from "@/quiz/categories";
import styles from "./quiz.module.css";

type CategorySelectProps = {
  // 問題が1問以上ある分類。ほかの分類は選べない。
  available: readonly CategoryId[];
  // 画面を開いたときに選んでいる分類。
  initial: readonly CategoryId[];
};

// 出題の範囲を分類から選ぶ画面。決まりは docs/specs/category-select.md に書いてある。
export function CategorySelect({ available, initial }: CategorySelectProps) {
  const t = useTranslations("Categories");
  const names = useTranslations("CategoryNames");
  const [selected, setSelected] = useState<readonly CategoryId[]>(() =>
    initial.filter((id) => available.includes(id)),
  );

  const toggle = (id: CategoryId, checked: boolean) =>
    setSelected((current) =>
      checked ? [...current, id] : current.filter((other) => other !== id),
    );

  return (
    <main className={styles.screen}>
      <h1 id="categories-title">{t("title")}</h1>
      {/* GET で送ると、チェックした分類が並びの順に ?category=... として付く。 */}
      <Form action="/quiz" className={styles.categories}>
        <fieldset aria-labelledby="categories-title">
          {categoryIds.map((id) => (
            <label key={id}>
              <input
                type="checkbox"
                name={categoryParam}
                value={id}
                checked={selected.includes(id)}
                disabled={!available.includes(id)}
                onChange={(event) => toggle(id, event.target.checked)}
              />
              {names(id)}
            </label>
          ))}
        </fieldset>
        <div className={styles.actions}>
          <button type="submit" disabled={selected.length === 0}>
            {t("start")}
          </button>
        </div>
      </Form>
      <Link href="/quiz">{t("all")}</Link>
      <Link href="/">{t("back")}</Link>
    </main>
  );
}

// URL のクエリ category にある分類を選んだ状態で、分類を選ぶ画面を出す。
export function CategorySelectFromQuery({
  available,
}: {
  available: readonly CategoryId[];
}) {
  const initial = parseCategories(useSearchParams().getAll(categoryParam));
  return <CategorySelect available={available} initial={initial} />;
}
