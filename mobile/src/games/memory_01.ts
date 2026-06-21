// memory_01.ts — "Mémoire des Formes" mini-game
// Simon-like: l'enfant mémorise une séquence de couleurs/formes et la reproduit.

const MEMORY_GAME_HTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Mémoire des Formes</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-user-select: none; }
    body {
      background: #0B0C1E;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      overflow: hidden;
      touch-action: manipulation;
      padding: 0 0 20px;
    }
    .hud {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 20px 0;
    }
    .hud-pill {
      background: rgba(255,255,255,0.1);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
    }
    #status {
      font-size: 17px;
      font-weight: 700;
      text-align: center;
      padding: 10px 20px;
      min-height: 48px;
    }
    #grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      padding: 0 24px;
      width: 100%;
      max-width: 380px;
      flex: 1;
      align-content: center;
    }
    .tile {
      aspect-ratio: 1;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 52px;
      cursor: pointer;
      transition: transform 0.08s, filter 0.08s;
      position: relative;
      overflow: hidden;
    }
    .tile.dim { filter: brightness(0.3); }
    .tile.lit { filter: brightness(1.4); transform: scale(0.95); }
    .tile.correct-flash { animation: correctPop 0.4s ease; }
    .tile.wrong-shake  { animation: wrongShake 0.4s ease; }
    @keyframes correctPop {
      0%   { transform: scale(0.95); }
      50%  { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    @keyframes wrongShake {
      0%,100%{ transform: translateX(0); }
      25%    { transform: translateX(-8px); }
      75%    { transform: translateX(8px); }
    }
    .progress-bar {
      width: 100%;
      max-width: 340px;
      height: 6px;
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
      overflow: hidden;
      margin: 0 24px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #7C6FCD, #A78BFA);
      border-radius: 3px;
      transition: width 0.3s ease;
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
    .ol-title { font-size: 26px; font-weight: 800; }
    .ol-sub { font-size: 15px; opacity: 0.65; text-align: center; max-width: 280px; line-height: 1.5; }
    .ol-btn {
      margin-top: 8px;
      background: linear-gradient(135deg, #7C6FCD, #A78BFA);
      color: white; border: none;
      padding: 14px 36px;
      border-radius: 50px;
      font-size: 17px; font-weight: 700; cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="hud">
    <div class="hud-pill" id="roundHud">Tour 1/__MAX_ROUNDS__</div>
    <div class="hud-pill" id="seqHud">Séquence: 2</div>
  </div>

  <div id="status">Regarde bien la séquence...</div>

  <div id="grid">
    <div class="tile dim" id="tile0" data-idx="0"></div>
    <div class="tile dim" id="tile1" data-idx="1"></div>
    <div class="tile dim" id="tile2" data-idx="2"></div>
    <div class="tile dim" id="tile3" data-idx="3"></div>
  </div>

  <div class="progress-bar"><div class="progress-fill" id="progressFill" style="width:0%"></div></div>

  <div id="overlay">
    <div class="ol-icon">🧩</div>
    <div class="ol-title">Mémoire des Formes</div>
    <div class="ol-sub">Regarde la séquence qui s'allume, puis reproduis-la dans le même ordre !</div>
    <button class="ol-btn" id="startBtn">Je suis prêt !</button>
  </div>

  <script>
    var MAX_ROUNDS      = __MAX_ROUNDS__;
    var START_SEQ_LEN   = __START_SEQ_LEN__;
    var FLASH_MS        = __FLASH_MS__;

    var TILES = [
      { emoji: '🔴', color: 'linear-gradient(135deg,#FF6B6B,#CC0000)' },
      { emoji: '🔵', color: 'linear-gradient(135deg,#4A7CF7,#1A4FBF)' },
      { emoji: '🟢', color: 'linear-gradient(135deg,#34C78A,#1A8F60)' },
      { emoji: '🟡', color: 'linear-gradient(135deg,#F59E0B,#B97000)' },
    ];

    // Init tiles
    var tileEls = [
      document.getElementById('tile0'),
      document.getElementById('tile1'),
      document.getElementById('tile2'),
      document.getElementById('tile3'),
    ];
    for (var i = 0; i < 4; i++) {
      tileEls[i].style.background = TILES[i].color;
      tileEls[i].textContent = TILES[i].emoji;
    }

    var roundHud     = document.getElementById('roundHud');
    var seqHud       = document.getElementById('seqHud');
    var statusEl     = document.getElementById('status');
    var progressFill = document.getElementById('progressFill');

    var round          = 0;
    var correctAnswers = 0;
    var errors         = 0;
    var reactionTimes  = [];
    var sequence       = [];
    var playerInput    = [];
    var seqLen         = START_SEQ_LEN;
    var gameState      = 'IDLE';
    var inputStart     = 0;
    var gameStartTime  = Date.now();

    function flashTile(idx, ms, cb) {
      tileEls[idx].classList.remove('dim');
      tileEls[idx].classList.add('lit');
      setTimeout(function() {
        tileEls[idx].classList.remove('lit');
        tileEls[idx].classList.add('dim');
        if (cb) setTimeout(cb, ms * 0.4);
      }, ms);
    }

    function playSequence(seq, onDone) {
      gameState = 'SHOWING';
      statusEl.textContent = 'Mémorise !';
      for (var i = 0; i < 4; i++) tileEls[i].classList.add('dim');
      var idx = 0;
      function next() {
        if (idx >= seq.length) { onDone(); return; }
        setTimeout(function() {
          flashTile(seq[idx], FLASH_MS, null);
          idx++;
          setTimeout(next, FLASH_MS * 1.7);
        }, 0);
      }
      setTimeout(next, 600);
    }

    function startRound() {
      round++;
      roundHud.textContent = 'Tour ' + round + '/' + MAX_ROUNDS;
      seqHud.textContent   = 'Séquence: ' + seqLen;
      // Build sequence
      sequence = [];
      for (var i = 0; i < seqLen; i++) {
        sequence.push(Math.floor(Math.random() * 4));
      }
      playerInput = [];
      progressFill.style.width = '0%';

      playSequence(sequence, function() {
        gameState  = 'INPUT';
        statusEl.textContent = 'À toi !';
        for (var i = 0; i < 4; i++) tileEls[i].classList.remove('dim');
        inputStart = Date.now();
      });
    }

    function handleTileClick(idx) {
      if (gameState !== 'INPUT') return;
      flashTile(idx, 280, null);
      playerInput.push(idx);
      var pos = playerInput.length - 1;
      progressFill.style.width = Math.round((playerInput.length / seqLen) * 100) + '%';

      if (playerInput[pos] !== sequence[pos]) {
        // Error
        errors++;
        tileEls[idx].classList.add('wrong-shake');
        setTimeout(function() { tileEls[idx].classList.remove('wrong-shake'); }, 400);
        statusEl.textContent = '❌ Raté ! Séquence recommencée';
        gameState = 'WAITING';
        if (round >= MAX_ROUNDS) { setTimeout(endGame, 1200); return; }
        setTimeout(startRound, 1500);
        return;
      }

      // Correct so far
      tileEls[idx].classList.add('correct-flash');
      setTimeout(function() { tileEls[idx].classList.remove('correct-flash'); }, 400);

      if (playerInput.length === seqLen) {
        // Full sequence correct
        reactionTimes.push(Date.now() - inputStart);
        correctAnswers++;
        seqLen++;  // Increase difficulty
        statusEl.textContent = '✅ Bravo !';
        gameState = 'WAITING';
        if (round >= MAX_ROUNDS) { setTimeout(endGame, 1200); return; }
        setTimeout(startRound, 1200);
      }
    }

    // Attach touch/click events
    for (var ti = 0; ti < 4; ti++) {
      (function(i) {
        tileEls[i].addEventListener('touchstart', function(e) {
          e.preventDefault();
          handleTileClick(i);
        });
        tileEls[i].addEventListener('mousedown', function() {
          handleTileClick(i);
        });
      })(ti);
    }

    function endGame() {
      gameState = 'IDLE';
      var avgRT = reactionTimes.length > 0
        ? reactionTimes.reduce(function(a,b){return a+b;},0) / reactionTimes.length
        : 3000;
      var duration = Math.floor((Date.now() - gameStartTime) / 1000);
      var total    = correctAnswers + errors;
      var score    = total > 0 ? Math.min(100, Math.round((correctAnswers / total) * 100)) : 0;

      var results = {
        score: score,
        reactionTime: avgRT / 1000,
        numberOfErrors: errors,
        correctAnswers: correctAnswers,
        missedTargets: 0,
        impulsiveClicks: 0,
        focusDuration: duration,
        levelCompleted: true
      };
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(results));
      }
    }

    document.getElementById('startBtn').addEventListener('click', function() {
      document.getElementById('overlay').style.display = 'none';
      gameStartTime = Date.now();
      startRound();
    });
  </script>
</body>
</html>
`;

export const getMemoryGameHtml = (difficultyLevel: number): string => {
  const maxRounds    = 5 + difficultyLevel * 2;
  const startSeqLen  = 1 + difficultyLevel;
  const flashMs      = Math.max(350, 700 - difficultyLevel * 70);

  return MEMORY_GAME_HTML
    .replace(/__MAX_ROUNDS__/g,    String(maxRounds))
    .replace(/__START_SEQ_LEN__/g, String(startSeqLen))
    .replace(/__FLASH_MS__/g,      String(flashMs));
};
