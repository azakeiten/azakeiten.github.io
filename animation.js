/* ================================================================
   animation.js — Canvasアニメーション（麻の葉パターン・パーティクル）
   ================================================================ */
(function() {
  const canvas = document.getElementById('economicCanvas');
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = false;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function drawAsanohaPattern(x, y, size, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = 'rgba(200, 169, 110, 0.3)';
    ctx.lineWidth = 1;

    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size / 3;

    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle + Math.PI / 3) * radius;
      const y2 = centerY + Math.sin(angle + Math.PI / 3) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius / 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  class PixelParticle {
    constructor() { this.reset(); }

    reset() {
      this.x = Math.floor(Math.random() * canvas.width);
      this.y = Math.floor(Math.random() * canvas.height);
      this.size = Math.floor(Math.random() * 4) + 2;
      this.speedX = (Math.random() - 0.5) * 1.5;
      this.speedY = (Math.random() - 0.5) * 1.5;
      this.opacity = Math.random() * 0.3 + 0.1;
      this.color = this.getRandomSoftColor();
      this.showPattern = Math.random() > 0.7;
    }

    getRandomSoftColor() {
      const colors = [
        'rgba(200, 169, 110, ',
        'rgba(139, 115, 85, ',
        'rgba(232, 213, 176, ',
        'rgba(188, 170, 145, ',
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;

      this.opacity = 0.1 + Math.sin(Date.now() * 0.0005 + this.x * 0.01) * 0.2;
    }

    draw() {
      ctx.fillStyle = this.color + this.opacity + ')';
      ctx.fillRect(this.x, this.y, this.size, this.size);

      if (this.showPattern && this.size >= 4) {
        drawAsanohaPattern(this.x - 2, this.y - 2, this.size * 2, this.opacity * 0.5);
      }
    }
  }

  class PixelDataElement {
    constructor() { this.reset(); }

    reset() {
      this.x = Math.floor(Math.random() * canvas.width);
      this.y = canvas.height + 50;
      this.speed = Math.random() * 1.5 + 0.5;
      this.size = Math.floor(Math.random() * 8) + 4;
      this.symbols = ['¥', '$', '€', '£', '₹'];
      this.symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
      this.opacity = Math.random() * 0.2 + 0.05;
      this.color = this.getRandomSoftColor();
    }

    getRandomSoftColor() {
      const colors = ['rgba(200, 169, 110, ', 'rgba(139, 115, 85, '];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.y -= this.speed;
      if (this.y < -20) this.reset();
    }

    draw() {
      ctx.save();
      ctx.fillStyle = this.color + this.opacity + ')';
      ctx.font = `${this.size * 4}px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.symbol, this.x, this.y);
      ctx.restore();
    }
  }

  class BackgroundAsanoha {
    constructor() { this.gridSize = 80; this.opacity = 0.03; }
    draw() {
      for (let x = 0; x < canvas.width + this.gridSize; x += this.gridSize) {
        for (let y = 0; y < canvas.height + this.gridSize; y += this.gridSize) {
          drawAsanohaPattern(x, y, this.gridSize * 0.6, this.opacity);
        }
      }
    }
  }

  const particles = [];
  for (let i = 0; i < 60; i++) particles.push(new PixelParticle());

  const dataElements = [];
  for (let i = 0; i < 12; i++) dataElements.push(new PixelDataElement());

  const backgroundPattern = new BackgroundAsanoha();

  // 接続描画用の再利用オブジェクト（O(n²)のnew生成を排除）
  function drawConnections(particles) {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        if (distance < 120) {
          ctx.strokeStyle = `rgba(200, 169, 110, ${(1 - distance / 120) * 0.15})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.fillStyle = 'rgba(248, 244, 230, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    backgroundPattern.draw();
    drawConnections(particles);
    particles.forEach(p => { p.update(); p.draw(); });
    dataElements.forEach(e => { e.update(); e.draw(); });

    requestAnimationFrame(animate);
  }

  animate();
})();
