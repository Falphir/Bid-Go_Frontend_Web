import React, { useEffect, useState } from "react";
import "./Countdown.css";

/**
 * Countdown label for auction end time.
 *
 * Given an `endDate`, it displays a compact time-left string (e.g.
 * `2d 5h` or `3h 10m`) and changes color as the deadline approaches.
 *
 * @param {{ endDate: (string|Date) }} props - Component props with the auction end date.
 * @returns {JSX.Element} Formatted countdown span.
 */
export default function Countdown({ endDate }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [diffMs, setDiffMs] = useState(0);

  useEffect(() => {
    if (!endDate) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const diff = end - now;

      setDiffMs(diff);

      if (diff <= 0) {
        setTimeLeft("Auction ended");
        return;
      }

      const totalMinutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [endDate]);

  let color = "green";
  if (diffMs <= 0) color = "red";
  else if (diffMs < 60 * 60 * 1000) color = "orange";
  else if (diffMs < 6 * 60 * 60 * 1000) color = "#e6b800";

  return <span style={{ color, fontWeight: 600 }}>{timeLeft}</span>;
}
