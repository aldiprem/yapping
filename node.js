function frame(now) {
  const dt = Math.min(40, now - lastTime) / 16.6667;
  lastTime = now;
  footPhase += dt * 0.3;

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  if (pointer.active) {
    const head = segments[0];
    const dx = pointer.x - head.x;
    const dy = pointer.y - head.y;
    const dist = Math.hypot(dx, dy) || 1;
    const maxStep = speed * dt;
    const step = Math.min(maxStep, dist);
    head.x += dx / dist * step;
    head.y += dy / dist * step;
  } else {
    const head = segments[0];
    head.x = lerp(head.x, window.innerWidth / 2, 0.01 * dt);
    head.y = lerp(head.y, window.innerHeight / 2, 0.01 * dt);
  }

  const followDist = 8;
  for (let i = 1; i < segmentCount; i++) {
    const prev = segments[i - 1];
    const cur = segments[i];
    const dx = prev.x - cur.x;
    const dy = prev.y - cur.y;
    const d = Math.hypot(dx, dy) || 1;
    const targetX = prev.x - (dx / d) * followDist;
    const targetY = prev.y - (dy / d) * followDist;
    cur.x = lerp(cur.x, targetX, 0.4 * dt);
    cur.y = lerp(cur.y, targetY, 0.4 * dt);
  }

  // Gambar kaki ular - tampil hanya di segmen tengah 30%-70%
  ctx.lineWidth = 3; // Buat lebih tebal biar keliatan
  for (let i = 0; i < segments.length; i++) {
    const t = i / segments.length;
    if (t < 0.3 || t > 0.7) continue;

    const p = segments[i];
    const size = lerp(18, 6, t); // buat kaki lebih besar

    // Animasi kaki hanya jika pointer aktif dan speed > 0
    let legMovement = 0;
    if (speed > 0.1 && pointer.active) {
      legMovement = Math.sin(footPhase * 20 + i * 1.5) * 0.7; // gerakan lebih jelas
    }

    const legLen = size * 1.4;
    ctx.strokeStyle = 'hsl(180, 90%, 60%)'; // warna kaki kontras

    ctx.beginPath();

    // Sudut kaki kiri dan kanan dengan offset ±0.5 radian
    const baseAngle = Math.PI / 2;
    const leftAngle = baseAngle + legMovement - 0.5;
    const rightAngle = baseAngle + legMovement + 0.5;

    // Kaki kiri
    ctx.moveTo(p.x + Math.cos(leftAngle) * size, p.y + Math.sin(leftAngle) * size);
    ctx.lineTo(p.x + Math.cos(leftAngle) * (size + legLen), p.y + Math.sin(leftAngle) * (size + legLen));

    // Kaki kanan
    ctx.moveTo(p.x + Math.cos(rightAngle) * size, p.y + Math.sin(rightAngle) * size);
    ctx.lineTo(p.x + Math.cos(rightAngle) * (size + legLen), p.y + Math.sin(rightAngle) * (size + legLen));

    ctx.stroke();
  }

  // Gambar badan ular
  for (let i = segments.length - 1; i >= 0; i--) {
    const p = segments[i];
    const t = i / Math.max(1, segments.length - 1);
    const size = lerp(14, 4, t);
    const hue = lerp(140, 200, t);
    const light = lerp(60, 35, t);
    ctx.beginPath();
    ctx.fillStyle = `hsl(${hue} 60% ${light}%)`;
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Gambar lingkaran di pointer
  if (pointer.active) {
    const pulse = 5 * Math.sin(now / 200) + 20;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.arc(pointer.x, pointer.y, pulse, 0, Math.PI * 2);
    ctx.stroke();
  }

  requestAnimationFrame(frame);
}