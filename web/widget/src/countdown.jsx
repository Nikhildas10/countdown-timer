import { h, render } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import "./style.css";

const pad = (n) => String(n).padStart(2, "0");

function calcTimeLeft(endDate) {
    const diff = new Date(endDate) - Date.now();
    if (diff <= 0) return null;
    const total = Math.floor(diff / 1000);
    return {
        total,
        days: Math.floor(total / 86400),
        hours: Math.floor((total % 86400) / 3600),
        minutes: Math.floor((total % 3600) / 60),
        seconds: Math.floor(total % 60),
    };
}

function contrastColor(hex = "#000000") {
    const h = hex.replace("#", "").padEnd(6, "0");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.55 ? "#111111" : "#ffffff";
}

function UrgencyBanner({ onClose }) {
    return (
        <div class="ct-notif-banner">
            <span class="ct-notif-banner__msg">
                Hurry! This offer expires in less than 5 minutes!
            </span>
            <button class="ct-notif-banner__close" onClick={onClose} aria-label="Close">
                &times;
            </button>
        </div>
    );
}

function CountdownBar({ timer }) {
    const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(timer.endDate));
    const [showBanner, setShowBanner] = useState(false);
    const expired = useRef(false);

    const position = (timer.timerPosition || "Top").toLowerCase();
    const size = (timer.timerSize || "Medium").toLowerCase();
    const urgency = timer.urgencyNotification || "None";
    const bg = timer.color || "#1a1a2e";
    const fg = contrastColor(bg);

    useEffect(() => {
        const tick = setInterval(() => {
            const left = calcTimeLeft(timer.endDate);
            setTimeLeft(left);

            if (!left && !expired.current) {
                expired.current = true;
                clearInterval(tick);
                if (position === "top") document.body.classList.remove("ct-body-top-offset");
                return;
            }

            if (left && urgency !== "None" && left.total <= 300) {
                if (urgency === "Banner") setShowBanner(true);
            } else {
                setShowBanner(false);
            }
        }, 1000);

        if (position === "top") document.body.classList.add("ct-body-top-offset");
        if (position === "bottom") document.body.classList.add("ct-body-bottom-offset");

        return () => {
            clearInterval(tick);
            if (position === "top") document.body.classList.remove("ct-body-top-offset");
            if (position === "bottom") document.body.classList.remove("ct-body-bottom-offset");
        };
    }, []);

    if (!timeLeft) return null;

    const isUrgent = timeLeft.total <= 300;

    return (
        <>
            {showBanner && <UrgencyBanner onClose={() => setShowBanner(false)} />}

            <div
                class={[
                    "ct-bar",
                    `ct-pos-${position}`,
                    `ct-size-${size}`,
                    isUrgent && urgency === "Color pulse" ? "ct-urgent-pulse" : "",
                ].join(" ")}
                style={{ backgroundColor: bg, color: fg }}
            >
                {timer.description && (
                    <span class="ct-desc">{timer.description}</span>
                )}

                <div class="ct-clock">
                    <div class="ct-unit">
                        <span class="ct-num">{pad(timeLeft.days)}</span>
                        <span class="ct-lbl">Days</span>
                    </div>
                    <span class="ct-sep">:</span>
                    <div class="ct-unit">
                        <span class="ct-num">{pad(timeLeft.hours)}</span>
                        <span class="ct-lbl">Hrs</span>
                    </div>
                    <span class="ct-sep">:</span>
                    <div class="ct-unit">
                        <span class="ct-num">{pad(timeLeft.minutes)}</span>
                        <span class="ct-lbl">Mins</span>
                    </div>
                    <span class="ct-sep">:</span>
                    <div class="ct-unit">
                        <span class="ct-num">{pad(timeLeft.seconds)}</span>
                        <span class="ct-lbl">Secs</span>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function App({ apiHost, shop }) {
    const [timers, setTimers] = useState([]);

    useEffect(() => {
        if (!apiHost || !shop) return;
        fetch(`https://${apiHost}/api/storefront/timers?shop=${encodeURIComponent(shop)}`)
            .then((r) => r.json())
            .then((data) => setTimers(data.timers || []))
            .catch((err) => console.error("[CountdownWidget]", err));
    }, []);

    return (
        <>
            {timers.map((timer) => (
                <CountdownBar key={timer._id} timer={timer} />
            ))}
        </>
    );
}
