import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Sparkles, FileText, History } from "lucide-react";
import ConfidenceGauge from "@/components/ConfidenceGauge";
import SignalList from "@/components/SignalList";
import ReviewHistory from "@/components/ReviewHistory";

const EXAMPLE_REVIEWS = [
  "This phone battery lasts only 2 hours. Very bad product.",
  "AMAZING!!! BEST PRODUCT EVER!!! Must buy immediately!!! You won't regret it!!!",
  "I've been using this laptop for 3 months. The 16GB RAM handles multitasking well, though the fan gets loud under heavy load. Battery lasts about 6 hours with normal use. Screen brightness could be better outdoors.",
  "Worst product ever. Don't buy. Terrible. Horrible. Waste of money.",
  "BEST PRODUCT EVER!!!! BUY NOW!!!! AMAZING AMAZING!!!! BEST BEST BEST!!!!",
];

const Index = () => {
  const [reviewText, setReviewText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!reviewText.trim()) return;
    setIsAnalyzing(true);
    setResult(null);

    await new Promise((r) => setTimeout(r, 1200));

    try {
      const response = await fetch('http://192.168.0.38:3000/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewText: reviewText,
          rating: 5,
          reviewerName: ''
        })
      });

      const data = await response.json();
      const analysisResult = data.analysis;

      setResult(analysisResult);
      setHistory((prev) => [analysisResult, ...prev]);

    } catch (error) {
      console.error('Error connecting to backend:', error);
    }

    setIsAnalyzing(false);
  };

  const handleSelectHistory = (r: any) => {
    setResult(r);
  };

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Header */}
      <header className="border-b border-border/50 glass sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              Fake Review Detector
            </h1>
            <p className="text-xs text-muted-foreground">NLP-powered review authenticity analysis</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-[10px] font-mono text-muted-foreground leading-tight">Model: NLP + ML classification</p>
              <p className="text-[10px] font-mono text-muted-foreground leading-tight">Features: punctuation, sentiment, review length</p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-secondary text-muted-foreground">
              MVP v1.0
            </span>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Input + Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Review Input
                </h2>
              </div>

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Paste or type a product review to analyze..."
                className="w-full h-32 px-4 py-3 rounded-lg bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
              />

              <div className="flex items-center justify-between mt-4">
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_REVIEWS.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setReviewText(ex)}
                      className="text-xs px-3 py-1.5 rounded-md bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                    >
                      Example {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={!reviewText.trim() || isAnalyzing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {isAnalyzing ? "Analyzing..." : "Analyze"}
                </button>
              </div>
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
              {isAnalyzing && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border border-border bg-card p-10 flex flex-col items-center gap-4"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Processing review...</p>
                    <p className="text-xs text-muted-foreground mt-1">Running NLP analysis and classification</p>
                  </div>
                </motion.div>
              )}

              {!isAnalyzing && result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border bg-card p-6"
                >
                  {/* Verdict Box */}
                  <div className={`text-center p-4 rounded-lg mb-4 ${
                    result.verdict === 'FAKE'
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : result.verdict === 'SUSPICIOUS'
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                      : 'bg-green-100 text-green-700 border border-green-300'
                  }`}>
                    <div className="text-3xl font-bold">{result.verdict}</div>
                    <div className="text-sm mt-1">Fake Score: {result.score}/100</div>
                    <div className="text-xs mt-1">{result.wordCount} words analyzed</div>
                  </div>

                  {/* Flags */}
                  {result.flags && result.flags.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        Detected Issues
                      </p>
                      <ul className="space-y-2">
                        {result.flags.map((flag: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                            <span>⚠️</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.flags && result.flags.length === 0 && (
                    <p className="text-sm text-green-600 text-center mt-2">
                      ✅ No suspicious patterns detected
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right column: History */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  History
                </h2>
                {history.length > 0 && (
                  <span className="ml-auto text-xs font-mono text-muted-foreground">
                    {history.length}
                  </span>
                )}
              </div>

              {history.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No reviews analyzed yet
                </p>
              )}

              {history.map((item, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectHistory(item)}
                  className="cursor-pointer p-3 rounded-lg hover:bg-secondary/50 transition-colors border-b last:border-0"
                >
                  <span className={`text-xs font-bold ${
                    item.verdict === 'FAKE' ? 'text-red-500' :
                    item.verdict === 'SUSPICIOUS' ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {item.verdict}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    Score: {item.score}/100
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;