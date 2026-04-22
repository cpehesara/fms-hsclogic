function Card({ children, className = "", padding = true }) {
  return (
    <div className={`bg-brand-surface border border-brand-border rounded-xl ${padding ? "p-5" : ""} ${className}`}>
      {children}
    </div>
  );
}

export default Card;
