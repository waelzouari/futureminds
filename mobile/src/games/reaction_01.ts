// reaction_01.ts — "Réaction Rapide" mini-game (HTML5 / Canvas)
// The HTML is built with plain string concatenation to avoid nested template
// literal conflicts between TypeScript and JavaScript.

const GAME_HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Réaction Rapide</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-user-select: none; }
    body {
      background: #0B0C1E;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      overflow: hidden;
      touch-action: manipulation;
    }
    #gameArea {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hud {
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      display: flex;
      justify-content: space-between;
      font-size: 18px;
      font-weight: bold;
      z-index: 10;
      opacity: 0.85;
    }
    .message {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      padding: 20px;
      z-index: 5;
    }
    .submessage {
      font-size: 16px;
      opacity: 0.7;
      margin-top: 10px;
      font-weight: normal;
    }
    #target {
      position: absolute;
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, #F59E0B 0%, #EF4444 100%);
      border-radius: 50%;
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      box-shadow: 0 0 20px rgba(245,158,11,0.6);
      cursor: pointer;
      z-index: 20;
    }
    .feedback {
      position: absolute;
      font-size: 28px;
      font-weight: bold;
      animation: floatUp 1s ease-out forwards;
      pointer-events: none;
      z-index: 30;
    }
    @keyframes floatUp {
      0%   { transform: translateY(0);     opacity: 1; }
      100% { transform: translateY(-50px); opacity: 0; }
    }
    .flash {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      opacity: 0;
      pointer-events: none;
      z-index: 100;
      transition: opacity 0.1s;
    }
  </style>
</head>
<body>
  <div id="flash" class="flash"></div>
  <div class="hud">
    <div id="roundDisplay">Tour 1/__TOTAL_ROUNDS__</div>
    <div id="scoreDisplay">Score: 0</div>
  </div>
  <div id="gameArea">
    <div id="messageBox" class="message">
      <div>Prépare-toi !</div>
      <div class="submessage">Appuie sur le cercle dès qu'il apparaît.</div>
    </div>
    <div id="target">⚡</div>
  </div>

  <script>
    var TOTAL_ROUNDS     = __TOTAL_ROUNDS__;
    var MAX_DISPLAY_TIME = __MAX_DISPLAY_TIME__;

    var currentRound   = 0;
    var score          = 0;
    var correctAnswers = 0;
    var missedTargets  = 0;
    var impulsiveClicks = 0;
    var reactionTimes  = [];
    var gameState      = 'INIT';
    var targetSpawnTime = 0;
    var timeoutId      = null;
    var gameStartTime  = Date.now();

    var gameArea     = document.getElementById('gameArea');
    var target       = document.getElementById('target');
    var messageBox   = document.getElementById('messageBox');
    var roundDisplay = document.getElementById('roundDisplay');
    var scoreDisplay = document.getElementById('scoreDisplay');
    var flash        = document.getElementById('flash');

    setTimeout(function() { startRound(); }, 3000);

    function startRound() {
      if (currentRound >= TOTAL_ROUNDS) { endGame(); return; }
      currentRound++;
      roundDisplay.innerText = 'Tour ' + currentRound + '/' + TOTAL_ROUNDS;
      gameState = 'WAIT';
      messageBox.style.display = 'none';
      target.style.display     = 'none';
      var waitTime = Math.floor(Math.random() * 2500) + 1500;
      timeoutId = setTimeout(spawnTarget, waitTime);
    }

    function spawnTarget() {
      gameState = 'TARGET';
      var maxX = gameArea.clientWidth  - 100;
      var maxY = gameArea.clientHeight - 100;
      target.style.left    = Math.floor(Math.random() * maxX) + 'px';
      target.style.top     = Math.floor(Math.random() * maxY) + 'px';
      target.style.display = 'flex';
      targetSpawnTime = Date.now();
      timeoutId = setTimeout(function() {
        if (gameState === 'TARGET') handleMiss();
      }, MAX_DISPLAY_TIME);
    }

    function showFeedback(text, color, x, y) {
      var fb = document.createElement('div');
      fb.className    = 'feedback';
      fb.innerText    = text;
      fb.style.color  = color;
      fb.style.left   = x + 'px';
      fb.style.top    = y + 'px';
      gameArea.appendChild(fb);
      setTimeout(function() { fb.remove(); }, 1000);
    }

    function triggerFlash(color) {
      flash.style.backgroundColor = color;
      flash.style.opacity = '0.3';
      setTimeout(function() { flash.style.opacity = '0'; }, 100);
    }

    function handleMiss() {
      gameState = 'WAIT';
      target.style.display = 'none';
      missedTargets++;
      triggerFlash('red');
      setTimeout(startRound, 1000);
    }

    function handleHit(clientX, clientY) {
      var reactionTime = Date.now() - targetSpawnTime;
      clearTimeout(timeoutId);
      gameState = 'WAIT';
      target.style.display = 'none';
      correctAnswers++;
      reactionTimes.push(reactionTime);
      var timeScore = Math.max(10, 100 - Math.floor(reactionTime / 10));
      score += timeScore;
      scoreDisplay.innerText = 'Score: ' + score;
      showFeedback(reactionTime + 'ms', '#4ADE80', clientX - 20, clientY - 40);
      triggerFlash('white');
      setTimeout(startRound, 1000);
    }

    function handleImpulsive(clientX, clientY) {
      impulsiveClicks++;
      score = Math.max(0, score - 10);
      scoreDisplay.innerText = 'Score: ' + score;
      showFeedback('Trop tôt!', '#F87171', clientX - 40, clientY - 40);
      triggerFlash('red');
      clearTimeout(timeoutId);
      timeoutId = setTimeout(spawnTarget, Math.floor(Math.random() * 2000) + 1000);
    }

    target.addEventListener('touchstart', function(e) {
      e.stopPropagation(); e.preventDefault();
      if (gameState === 'TARGET') handleHit(e.touches[0].clientX, e.touches[0].clientY);
    });
    target.addEventListener('mousedown', function(e) {
      e.stopPropagation();
      if (gameState === 'TARGET') handleHit(e.clientX, e.clientY);
    });
    gameArea.addEventListener('touchstart', function(e) {
      if (gameState === 'WAIT') handleImpulsive(e.touches[0].clientX, e.touches[0].clientY);
    });
    gameArea.addEventListener('mousedown', function(e) {
      if (gameState === 'WAIT') handleImpulsive(e.clientX, e.clientY);
    });

    function endGame() {
      gameState = 'END';
      messageBox.innerHTML = '<div>Terminé !</div><div class="submessage">Envoi des résultats...</div>';
      messageBox.style.display = 'block';

      var avgReactionTime = reactionTimes.length > 0
        ? reactionTimes.reduce(function(a, b) { return a + b; }, 0) / reactionTimes.length
        : 0;
      var durationSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
      var maxPossibleScore = TOTAL_ROUNDS * 100;
      var normalizedScore  = Math.min(100, Math.round((score / maxPossibleScore) * 100));

      var results = {
        score: normalizedScore,
        reactionTime: avgReactionTime / 1000,
        numberOfErrors: missedTargets + impulsiveClicks,
        correctAnswers: correctAnswers,
        missedTargets: missedTargets,
        impulsiveClicks: impulsiveClicks,
        focusDuration: durationSeconds,
        levelCompleted: true
      };

      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(results));
      } else {
        console.log('Results (Web test):', results);
      }
    }
  </script>
</body>
</html>
`;

export const getReactionGameHtml = (difficultyLevel: number): string => {
  const rounds          = 5 + difficultyLevel * 2;
  const maxDisplayTime  = Math.max(500, 2000 - difficultyLevel * 250);

  return GAME_HTML_TEMPLATE
    .replace(/__TOTAL_ROUNDS__/g, String(rounds))
    .replace(/__MAX_DISPLAY_TIME__/g, String(maxDisplayTime));
};
