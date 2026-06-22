// inhibition_01.ts — "Stop & Go" mini-game
// Go/No-Go task to measure inhibitory control.

const INHIBITION_GAME_HTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Stop & Go</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-user-select: none; }
    body {
      background: #F0F6FF;
      color: #1A2340;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow: hidden;
      touch-action: manipulation;
    }
    .hud {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
    }
    .hud-pill {
      background: #FFFFFF;
      border: 1.5px solid #DDE8FF;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
      color: #1A2340;
      box-shadow: 0 2px 8px rgba(74,144,226,0.1);
    }
    .status {
      font-size: 18px;
      font-weight: 700;
      margin-top: 20px;
      min-height: 24px;
      color: #1A2340;
    }
    .game-area {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .stimulus {
      width: 150px;
      height: 150px;
      border-radius: 20px;
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 80px;
      cursor: pointer;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      transition: transform 0.1s;
    }
    .stimulus:active {
      transform: scale(0.9);
    }
    .stimulus.go {
      background: linear-gradient(135deg, #34C78A, #1A8F60);
      box-shadow: 0 10px 30px rgba(52, 199, 138, 0.4);
    }
    .stimulus.stop {
      background: linear-gradient(135deg, #EF4444, #B91C1C);
      box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4);
      border-radius: 50%; /* Circle for Stop to distinguish more */
    }
    .feedback {
      position: absolute;
      font-size: 32px;
      font-weight: bold;
      animation: floatUp 1s ease-out forwards;
      pointer-events: none;
    }
    @keyframes floatUp {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(-50px); opacity: 0; }
    }
    #overlay {
      position: fixed;
      inset: 0;
      background: rgba(240,246,255,0.97);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      z-index: 20;
    }
    .ol-btn {
      margin-top: 8px;
      background: linear-gradient(135deg, #27AE60, #4A90E2);
      color: white; border: none;
      padding: 14px 36px;
      border-radius: 50px;
      font-size: 17px; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 16px rgba(39,174,96,0.3);
    }
  </style>
</head>
<body>
  <div class="hud">
    <div class="hud-pill" id="roundHud">Essai 0/__TOTAL_TRIALS__</div>
    <div class="hud-pill" id="scoreHud">Score: 0</div>
  </div>
  <div class="status" id="statusEl">Prépare-toi...</div>

  <div class="game-area" id="gameArea">
    <div class="stimulus" id="stimulusEl"></div>
  </div>

  <div id="overlay">
    <div style="font-size: 64px;">🚦</div>
    <div style="font-size: 26px; font-weight: 800; color: #1A2340;">Stop &amp; Go</div>
    <div style="font-size: 15px; color: #6B7A99; text-align: center; max-width: 280px; line-height: 1.5;">
      Appuie sur le 🟢 <b>vert (GO)</b> aussi vite que possible.<br><br>
      Mais ne touche pas au 🔴 <b>rouge (STOP)</b> !
    </div>
    <button class="ol-btn" id="startBtn">Démarrer</button>
  </div>

  <script>
    var TOTAL_TRIALS = __TOTAL_TRIALS__;
    var STIMULUS_DURATION = __STIMULUS_DURATION__; // ms

    var roundHud = document.getElementById('roundHud');
    var scoreHud = document.getElementById('scoreHud');
    var statusEl = document.getElementById('statusEl');
    var stimulusEl = document.getElementById('stimulusEl');
    var gameArea = document.getElementById('gameArea');

    var currentTrial = 0;
    var score = 0;
    var correctGo = 0;    // Clicked on Go
    var missedGo = 0;     // Didn't click on Go (omission error)
    var failedStop = 0;   // Clicked on Stop (commission error / impulsivity)
    var correctStop = 0;  // Didn't click on Stop
    var reactionTimes = [];
    
    var trialType = 'GO'; // 'GO' or 'STOP'
    var trialState = 'IDLE'; // IDLE, WAIT, STIMULUS
    var stimulusTimeout = null;
    var nextTrialTimeout = null;
    var stimulusStartTime = 0;
    var hasResponded = false;
    var gameStartTime = Date.now();

    function showFeedback(text, color) {
      var fb = document.createElement('div');
      fb.className = 'feedback';
      fb.innerText = text;
      fb.style.color = color;
      gameArea.appendChild(fb);
      setTimeout(function() { fb.remove(); }, 1000);
    }

    function startTrial() {
      if (currentTrial >= TOTAL_TRIALS) {
        endGame();
        return;
      }
      currentTrial++;
      roundHud.innerText = 'Essai ' + currentTrial + '/' + TOTAL_TRIALS;
      statusEl.innerText = '';
      stimulusEl.style.display = 'none';
      hasResponded = false;
      trialState = 'WAIT';

      // 75% GO, 25% STOP
      trialType = Math.random() < 0.75 ? 'GO' : 'STOP';

      var waitTime = 1000 + Math.random() * 2000;
      nextTrialTimeout = setTimeout(showStimulus, waitTime);
    }

    function showStimulus() {
      trialState = 'STIMULUS';
      stimulusStartTime = Date.now();
      
      stimulusEl.className = 'stimulus ' + (trialType === 'GO' ? 'go' : 'stop');
      stimulusEl.innerText = trialType === 'GO' ? '🟢' : '🛑';
      stimulusEl.style.display = 'flex';

      stimulusTimeout = setTimeout(function() {
        if (!hasResponded) {
          handleTimeout();
        }
      }, STIMULUS_DURATION);
    }

    function handleTimeout() {
      stimulusEl.style.display = 'none';
      if (trialType === 'GO') {
        missedGo++;
        score = Math.max(0, score - 10);
        showFeedback('Trop lent!', '#F87171');
      } else {
        correctStop++;
        score += 20;
        showFeedback('Bien retenu!', '#34C78A');
      }
      scoreHud.innerText = 'Score: ' + score;
      startTrial();
    }

    function handleInteraction(e) {
      e.preventDefault();
      if (trialState === 'WAIT') {
        // Anticipatory response
        clearTimeout(nextTrialTimeout);
        score = Math.max(0, score - 10);
        scoreHud.innerText = 'Score: ' + score;
        showFeedback('Trop tôt!', '#F59E0B');
        startTrial(); // restart wait
        return;
      }
      if (trialState !== 'STIMULUS' || hasResponded) return;
      
      hasResponded = true;
      clearTimeout(stimulusTimeout);
      stimulusEl.style.display = 'none';

      var rt = Date.now() - stimulusStartTime;
      
      if (trialType === 'GO') {
        correctGo++;
        reactionTimes.push(rt);
        var timeScore = Math.max(5, 50 - Math.floor(rt / 20));
        score += timeScore;
        showFeedback(rt + 'ms', '#34C78A');
      } else {
        failedStop++;
        score = Math.max(0, score - 20);
        showFeedback('Erreur!', '#EF4444');
      }
      scoreHud.innerText = 'Score: ' + score;
      
      setTimeout(startTrial, 500);
    }

    stimulusEl.addEventListener('touchstart', handleInteraction);
    stimulusEl.addEventListener('mousedown', handleInteraction);
    gameArea.addEventListener('touchstart', function(e) { if(e.target !== stimulusEl) handleInteraction(e); });
    gameArea.addEventListener('mousedown', function(e) { if(e.target !== stimulusEl) handleInteraction(e); });

    function endGame() {
      trialState = 'IDLE';
      statusEl.innerText = 'Terminé ! Calcul des résultats...';
      
      var avgRT = reactionTimes.length > 0 
        ? reactionTimes.reduce(function(a,b){return a+b;},0) / reactionTimes.length 
        : 0;
      var duration = Math.floor((Date.now() - gameStartTime) / 1000);
      var maxPossibleScore = TOTAL_TRIALS * 50;
      var normalizedScore = Math.min(100, Math.round((score / maxPossibleScore) * 100));

      var results = {
        score: normalizedScore,
        reactionTime: avgRT / 1000,
        numberOfErrors: missedGo + failedStop,
        correctAnswers: correctGo + correctStop,
        missedTargets: missedGo,
        impulsiveClicks: failedStop,
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
      startTrial();
    });
  </script>
</body>
</html>
`;

export const getInhibitionGameHtml = (difficultyLevel: number): string => {
  const totalTrials = 10 + difficultyLevel * 5;
  const stimulusDuration = Math.max(600, 1500 - difficultyLevel * 200);

  return INHIBITION_GAME_HTML
    .replace(/__TOTAL_TRIALS__/g, String(totalTrials))
    .replace(/__STIMULUS_DURATION__/g, String(stimulusDuration));
};
