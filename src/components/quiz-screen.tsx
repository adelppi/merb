"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { parseLocale } from "@/i18n/locale";
import { readingText } from "@/questions/reading";
import type { Answer, Question } from "@/questions/schema";
import {
  otherAnswers,
  placedCards,
  poolCards,
  type QuizState,
} from "@/quiz/reducer";
import { useQuiz } from "@/quiz/use-quiz";
import { CardBoard } from "./card-board";
import { MathFormula } from "./math-formula";
import styles from "./quiz.module.css";

// 1問を解く出題の画面。決まりは docs/specs/quiz.md に書いてある。
export function QuizScreen({ questions }: { questions: readonly Question[] }) {
  const t = useTranslations("Quiz");
  const locale = parseLocale(useLocale());
  const { state, dispatch, next } = useQuiz(questions);
  const back = <Link href="/">{t("back")}</Link>;

  if (questions.length === 0) {
    return (
      <main className={styles.screen}>
        <p>{t("noQuestions")}</p>
        {back}
      </main>
    );
  }
  if (state === null) {
    return <main className={styles.screen}>{back}</main>;
  }

  return (
    <main className={styles.screen}>
      <p>{state.question.prompt[locale]}</p>
      <MathFormula latex={state.question.latex} />
      <CardBoard
        placed={placedCards(state)}
        pool={poolCards(state)}
        locked={state.phase !== "solving"}
        answerLabel={t("answerArea")}
        poolLabel={t("pool")}
        onPlace={(id, at) => dispatch({ type: "place", id, at })}
        onUnplace={(id) => dispatch({ type: "unplace", id })}
        onMove={(id, to) => dispatch({ type: "move", id, to })}
      />
      <Result
        state={state}
        onCheck={() => dispatch({ type: "check" })}
        onRetry={() => dispatch({ type: "retry" })}
        onReveal={() => dispatch({ type: "reveal" })}
        onNext={next}
      />
      {back}
    </main>
  );
}

type ResultProps = {
  state: QuizState;
  onCheck: () => void;
  onRetry: () => void;
  onReveal: () => void;
  onNext: () => void;
};

// 答え合わせのボタンと、答え合わせをしたあとに出すもの。
function Result({ state, onCheck, onRetry, onReveal, onNext }: ResultProps) {
  const t = useTranslations("Quiz");
  const nextButton = (
    <button type="button" onClick={onNext}>
      {t("next")}
    </button>
  );

  switch (state.phase) {
    case "solving":
      return (
        <div className={styles.actions}>
          <button type="button" onClick={onCheck}>
            {t("check")}
          </button>
        </div>
      );
    case "correct": {
      const others = otherAnswers(state);
      return (
        <div>
          <p role="status">{t("correct")}</p>
          {others.length > 0 && (
            <Readings title={t("otherReadings")} answers={others} />
          )}
          <div className={styles.actions}>{nextButton}</div>
        </div>
      );
    }
    case "incorrect":
      return (
        <div>
          <p role="status">{t("incorrect")}</p>
          <div className={styles.actions}>
            <button type="button" onClick={onRetry}>
              {t("retry")}
            </button>
            <button type="button" onClick={onReveal}>
              {t("reveal")}
            </button>
          </div>
        </div>
      );
    case "revealed":
      return (
        <div>
          <Readings title={t("answer")} answers={state.question.answers} />
          <div className={styles.actions}>{nextButton}</div>
        </div>
      );
  }
}

function Readings({ title, answers }: { title: string; answers: Answer[] }) {
  return (
    <section aria-label={title}>
      <h2>{title}</h2>
      <ul lang="en">
        {answers.map((answer) => (
          <li key={answer.cards.join(" ")}>{readingText(answer)}</li>
        ))}
      </ul>
    </section>
  );
}
