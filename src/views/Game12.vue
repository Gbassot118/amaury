<template>
  <div class="game-container">
    <h1>Code Caché</h1>

    <div class="instructions">
      <p>Retrouve et mémorise les codes à 3 chiffres en explorant l'environnement.</p>
    </div>

    <!-- Main Game Area -->
    <div class="game-area" v-if="!gameCompleted">
      <!-- Home Screen with Clue and Code Input -->
      <div v-if="!exploring" class="home-screen">
        <div class="clue-container">
          <div class="clue-icon">{{ currentClue.icon }}</div>
          <div class="clue-name">{{ currentClue.name }}</div>
        </div>

        <div class="code-input">
          <div class="code-display">{{ enteredCode.join('') || '___' }}</div>
          <div class="keypad">
            <button 
              v-for="num in [1,2,3,4,5,6,7,8,9,0]" 
              :key="num" 
              @click="addDigit(num)"
              class="keypad-button"
            >
              {{ num }}
            </button>
            <button @click="clearCode()" class="keypad-button clear-button">C</button>
          </div>
          <button @click="validateCode()" class="validate-button" :disabled="enteredCode.length < 3">Valider</button>
        </div>

        <button @click="startExploration()" class="explore-button">Explorer</button>
      </div>

      <!-- Exploration Area -->
      <div v-else class="exploration-area">
        <div class="environment" :class="'level-' + (currentLevel + 1)">
          <div 
            v-for="(item, index) in levels[currentLevel].items" 
            :key="index"
            class="interactive-item"
            :class="{ 'has-clue': item.hasClue }"
            :style="{ left: item.x + '%', top: item.y + '%' }"
            @click="examineItem(item)"
          >
            <div class="item-icon">{{ item.icon }}</div>
          </div>
        </div>

        <button @click="returnHome()" class="return-button">Retour</button>
      </div>

      <!-- Feedback Messages -->
      <div v-if="showFeedback" class="feedback-message" :class="{ 'success': feedbackSuccess }">
        <p>{{ feedbackMessage }}</p>
      </div>

      <!-- Item Examination Modal -->
      <div v-if="showExamination" class="examination-modal">
        <div class="examination-content">
          <div class="examined-item">
            <div class="item-icon large">{{ examinedItem.icon }}</div>
            <div v-if="examinedItem.hasClue" class="clue-reveal">
              <div class="clue-icon">{{ currentClue.icon }}</div>
              <div class="code-reveal" :class="{ 'flash': examinedItem.flashCode }">{{ currentClue.code.join('-') }}</div>
            </div>
            <div v-else class="no-clue-message">Rien d'intéressant ici...</div>
          </div>
          <button @click="closeExamination()" class="close-button">Fermer</button>
        </div>
      </div>
    </div>

    <!-- Level Complete Message -->
    <div v-if="levelCompleted && !gameCompleted" class="level-complete-message">
      <h2>Bravo !</h2>
      <p>Tu as trouvé le bon code pour {{ currentClue.name }} !</p>
      <button @click="nextLevel()" class="next-button">Niveau Suivant</button>
    </div>

    <!-- Game Complete Message -->
    <div v-if="gameCompleted" class="victory-message">
      <h2>Félicitations !</h2>
      <p>Tu as réussi à trouver tous les codes cachés !</p>
      <button @click="resetGame()" class="reset-button">Rejouer</button>
      <router-link to="/" class="home-button">Menu Principal</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CodeCacheGame',
  data() {
    return {
      currentLevel: 0,
      levels: [
        // Level 1: One code to find
        {
          clue: { icon: '🐸', name: 'Grenouille', code: [3, 7, 2] },
          items: [
            { icon: '🌳', x: 20, y: 30, hasClue: false },
            { icon: '🪵', x: 60, y: 40, hasClue: true },
            { icon: '🌿', x: 80, y: 70, hasClue: false },
            { icon: '🍄', x: 30, y: 60, hasClue: false },
            { icon: '🪨', x: 50, y: 20, hasClue: false }
          ]
        },
        // Level 2: Two codes to remember
        {
          clue: { icon: '🦊', name: 'Renard', code: [5, 1, 9] },
          items: [
            { icon: '🌲', x: 15, y: 25, hasClue: false },
            { icon: '🏠', x: 45, y: 35, hasClue: false },
            { icon: '📪', x: 75, y: 30, hasClue: true },
            { icon: '🌻', x: 25, y: 70, hasClue: false },
            { icon: '🪑', x: 60, y: 60, hasClue: false },
            { icon: '📦', x: 40, y: 50, hasClue: false }
          ],
          multipleClues: true,
          secondClue: { icon: '🦉', name: 'Hibou', code: [8, 4, 6] }
        },
        // Level 3: Flash code (visible for 1 second)
        {
          clue: { icon: '🦋', name: 'Papillon', code: [2, 9, 4] },
          items: [
            { icon: '🌺', x: 20, y: 40, hasClue: false },
            { icon: '🧸', x: 50, y: 30, hasClue: false },
            { icon: '🪞', x: 70, y: 50, hasClue: true, flashCode: true },
            { icon: '🧩', x: 30, y: 70, hasClue: false },
            { icon: '🎨', x: 60, y: 20, hasClue: false },
            { icon: '📚', x: 40, y: 60, hasClue: false },
            { icon: '🧶', x: 80, y: 35, hasClue: false }
          ]
        },
        // Level 4: Similar codes (need to be attentive)
        {
          clue: { icon: '🐱', name: 'Chat', code: [6, 3, 8] },
          items: [
            { icon: '🛋️', x: 25, y: 35, hasClue: false, fakeCode: [6, 8, 3] },
            { icon: '🧸', x: 55, y: 25, hasClue: true },
            { icon: '🧺', x: 75, y: 45, hasClue: false, fakeCode: [3, 6, 8] },
            { icon: '🪴', x: 35, y: 65, hasClue: false },
            { icon: '🧣', x: 65, y: 55, hasClue: false, fakeCode: [8, 3, 6] },
            { icon: '📱', x: 45, y: 15, hasClue: false },
            { icon: '🧦', x: 15, y: 75, hasClue: false }
          ],
          similarCodes: true
        }
      ],
      currentClue: null,
      enteredCode: [],
      exploring: false,
      showFeedback: false,
      feedbackMessage: '',
      feedbackSuccess: false,
      feedbackTimer: null,
      levelCompleted: false,
      gameCompleted: false,
      showExamination: false,
      examinedItem: null,
      rememberedCodes: [],
      currentClueIndex: 0
    };
  },
  created() {
    this.initializeGame();
  },
  methods: {
    initializeGame() {
      this.currentLevel = 0;
      this.gameCompleted = false;
      this.levelCompleted = false;
      this.loadLevel();
    },

    loadLevel() {
      const level = this.levels[this.currentLevel];
      this.currentClue = level.clue;
      this.enteredCode = [];
      this.exploring = false;
      this.showFeedback = false;
      this.levelCompleted = false;
      this.rememberedCodes = [];
      this.currentClueIndex = 0;

      // Shuffle the items positions slightly to avoid memorization
      level.items.forEach(item => {
        item.x = Math.max(10, Math.min(90, item.x + (Math.random() * 10 - 5)));
        item.y = Math.max(10, Math.min(90, item.y + (Math.random() * 10 - 5)));
      });

      // For levels with multiple clues, prepare the array of clues
      if (level.multipleClues) {
        this.rememberedCodes = [
          { clue: level.clue, found: false },
          { clue: level.secondClue, found: false }
        ];
        this.currentClue = this.rememberedCodes[0].clue;
      }
    },

    startExploration() {
      this.exploring = true;
    },

    returnHome() {
      this.exploring = false;
    },

    examineItem(item) {
      this.examinedItem = item;
      this.showExamination = true;

      // If this item has the clue and it's a flash code, show it briefly
      if (item.hasClue && item.flashCode) {
        setTimeout(() => {
          this.closeExamination();
        }, 1000);
      }

      // For levels with similar codes, show fake codes on some items
      if (this.levels[this.currentLevel].similarCodes && item.fakeCode) {
        item.hasClue = true;
        item.tempCode = this.currentClue.code;
        this.currentClue.code = item.fakeCode;

        setTimeout(() => {
          this.currentClue.code = item.tempCode;
          delete item.tempCode;
        }, 2000);
      }
    },

    closeExamination() {
      this.showExamination = false;
      this.examinedItem = null;
    },

    addDigit(digit) {
      if (this.enteredCode.length < 3) {
        this.enteredCode.push(digit);
      }
    },

    clearCode() {
      this.enteredCode = [];
    },

    validateCode() {
      const level = this.levels[this.currentLevel];
      let success = false;
      let message = '';

      // For levels with multiple clues
      if (level.multipleClues) {
        const currentClueObj = this.rememberedCodes[this.currentClueIndex];

        if (this.arraysEqual(this.enteredCode, currentClueObj.clue.code)) {
          success = true;
          currentClueObj.found = true;
          message = `Bravo ! Tu as trouvé le bon code pour ${currentClueObj.clue.name} !`;

          // Check if all clues are found
          if (this.rememberedCodes.every(c => c.found)) {
            this.levelCompleted = true;
          } else {
            // Move to the next clue
            this.currentClueIndex = (this.currentClueIndex + 1) % this.rememberedCodes.length;
            this.currentClue = this.rememberedCodes[this.currentClueIndex].clue;
            this.enteredCode = [];
          }
        } else {
          success = false;
          message = `Ce n'est pas le bon code pour ${currentClueObj.clue.name}. Réessaie !`;
        }
      } else {
        // Regular level with one code
        if (this.arraysEqual(this.enteredCode, this.currentClue.code)) {
          success = true;
          message = `Bravo ! Tu as trouvé le bon code pour ${this.currentClue.name} !`;
          this.levelCompleted = true;
        } else {
          success = false;
          message = `Ce n'est pas le bon code. Réessaie !`;
        }
      }

      this.showFeedbackMessage(message, success);

      if (this.levelCompleted) {
        // Check if this was the last level
        if (this.currentLevel === this.levels.length - 1) {
          setTimeout(() => {
            this.gameCompleted = true;
          }, 2000);
        }
      }
    },

    showFeedbackMessage(message, success) {
      this.feedbackSuccess = success;
      this.feedbackMessage = message;
      this.showFeedback = true;

      // Clear any existing feedback timer
      if (this.feedbackTimer) {
        clearTimeout(this.feedbackTimer);
      }

      // Hide feedback after 3 seconds
      this.feedbackTimer = setTimeout(() => {
        this.showFeedback = false;
      }, 3000);
    },

    nextLevel() {
      this.currentLevel++;
      // Check if we've exceeded the available levels
      if (this.currentLevel >= this.levels.length) {
        this.gameCompleted = true;
        return;
      }
      this.loadLevel();
    },

    resetGame() {
      this.initializeGame();
    },

    arraysEqual(arr1, arr2) {
      if (arr1.length !== arr2.length) return false;
      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
      }
      return true;
    }
  }
};
</script>

<style scoped>
.game-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

h1 {
  color: #6a5acd;
  text-align: center;
  margin-bottom: 20px;
}

.instructions {
  text-align: center;
  margin-bottom: 30px;
  font-size: 18px;
}

.game-area {
  position: relative;
  background-color: #f8f8ff;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

/* Home Screen Styles */
.home-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.clue-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.clue-icon {
  font-size: 60px;
  margin-bottom: 10px;
}

.clue-name {
  font-size: 24px;
  font-weight: bold;
  color: #6a5acd;
}

.code-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.code-display {
  font-size: 36px;
  font-weight: bold;
  background-color: white;
  padding: 10px 20px;
  border-radius: 10px;
  min-width: 120px;
  text-align: center;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
  letter-spacing: 5px;
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 10px;
}

.keypad-button {
  width: 60px;
  height: 60px;
  font-size: 24px;
  border-radius: 50%;
  border: none;
  background-color: #6a5acd;
  color: white;
  cursor: pointer;
  transition: transform 0.1s, background-color 0.3s;
}

.keypad-button:hover {
  background-color: #5a4abf;
  transform: scale(1.05);
}

.keypad-button:active {
  transform: scale(0.95);
}

.clear-button {
  background-color: #ff6b6b;
}

.clear-button:hover {
  background-color: #ff5252;
}

.validate-button {
  padding: 10px 30px;
  font-size: 18px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.validate-button:hover {
  background-color: #45a049;
}

.validate-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.explore-button {
  padding: 12px 30px;
  font-size: 18px;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.explore-button:hover {
  background-color: #f57c00;
}

/* Exploration Area Styles */
.exploration-area {
  position: relative;
  height: 500px;
}

.environment {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
}

.level-1 {
  background-color: #e6f7ff;
}

.level-2 {
  background-color: #f0f7e6;
}

.level-3 {
  background-color: #fff0e6;
}

.level-4 {
  background-color: #f7e6ff;
}

.interactive-item {
  position: absolute;
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s;
  z-index: 2;
}

.interactive-item:hover {
  transform: scale(1.2);
}

.item-icon {
  font-size: 40px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
}

.item-icon.large {
  font-size: 80px;
}

.return-button {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  font-size: 16px;
  background-color: #6a5acd;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.return-button:hover {
  background-color: #5a4abf;
}

/* Feedback Message Styles */
.feedback-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ff6b6b;
  color: white;
  padding: 15px 30px;
  border-radius: 10px;
  z-index: 100;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s;
}

.feedback-message.success {
  background-color: #4caf50;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Examination Modal Styles */
.examination-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.examination-content {
  background-color: white;
  padding: 30px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 80%;
  animation: zoomIn 0.3s;
}

@keyframes zoomIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.examined-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.clue-reveal {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.code-reveal {
  font-size: 36px;
  font-weight: bold;
  color: #6a5acd;
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #f0f0ff;
  border-radius: 10px;
  letter-spacing: 5px;
}

.code-reveal.flash {
  animation: flashCode 1s;
}

@keyframes flashCode {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}

.no-clue-message {
  margin-top: 20px;
  font-size: 18px;
  color: #666;
}

.close-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #6a5acd;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.close-button:hover {
  background-color: #5a4abf;
}

/* Level Complete and Victory Message Styles */
.level-complete-message, .victory-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 100;
  animation: bounceIn 0.5s;
}

@keyframes bounceIn {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
  50% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.level-complete-message h2, .victory-message h2 {
  color: #6a5acd;
  margin-bottom: 15px;
}

.next-button, .reset-button, .home-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #6a5acd;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin: 10px;
  display: inline-block;
  text-decoration: none;
}

.next-button:hover, .reset-button:hover, .home-button:hover {
  background-color: #5a4abf;
}

.home-button {
  background-color: #ff9800;
}

.home-button:hover {
  background-color: #f57c00;
}
</style>
