// Heuristic-based fake review analysis engine
// Simulates ML classification using NLP signal detection

export interface AnalysisSignal {
  name: string;
  description: string;
  weight: number; // -1 to 1, negative = fake signal, positive = genuine signal
  detected: boolean;
}

export interface AnalysisResult {
  prediction: "fake" | "genuine";
  confidence: number;
  signals: AnalysisSignal[];
  processedText: string;
  wordCount: number;
  timestamp: Date;
  originalText: string;
}

const STOP_WORDS = new Set([
  "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your",
  "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her",
  "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs",
  "themselves", "what", "which", "who", "whom", "this", "that", "these", "those",
  "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if",
  "or", "because", "as", "until", "while", "of", "at", "by", "for", "with",
  "about", "against", "between", "through", "during", "before", "after", "above",
  "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under",
  "again", "further", "then", "once", "here", "there", "when", "where", "why",
  "how", "all", "both", "each", "few", "more", "most", "other", "some", "such",
  "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s",
  "t", "can", "will", "just", "don", "should", "now",
]);

function preprocess(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
    .join(" ");
}

function detectSignals(text: string): AnalysisSignal[] {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(Boolean);

  const signals: AnalysisSignal[] = [];

  // Excessive exclamation marks
  const exclamationCount = (text.match(/!/g) || []).length;
  signals.push({
    name: "Excessive Punctuation",
    description: `Found ${exclamationCount} exclamation mark(s)`,
    weight: exclamationCount > 3 ? -0.3 : exclamationCount > 1 ? -0.1 : 0.1,
    detected: exclamationCount > 1,
  });

  // All caps words
  const capsWords = words.filter((w) => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w));
  signals.push({
    name: "Capitalized Words",
    description: `${capsWords.length} all-caps word(s) detected`,
    weight: capsWords.length > 2 ? -0.25 : 0.05,
    detected: capsWords.length > 2,
  });

  // Superlative/extreme language
  const extremeWords = ["best", "worst", "amazing", "terrible", "perfect", "horrible", "fantastic", "awful", "incredible", "disgusting", "outstanding", "useless"];
  const foundExtreme = extremeWords.filter((w) => lower.includes(w));
  signals.push({
    name: "Extreme Language",
    description: foundExtreme.length > 0 ? `Found: ${foundExtreme.join(", ")}` : "No extreme language",
    weight: foundExtreme.length > 2 ? -0.35 : foundExtreme.length > 0 ? -0.15 : 0.1,
    detected: foundExtreme.length > 0,
  });

  // Review length
  const wordCount = words.length;
  signals.push({
    name: "Review Length",
    description: `${wordCount} words`,
    weight: wordCount < 5 ? -0.2 : wordCount > 20 ? 0.2 : 0.05,
    detected: wordCount < 10 || wordCount > 50,
  });

  // Repetitive patterns (words)
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  const repetitionRatio = uniqueWords.size / Math.max(words.length, 1);
  signals.push({
    name: "Word Repetition",
    description: `${Math.round(repetitionRatio * 100)}% unique words`,
    weight: repetitionRatio < 0.5 ? -0.35 : repetitionRatio < 0.7 ? -0.15 : 0.1,
    detected: repetitionRatio < 0.7,
  });

  // Repetitive phrases (bigrams/trigrams)
  const bigramCounts: Record<string, number> = {};
  const lowerWords = words.map((w) => w.toLowerCase());
  for (let i = 0; i < lowerWords.length - 1; i++) {
    const bigram = `${lowerWords[i]} ${lowerWords[i + 1]}`;
    bigramCounts[bigram] = (bigramCounts[bigram] || 0) + 1;
  }
  const repeatedPhrases = Object.entries(bigramCounts).filter(([, c]) => c > 1);
  const repeatedPhraseNames = repeatedPhrases.map(([p, c]) => `"${p}" (×${c})`).slice(0, 3);
  signals.push({
    name: "Repetitive Phrases",
    description: repeatedPhrases.length > 0 ? `Found: ${repeatedPhraseNames.join(", ")}` : "No repeated phrases",
    weight: repeatedPhrases.length > 2 ? -0.4 : repeatedPhrases.length > 0 ? -0.25 : 0.1,
    detected: repeatedPhrases.length > 0,
  });

  // Specific detail detection (numbers, measurements)
  const hasSpecifics = /\d+\s*(hour|day|week|month|year|inch|cm|mm|gb|mb|kg|lb|oz|mile|km)/i.test(text);
  signals.push({
    name: "Specific Details",
    description: hasSpecifics ? "Contains measurable details" : "No specific measurements found",
    weight: hasSpecifics ? 0.25 : -0.1,
    detected: hasSpecifics,
  });

  // Generic phrases
  const genericPhrases = ["highly recommend", "must buy", "don't buy", "waste of money", "best ever", "love it", "hate it", "five stars", "5 stars", "one star", "1 star"];
  const foundGeneric = genericPhrases.filter((p) => lower.includes(p));
  signals.push({
    name: "Generic Phrases",
    description: foundGeneric.length > 0 ? `Found: "${foundGeneric[0]}"` : "No generic phrases",
    weight: foundGeneric.length > 1 ? -0.3 : foundGeneric.length > 0 ? -0.15 : 0.1,
    detected: foundGeneric.length > 0,
  });

  // Sentence variety
  const avgSentenceLen = words.length / Math.max(sentences.length, 1);
  signals.push({
    name: "Sentence Structure",
    description: `Avg ${Math.round(avgSentenceLen)} words per sentence`,
    weight: sentences.length > 2 && avgSentenceLen > 5 ? 0.2 : -0.1,
    detected: sentences.length <= 1,
  });

  return signals;
}

export function analyzeReview(text: string): AnalysisResult {
  const processedText = preprocess(text);
  const signals = detectSignals(text);

  // Calculate weighted score
  const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0);
  const maxPossibleRange = signals.length * 0.35;

  // Normalize to 0-1 range where 0 = definitely fake, 1 = definitely genuine
  const normalizedScore = Math.max(0, Math.min(1, (totalWeight + maxPossibleRange) / (2 * maxPossibleRange)));

  const prediction = normalizedScore >= 0.5 ? "genuine" : "fake";
  const confidence = Math.round(Math.abs(normalizedScore - 0.5) * 2 * 40 + 55); // 55-95% range

  return {
    prediction,
    confidence: Math.min(confidence, 95),
    signals,
    processedText,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    timestamp: new Date(),
    originalText: text,
  };
}
