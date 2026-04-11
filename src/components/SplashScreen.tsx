// ─────────────────────────────────────────────────────────────
//  AMML — Animated Splash Screen
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef } from "react";
interface Props { onDone: () => void; }
export default function SplashScreen({ onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/images/logo-amml.png";
    img.onload = () => {
      canvas.style.opacity = "0";
      canvas.style.transition = "opacity 0.8s ease";
      requestAnimationFrame(() => { canvas.style.opacity = "1"; });
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.85;
      const w = img.width * scale, h = img.height * scale;
      const x = (canvas.width - w) / 2, y = (canvas.height - h) / 2;
      ctx.fillStyle = "#000028";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, w, h);
    };
    img.onerror = () => {
      ctx.fillStyle = "#000028";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0064B4";
      ctx.font = "bold 24px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("AMML", canvas.width / 2, canvas.height / 2);
    };
    const timer = setTimeout(onDone, 2800);
    return () => clearTimeout(timer);
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "linear-gradient(160deg, #000028 0%, #003C78 45%, #001F4D 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 0,
    }}>
      <canvas
        ref={canvasRef}
        width={644}
        height={438}
        style={{ width: 322, height: 219, borderRadius: 8 }}
      />
      <div style={{
        marginTop: 28,
        fontFamily: "Outfit, sans-serif",
        fontSize: 13, fontWeight: 600,
        letterSpacing: "0.3em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.35)",
        opacity: 0, animation: "fadeUp 0.5s ease 1.0s forwards",
      }}>
        Abuja Markets Management Limited
      </div>
      <div style={{
        marginTop: 36, width: 200, height: 3,
        background: "rgba(255,255,255,0.1)",
        borderRadius: 99, overflow: "hidden",
        opacity: 0, animation: "fadeUp 0.3s ease 1.2s forwards",
      }}>
        <div style={{
          height: "100%", borderRadius: 99,
          background: "linear-gradient(90deg, #0064B4, #DC6400)",
          animation: "loadBar 1.4s ease 1.5s forwards",
        }} />
      </div>
      <style>{String.raw`@keyframes loadBar { 0% { width: 0%; } 60% { width: 75%; } 85% { width: 90%; } 100% { width: 100%; } } @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
