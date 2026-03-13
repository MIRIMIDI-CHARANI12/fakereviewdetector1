function analyzeReview(reviewText, rating, reviewerName = '') {
  const flags = [];
  let score = 0;

  const text = reviewText.trim();
  const wordCount = text.split(/\s+/).length;

  // Rule 1: Very short review
  if (wordCount < 5) {
    flags.push('Extremely short review (less than 5 words)');
    score += 30;
  } else if (wordCount < 15) {
    flags.push('Short review with little detail');
    score += 15;
  }

  // Rule 2: Excessive caps
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.5 && wordCount > 3) {
    flags.push('Excessive use of capital letters');
    score += 20;
  }

  // Rule 3: Too many exclamation marks
  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount > 3) {
    flags.push(`Too many exclamation marks (${exclamationCount})`);
    score += 15;
  }

  // Rule 4: Generic spammy phrases
  const genericPhrases = [
    'best product ever', 'highly recommend', 'love it',
    'amazing product', 'great quality', 'five stars',
    'must buy', 'totally worth it', 'exceeded my expectations',
  ];
  const lowerText = text.toLowerCase();
  const foundPhrases = genericPhrases.filter(p => lowerText.includes(p));
  if (foundPhrases.length >= 2) {
    flags.push(`Generic phrases found: "${foundPhrases.join('", "')}"`);
    score += 20;
  }

  // Rule 5: Repetitive words
  const words = lowerText.split(/\s+/);
  const wordFreq = {};
  words.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
  const repeatedWords = Object.entries(wordFreq)
    .filter(([word, count]) => count > 3 && word.length > 3)
    .map(([word]) => word);
  if (repeatedWords.length > 0) {
    flags.push(`Repetitive words: "${repeatedWords.join('", "')}"`);
    score += 15;
  }

  // Rule 6: No product details
  const hasDetails = /\b(model|size|color|feature|button|screen|battery|delivery|price|warranty)\b/i.test(text);
  if (!hasDetails && wordCount > 10) {
    flags.push('No specific product details mentioned');
    score += 10;
  }

  // Rule 7: Extreme rating + vague text
  if ((rating === 1 || rating === 5) && wordCount < 20) {
    flags.push('Extreme rating with very brief explanation');
    score += 15;
  }

  // Rule 8: Suspicious username
  if (reviewerName && /^[A-Za-z]{2,4}\d{3,}$/.test(reviewerName)) {
    flags.push('Reviewer username looks auto-generated');
    score += 10;
  }

  score = Math.min(score, 100);

  let verdict;
  if (score >= 60) verdict = 'FAKE';
  else if (score >= 35) verdict = 'SUSPICIOUS';
  else verdict = 'LIKELY REAL';

  return { score, verdict, flags, wordCount, analyzedAt: new Date().toISOString() };
}

module.exports = { analyzeReview };