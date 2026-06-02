export function scoreQuiz(questions: { answerIndex: number }[], answers: number[]): number {
  if (questions.length === 0) return 0;
  let correct = 0;
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] === questions[i].answerIndex) correct += 1;
  }
  return Math.round((correct / questions.length) * 100);
}
