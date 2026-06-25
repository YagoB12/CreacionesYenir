import { useState, useEffect } from "react";
import "./scoreGauge.css";

interface Props {
  score: number; // 0 - 100
  size?: number;
}

const getColor = (score: number) => {
  if (score >= 100) return { stroke: "#16a34a", bg: "#dcfce7", text: "#16a34a" }; // verde
  if (score >= 80) return { stroke: "#ca8a04", bg: "#fef9c3", text: "#ca8a04" };  // amarillo
  return { stroke: "#dc2626", bg: "#fee2e2", text: "#dc2626" };                   // rojo
};

const ScoreGauge: React.FC<Props> = ({ score, size = 110 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Anima desde 0 hasta el score real cuando el componente se monta
  useEffect(() => {
    setAnimatedScore(0); // reset por si el modal reutiliza el componente con otro pago

    const timeout = setTimeout(() => {
      setAnimatedScore(score);
    }, 100); // pequeño delay para que el navegador registre el estado inicial en 0

    return () => clearTimeout(timeout);
  }, [score]);

  const colors = getColor(score);
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="score-gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Fondo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.bg}
          strokeWidth={strokeWidth}
        />
        {/* Progreso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="score-gauge-progress"
        />
      </svg>
      <div className="score-gauge-label" style={{ color: colors.text }}>
        {Math.round(animatedScore)}%
      </div>
    </div>
  );
};

export default ScoreGauge;