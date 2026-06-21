// focus_timer_01.ts — "Concentration Zen" mini-game
// Measures sustained attention. Player must keep their finger on a slowly moving target.

const FOCUS_GAME_HTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Concentration Zen</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-user-select: none; }
    body {
      background: #0B0C1E;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow: hidden;
      height: 100vh;
      touch-action: none;
    }
    #gameArea {
      position: absolute;
      inset: 0;
    }
    .hud {
      position: absolute;
      top: 40px; left: 0; right: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
      z-index: 10;
    }
    .timer {
      font-size: 48px;
      font-weight: 800;
      color: #A78BFA;
      font-variant-numeric: tabular-nums;
    }
    .progress-bg {
      width: 200px; height: 8px;
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
      margin-top: 10px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #A78BFA;
      width: 0%;
    }
    .status {
      margin-top: 10px;
      font-size: 16px;
      opacity: 0.8;
    }
    #target {
      position: absolute;
      width: 120px; height: 120px;
      background: radial-gradient(circle, rgba(167,139,250,0.8) 0%, rgba(124,111,205,0.4) 60%, transparent 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 50px;
      transform: translate(-50%, -50%);
      pointer-events: none;
      transition: width 0.3s, height 0.3s;
    }
    #target.focused {
      width: 140px; height: 140px;
      background: radial-gradient(circle, rgba(167,139,250,1) 0%, rgba(124,111,205,0.6) 60%, transparent 100%);
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
    .ol-btn {
      margin-top: 8px;
      background: linear-gradient(135deg, #A78BFA, #7C6FCD);
      color: white; border: none;
      padding: 14px 36px;
      border-radius: 50px;
      font-size: 17px; font-weight: 700; cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="hud">
    <div class="timer" id="timerEl">0.0s</div>
    <div class="progress-bg"><div class="progress-fill" id="progressFill"></div></div>
    <div class="status" id="statusEl">Maintiens ton doigt sur le lotus</div>
  </div>

  <div id="gameArea">
    <div id="target">🪷</div>
  </div>

  <div id="overlay">
    <div style="font-size: 64px;">🎯</div>
    <div style="font-size: 26px; font-weight: 800;">Concentration Zen</div>
    <div style="font-size: 15px; opacity: 0.65; text-align: center; max-width: 280px; line-height: 1.5;">
      Maintiens ton doigt sur la fleur de lotus et suis-la lentement sans relâcher, jusqu'à la fin du temps.
    </div>
    <button class="ol-btn" id="startBtn">Commencer</button>
  </div>

  <script>
    var DURATION_SEC = __DURATION_SEC__;
    var SPEED = __SPEED__;

    var timerEl = document.getElementById('timerEl');
    var progressFill = document.getElementById('progressFill');
    var statusEl = document.getElementById('statusEl');
    var targetEl = document.getElementById('target');
    var gameArea = document.getElementById('gameArea');

    var W = window.innerWidth;
    var H = window.innerHeight;
    var tx = W/2, ty = H/2;
    var vx = (Math.random() - 0.5) * SPEED;
    var vy = (Math.random() - 0.5) * SPEED;

    var isTouching = false;
    var isFocused = false; // Is finger inside target?
    var focusTimeMs = 0;
    var totalErrors = 0; // times focus was lost
    var gameStartTime = 0;
    var lastTime = 0;
    var animId;
    var gameState = 'IDLE';

    function updateTargetPos() {
      targetEl.style.left = tx + 'px';
      targetEl.style.top = ty + 'px';
    }
    updateTargetPos();

    function loop(ts) {
      if (gameState !== 'PLAYING') return;
      animId = requestAnimationFrame(loop);

      var dt = (ts - lastTime) / 1000;
      lastTime = ts;
      if (dt > 0.1) dt = 0.1;

      // Move target
      tx += vx * dt;
      ty += vy * dt;
      if (tx < 60) { tx = 60; vx *= -1; }
      if (tx > W - 60) { tx = W - 60; vx *= -1; }
      if (ty < 150) { ty = 150; vy *= -1; }
      if (ty > H - 60) { ty = H - 60; vy *= -1; }

      // Random direction change occasionally
      if (Math.random() < 0.02) {
        vx += (Math.random() - 0.5) * SPEED * 0.5;
        vy += (Math.random() - 0.5) * SPEED * 0.5;
        // Normalize speed
        var len = Math.sqrt(vx*vx + vy*vy);
        vx = (vx / len) * SPEED;
        vy = (vy / len) * SPEED;
      }

      updateTargetPos();

      var elapsedSec = (Date.now() - gameStartTime) / 1000;
      if (elapsedSec >= DURATION_SEC) {
        endGame();
        return;
      }

      progressFill.style.width = Math.min(100, (elapsedSec / DURATION_SEC) * 100) + '%';

      if (isFocused) {
        focusTimeMs += dt * 1000;
        timerEl.innerText = (focusTimeMs / 1000).toFixed(1) + 's';
        targetEl.classList.add('focused');
        statusEl.innerText = "Parfait, reste concentré...";
        statusEl.style.color = "#A78BFA";
      } else {
        targetEl.classList.remove('focused');
        statusEl.innerText = "Replace ton doigt sur le lotus !";
        statusEl.style.color = "#EF4444";
      }
    }

    function checkTouch(cx, cy) {
      var dx = cx - tx;
      var dy = cy - ty;
      var dist = Math.sqrt(dx*dx + dy*dy);
      var wasFocused = isFocused;
      isFocused = (dist < 70); // 70px radius tolerance

      if (wasFocused && !isFocused) {
        totalErrors++;
      }
    }

    gameArea.addEventListener('touchstart', function(e) {
      e.preventDefault();
      isTouching = true;
      checkTouch(e.touches[0].clientX, e.touches[0].clientY);
    });
    gameArea.addEventListener('touchmove', function(e) {
      e.preventDefault();
      if (isTouching) checkTouch(e.touches[0].clientX, e.touches[0].clientY);
    });
    gameArea.addEventListener('touchend', function(e) {
      e.preventDefault();
      isTouching = false;
      if (isFocused) totalErrors++;
      isFocused = false;
    });

    gameArea.addEventListener('mousedown', function(e) {
      isTouching = true;
      checkTouch(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', function(e) {
      if (isTouching) checkTouch(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', function(e) {
      isTouching = false;
      if (isFocused) totalErrors++;
      isFocused = false;
    });

    function endGame() {
      gameState = 'END';
      cancelAnimationFrame(animId);
      
      var normalizedScore = Math.min(100, Math.round((focusTimeMs / (DURATION_SEC * 1000)) * 100));

      var results = {
        score: normalizedScore,
        reactionTime: 0,
        numberOfErrors: totalErrors,
        correctAnswers: Math.round(focusTimeMs / 1000),
        missedTargets: 0,
        impulsiveClicks: 0,
        focusDuration: DURATION_SEC,
        levelCompleted: true
      };

      document.getElementById('overlay').style.display = 'flex';
      document.getElementById('overlay').innerHTML = "<h2>Méditation terminée !</h2><p>Envoi des résultats...</p>";

      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(results));
      }
    }

    document.getElementById('startBtn').addEventListener('click', function() {
      document.getElementById('overlay').style.display = 'none';
      gameStartTime = Date.now();
      lastTime = performance.now();
      gameState = 'PLAYING';
      animId = requestAnimationFrame(loop);
    });
  </script>
</body>
</html>
`;

export const getFocusGameHtml = (difficultyLevel: number): string => {
  const durationSec = 20 + difficultyLevel * 10;
  const speed = 40 + difficultyLevel * 20;

  return FOCUS_GAME_HTML
    .replace(/__DURATION_SEC__/g, String(durationSec))
    .replace(/__SPEED__/g, String(speed));
};
