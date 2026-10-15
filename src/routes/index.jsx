import { Link } from "@tanstack/react-router";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Brush,
  CheckCircle2,
  Download,
  Eraser,
  Palette,
  Pencil,
  Redo2,
  Trash2,
  Undo2,
  Users,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import downArrowImage from "../assets/down_arrow.png";
import leftArrowImage from "../assets/left_arrow.png";
import normalImage from "../assets/normal.png";
import rightArrowImage from "../assets/right_arrow.png";
import upArrowImage from "../assets/up_arrow.png";
export const Route = createFileRoute("/")({
  component: LandingPage,
});

const keyboardImages = {
  normal: normalImage,
  down: downArrowImage,
  left: leftArrowImage,
  right: rightArrowImage,
  up: upArrowImage,
};

const paintColors = [
  "#000000",
  "#808080",
  "#800000",
  "#808000",
  "#008000",
  "#008080",
  "#000080",
  "#800080",
  "#804000",
  "#0080ff",
  "#8000ff",
  "#ffffff",
  "#c0c0c0",
  "#ff0000",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#0000ff",
  "#ff00ff",
  "#ff8040",
];

const paintPresets = {
  logo: { label: "Penjelasan Logo", image: "/logo_explain.png" },
  mascot: { label: "Penjelasan Maskot", image: "/mascot_explain.png" },
  blank: { label: "Canvas Polos", image: null },
};

function PaintStudio() {
  const canvasRef = useRef(null);
  const historyRef = useRef([]);
  const historyStepRef = useRef(-1);
  const drawingRef = useRef(false);
  const toolRef = useRef("pencil");
  const colorRef = useRef("#000000");
  const sizeRef = useRef(2);
  const [activePreset, setActivePreset] = useState("logo");
  const [activeTool, setActiveTool] = useState("pencil");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(2);
  const [coordinates, setCoordinates] = useState("");

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const history = historyRef.current.slice(0, historyStepRef.current + 1);
    history.push(
      canvas
        .getContext("2d", { willReadFrequently: true })
        .getImageData(0, 0, canvas.width, canvas.height),
    );
    historyRef.current = history;
    historyStepRef.current = history.length - 1;
  }, []);

  const resetHistory = useCallback(() => {
    historyRef.current = [];
    historyStepRef.current = -1;
    saveState();
  }, [saveState]);

  const paintPreset = useCallback(
    (presetKey) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const preset = paintPresets[presetKey];
      if (preset.image) {
        const image = new Image();
        image.onload = () => {
          const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
          const width = image.width * scale;
          const height = image.height * scale;
          context.drawImage(
            image,
            (canvas.width - width) / 2,
            (canvas.height - height) / 2,
            width,
            height,
          );
          resetHistory();
        };
        image.onerror = () => {
          resetHistory();
        };
        image.src = preset.image;
      } else {
        resetHistory();
      }
      setActivePreset(presetKey);
    },
    [resetHistory],
  );

  useEffect(() => {
    paintPreset("logo");
  }, [paintPreset]);

  const setPaintTool = (tool) => {
    toolRef.current = tool;
    setActiveTool(tool);
    const nextSize = tool === "pencil" ? 2 : tool === "brush" ? 8 : 18;
    sizeRef.current = nextSize;
    setSize(nextSize);
  };

  const setPaintColor = (nextColor) => {
    colorRef.current = nextColor;
    setColor(nextColor);
  };

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) * canvas.width) / bounds.width,
      y: ((event.clientY - bounds.top) * canvas.height) / bounds.height,
    };
  };

  const draw = (event) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const point = getCanvasPoint(event);
    context.lineWidth = sizeRef.current;
    context.lineCap = toolRef.current === "brush" ? "round" : "square";
    context.lineJoin = toolRef.current === "brush" ? "round" : "miter";
    context.strokeStyle = toolRef.current === "eraser" ? "#ffffff" : colorRef.current;
    context.lineTo(point.x, point.y);
    context.stroke();
    context.beginPath();
    context.moveTo(point.x, point.y);
    setCoordinates(`${Math.floor(point.x)}, ${Math.floor(point.y)}`);
  };

  const startDrawing = (event) => {
    drawingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const context = canvasRef.current.getContext("2d", { willReadFrequently: true });
    const point = getCanvasPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
    draw(event);
  };

  const stopDrawing = (event) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    canvasRef.current.getContext("2d", { willReadFrequently: true }).beginPath();
    saveState();
  };

  const restoreState = (step) => {
    const canvas = canvasRef.current;
    const state = historyRef.current[step];
    if (!canvas || !state) return;
    canvas.getContext("2d", { willReadFrequently: true }).putImageData(state, 0, 0);
    historyStepRef.current = step;
  };

  const undo = () => {
    if (historyStepRef.current > 0) restoreState(historyStepRef.current - 1);
  };

  const redo = () => {
    if (historyStepRef.current < historyRef.current.length - 1) {
      restoreState(historyStepRef.current + 1);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const downloadCanvas = () => {
    const link = document.createElement("a");
    link.download = "z-up-canvas.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="paint-studio">
      <div className="paint-presets" aria-label="Pilih isi canvas">
        {Object.entries(paintPresets).map(([key, preset]) => (
          <button
            key={key}
            type="button"
            className={`paint-preset ${activePreset === key ? "active" : ""}`}
            onClick={() => paintPreset(key)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="paint-window">
        <div className="paint-titlebar">
          <span className="flex items-center gap-2">
            <Palette size={14} />
            untitled - Z UP Paint
          </span>
          <span className="paint-window-controls" aria-hidden="true">
            _ □ ×
          </span>
        </div>
        <div className="paint-menu" aria-hidden="true">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Image</span>
          <span>Colors</span>
          <span>Help</span>
        </div>

        <div className="paint-workspace">
          <aside className="paint-toolbar" aria-label="Alat menggambar">
            <button
              type="button"
              className={`paint-tool ${activeTool === "pencil" ? "active" : ""}`}
              onClick={() => setPaintTool("pencil")}
              title="Pensil"
              aria-label="Pensil"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              className={`paint-tool ${activeTool === "brush" ? "active" : ""}`}
              onClick={() => setPaintTool("brush")}
              title="Kuas"
              aria-label="Kuas"
            >
              <Brush size={15} />
            </button>
            <button
              type="button"
              className={`paint-tool ${activeTool === "eraser" ? "active" : ""}`}
              onClick={() => setPaintTool("eraser")}
              title="Penghapus"
              aria-label="Penghapus"
            >
              <Eraser size={15} />
            </button>
            <div className="paint-size-options" aria-label="Ukuran garis">
              {[2, 5, 10, 18].map((lineSize) => (
                <button
                  type="button"
                  key={lineSize}
                  className={size === lineSize ? "active" : ""}
                  onClick={() => {
                    sizeRef.current = lineSize;
                    setSize(lineSize);
                  }}
                  aria-label={`Ukuran garis ${lineSize}`}
                >
                  <span style={{ height: `${lineSize}px` }} />
                </button>
              ))}
            </div>
          </aside>
          <div className="paint-canvas-wrapper">
            <canvas
              ref={canvasRef}
              width="900"
              height="560"
              className="paint-canvas"
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerCancel={stopDrawing}
              onPointerLeave={() => setCoordinates("")}
              aria-label="Canvas Z UP Paint yang dapat digambar"
            />
          </div>
        </div>

        <div className="paint-palette">
          <div className="paint-selected-colors" aria-label="Warna aktif">
            <span style={{ backgroundColor: color }} />
            <span />
          </div>
          <div className="paint-color-grid">
            {paintColors.map((paintColor) => (
              <button
                type="button"
                key={paintColor}
                className="paint-color"
                style={{ backgroundColor: paintColor }}
                onClick={() => setPaintColor(paintColor)}
                aria-label={`Pilih warna ${paintColor}`}
              />
            ))}
          </div>
          <div className="paint-actions">
            <button type="button" className="paint-action" onClick={undo} title="Urungkan">
              <Undo2 size={14} />
            </button>
            <button type="button" className="paint-action" onClick={redo} title="Ulangi">
              <Redo2 size={14} />
            </button>
            <button
              type="button"
              className="paint-action"
              onClick={clearCanvas}
              title="Kosongkan canvas"
            >
              <Trash2 size={14} />
            </button>
            <button type="button" className="paint-save" onClick={downloadCanvas}>
              <Download size={14} />
              Simpan PNG
            </button>
          </div>
        </div>
        <div className="paint-status">
          <span>Untuk berkreasi, pilih alat lalu gambar di canvas.</span>
          <span>{coordinates}</span>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [keyboardDirection, setKeyboardDirection] = useState("normal");
  const [newsPosts, setNewsPosts] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) return undefined;
    const loadNews = async () => {
      const { data, error } = await supabase
        .from("news_posts")
        .select("id, title, excerpt, content_html, cover_image_url, created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) {
        console.error("Gagal memuat berita landing page", error);
        return;
      }
      setNewsPosts(data || []);
    };
    loadNews();
    return undefined;
  }, []);

  const handleKeyboardHover = (event) => {
    const { offsetX, offsetY } = event.nativeEvent;
    const { offsetWidth, offsetHeight } = event.currentTarget;
    const x = offsetX - offsetWidth / 2;
    const y = offsetY - offsetHeight / 2;

    if (Math.abs(x) > Math.abs(y)) {
      setKeyboardDirection(x > 0 ? "right" : "left");
    } else {
      setKeyboardDirection(y > 0 ? "down" : "up");
    }
  };

  const handleKeyboardClick = () => {
    if (keyboardDirection === "down") {
      document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
    } else if (keyboardDirection === "left") {
      document.getElementById("news")?.scrollIntoView({ behavior: "smooth" });
    } else if (keyboardDirection === "right") {
      navigate({ to: "/login" });
    }
  };

  return (
    <div className="landing-page min-h-screen bg-background flex flex-col font-body">
      {/* Header / Navigasi Atas */}
      <header className="w-full border-b-2 border-foreground bg-primary px-6 py-4 flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <img src="/logo.png" alt="Z UP Logo" className="h-15 w-auto object-contain" />
          </Link>
        </div>
        <nav>
          {/* Diubah mengarah ke /login dan menggunakan warna Navy Blue */}
          <Link to="/login">
            <Button className="bg-foreground text-background hover:bg-foreground/90 px-6">
              Masuk Dasbor
            </Button>
          </Link>
        </nav>
      </header>

      {/* Bagian Hero Section */}
      <main className="flex-1 bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 px-6 py-16 sm:px-10 lg:flex-row lg:px-16 lg:py-24">
          {/* Konten Kiri (Teks) */}
          <div className="w-full lg:w-[48%]">
            {/* Badge Label */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border-2 border-primary bg-primary/10 text-primary text-sm font-bold w-fit">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Platform Pengembangan Karier Anak Muda</span>
            </div>

            {/* Headline Utama */}
            <h1 className="font-display text-6xl leading-[0.9] tracking-normal sm:text-8xl lg:text-9xl">
              Wujudkan Potensi <br />
              <span className="text-primary">Generasi Z</span>
            </h1>

            {/* Deskripsi Natural (Copywriting Baru) */}
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted lg:text-xl">
              Z UP hadir buat kamu yang ingin bangun karier dari nol. Kami bantu kenali minatmu,
              asah skill lewat pelatihan yang pas, bikin CV otomatis yang tembus HRD, sampai
              ngehubungin kamu langsung ke lowongan kerja atau proyek UMKM terdekat.
            </p>

            {/* Tombol CTA yang langsung diarahkan ke halaman Login */}
            <div className="mt-8">
              <Link to="/login">
                <Button
                  size="lg"
                  className="bg-primary text-foreground hover:bg-primary/90 px-8 py-6 text-lg group"
                >
                  Mulai Sekarang
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Statistik Bawah */}
            <div className="mt-10 flex gap-10 border-t-2 border-ink-muted/50 pt-8">
              <div>
                <div className="flex items-center gap-2 text-ink-muted mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Talenta Bergabung</span>
                </div>
                <p className="text-3xl font-bold text-primary">2.450+</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-ink-muted mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Tingkat Penempatan</span>
                </div>
                <p className="text-3xl font-bold text-accent">78%</p>
              </div>
            </div>
          </div>

          {/* Konten Kanan (Keyboard interaktif) */}
          <div className="w-full lg:w-[48%]">
            <div
              className="relative mx-auto w-full max-w-2xl cursor-pointer transition-transform duration-500 hover:scale-[1.02]"
              onMouseMove={handleKeyboardHover}
              onMouseLeave={() => setKeyboardDirection("normal")}
              onClick={handleKeyboardClick}
              aria-label="Keyboard navigasi interaktif"
              role="button"
              tabIndex={0}
            >
              <img
                src={keyboardImages[keyboardDirection]}
                alt={`Keyboard Z UP arah ${keyboardDirection}`}
                className="h-auto w-full object-contain transition-opacity duration-150"
              />
            </div>
          </div>
        </div>
      </main>

      <section id="about" className="scroll-mt-24 bg-background px-8 py-20 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Tentang Z UP
          </p>
          <h2 className="max-w-3xl font-heading text-4xl font-extrabold text-foreground lg:text-6xl">
            Mulai dari potensi, tumbuh jadi prestasi.
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Z UP membantu anak muda mengenali kekuatan diri, mengembangkan skill yang relevan, dan
            menemukan langkah karier yang sesuai. Semua dirancang agar perjalananmu dari belajar
            sampai siap kerja terasa lebih jelas dan terarah.
          </p>
          <PaintStudio />
        </div>
      </section>

      <section id="news" className="scroll-mt-24 bg-ink px-8 py-20 text-ink-foreground lg:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-primary">
            News & Update
          </p>
          <h2 className="max-w-3xl font-heading text-4xl font-extrabold lg:text-6xl">
            Cerita dan peluang terbaru dari Z UP.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {newsPosts.map((post) => (
              <article
                key={post.id}
                className="cursor-pointer overflow-hidden border-2 border-ink-muted/50 bg-ink-foreground/5 transition hover:-translate-y-1 hover:border-primary"
                onClick={() => setSelectedNews(post)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedNews(post);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Baca berita ${post.title}`}
              >
                {post.cover_image_url && (
                  <img
                    src={post.cover_image_url}
                    alt=""
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-6">
                  <p className="font-mono text-sm font-bold text-primary">Berita</p>
                  <h3 className="mt-3 font-heading text-2xl font-bold">{post.title}</h3>
                  <p className="mt-3 text-ink-muted">{post.excerpt}</p>
                  <p className="mt-5 text-sm font-bold text-primary">Baca selengkapnya →</p>
                </div>
              </article>
            ))}
            {newsPosts.length === 0 && (
              <>
                <article className="border-2 border-ink-muted/50 bg-ink-foreground/5 p-6">
                  <p className="font-mono text-sm font-bold text-primary">Segera Hadir</p>
                  <h3 className="mt-3 font-heading text-2xl font-bold">
                    Program pengembangan skill
                  </h3>
                  <p className="mt-3 text-ink-muted">
                    Nantikan kabar terbaru tentang pelatihan dan aktivitas pengembangan karier.
                  </p>
                </article>
                <article className="border-2 border-ink-muted/50 bg-ink-foreground/5 p-6">
                  <p className="font-mono text-sm font-bold text-accent">Peluang</p>
                  <h3 className="mt-3 font-heading text-2xl font-bold">Temukan langkah kariermu</h3>
                  <p className="mt-3 text-ink-muted">
                    Dapatkan informasi peluang kerja dan proyek yang relevan dengan potensimu.
                  </p>
                </article>
                <article className="border-2 border-ink-muted/50 bg-ink-foreground/5 p-6">
                  <p className="font-mono text-sm font-bold text-primary">Komunitas</p>
                  <h3 className="mt-3 font-heading text-2xl font-bold">Bertumbuh bersama</h3>
                  <p className="mt-3 text-ink-muted">
                    Ikuti cerita inspiratif dan insight dari talenta muda Indonesia.
                  </p>
                </article>
              </>
            )}
          </div>
          {selectedNews && (
            <article className="mt-8 border-2 border-primary bg-background p-6 text-foreground shadow-[5px_5px_0_var(--primary)] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-sm font-bold text-primary">Berita Z UP</p>
                  <h3 className="mt-2 font-heading text-3xl font-normal">{selectedNews.title}</h3>
                </div>
                <button
                  type="button"
                  className="border-2 border-foreground px-3 py-1 text-sm font-bold hover:bg-primary"
                  onClick={() => setSelectedNews(null)}
                >
                  Tutup
                </button>
              </div>
              {selectedNews.cover_image_url && (
                <img
                  src={selectedNews.cover_image_url}
                  alt=""
                  className="mt-6 max-h-96 w-full object-cover"
                />
              )}
              <div
                className="news-content mt-6 max-w-4xl leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeNewsHtml(selectedNews.content_html) }}
              />
            </article>
          )}
        </div>
      </section>

      <footer className="border-t-2 border-foreground bg-primary px-8 py-10 text-foreground lg:px-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <img src="/logo.png" alt="Z UP Logo" className="h-14 w-auto object-contain" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              Temukan potensi, bangun skill, dan melangkah lebih siap bersama Z UP.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 font-mono text-xs font-semibold uppercase">
            <Link className="underline underline-offset-4 hover:no-underline" to="/login">
              Masuk
            </Link>
            <a className="underline underline-offset-4 hover:no-underline" href="#about">
              Tentang
            </a>
            <a className="underline underline-offset-4 hover:no-underline" href="#news">
              Update
            </a>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl border-t-2 border-foreground/30 pt-4 font-mono text-xs">
          © 2026 Z UP. Tumbuh bersama generasi baru.
        </div>
      </footer>
    </div>
  );
}

function sanitizeNewsHtml(value = "") {
  return value.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
}
