// utils/analytics.js
exports.calculateInterviewReadiness = (subjectProgress, allQuizzes) => {
  let score = 0;

  // Consistency (20 points) - based on number of quizzes
  const quizScore = Math.min((subjectProgress.quizzesCompleted / 10) * 20, 20);
  score += quizScore;

  // Accuracy (40 points)
  const accuracyScore = (subjectProgress.averageAccuracy / 100) * 40;
  score += accuracyScore;

  // Improvement trend (20 points)
  if (allQuizzes.length >= 3) {
    const recent = allQuizzes.slice(0, 3);
    const older = allQuizzes.slice(3, 6);
    if (older.length > 0) {
      const recentAvg = recent.reduce((sum, q) => sum + q.results.accuracy, 0) / recent.length;
      const olderAvg = older.reduce((sum, q) => sum + q.results.accuracy, 0) / older.length;
      const improvement = ((recentAvg - olderAvg) / olderAvg) * 100;
      score += Math.max(Math.min(improvement, 20), 0);
    }
  }

  // Topic coverage (20 points)
  const topicCoverage = (subjectProgress.strengthTopics.length / 5) * 20;
  score += Math.min(topicCoverage, 20);

  return Math.round(score);
};