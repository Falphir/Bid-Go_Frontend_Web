import React, { useEffect, useState } from "react";

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
                setTimeLeft("Leilão terminado");
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

    // ✅ Escolher cor com base no tempo real restante (diffMs)
    let color = "green"; // padrão
    if (diffMs <= 0) color = "red"; // terminou
    else if (diffMs < 60 * 60 * 1000) color = "orange"; // < 1h
    else if (diffMs < 6 * 60 * 60 * 1000) color = "#e6b800"; // < 6h
    // caso contrário, mantém verde

    return <span style={{ color, fontWeight: 600 }}>{timeLeft}</span>;
}
