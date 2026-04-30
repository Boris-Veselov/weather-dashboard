(function () {

  /* ── PEXELS API — paste your free key from pexels.com/api ── */
  var PEXELS_KEY = 'CUQqoDpSa6YrqUG81NXrW4a1RJRkqduwqC1S1xHeqw6fcUGSY1u65eKC';

  function loadStormPhotos() {
    if (PEXELS_KEY === 'YOUR_PEXELS_API_KEY') return;
    fetch('https://api.pexels.com/v1/search?query=thunderstorm+lightning+storm&per_page=6&orientation=landscape', {
      headers: { Authorization: PEXELS_KEY }
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var panels = document.querySelectorAll('.w-panel');
      data.photos.forEach(function (photo, i) {
        if (panels[i]) panels[i].style.backgroundImage = 'url(' + photo.src.large2x + ')';
        if (panels[i + 6]) panels[i + 6].style.backgroundImage = 'url(' + photo.src.large2x + ')';
      });
    });
  }
  loadStormPhotos();

  /* ── RAIN CANVAS ─────────────────────────────── */
  var canvas = document.getElementById('rainCanvas');
  var ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  var drops = [];
  for (var i = 0; i < 250; i++) {
    drops.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      len: 12 + Math.random() * 18,
      speed: 10 + Math.random() * 12,
      opacity: 0.08 + Math.random() * 0.18
    });
  }

  function drawRain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drops.forEach(function (d) {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - d.len * 0.18, d.y + d.len);
      ctx.strokeStyle = 'rgba(180, 210, 240, ' + d.opacity + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
      d.y += d.speed;
      d.x -= d.speed * 0.18;
      if (d.y > canvas.height + d.len) {
        d.y = -d.len;
        d.x = Math.random() * canvas.width;
      }
    });
    requestAnimationFrame(drawRain);
  }
  drawRain();

  /* ── THUNDER SOUNDS ──────────────────────────── */
  var audioCtx = null;
  var started  = false;

  /* "click for sound" badge — shown only if autoplay is blocked */
  var badge = document.createElement('div');
  badge.id = 'soundBadge';
  badge.textContent = '🔊 Click anywhere for thunder';
  document.body.appendChild(badge);

  function hideBadge() {
    badge.style.opacity = '0';
    setTimeout(function () { badge.remove(); }, 500);
  }

  function startStorm() {
    if (started) return;
    started = true;
    hideBadge();
    setTimeout(playThunder, 400);
    scheduleStorm();
  }

  function playThunder() {
    if (!audioCtx) return;
    var sr  = audioCtx.sampleRate;
    var dur = 3 + Math.random() * 2.5;
    var buf = audioCtx.createBuffer(1, Math.floor(sr * dur), sr);
    var d   = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) {
      var t = i / d.length;
      d[i] = (Math.random() * 2 - 1) *
              Math.exp(-t * 3.5) *
              Math.pow(Math.sin(t * Math.PI), 0.3);
    }
    var src  = audioCtx.createBufferSource();
    src.buffer = buf;
    var lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 110 + Math.random() * 90;
    var gain = audioCtx.createGain();
    gain.gain.value = 0.6 + Math.random() * 0.4;
    src.connect(lp); lp.connect(gain); gain.connect(audioCtx.destination);
    src.start();
  }

  function scheduleStorm() {
    setTimeout(function () {
      playThunder();
      scheduleStorm();
    }, 3000 + Math.random() * 7000);
  }

  function tryAutoplay() {
    audioCtx = new (window.AudioContext || window['webkitAudioContext'])();
    audioCtx.resume().then(function () {
      if (audioCtx.state === 'running') {
        startStorm();
      }
      /* else: badge stays visible, waiting for click */
    });
    audioCtx.addEventListener('statechange', function () {
      if (audioCtx.state === 'running') startStorm();
    });
  }

  /* try on page load */
  tryAutoplay();

  /* unlock on first interaction if still blocked */
  ['click', 'keydown', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, function () {
      if (audioCtx) {
        audioCtx.resume();
      } else {
        tryAutoplay();
      }
    }, { once: true });
  });

})();
