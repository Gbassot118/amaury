<template>
  <div class="game-container">
    <h1>Jeu des Chiffres</h1>

    <div class="instructions">
      <p>Tape les chiffres dans l'ordre</p>
    </div>

    <div class="number-rows">
      <div 
        v-for="(number, index) in numbers" 
        :key="index" 
        class="number-row"
      >
        <div 
          class="number-box"
          :class="{
            'completed': index < currentNumberIndex,
            'current': index === currentNumberIndex,
            'pending': index > currentNumberIndex
          }"
        >
          <span v-if="index < currentNumberIndex || (index === currentNumberIndex && showCurrentNumber)">{{ number }}</span>
          <span v-else>{{ number }}</span>
        </div>
        <div class="flowers">
          <span 
            v-for="n in number" 
            :key="n" 
            class="flower"
          >
            🌸
          </span>
        </div>
      </div>
    </div>

    <div v-if="showError" class="error-message">
      <span>{{ errorNumber }}</span>
    </div>

    <div v-if="gameCompleted" class="victory-message">
      <h2>Bravo !</h2>
      <p>Tu as réussi à taper tous les chiffres !</p>
      <button @click="resetGame" class="reset-button">Rejouer</button>
      <router-link to="/" class="home-button">Menu Principal</router-link>
    </div>

    <Fireworks v-if="gameCompleted" ref="fireworks" class="fireworks-container" />
  </div>
</template>

<script>
import { Fireworks } from '@fireworks-js/vue'

export default {
  name: 'NumberGame',
  components: {
    Fireworks
  },
  data() {
    return {
      numbers: [],
      currentNumberIndex: 0,
      showError: false,
      errorNumber: '',
      gameCompleted: false,
      showCurrentNumber: false,
      fireworksTimer: null
    }
  },
  created() {
    this.generateRandomNumbers();
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyPress);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyPress);
  },
  watch: {
    gameCompleted(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.startFireworks();
        });
      }
    }
  },
  methods: {
    generateRandomNumbers() {
      // Generate 3 random numbers between 1 and 9
      this.numbers = [];
      for (let i = 0; i < 3; i++) {
        const randomNumber = Math.floor(Math.random() * 9) + 1;
        this.numbers.push(randomNumber);
      }
    },
    handleKeyPress(event) {
      if (this.gameCompleted) return;

      const pressedKey = event.key;

      // Only process numeric keys
      if (/^[0-9]$/.test(pressedKey)) {
        const expectedNumber = this.numbers[this.currentNumberIndex].toString();

        if (pressedKey === expectedNumber) {
          // Correct number
          this.showCurrentNumber = true;

          // Delay to show the number before moving to next
          setTimeout(() => {
            this.currentNumberIndex++;
            this.showCurrentNumber = false;

            // Check if game is completed
            if (this.currentNumberIndex >= this.numbers.length) {
              this.gameCompleted = true;
            }
          }, 1);
        } else {
          // Wrong number
          this.showError = true;
          this.errorNumber = pressedKey;

          // Hide error message after a delay
          setTimeout(() => {
            this.showError = false;
            this.errorNumber = '';
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

      this.generateRandomNumbers();
      this.currentNumberIndex = 0;
      this.showError = false;
      this.errorNumber = '';
      this.gameCompleted = false;
      this.showCurrentNumber = false;
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

.number-rows {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 50px;
}

.number-row {
  display: flex;
  align-items: center;
  gap: 20px;
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

.number-box.completed {
  border-color: #42b983;
  background-color: #d7f7e8;
  color: #42b983;
}

.number-box.current {
  border-color: #42b983;
  border-width: 4px;
  box-shadow: 0 0 10px rgba(66, 185, 131, 0.5);
  color: #cccccc;
}

.number-box.pending {
  background-color: #f0f0f0;
  color: #cccccc; /* Gray text color for pending numbers */
}

.flowers {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.flower {
  font-size: 24px;
  animation: sway 2s infinite ease-in-out;
}

.flower:nth-child(odd) {
  animation-delay: 0.5s;
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

@keyframes sway {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
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
