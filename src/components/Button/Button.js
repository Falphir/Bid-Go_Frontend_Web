import "./Button.css";

// Botão reutilizável
export default function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
  style = {},
  className = "",
}) {
  return (
    <button
      className={`app-btn ${variant} ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}
