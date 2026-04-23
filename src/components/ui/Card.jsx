/**
 * @file Card.jsx
 * @description Surface container with brand styling.
 *
 * @prop {boolean} padding - When false, renders no internal padding so the
 *   consumer can place full-bleed content (e.g. tables, custom headers).
 *   Defaults to true (p-5).
 */
function Card({ children, className = "", padding = true }) {
  return (
    <div className={`bg-brand-surface border border-brand-border rounded-xl ${padding ? "p-5" : ""} ${className}`}>
      {children}
    </div>
  );
}

export default Card;
