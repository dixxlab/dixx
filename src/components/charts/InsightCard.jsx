import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight, AlertTriangle, Rocket, Target } from 'lucide-react';
import { T as C } from '../../theme/tokens';

const insightIconMap = {
  up: TrendingUp,
  down: TrendingDown,
  right: ArrowRight,
  alert: AlertTriangle,
  rocket: Rocket,
  target: Target,
};

export const InsightCard = ({ insights }) => {
  if (insights.length === 0) return null;
  return (
    <div className="space-y-2 mb-4">
      {insights.map((ins, i) => {
        const tone = ins.type === 'success' ? C.success : ins.type === 'warning' ? C.warning : C.info;
        const Icon = insightIconMap[ins.icon];
        return (
          <motion.div
            key={i}
            className="rounded-2xl p-3 flex items-start gap-2"
            style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)`, border: `1px solid ${tone}`, borderRadius: C.radiusLg }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <div className="flex-shrink-0 mt-0.5" style={{ color: tone }}>{Icon && <Icon size={16} />}</div>
            <div className="text-xs leading-relaxed" style={{ color: C.text }}>{ins.text}</div>
          </motion.div>
        );
      })}
    </div>
  );
};
