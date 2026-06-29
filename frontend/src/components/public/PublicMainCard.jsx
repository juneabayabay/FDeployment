export default function PublicMainCard({ children, className = '' }) {
  return <div className={`public-main-card ${className}`.trim()}>{children}</div>;
}
