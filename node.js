// ====== Konfigurasi awal ======
let labels = [
  "Hadiah 1", "Hadiah 2", "Hadiah 3",
  "Hadiah 4", "Hadiah 5", "Hadiah 6"
];

// Palet warna segmen (akan diulang jika kurang)
const baseColors = [
  "#22d3ee","#34d399","#fbbf24","#f87171",
  "#a78bfa","#60a5fa","#f472b6","#f59e0b",
  "#10b981","#ef4444"
];

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const resultEl = document.getElementById("result");
const spinBtn = document.getElementById("spinBtn");
const againBtn = document.getElementById("againBtn");
const labelsInput = document.getElementById("labelsInput");
const applyLabelsBtn = document.getElementById("applyLabels");

// ====== Setup ukuran kanvas responsif (retina ready) ======
function resizeCanvas(){
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(dpr, dpr); // gambar dalam koordinat CSS pixel
}
resizeCanvas();
window.addEventListener("resize", () => { resizeCanvas(); drawWheel(); });

// ====== State animasi ======
let rotation = 0;        // rotasi saat ini (radian)
let spinning = false;    // lock agar tidak double spin

// ====== Menggambar roda ======
function drawWheel(){
  const rect = canvas.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);
  const cx = size/2;
  const cy = size/2;
  const outerR = size/2 - 6;     // radius luar
  const innerR = 0;              // bisa diubah jika mau ada "donut hole"
  const n = labels.length;
  const per = Math.PI * 2 / n;

  // Clear
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Translate ke tengah & apply rotasi
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  // Base ring
  ctx.beginPath();
  ctx.arc(0,0, outerR + 6, 0, Math.PI*2);
  ctx.fillStyle = "#0b1220";
  ctx.fill();

  // Garis tepi
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,255,.12)";
  ctx.beginPath();
  ctx.arc(0,0, outerR, 0, Math.PI*2);
  ctx.stroke();

  // Gambar segmen
  for(let i=0; i<n; i++){
    const start = -Math.PI/2 + i*per;
    const end   = start + per;

    // isi segmen
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.arc(0,0, outerR, start, end);
    ctx.closePath();
    ctx.fillStyle = baseColors[i % baseColors.length];
    ctx.globalAlpha = 0.95;
    ctx.fill();
    ctx.globalAlpha = 1;

    // garis pemisah
    ctx.strokeStyle = "rgba(0,0,0,.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // teks
    const mid = (start + end)/2;
    ctx.save();
    ctx.rotate(mid);
    ctx.translate((innerR + outerR)/2, 0);
    ctx.rotate(Math.PI/2); // agar teks tegak lurus radius
    ctx.fillStyle = "#0b1220";
    // bayangan tipis
    ctx.shadowColor = "rgba(0,0,0,.35)";
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 1;

    // bungkus teks kalau terlalu panjang
    drawTextMultiline(ctx, labels[i], outerR - innerR - 24, 14, 2);
    ctx.restore();
  }

  // Lingkaran tengah
  ctx.beginPath();
  ctx.arc(0,0, Math.max(36, size*0.06), 0, Math.PI*2);
  ctx.fillStyle = "#111827";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,255,.10)";
  ctx.stroke();

  ctx.restore();
}

// teks multiline sederhana
function drawTextMultiline(ctx, text, maxWidth, fontSize=14, maxLines=2){
  ctx.font = `600 ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#e5e7eb";

  const words = text.split(" ");
  const lines = [];
  let line = "";
  for(const w of words){
    const test = line ? line + " " + w : w;
    const wWidth = ctx.measureText(test).width;
    if(wWidth <= maxWidth) {
      line = test;
    } else {
      if(line) lines.push(line);
      line = w;
      if(lines.length === maxLines-1) break;
    }
  }
  if(line) lines.push(line);

  const totalH = lines.length * fontSize * 1.15;
  for(let i=0;i<lines.length;i++){
    ctx.fillText(lines[i], 0, (i - (lines.length-1)/2)*fontSize*1.15);
  }
}

// ====== Logika spin ======
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

function spin(){
  if(spinning || labels.length < 2) return;
  spinning = true;
  spinBtn.disabled = true;
  againBtn.disabled = true;
  resultEl.textContent = "Memutar...";

  const n = labels.length;
  const per = Math.PI * 2 / n;

  // Tentukan pemenang acak
  const winnerIndex = Math.floor(Math.random() * n);

  // Sudut tengah segmen pemenang (dalam koordinat roda sebelum rotasi akhir)
  const winnerCenter = -Math.PI/2 + winnerIndex * per + per/2;

  // Kita ingin winnerCenter berada tepat di -PI/2 (posisi pointer atas)
  // Jadi penyesuaian offset akhir = -winnerCenter
  const offsetToPointer = -winnerCenter;

  // Tambah beberapa putaran penuh untuk efek dramatis
  const extraTurns = 5 + Math.random() * 3; // 5–8 putaran
  const totalRotationDelta = extraTurns * Math.PI * 2 + offsetToPointer;

  const duration = 5000; // ms
  const startTime = performance.now();
  const startRotation = rotation;

  function frame(now){
    const t = Math.min(1, (now - startTime) / duration);
    const eased = easeOutCubic(t);
    rotation = startRotation + totalRotationDelta * eased;

    drawWheel();

    if(t < 1){
      requestAnimationFrame(frame);
    } else {
      // Normalisasi rotasi
      rotation = (rotation % (Math.PI*2) + Math.PI*2) % (Math.PI*2);
      drawWheel();
      const name = labels[winnerIndex];
      resultEl.textContent = `🎉 Pemenang: ${name}`;
      againBtn.disabled = false;
      spinning = false;
    }
  }

  requestAnimationFrame(frame);
}

function spinAgain(){
  if(spinning) return;
  resultEl.textContent = "Hasil akan muncul di sini.";
  spinBtn.disabled = false;
}

// ====== Edit label dinamis ======
applyLabelsBtn.addEventListener("click", () => {
  const raw = labelsInput.value.trim();
  const parts = raw.split(",").map(s => s.trim()).filter(Boolean);
  if(parts.length >= 2){
    labels = parts.slice(0, 64); // batasi agar tidak kebanyakan
    resultEl.textContent = "Daftar segmen diperbarui.";
    drawWheel();
    spinBtn.disabled = false;
    againBtn.disabled = true;
  } else {
    resultEl.textContent = "Minimal 2 segmen ya.";
  }
});

// ====== Event ======
spinBtn.addEventListener("click", spin);
againBtn.addEventListener("click", spinAgain);

// ====== Init ======
drawWheel();