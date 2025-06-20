<template>
  <div class="game-container">
    <h1>Jeu d'Addition</h1>

    <div class="instructions">
      <p>Calcule la somme des deux nombres et tape le résultat</p>
    </div>

    <div class="number-boxes">
      <div class="number-box">
        <span>{{ firstNumber }}</span>
      </div>
      <div class="operator">+</div>
      <div class="number-box">
        <span>{{ secondNumber }}</span>
      </div>
      <div class="operator">=</div>
      <div 
        class="number-box result-box"
        :class="{
          'completed': resultEntered && isCorrect,
          'error': resultEntered && !isCorrect
        }"
      >
        <span v-if="resultEntered">{{ userResult }}</span>
      </div>
    </div>

    <div v-if="resultEntered && !isCorrect" class="error-message">
      <span>{{ userResult }}</span>
    </div>

    <div v-if="gameCompleted" class="victory-message">
      <h2>Bravo !</h2>
      <p>Tu as trouvé le bon résultat !</p>
      <button @click="resetGame" class="reset-button">Nouveau calcul</button>
      <router-link to="/" class="home-button">Menu Principal</router-link>
    </div>

    <Fireworks v-if="gameCompleted" ref="fireworks" class="fireworks-container" />
  </div>
</template>

<script>
import { Fireworks } from '@fireworks-js/vue'

export default {
  name: 'AdditionGame',
  components: {
    Fireworks
  },
  data() {
    return {
      firstNumber: 0,
      secondNumber: 0,
      userResult: '',
      resultEntered: false,
      isCorrect: false,
      gameCompleted: false,
      fireworksTimer: null
    }
  },
  computed: {
    correctResult() {
      return this.firstNumber + this.secondNumber;
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyPress);
    this.generateNewProblem();
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyPress);
    if (this.fireworksTimer) {
      clearTimeout(this.fireworksTimer);
    }
  },
  methods: {
    generateNewProblem() {
      // Generate two random numbers whose sum is less than or equal to 9
      const maxSum = 9;
      this.firstNumber = Math.floor(Math.random() * maxSum) + 1; // 1 to 9
      
      // Ensure the sum is at most 9
      const maxSecondNumber = maxSum - this.firstNumber;
      this.secondNumber = Math.floor(Math.random() * (maxSecondNumber + 1)); // 0 to maxSecondNumber
      
      this.userResult = '';
      this.resultEntered = false;
      this.isCorrect = false;
      this.gameCompleted = false;
    },
    handleKeyPress(event) {
      if (this.gameCompleted) return;

      const pressedKey = event.key;

      // Only process numeric keys 0-9
      if (/^[0-9]$/.test(pressedKey)) {
        this.userResult = pressedKey;
        this.resultEntered = true;
        
        // Check if the answer is correct
        this.isCorrect = parseInt(this.userResult) === this.correctResult;
        
        if (this.isCorrect) {
          // Correct answer
          setTimeout(() => {
            this.gameCompleted = true;
            this.$nextTick(() => {
              this.startFireworks();
            });
          }, 500);
        } else {
          // Wrong answer - show error briefly then reset
          setTimeout(() => {
            this.resultEntered = false;
            this.userResult = '';
          }, 1500);
        }
      }
    },
    startFireworks() {
      if (this.$refs.fireworks) {
        const fireworks = this.$refs.fireworks;
        fireworks.updateOptions({
          autoresize: true,
          opacity: 0.5,
          acceleration: 1.05,
          friction: 0.97,
          gravity: 1.5,
          particles: 50,
          traceLength: 3,
          traceSpeed: 10,
          explosion: 5,
          intensity: 30,
          flickering: 50,
          lineStyle: 'round',
          hue: {
            min: 0,
            max: 360
          },
          delay: {
            min: 30,
            max: 60
          },
          rocketsPoint: {
            min: 50,
            max: 50
          },
          lineWidth: {
            explosion: {
              min: 1,
              max: 3
            },
            trace: {
              min: 1,
              max: 2
            }
          },
          brightness: {
            min: 50,
            max: 80
          },
          decay: {
            min: 0.015,
            max: 0.03
          },
          mouse: {
            click: false,
            move: false,
            max: 1
          }
        });
        fireworks.start();

        // Stop fireworks after 10 seconds
        this.fireworksTimer = setTimeout(() => {
          if (this.$refs.fireworks) {
            this.$refs.fireworks.stop();
          }
        }, 10000);
      }
    },
    resetGame() {
      if (this.$refs.fireworks) {
        this.$refs.fireworks.stop();
      }

      // Clear the fireworks timer if it exists
      if (this.fireworksTimer) {
        clearTimeout(this.fireworksTimer);
        this.fireworksTimer = null;
      }

      this.generateNewProblem();
    }
  }
}
</script>

<style scoped>
.game-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #42b983;
  margin-bottom: 30px;
}

.instructions {
  margin-bottom: 40px;
  font-size: 20px;
}

.number-boxes {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 50px;
}

.number-box {
  width: 80px;
  height: 80px;
  border: 3px solid #ccc;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: bold;
}

.operator {
  font-size: 40px;
  font-weight: bold;
  margin: 0 5px;
}

.result-box {
  border-color: #42b983;
  border-width: 4px;
  box-shadow: 0 0 10px rgba(66, 185, 131, 0.5);
}

.number-box.completed {
  border-color: #42b983;
  background-color: #d7f7e8;
  color: #42b983;
}

.number-box.error {
  border-color: #ff5252;
  background-color: #ffeded;
  color: #ff5252;
  animation: shake 0.5s;
}

.error-message {
  margin: 30px auto;
  animation: shake 0.5s;
}

.error-message span {
  font-size: 100px;
  color: #ff5252;
  font-weight: bold;
}

.victory-message {
  margin-top: 40px;
  padding: 20px;
  background-color: #d7f7e8;
  border-radius: 10px;
  animation: fadeIn 1s;
}

.victory-message h2 {
  color: #42b983;
  font-size: 36px;
  margin-bottom: 10px;
}

.reset-button, .home-button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin: 10px;
  display: inline-block;
  text-decoration: none;
}

.reset-button:hover, .home-button:hover {
  background-color: #3aa876;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fireworks-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}
</style>