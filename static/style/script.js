const music = document.getElementById("bg-music");
const musicSource = document.getElementById("music-source");
const mainMessage = document.getElementById("main-message");
const subtitle = document.getElementById("subtitle");

// Parse query parameters
const urlParams = new URLSearchParams(window.location.search);
const selectedMusic = urlParams.get('music') || '/static/style/phepmau.mp3';
const mainText = decodeURIComponent(urlParams.get('mainText') || 'I love you in every universe');
const subText = decodeURIComponent(urlParams.get('subText') || 'Anh yêu em...Cho dù ở vũ trụ nào anh vẫn yêu em');
const customMessages = urlParams.get('messages') ? decodeURIComponent(urlParams.get('messages')).split('|') : [
  "Em là vũ trụ của anh",
  "Tình yêu bất tận giữa các vì sao",
  "Em là ngôi sao sáng nhất",
  "Anh tỏa sáng là vì em",
  "Em thật tỏa sáng trên bầu trời của anh"
];
const imageParam = urlParams.get('images');
const fallingImageData = imageParam ? JSON.parse(decodeURIComponent(imageParam)) : [];
const fallingImages = [];

const loadedFallingImages = [];
fallingImageData.forEach(base64 => {
  const img = new Image();
  img.src = base64;
  loadedFallingImages.push(img);
});

// Set main & sub text
mainMessage.textContent = mainText;
subtitle.textContent = subText;

// 🎵 Set up music
musicSource.src = selectedMusic;
music.load();

const playMusicOnce = () => {
  music.play().catch(e => console.log("🎧 Music play blocked:", e));
  window.removeEventListener("click", playMusicOnce);
};
window.addEventListener("click", playMusicOnce);

const messages = customMessages;
const fallingTexts = [];

function createFallingText() {
  const text = messages[Math.floor(Math.random() * messages.length)];
  const fontSize = Math.random() * 10 + 10;
  ctx.font = `bold ${fontSize}px Pacifico`;
  const textWidth = ctx.measureText(text).width;
  const x = Math.random() * (width - textWidth);

  fallingTexts.push({
    text,
    x,
    y: -10,
    speed: Math.random() * 2 + 2,
    alpha: 1,
    fontSize,
    hue: Math.random() * 360
  });
}

function createFallingImage() {
  if (loadedFallingImages.length === 0) return;
  const img = loadedFallingImages[Math.floor(Math.random() * loadedFallingImages.length)];
  const size = Math.random() * 30 + 30;
  const x = Math.random() * (width - size);

  fallingImages.push({
    img,
    x,
    y: -size,
    size,
    speed: Math.random() * 2 + 2, // Match text speed
    alpha: 1,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 1
  });
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const stars = [];
const heartStars = [];
const meteors = [];

let mouseX = width / 2;
let mouseY = height / 2;
let heartBeat = 1;
let heartScale = Math.min(width, height) * 0.015;

function heartShape(t, scale = 1) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
  return { x: x * scale, y: y * scale };
}

function createHeartStars(count = 1600) {
  const centerX = width / 2;
  const centerY = height / 2 + 20;
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const heart = heartShape(t, heartScale);
    const offsetX = (Math.random() - 0.5) * 15;
    const offsetY = (Math.random() - 0.5) * 15;

    const targetX = centerX + heart.x + offsetX;
    const targetY = centerY + heart.y + offsetY;

    heartStars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      targetX,
      targetY,
      originalX: targetX,
      originalY: targetY,
      size: Math.random() * 3 + 1,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      brightness: Math.random() * 0.5 + 0.5,
      hue: Math.random() * 60 + 300,
      mode: 'flying'
    });
  }
}

function createBackgroundStars() {
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.01 + 0.005,
      brightness: Math.random() * 0.3 + 0.2
    });
  }
}

function createMeteor() {
  meteors.push({
    x: Math.random() * width,
    y: -50,
    length: Math.random() * 80 + 50,
    speed: Math.random() * 6 + 6,
    angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
    alpha: 1
  });
}

setInterval(() => {
  for (let i = 0; i < 2; i++) {
    if (Math.random() < 0.95) createFallingText();
  }
}, 1700);
setInterval(() => {
  if (Math.random() < 0.7) createFallingImage();
}, 1700); // Match text interval

function animate() {
  ctx.clearRect(0, 0, width, height);
  heartBeat += 0.1;

  stars.forEach(star => {
    star.twinkle += star.twinkleSpeed;
    const flicker = Math.random() < 0.005 ? 1 : 0;
    const baseOpacity = star.brightness * (0.4 + 0.6 * Math.sin(star.twinkle));
    const opacity = Math.min(1, baseOpacity + flicker);

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = flicker ? 20 : 0;
    ctx.shadowColor = flicker ? '#fff' : 'transparent';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  meteors.forEach((m, i) => {
    const dx = Math.cos(m.angle) * m.length;
    const dy = Math.sin(m.angle) * m.length;
    ctx.save();
    ctx.globalAlpha = m.alpha;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x - dx, m.y - dy);
    ctx.stroke();
    ctx.restore();
    m.x += Math.cos(m.angle) * m.speed;
    m.y += Math.sin(m.angle) * m.speed;
    m.alpha -= 0.005;
    if (m.alpha <= 0) meteors.splice(i, 1);
  });

  fallingTexts.forEach((t, i) => {
    ctx.save();
    ctx.font = `bold ${t.fontSize}px Pacifico`;
    ctx.fillStyle = `hsla(${t.hue}, 100%, 85%, ${t.alpha})`;
    ctx.shadowBlur = 5;
    ctx.shadowColor = `hsla(${t.hue}, 100%, 70%, ${t.alpha})`;
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();

    t.y += t.speed;
    t.alpha -= 0.002;
    if (t.y > height + 30 || t.alpha <= 0) {
      fallingTexts.splice(i, 1);
    }
  });

  fallingImages.forEach((imgObj, i) => {
    ctx.save();
    ctx.globalAlpha = imgObj.alpha;
    ctx.translate(imgObj.x + imgObj.size / 2, imgObj.y + imgObj.size / 2);
    ctx.rotate(imgObj.rotation * Math.PI / 180);
    ctx.drawImage(imgObj.img, -imgObj.size / 2, -imgObj.size / 2, imgObj.size, imgObj.size);
    ctx.restore();

    imgObj.y += imgObj.speed;
    imgObj.alpha -= 0.002; // Match text fade
    imgObj.rotation += imgObj.rotationSpeed;

    if (imgObj.y > height + imgObj.size || imgObj.alpha <= 0) {
      fallingImages.splice(i, 1);
    }
  });

  heartStars.forEach((star, i) => {
    star.twinkle += star.twinkleSpeed;
    const centerX = width / 2;
    const centerY = height / 2 + 20;

    if (star.mode === 'flying') {
      const dx = star.targetX - star.x;
      const dy = star.targetY - star.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = 0.07;
      if (dist > 1) {
        star.x += dx * speed;
        star.y += dy * speed;
      } else {
        star.mode = 'heart';
      }
    } else {
      const deltaX = star.originalX - centerX;
      const deltaY = star.originalY - centerY;
      const beatScale = 1 + Math.sin(heartBeat) * 0.05;
      star.x = centerX + deltaX * beatScale;
      star.y = centerY + deltaY * beatScale;

      const distanceToMouse = Math.hypot(mouseX - star.x, mouseY - star.y);
      let interactionForce = 0;
      if (distanceToMouse < 100) {
        interactionForce = (100 - distanceToMouse) / 100;
        const angle = Math.atan2(star.y - mouseY, star.x - mouseX);
        star.x += Math.cos(angle) * interactionForce * 10;
        star.y += Math.sin(angle) * interactionForce * 10;
      }
    }

    const twinkleOpacity = star.brightness * (0.3 + 0.7 * Math.sin(star.twinkle));
    ctx.save();
    ctx.globalAlpha = twinkleOpacity;
    ctx.fillStyle = `hsl(${star.hue}, 70%, 80%)`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `hsl(${star.hue}, 70%, 60%)`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

canvas.addEventListener('click', (e) => {
  const centerX = width / 2;
  const centerY = height / 2 + 20;
  heartScale *= 1.015;
  heartStars.forEach((star, i) => {
    if (star.mode === 'heart') {
      const t = (i / heartStars.length) * Math.PI * 2;
      const heart = heartShape(t, heartScale);
      const offsetX = (Math.random() - 0.5) * 15;
      const offsetY = (Math.random() - 0.5) * 15;
      star.originalX = centerX + heart.x + offsetX;
      star.originalY = centerY + heart.y + offsetY;
    }
  });

  for (let i = 0; i < 10; i++) {
    const t = Math.random() * Math.PI * 2;
    const heart = heartShape(t, heartScale);
    const targetX = centerX + heart.x;
    const targetY = centerY + heart.y;

    heartStars.push({
      x: e.clientX + (Math.random() - 0.5) * 50,
      y: e.clientY + (Math.random() - 0.5) * 50,
      targetX,
      targetY,
      originalX: targetX,
      originalY: targetY,
      size: Math.random() * 3 + 2,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.03 + 0.02,
      brightness: Math.random() * 0.8 + 0.6,
      hue: Math.random() * 60 + 300,
      mode: 'flying'
    });
  }
});

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  heartScale = Math.min(width, height) * 0.015;
  heartStars.length = 0;
  stars.length = 0;
  createHeartStars();
  createBackgroundStars();
});

setInterval(() => { if (Math.random() < 0.7) createMeteor(); }, 3000);

createHeartStars();
createBackgroundStars();
animate();