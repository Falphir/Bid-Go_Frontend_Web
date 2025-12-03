/**
 * @typedef {Object} ButtonProps
 * @property {*} children - Content to display inside the button.
 * @property {"primary"|"secondary"} [variant="primary"] - Visual style variant of the button.
 * @property {function()} [onClick] - Click event handler.
 * @property {"button"|"submit"|"reset"} [type="button"] - Native button type.
 * @property {boolean} [disabled=false] - Whether the button is disabled.
 * @property {Object} [style] - Inline styles applied to the button element.
 * @property {string} [className] - Additional CSS class names to append.
 */

import "./Button.css";

/**
 * Reusable button component used across the Bid-Go application.
 *
 * It wraps the native HTML `<button>` element and applies the
 * shared `app-btn` styling and the selected visual variant.
 *
 * @param {ButtonProps} props - Button configuration and content.
 * @returns {JSX.Element} Rendered button element.
 */
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
