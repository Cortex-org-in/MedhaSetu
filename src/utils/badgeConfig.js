export const BADGES = [
  { id: 'first_quiz', name: 'First Steps', desc: 'Complete your first quiz session', emoji: '👣' },
  { id: 'quiz_10', name: 'Mental Gymnastics', desc: 'Complete 10 quiz sessions', emoji: '🤸' },
  { id: 'quiz_25', name: 'Agility Master', desc: 'Complete 25 quiz sessions', emoji: '🏆' },
  { id: 'streak_3', name: 'Streak Starter', desc: 'Train for 3 consecutive days', emoji: '⚡' },
  { id: 'streak_7', name: 'Consistency Champ', desc: 'Train for 7 consecutive days', emoji: '🔥' },
  { id: 'streak_15', name: 'Agility Legend', desc: 'Train for 15 consecutive days', emoji: '👑' },
  { id: 'perfect_1', name: 'Perfectionist', desc: 'Score 100% on any quiz', emoji: '🌟' },
  { id: 'perfect_3', name: 'Triple Crown', desc: 'Score a perfect 100% on 3 quizzes', emoji: '🎖️' },
  { id: 'arts_1', name: 'Art Lover', desc: 'Complete 1 Arts quiz', emoji: '🎨' },
  { id: 'arts_5', name: 'Art Scholar', desc: 'Complete 5 Arts quizzes', emoji: '🏛️' },
  { id: 'maths_1', name: 'Number Crusher', desc: 'Complete 1 Mathematics quiz', emoji: '🔢' },
  { id: 'maths_5', name: 'Math Genius', desc: 'Complete 5 Mathematics quizzes', emoji: '📐' },
  { id: 'gk_1', name: 'Curious Mind', desc: 'Complete 1 General Knowledge quiz', emoji: '🌍' },
  { id: 'gk_5', name: 'Oracle of Knowledge', desc: 'Complete 5 General Knowledge quizzes', emoji: '🔮' },
  { id: 'history_1', name: 'Time Traveler', desc: 'Complete 1 Indian History & Geography quiz', emoji: '🗺️' },
  { id: 'history_5', name: 'Grand Historian', desc: 'Complete 5 Indian History & Geography quizzes', emoji: '📜' },
  { id: 'science_1', name: 'Science Explorer', desc: 'Complete 1 Science quiz', emoji: '🔬' },
  { id: 'science_5', name: 'Science Genius', desc: 'Complete 5 Science quizzes', emoji: '🚀' },
  { id: 'logic_1', name: 'Pattern Finder', desc: 'Complete 1 Logical Reasoning quiz', emoji: '🧩' },
  { id: 'logic_5', name: 'Grand Logician', desc: 'Complete 5 Logical Reasoning quizzes', emoji: '🧠' },
  { id: 'high_accuracy_5', name: 'Sharp Shooter', desc: 'Complete 5 quizzes with 80% or higher accuracy', emoji: '🎯' },
  { id: 'correct_50', name: 'Brain Builder', desc: 'Answer 50 questions correctly in total', emoji: '💡' },
  { id: 'correct_150', name: 'Super Thinker', desc: 'Answer 150 questions correctly in total', emoji: '🛸' },
  { id: 'double_train', name: 'Double Dose', desc: 'Complete 2 quizzes in a single day', emoji: '✌️' },
  { id: 'finance_1', name: 'Wealth Wiseman', desc: 'Complete 1 Economics & Financial Literacy quiz', emoji: '💰' },
  { id: 'finance_5', name: 'Financial Guru', desc: 'Complete 5 Economics & Financial Literacy quizzes', emoji: '📈' },
  { id: 'literature_1', name: 'Bookworm', desc: 'Complete 1 Indian Literature & Classics quiz', emoji: '📚' },
  { id: 'literature_5', name: 'Literary Scholar', desc: 'Complete 5 Indian Literature & Classics quizzes', emoji: '✍️' },
  { id: 'nostalgia_1', name: 'Retro Fan', desc: 'Complete 1 Cinema, Music & Retro Nostalgia quiz', emoji: '📻' },
  { id: 'nostalgia_5', name: 'Nostalgia Maestro', desc: 'Complete 5 Cinema, Music & Retro Nostalgia quizzes', emoji: '🎬' },
  { id: 'words_1', name: 'Word Smith', desc: 'Complete 1 Word Power & Language Puzzles quiz', emoji: '🗣️' },
  { id: 'words_5', name: 'Verbal Wizard', desc: 'Complete 5 Word Power & Language Puzzles quizzes', emoji: '📖' }
];

export function checkForNewBadges(userData, currentQuizResult) {
  const scores = [...(userData.scores || [])];
  
  const alreadyAdded = scores.some(s => s.date === currentQuizResult.date && s.category === currentQuizResult.category && s.score === currentQuizResult.score);
  if (!alreadyAdded) {
    scores.push(currentQuizResult);
  }

  const streak = userData.streak || 1;
  const currentUnlocked = userData.badges || [];
  const newlyUnlocked = [];

  const checkUnlock = (id, condition) => {
    if (!currentUnlocked.includes(id) && condition) {
      newlyUnlocked.push(id);
    }
  };

  const totalQuizzes = scores.length;
  
  let totalCorrect = 0;
  let perfectScores = 0;
  let highAccuracyCount = 0;
  
  const categoryCounts = {
    'Arts': 0,
    'Mathematics': 0,
    'General Knowledge': 0,
    'Indian History & Geography': 0,
    'Science': 0,
    'Logical Reasoning & Patterns': 0,
    'Economics & Financial Literacy': 0,
    'Indian Literature & Classics': 0,
    'Cinema, Music & Retro Nostalgia': 0,
    'Word Power & Language Puzzles': 0
  };

  const dateCounts = {};

  scores.forEach(s => {
    totalCorrect += s.score || 0;
    
    const accuracy = (s.score / s.total);
    if (accuracy === 1) perfectScores++;
    if (accuracy >= 0.8) highAccuracyCount++;

    if (categoryCounts[s.category] !== undefined) {
      categoryCounts[s.category]++;
    }

    if (s.date) {
      dateCounts[s.date] = (dateCounts[s.date] || 0) + 1;
    }
  });

  // 1. Quizzes completed criteria
  checkUnlock('first_quiz', totalQuizzes >= 1);
  checkUnlock('quiz_10', totalQuizzes >= 10);
  checkUnlock('quiz_25', totalQuizzes >= 25);

  // 2. Streak criteria
  checkUnlock('streak_3', streak >= 3);
  checkUnlock('streak_7', streak >= 7);
  checkUnlock('streak_15', streak >= 15);

  // 3. Perfect accuracy criteria
  checkUnlock('perfect_1', perfectScores >= 1);
  checkUnlock('perfect_3', perfectScores >= 3);

  // 4. Category criteria
  checkUnlock('arts_1', categoryCounts['Arts'] >= 1);
  checkUnlock('arts_5', categoryCounts['Arts'] >= 5);

  checkUnlock('maths_1', categoryCounts['Mathematics'] >= 1);
  checkUnlock('maths_5', categoryCounts['Mathematics'] >= 5);

  checkUnlock('gk_1', categoryCounts['General Knowledge'] >= 1);
  checkUnlock('gk_5', categoryCounts['General Knowledge'] >= 5);

  checkUnlock('history_1', categoryCounts['Indian History & Geography'] >= 1);
  checkUnlock('history_5', categoryCounts['Indian History & Geography'] >= 5);

  checkUnlock('science_1', categoryCounts['Science'] >= 1);
  checkUnlock('science_5', categoryCounts['Science'] >= 5);

  checkUnlock('logic_1', categoryCounts['Logical Reasoning & Patterns'] >= 1);
  checkUnlock('logic_5', categoryCounts['Logical Reasoning & Patterns'] >= 5);

  checkUnlock('finance_1', categoryCounts['Economics & Financial Literacy'] >= 1);
  checkUnlock('finance_5', categoryCounts['Economics & Financial Literacy'] >= 5);

  checkUnlock('literature_1', categoryCounts['Indian Literature & Classics'] >= 1);
  checkUnlock('literature_5', categoryCounts['Indian Literature & Classics'] >= 5);

  checkUnlock('nostalgia_1', categoryCounts['Cinema, Music & Retro Nostalgia'] >= 1);
  checkUnlock('nostalgia_5', categoryCounts['Cinema, Music & Retro Nostalgia'] >= 5);

  checkUnlock('words_1', categoryCounts['Word Power & Language Puzzles'] >= 1);
  checkUnlock('words_5', categoryCounts['Word Power & Language Puzzles'] >= 5);

  // 5. Accuracy count criteria
  checkUnlock('high_accuracy_5', highAccuracyCount >= 5);

  // 6. Total correct answers criteria
  checkUnlock('correct_50', totalCorrect >= 50);
  checkUnlock('correct_150', totalCorrect >= 150);

  // 7. Double training criteria (2 quizzes in one day)
  const hasDoubleTrain = Object.values(dateCounts).some(count => count >= 2);
  checkUnlock('double_train', hasDoubleTrain);

  return newlyUnlocked;
}
