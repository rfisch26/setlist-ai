const MESSAGES = [
  "Pulling the setlist…",
  "Reviewing the song choices…",
  "Channeling our inner music journalist…",
  "Crafting your concert story…",
];

interface Props {
  step: number;
}

export default function LoadingState({ step }: Props) {
  const msg = MESSAGES[Math.min(step, MESSAGES.length - 1)];
  return (
    <div className="loading-state">
      <div className="loading-bars">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bar" style={{ animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
      <p className="loading-msg">{msg}</p>
    </div>
  );
}