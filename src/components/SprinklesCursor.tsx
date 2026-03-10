import { useEffect, useCallback, useRef } from "react";

const SPRINKLE_COLORS = [
  "hsl(20, 50%, 25%)",   // chocolate
  "hsl(340, 70%, 70%)",  // pink
  "hsl(45, 80%, 65%)",   // yellow
  "hsl(160, 40%, 65%)",  // mint
  "hsl(30, 70%, 55%)",   // caramel
];

interface Sprinkle {
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  width: number;
  height: number;
}

const SprinklesCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sprinklesRef = useRef<Sprinkle[]>([]);
  const animRef = useRef<number>(0);
  const lastPos = useRef({ x: 0, y: 0 });
  const mousePos = useRef({ x: -100, y: -100 });
  const cursorImgRef = useRef<HTMLImageElement | null>(null);

  const spawnSprinkles = useCallback((x: number, y: number, count: number) => {
    for (let i = 0; i < count; i++) {
      sprinklesRef.current.push({
        x,
        y,
        color: SPRINKLE_COLORS[Math.floor(Math.random() * SPRINKLE_COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        scale: 0.5 + Math.random() * 0.8,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 2,
        life: 1,
        maxLife: 40 + Math.random() * 30,
        width: 3 + Math.random() * 2,
        height: 10 + Math.random() * 6,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load cursor image
    const img = new Image();
    img.src = "/cake-server-cursor.png";
    img.onload = () => {
      cursorImgRef.current = img;
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 8) {
        spawnSprinkles(e.clientX, e.clientY, 1 + Math.floor(dist / 20));
        lastPos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onClick = (e: MouseEvent) => {
      spawnSprinkles(e.clientX, e.clientY, 12);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick, true);

    const CURSOR_SIZE = 96;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const sprinkles = sprinklesRef.current;

      for (let i = sprinkles.length - 1; i >= 0; i--) {
        const s = sprinkles[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.12;
        s.vx *= 0.98;
        s.rotation += 0.05;
        s.life++;

        const progress = s.life / s.maxLife;
        const alpha = 1 - progress;

        if (progress >= 1) {
          sprinkles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.scale(s.scale, s.scale);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.roundRect(-s.width / 2, -s.height / 2, s.width, s.height, 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw cake server cursor
      if (cursorImgRef.current) {
        ctx.save();
        ctx.drawImage(
          cursorImgRef.current,
          mousePos.current.x - 4,
          mousePos.current.y - 2,
          CURSOR_SIZE * 0.6,
          CURSOR_SIZE
        );
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick, true);
      cancelAnimationFrame(animRef.current);
    };
  }, [spawnSprinkles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};

export default SprinklesCursor;
