import { useState } from 'react';
import { Lightbulb, Info } from 'lucide-react';
import type { CvQuality } from '../types/quality';

interface AtsScoreCardProps {
  quality: CvQuality;
  embedded?: boolean; // true = dipakai di dalam kartu lain (tanpa border & margin)
}

function tone(score: number) {
  if (score >= 75) return { text: 'text-success', stroke: '#16A34A', bg: 'bg-success-bg' };
  if (score >= 50) return { text: 'text-warning', stroke: '#D97706', bg: 'bg-warning-bg' };
  return { text: 'text-error', stroke: '#DC2626', bg: 'bg-error-bg' };
}

function ScoreRing({ score }: { score: number }) {
  const size = 84;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const t = tone(score);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={t.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-lg font-medium ${t.text}`}>
        {score}%
      </span>
    </div>
  );
}

export function AtsScoreCard({ quality, embedded = false }: AtsScoreCardProps) {
  const [activeKey, setActiveKey] = useState(quality.factors[0]?.key);
  const activeFactor = quality.factors.find((f) => f.key === activeKey) ?? quality.factors[0];

  return (
    <div
      className={
        embedded ? 'pt-1' : 'bg-surface border border-border-subtle rounded-xl p-6 mt-6'
      }
    >
      <div className="flex items-center gap-1.5 mb-1">
        <p className="text-base font-medium text-gray-900">Skor ATS CV</p>
        <span title="Dihitung dari 4 faktor: dampak kuantitatif, panjang CV, keringkasan bullet point, dan kelengkapan bagian.">
          <Info size={14} className="text-gray-400" />
        </span>
      </div>
      <p className="text-xs text-text-secondary mb-5">
        Pastikan resume kamu ramah ATS dengan menganalisis faktor-faktornya.
      </p>

      <div className="flex items-center gap-5 mb-6">
        <ScoreRing score={quality.atsScore} />
        <p className="text-sm text-gray-900">{quality.headline}</p>
      </div>

      <p className="text-sm font-medium text-gray-900 mb-3">Faktor Skor</p>
      <div className="grid grid-cols-4 gap-3 mb-2">
        {quality.factors.map((f) => {
          const t = tone(f.score);
          const isActive = f.key === activeKey;
          return (
            <button
              key={f.key}
              onClick={() => setActiveKey(f.key)}
              className={`text-left rounded-xl border p-3 transition-colors ${
                isActive ? 'border-navy bg-navy/5' : 'border-border-subtle hover:border-navy/40'
              }`}
            >
              <p className={`text-base font-medium ${t.text}`}>{f.score}%</p>
              <p className="text-xs text-text-secondary mt-0.5">{f.label}</p>
            </button>
          );
        })}
      </div>
      {activeFactor && (
        <p className="text-xs text-text-secondary mb-6">{activeFactor.detail}</p>
      )}

      <p className="text-xs font-medium text-gray-900 tracking-wide uppercase mb-1.5">Catatan</p>
      <p className="text-sm text-gray-700 mb-6">{quality.catatan}</p>

      <p className="text-xs font-medium text-gray-900 tracking-wide uppercase mb-2">Tips</p>
      <ul className="space-y-2.5">
        {quality.tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-warning-bg text-warning flex items-center justify-center shrink-0">
              <Lightbulb size={13} />
            </span>
            <p className="text-sm text-gray-700">{tip.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}