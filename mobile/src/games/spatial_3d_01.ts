// spatial_3d_01.ts — "Parcours 3D" mini-game
// Pseudo-3D avoidance game (tunnel effect) to measure selective attention and spatial awareness.

const SPATIAL_GAME_HTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Parcours 3D</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-user-select: none; }
    body {
      background: #000;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow: hidden;
      height: 100vh;
      touch-action: none;
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
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(8px);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
    }
    #overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      z-index: 20;
    }
    .ol-icon { font-size: 64px; }
    .ol-btn {
      margin-top: 8px;
      background: linear-gradient(135deg, #4ECDC4, #4A7CF7);
      color: white; border: none;
      padding: 14px 36px;
      border-radius: 50px;
      font-size: 17px; font-weight: 700; cursor: pointer;
    }
    .controls {
      position: fixed;
      bottom: 20px; left: 20px; right: 20px;
      display: flex;
      justify-content: space-between;
      pointer-events: none;
    }
    .ctrl-btn {
      width: 80px; height: 80px;
      background: rgba(255,255,255,0.1);
      border-radius: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      pointer-events: auto;
      backdrop-filter: blur(4px);
    }
    .ctrl-btn:active { background: rgba(255,255,255,0.3); }
  </style>
</head>
<body>
  <div class="hud">
    <div class="hud-pill" id="scoreHud">Score: 0</div>
    <div class="hud-pill" id="healthHud">Vies: 3</div>
  </div>

  <canvas id="canvas"></canvas>

  <div class="controls" id="controls">
    <div class="ctrl-btn" id="btnLeft">◀</div>
    <div class="ctrl-btn" id="btnRight">▶</div>
  </div>

  <div id="overlay">
    <div class="ol-icon">🌐</div>
    <div style="font-size: 26px; font-weight: 800;">Parcours 3D</div>
    <div style="font-size: 15px; opacity: 0.65; text-align: center; max-width: 280px; line-height: 1.5;">
      Utilise les flèches pour esquiver les blocs rouges 🟥 et attraper les cibles bleues 🟦.
    </div>
    <button class="ol-btn" id="startBtn">Décollage !</button>
  </div>

  <script>
    var DURATION_SEC = __DURATION_SEC__;
    var SPEED_MULT = __SPEED_MULT__;

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var scoreHud = document.getElementById('scoreHud');
    var healthHud = document.getElementById('healthHud');
    
    var W, H, cx, cy;
    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cx = W / 2;
      cy = H / 2;
    }
    window.addEventListener('resize', resize);
    resize();

    var gameState = 'IDLE';
    var score = 0;
    var health = 3;
    var objects = [];
    var playerX = 0; // -1 (left), 0 (center), 1 (right)
    var playerTargetX = 0;
    var fov = 300;
    var animId;
    var gameStartTime = 0;
    var lastSpawnTime = 0;
    
    // Metrics
    var collected = 0;
    var missed = 0;
    var collisions = 0;

    function reset() {
      score = 0;
      health = 3;
      objects = [];
      playerTargetX = 0;
      playerX = 0;
      collected = 0;
      missed = 0;
      collisions = 0;
      updateHud();
    }

    function updateHud() {
      scoreHud.innerText = 'Score: ' + score;
      healthHud.innerText = 'Vies: ' + health;
    }

    function spawnObject() {
      var lane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
      var isGood = Math.random() > 0.6; // 40% good, 60% bad
      objects.push({
        lane: lane,
        z: 1000,
        type: isGood ? 'good' : 'bad',
        active: true
      });
    }

    var lastTime = 0;
    function loop(ts) {
      animId = requestAnimationFrame(loop);
      if (gameState !== 'PLAYING') return;

      var dt = (ts - lastTime) / 1000;
      lastTime = ts;
      if (dt > 0.1) dt = 0.1;

      var elapsed = (Date.now() - gameStartTime) / 1000;
      if (elapsed >= DURATION_SEC || health <= 0) {
        endGame();
        return;
      }

      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, W, H);

      // Smooth player movement
      playerX += (playerTargetX - playerX) * 10 * dt;

      // Draw grid lines
      ctx.strokeStyle = 'rgba(78, 205, 196, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy); ctx.lineTo(cx - W, H);
      ctx.moveTo(cx, cy); ctx.lineTo(cx, H);
      ctx.moveTo(cx, cy); ctx.lineTo(cx + W, H);
      ctx.stroke();

      var speed = 400 * SPEED_MULT * dt;

      if (ts - lastSpawnTime > (800 / SPEED_MULT)) {
        spawnObject();
        lastSpawnTime = ts;
      }

      // Sort objects by z (painter's algorithm)
      objects.sort(function(a, b) { return b.z - a.z; });

      for (var i = 0; i < objects.length; i++) {
        var obj = objects[i];
        if (!obj.active) continue;

        obj.z -= speed;

        if (obj.z < 10) {
          obj.active = false;
          // Collision logic
          if (Math.abs(obj.lane - playerTargetX) < 0.5) {
            if (obj.type === 'good') {
              score += 20;
              collected++;
              // flash screen green
              ctx.fillStyle = 'rgba(78, 205, 196, 0.5)';
              ctx.fillRect(0,0,W,H);
            } else {
              health--;
              collisions++;
              // flash screen red
              ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
              ctx.fillRect(0,0,W,H);
            }
            updateHud();
          } else {
            if (obj.type === 'good') missed++;
          }
          continue;
        }

        // Draw object
        var scale = fov / (fov + obj.z);
        var x3d = obj.lane * 80 - (playerX * 80);
        var y3d = 50; // below horizon
        
        var px = cx + x3d * scale;
        var py = cy + y3d * scale;
        var size = 40 * scale;

        ctx.fillStyle = obj.type === 'good' ? '#4A7CF7' : '#EF4444';
        if (obj.type === 'good') {
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI*2);
          ctx.fill();
        } else {
          ctx.fillRect(px - size, py - size, size*2, size*2);
        }
      }
      
      // Draw Player car/ship at bottom
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.moveTo(cx, H - 40);
      ctx.lineTo(cx - 20, H - 10);
      ctx.lineTo(cx + 20, H - 10);
      ctx.fill();
    }

    document.getElementById('btnLeft').addEventListener('touchstart', function(e) { e.preventDefault(); if(playerTargetX > -1) playerTargetX--; });
    document.getElementById('btnRight').addEventListener('touchstart', function(e) { e.preventDefault(); if(playerTargetX < 1) playerTargetX++; });
    document.getElementById('btnLeft').addEventListener('mousedown', function() { if(playerTargetX > -1) playerTargetX--; });
    document.getElementById('btnRight').addEventListener('mousedown', function() { if(playerTargetX < 1) playerTargetX++; });

    function endGame() {
      gameState = 'END';
      cancelAnimationFrame(animId);
      var duration = Math.floor((Date.now() - gameStartTime) / 1000);
      
      var maxPossible = (DURATION_SEC / (0.8 / SPEED_MULT)) * 0.4 * 20;
      var normalizedScore = Math.min(100, Math.max(0, Math.round((score / maxPossible) * 100)));

      var results = {
        score: normalizedScore,
        reactionTime: 0, // N/A for this continuous game
        numberOfErrors: collisions,
        correctAnswers: collected,
        missedTargets: missed,
        impulsiveClicks: collisions,
        focusDuration: duration,
        levelCompleted: health > 0
      };

      document.getElementById('overlay').style.display = 'flex';
      document.getElementById('overlay').innerHTML = "<h2>Terminé !</h2><p>Envoi des résultats...</p>";

      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(results));
      }
    }

    document.getElementById('startBtn').addEventListener('click', function() {
      document.getElementById('overlay').style.display = 'none';
      reset();
      gameState = 'PLAYING';
      gameStartTime = Date.now();
      lastTime = performance.now();
      animId = requestAnimationFrame(loop);
    });
  </script>
</body>
</html>
`;

export const getSpatialGameHtml = (difficultyLevel: number): string => {
  const durationSec = 30 + difficultyLevel * 10;
  const speedMult = 0.8 + difficultyLevel * 0.3;

  return SPATIAL_GAME_HTML
    .replace(/__DURATION_SEC__/g, String(durationSec))
    .replace(/__SPEED_MULT__/g, String(speedMult));
};
