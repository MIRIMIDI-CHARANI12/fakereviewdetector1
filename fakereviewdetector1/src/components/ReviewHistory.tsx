import { type AnalysisResult } from "@/lib/reviewAnalyzer";
import { Shield, AlertTriangle, Clock } from "lucide-react";

interface ReviewHistoryProps {
  history: AnalysisResult[];
  onSelect: (result: AnalysisResult) => void;
}

const ReviewHistory = ({ history, onSelect }: ReviewHistoryProps) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No reviews analyzed yet.</p>
        <p className="text-xs mt-1">Enter a review above to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((result, index) => {
        const isGenuine = result.prediction === "genuine";
        return (
          <button
            key={index}
            onClick={() => onSelect(result)}
            className="w-full text-left p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-md ${isGenuine ? "bg-genuine/10" : "bg-fake/10"}`}>
                {isGenuine ? (
                  <Shield className="w-3.5 h-3.5 text-genuine" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-fake" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">
                  {result.originalText.slice(0, 60)}
                  {result.originalText.length > 60 ? "…" : ""}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs font-mono font-semibold ${isGenuine ? "text-genuine" : "text-fake"}`}>
                    {result.prediction.toUpperCase()} · {result.confidence}%
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ReviewHistory;
