export const getReactionGameHtml = (difficultyLevel: number) => {
  // Config selon la difficulté
  const rounds = 5 + (difficultyLevel * 2); // Niveau 1 = 7 rounds, Niveau 5 = 15 rounds
  const maxDisplayTime = Math.max(500, 2000 - (difficultyLevel * 250)); // Temps pour cliquer (plus c'est difficile, plus c'est court)

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Réaction Rapide</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
    body {
      background-color: #0B0C1E;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
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
      opacity: 0.8;
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
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.6);
      cursor: pointer;
      z-index: 20;
    }
    .feedback {
      position: absolute;
      font-size: 32px;
      font-weight: bold;
      animation: floatUp 1s ease-out forwards;
      pointer-events: none;
      z-index: 30;
    }
    @keyframes floatUp {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(-50px); opacity: 0; }
    }
    .flash {
      position: absolute;
      top:0; left:0; right:0; bottom:0;
      background: white;
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
    <div id="roundDisplay">Tour 1/${rounds}</div>
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
    // Configuration
    const TOTAL_ROUNDS = ${rounds};
    const MAX_DISPLAY_TIME = ${maxDisplayTime};
    
    // State
    let currentRound = 0;
    let score = 0;
    let correctAnswers = 0;
    let missedTargets = 0;
    let impulsiveClicks = 0;
    let reactionTimes = [];
    let gameState = 'INIT'; // INIT, WAIT, TARGET, END
    let targetSpawnTime = 0;
    let timeoutId = null;
    let gameStartTime = Date.now();
    
    // DOM Elements
    const gameArea = document.getElementById('gameArea');
    const target = document.getElementById('target');
    const messageBox = document.getElementById('messageBox');
    const roundDisplay = document.getElementById('roundDisplay');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const flash = document.getElementById('flash');

    // Start Game Sequence
    setTimeout(() => {
      startRound();
    }, 3000);

    function startRound() {
      if (currentRound >= TOTAL_ROUNDS) {
        endGame();
        return;
      }
      
      currentRound++;
      roundDisplay.innerText = \`Tour \${currentRound}/\${TOTAL_ROUNDS}\`;
      gameState = 'WAIT';
      messageBox.style.display = 'none';
      target.style.display = 'none';
      
      // Random wait between 1.5s and 4s
      const waitTime = Math.floor(Math.random() * 2500) + 1500;
      
      timeoutId = setTimeout(() => {
        spawnTarget();
      }, waitTime);
    }

    function spawnTarget() {
      gameState = 'TARGET';
      
      // Random position (keep inside bounds)
      const maxX = gameArea.clientWidth - 100;
      const maxY = gameArea.clientHeight - 100;
      const x = Math.floor(Math.random() * maxX);
      const y = Math.floor(Math.random() * maxY);
      
      target.style.left = x + 'px';
      target.style.top = y + 'px';
      target.style.display = 'flex';
      
      targetSpawnTime = Date.now();
      
      // Target disappears if not clicked in time
      timeoutId = setTimeout(() => {
        if (gameState === 'TARGET') {
          handleMiss();
        }
      }, MAX_DISPLAY_TIME);
    }

    function showFeedback(text, color, x, y) {
      const fb = document.createElement('div');
      fb.className = 'feedback';
      fb.innerText = text;
      fb.style.color = color;
      fb.style.left = x + 'px';
      fb.style.top = y + 'px';
      gameArea.appendChild(fb);
      setTimeout(() => fb.remove(), 1000);
    }

    function triggerFlash(color) {
      flash.style.backgroundColor = color;
      flash.style.opacity = '0.3';
      setTimeout(() => { flash.style.opacity = '0'; }, 100);
    }

    function handleMiss() {
      gameState = 'WAIT';
      target.style.display = 'none';
      missedTargets++;
      triggerFlash('red');
      
      setTimeout(() => {
        startRound();
      }, 1000);
    }

    function handleHit(e) {
      const reactionTime = Date.now() - targetSpawnTime;
      clearTimeout(timeoutId);
      
      gameState = 'WAIT';
      target.style.display = 'none';
      correctAnswers++;
      reactionTimes.push(reactionTime);
      
      // Score calculation
      const timeScore = Math.max(10, 100 - Math.floor(reactionTime / 10));
      score += timeScore;
      scoreDisplay.innerText = \`Score: \${score}\`;
      
      showFeedback(reactionTime + 'ms', '#4ADE80', e.clientX - 20, e.clientY - 40);
      triggerFlash('white');
      
      setTimeout(() => {
        startRound();
      }, 1000);
    }

    function handleImpulsive(e) {
      impulsiveClicks++;
      score = Math.max(0, score - 10);
      scoreDisplay.innerText = \`Score: \${score}\`;
      showFeedback('Trop tôt!', '#F87171', e.clientX - 40, e.clientY - 40);
      triggerFlash('red');
      
      // Reset the round timer so they don't cheat by spamming
      clearTimeout(timeoutId);
      const waitTime = Math.floor(Math.random() * 2000) + 1000;
      timeoutId = setTimeout(() => {
        spawnTarget();
      }, waitTime);
    }

    // Interaction handling
    target.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (gameState === 'TARGET') {
        handleHit(e.touches[0]);
      }
    });
    
    target.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      if (gameState === 'TARGET') {
        handleHit(e);
      }
    });

    gameArea.addEventListener('touchstart', (e) => {
      if (gameState === 'WAIT') {
        handleImpulsive(e.touches[0]);
      }
    });

    gameArea.addEventListener('mousedown', (e) => {
      if (gameState === 'WAIT') {
        handleImpulsive(e);
      }
    });

    function endGame() {
      gameState = 'END';
      messageBox.innerHTML = "<div>Terminé !</div><div class='submessage'>Envoi des résultats...</div>";
      messageBox.style.display = 'block';
      
      const avgReactionTime = reactionTimes.length > 0 
        ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
        : 0;
        
      const durationSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
      
      // Normalizing score to 0-100 scale for consistency
      const maxPossibleScore = TOTAL_ROUNDS * 100;
      const normalizedScore = Math.min(100, Math.round((score / maxPossibleScore) * 100));

      const results = {
        score: normalizedScore,
        reactionTime: avgReactionTime / 1000, // convert to seconds
        numberOfErrors: missedTargets + impulsiveClicks,
        correctAnswers,
        missedTargets,
        impulsiveClicks,
        focusDuration: durationSeconds,
        levelCompleted: true
      };

      // Send to React Native
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(results));
      } else {
        console.log("Results (Web test):", results);
      }
    }
  </script>
</body>
</html>
  \`;
};
