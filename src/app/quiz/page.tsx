import { QuizScreen } from "@/components/quiz-screen";
import { loadQuestions } from "@/questions/load";

export default function Quiz() {
  return <QuizScreen questions={loadQuestions()} />;
}
