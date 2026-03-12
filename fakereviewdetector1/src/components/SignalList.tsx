import { motion } from "framer-motion";
import { type AnalysisSignal } from "@/lib/reviewAnalyzer";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";

interface SignalListProps {
  signals: AnalysisSignal[];
}

const SignalList = ({ signals }: SignalListProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Analysis Signals
      </h3>
      {signals.map((signal, index) => {
        const isPositive = signal.weight > 0;
        const isNeutral = Math.abs(signal.weight) < 0.05;

        return (
          <motion.div
            key={signal.name}
            className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index + 0.5 }}
          >
            {isNeutral ? (
              <MinusCircle className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
            ) : isPositive ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-genuine" />
            ) : (
              <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-fake" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{signal.name}</span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                  isNeutral ? "bg-muted text-muted-foreground" :
                  isPositive ? "bg-genuine/10 text-genuine" : "bg-fake/10 text-fake"
                }`}>
                  {signal.weight > 0 ? "+" : ""}{signal.weight.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{signal.description}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SignalList;
