import { motion } from "framer-motion";
import { Shield, AlertTriangle } from "lucide-react";

interface ConfidenceGaugeProps {
  confidence: number;
  prediction: "fake" | "genuine";
  animate?: boolean;
}

const ConfidenceGauge = ({ confidence, prediction, animate = true }: ConfidenceGaugeProps) => {
  const isGenuine = prediction === "genuine";
  const radius = 70;
  const circumference = Math.PI * radius;
  const offset = circumference - (confidence / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-44 h-24 overflow-hidden">
        <svg viewBox="0 0 160 85" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 10 80 A 70 70 0 0 1 150 80"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <motion.path
            d="M 10 80 A 70 70 0 0 1 150 80"
            fill="none"
            stroke={isGenuine ? "hsl(var(--genuine))" : "hsl(var(--fake))"}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={animate ? { strokeDashoffset: circumference } : { strokeDashoffset: offset }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <motion.span
            className="text-3xl font-bold font-mono"
            style={{ color: isGenuine ? "hsl(var(--genuine))" : "hsl(var(--fake))" }}
            initial={animate ? { opacity: 0 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {confidence}%
          </motion.span>
        </div>
      </div>

      <motion.div
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
          isGenuine
            ? "bg-genuine/10 text-genuine"
            : "bg-fake/10 text-fake"
        }`}
        initial={animate ? { scale: 0.8, opacity: 0 } : {}}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        {isGenuine ? <Shield className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
        {isGenuine
          ? confidence > 80 ? "Genuine Review" : "Likely Genuine Review"
          : confidence > 80 ? "Fake Review" : "Likely Fake Review"}
      </motion.div>
    </div>
  );
};

export default ConfidenceGauge;
