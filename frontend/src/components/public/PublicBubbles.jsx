export default function PublicBubbles() {
  return (
    <div className="public-bubbles" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="public-bubble" />
      ))}
    </div>
  );
}
