// attention_visual_01.ts — "Attention Visuelle" mini-game
// L'enfant doit suivre visuellement une cible parmi des distracteurs
// et tapper dessus quand elle s'arrête.

const ATTENTION_GAME_HTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Attention Visuelle</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-user-select: none; }
    body {
      background: #0B0C1E;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow: hidden;
      height: 100vh;
      touch-action: manipulation;
    }
    #canvas { display: block; width: 100vw; height: 100vh; }
    .hud {
      position: fixed;
      top: 16px; left: 16px; right: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
      pointer-events: none;
    }
    .hud-pill {
      background: rgba(255,255,255,0.12);
      backdrop-filter: blur(8px);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
    }
    #overlay {
      position: fixed;
      inset: 0;
      background: rgba(11,12,30,0.95);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      z-index: 20;
    }
    .ol-icon { font-size: 64px; }
    .ol-title { font-size: 26px; font-weight: 800; text-align: center; }
    .ol-sub { font-size: 15px; opacity: 0.65; text-align: center; max-width: 280px; line-height: 1.5; }
    .ol-btn {
      margin-top: 8px;
      background: linear-gradient(135deg, #4A7CF7, #7C6FCD);
      color: white;
      border: none;
      padding: 14px 36px;
      border-radius: 50px;
      font-size: 17px;
      font-weight: 700;
      cursor: pointer;
    }
    #countdown {
      position: fixed;
      inset: 0;
      background: rgba(11,12,30,0.85);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 19;
      font-size: 120px;
      font-weight: 900;
      color: #4A7CF7;
    }
  </style>
</head>
<body>
  <div class="hud">
    <div class="hud-pill" id="roundHud">Tour 0/__TOTAL_ROUNDS__</div>
    <div class="hud-pill" id="scoreHud">✅ 0 | ❌ 0</div>
  </div>

  <div id="overlay">
    <div class="ol-icon">👁️</div>
    <div class="ol-title">Attention Visuelle</div>
    <div class="ol-sub">Suis la cible bleue ⭐ avec tes yeux. Appuie dessus quand tout s'arrête !</div>
    <button class="ol-btn" id="startBtn">Commencer !</button>
  </div>
  <div id="countdown"></div>

  <canvas id="canvas"></canvas>

  <script>
    var TOTAL_ROUNDS     = __TOTAL_ROUNDS__;
    var N_DISTRACTORS    = __N_DISTRACTORS__;
    var MOVE_DURATION_MS = __MOVE_DURATION_MS__;
    var CLICK_WINDOW_MS  = __CLICK_WINDOW_MS__;

    var canvas   = document.getElementById('canvas');
    var ctx      = canvas.getContext('2d');
    var roundHud = document.getElementById('roundHud');
    var scoreHud = document.getElementById('scoreHud');
    var overlay  = document.getElementById('overlay');
    var cdDiv    = document.getElementById('countdown');

    var W, H;
    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // State
    var currentRound = 0;
    var correctAnswers = 0;
    var errors = 0;
    var reactionTimes = [];
    var phaseStart = 0;
    var gameState = 'IDLE'; // IDLE, MOVING, FROZEN
    var animId = null;
    var freezeTimeout = null;
    var gameStartTime = Date.now();

    // Balls
    var balls = [];
    var targetIdx = 0;

    function randomBall(isTarget) {
      return {
        x: 80 + Math.random() * (W - 160),
        y: 120 + Math.random() * (H - 240),
        r: isTarget ? 32 : 26,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        isTarget: isTarget,
        hue: isTarget ? 215 : (Math.random() * 30 + 0),  // blue vs orange-red
        glowPhase: Math.random() * Math.PI * 2,
      };
    }

    function initBalls() {
      balls = [];
      targetIdx = 0;
      balls.push(randomBall(true));
      for (var i = 0; i < N_DISTRACTORS; i++) balls.push(randomBall(false));
    }

    function drawBall(b, t) {
      var glow = 0.5 + 0.5 * Math.sin(t * 3 + b.glowPhase);
      ctx.save();
      // Glow
      if (b.isTarget) {
        var grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 2.5);
        grad.addColorStop(0, 'rgba(74,124,247,' + (0.25 * glow) + ')');
        grad.addColorStop(1, 'rgba(74,124,247,0)');
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
      // Body
      var bodyGrad = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, 0, b.x, b.y, b.r);
      if (b.isTarget) {
        bodyGrad.addColorStop(0, '#7BAEFF');
        bodyGrad.addColorStop(1, '#1A4FBF');
      } else {
        bodyGrad.addColorStop(0, '#FF8C5A');
        bodyGrad.addColorStop(1, '#CC3A00');
      }
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();
      // Star on target
      if (b.isTarget) {
        ctx.fillStyle = 'white';
        ctx.font = (b.r * 0.85) + 'px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', b.x, b.y + 1);
      }
      ctx.restore();
    }

    var lastTime = 0;
    function animate(ts) {
      animId = requestAnimationFrame(animate);
      var dt = (ts - lastTime) / 1000;
      lastTime = ts;
      if (dt > 0.1) dt = 0.1;

      ctx.clearRect(0, 0, W, H);

      // Background grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (var gx = 0; gx < W; gx += 60) { ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,H); ctx.stroke(); }
      for (var gy = 0; gy < H; gy += 60) { ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke(); }

      var t = ts / 1000;

      for (var i = 0; i < balls.length; i++) {
        var b = balls[i];
        if (gameState === 'MOVING') {
          b.x += b.vx;
          b.y += b.vy;
          if (b.x - b.r < 0)  { b.x = b.r;  b.vx = Math.abs(b.vx); }
          if (b.x + b.r > W)  { b.x = W - b.r; b.vx = -Math.abs(b.vx); }
          if (b.y - b.r < 100) { b.y = 100 + b.r; b.vy = Math.abs(b.vy); }
          if (b.y + b.r > H - 20) { b.y = H - 20 - b.r; b.vy = -Math.abs(b.vy); }
        }
        drawBall(b, t);
      }

      // FROZEN instruction
      if (gameState === 'FROZEN') {
        ctx.fillStyle = 'rgba(74,124,247,0.85)';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Appuie sur ⭐ !', W / 2, 70);
      }
    }

    function startRound() {
      currentRound++;
      roundHud.innerText = 'Tour ' + currentRound + '/' + TOTAL_ROUNDS;
      initBalls();
      gameState = 'MOVING';
      phaseStart = Date.now();

      clearTimeout(freezeTimeout);
      freezeTimeout = setTimeout(freezeRound, MOVE_DURATION_MS);
    }

    function freezeRound() {
      gameState = 'FROZEN';
      phaseStart = Date.now();
      clearTimeout(freezeTimeout);
      freezeTimeout = setTimeout(function() {
        // Time expired → miss
        errors++;
        updateScore();
        nextRound();
      }, CLICK_WINDOW_MS);
    }

    function updateScore() {
      scoreHud.innerText = '✅ ' + correctAnswers + ' | ❌ ' + errors;
    }

    function nextRound() {
      if (currentRound >= TOTAL_ROUNDS) {
        endGame();
      } else {
        gameState = 'MOVING';
        setTimeout(startRound, 800);
      }
    }

    var lastClickTime = 0;

    canvas.addEventListener('touchstart', function(e) {
      e.preventDefault(); // bloque le mousedown synthétique qui suit
      handleClick(e);
    }, { passive: false });

    canvas.addEventListener('mousedown', function(e) {
      // Ignorer si un touch vient d'être traité (< 300ms)
      if (Date.now() - lastClickTime < 300) return;
      handleClick(e);
    });

    function handleClick(e) {
      // Debounce : éviter double-traitement
      var now = Date.now();
      if (now - lastClickTime < 200) return;
      lastClickTime = now;

      var cx, cy;
      if (e.touches && e.touches.length > 0) {
        cx = e.touches[0].clientX;
        cy = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        cx = e.changedTouches[0].clientX;
        cy = e.changedTouches[0].clientY;
      } else {
        cx = e.clientX;
        cy = e.clientY;
      }

      if (gameState === 'FROZEN') {
        var target = balls[targetIdx];
        var dx = cx - target.x;
        var dy = cy - target.y;
        var dist = Math.sqrt(dx*dx + dy*dy);
        clearTimeout(freezeTimeout);

        if (dist < target.r * 1.8) {
          // Correct ✅
          reactionTimes.push(Date.now() - phaseStart);
          correctAnswers++;
        } else {
          // Mauvaise balle ❌
          errors++;
        }
        updateScore();
        nextRound();
      } else if (gameState === 'MOVING') {
        // Clic impulsif avant l'arrêt
        errors++;
        updateScore();
      }
    }

    function endGame() {
      gameState = 'IDLE';
      cancelAnimationFrame(animId);
      var avgRT = reactionTimes.length > 0
        ? reactionTimes.reduce(function(a,b){ return a+b; },0) / reactionTimes.length
        : 2000;
      var duration = Math.floor((Date.now() - gameStartTime) / 1000);
      var total = correctAnswers + errors;
      var rawScore = total > 0 ? correctAnswers / total : 0;
      var normalized = Math.min(100, Math.round(rawScore * 100));

      var results = {
        score: normalized,
        reactionTime: avgRT / 1000,
        numberOfErrors: errors,
        correctAnswers: correctAnswers,
        missedTargets: TOTAL_ROUNDS - correctAnswers - errors,
        impulsiveClicks: 0,
        focusDuration: duration,
        levelCompleted: true
      };
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(results));
      }
    }

    // Countdown then start
    document.getElementById('startBtn').addEventListener('click', function() {
      overlay.style.display = 'none';
      var n = 3;
      cdDiv.style.display = 'flex';
      cdDiv.innerText = n;
      var iv = setInterval(function() {
        n--;
        if (n <= 0) {
          clearInterval(iv);
          cdDiv.style.display = 'none';
          animId = requestAnimationFrame(animate);
          startRound();
          gameStartTime = Date.now();
        } else {
          cdDiv.innerText = n;
        }
      }, 900);
    });
  </script>
</body>
</html>
`;

export const getAttentionGameHtml = (difficultyLevel: number): string => {
  const totalRounds    = 6 + difficultyLevel * 2;
  const nDistractors   = 2 + difficultyLevel;
  const moveDuration   = Math.max(2000, 5000 - difficultyLevel * 600);
  const clickWindow    = Math.max(1500, 3500 - difficultyLevel * 400);

  return ATTENTION_GAME_HTML
    .replace(/__TOTAL_ROUNDS__/g,    String(totalRounds))
    .replace(/__N_DISTRACTORS__/g,   String(nDistractors))
    .replace(/__MOVE_DURATION_MS__/g, String(moveDuration))
    .replace(/__CLICK_WINDOW_MS__/g,  String(clickWindow));
};
