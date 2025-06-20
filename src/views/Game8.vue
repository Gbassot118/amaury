<template>
  <div class="game-container">
    <h1>Le Jardin des Animaux</h1>

    <div class="instructions">
      <p>Fais glisser exactement {{ currentNumber }} animaux dans le jardin pour gagner</p>
    </div>

    <div class="game-area">
      <!-- Target number display -->
      <div class="target-number-container">
        <div class="target-number">{{ currentNumber }}</div>
        <div class="counter">{{ placedAnimalsCount }}/{{ currentNumber }}</div>
      </div>

      <!-- Garden area (drop zone) -->
      <div 
        class="garden-container"
        @dragover.prevent
        @drop="dropAnimal($event)"
      >
        <h3 class="container-title">Le Jardin</h3>
        <div class="garden">
          <div class="garden-decoration">
            <div class="garden-icon">🌳</div>
            <div class="garden-icon">🌷</div>
            <div class="garden-icon">🌿</div>
            <div class="garden-icon">🌱</div>
          </div>
          <div 
            v-for="animal in placedAnimals" 
            :key="animal.id" 
            class="animal-in-garden"
            :style="{ 
              position: 'absolute', 
              left: animal.position.x + 'px', 
              top: animal.position.y + 'px' 
            }"
          >
            {{ animal.icon }}
          </div>
        </div>
      </div>

      <!-- Animals enclosure (source) -->
      <div class="container-wrapper enclosure-wrapper">
        <h3 class="container-title">Enclos des Animaux</h3>
        <div class="animals-container">
          <div 
            v-for="(animal, index) in animals" 
            :key="index"
            class="animal"
            :class="{ 'placed': animal.placed }"
            draggable="true"
            @dragstart="dragStart($event, animal)"
            v-show="!animal.placed"
            :style="{ 
              position: 'absolute', 
              left: animal.enclosurePosition.x + 'px', 
              top: animal.enclosurePosition.y + 'px',
              transition: 'left 2s, top 2s'
            }"
          >
            {{ animal.icon }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="showFeedback" class="feedback-message" :class="{ 'success': feedbackSuccess }">
      <p>{{ feedbackMessage }}</p>
    </div>

    <div v-if="gameCompleted" class="victory-message">
      <h2>Bravo !</h2>
      <p>Tu as réussi à placer exactement {{ currentNumber }} animaux dans le jardin !</p>
      <button @click="resetGame" class="reset-button">Rejouer</button>
      <router-link to="/" class="home-button">Menu Principal</router-link>
    </div>

    <Fireworks v-if="gameCompleted" ref="fireworks" class="fireworks-container" />
  </div>
</template>

<script>
import { Fireworks } from '@fireworks-js/vue'

export default {
  name: 'AnimalGardenGame',
  components: {
    Fireworks
  },
  data() {
    return {
      totalAnimals: 15, // More than 10 to avoid cheating
      animals: [],
      placedAnimals: [],
      currentDraggedAnimal: null,
      currentNumber: 1, // Start with 1
      maxNumber: 10, // Count up to 10
      placedAnimalsCount: 0,
      gameCompleted: false,
      fireworksTimer: null,
      animationTimer: null,
      showFeedback: false,
      feedbackMessage: '',
      feedbackSuccess: false,
      feedbackTimer: null,
      animalIcons: [
        '🐰', '🐸', '🐦', '🐢', '🦊', '🐿️', '🦔', '🐝', '🦋', '🐌'
      ]
    }
  },
  created() {
    this.initializeGame();
  },
  mounted() {
    // Add document-level dragend event to handle drops outside garden
    document.addEventListener('dragend', this.handleDragEnd);

    // Start the animation of animals in the enclosure
    this.startAnimalsAnimation();
  },
  beforeUnmount() {
    // Clean up event listeners and timers
    document.removeEventListener('dragend', this.handleDragEnd);
    this.stopAnimalsAnimation();

    if (this.fireworksTimer) {
      clearTimeout(this.fireworksTimer);
    }

    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
    }
  },
  methods: {
    initializeGame() {
      // Create animals
      this.animals = Array.from({ length: this.totalAnimals }, (_, i) => {
        const randomIconIndex = Math.floor(Math.random() * this.animalIcons.length);
        // Generate random positions within the enclosure
        const randomX = Math.floor(Math.random() * 200);
        const randomY = Math.floor(Math.random() * 200);
        return {
          id: i,
          placed: false,
          icon: this.animalIcons[randomIconIndex],
          position: { x: 0, y: 0 },
          enclosurePosition: { x: randomX, y: randomY }
        };
      });

      this.placedAnimals = [];
      // Choose a random number between 1 and 10
      this.currentNumber = Math.floor(Math.random() * 10) + 1;
      this.placedAnimalsCount = 0;
      this.gameCompleted = false;
      this.showFeedback = false;
    },

    dragStart(event, animal) {
      this.currentDraggedAnimal = animal;
      event.dataTransfer.setData('text/plain', animal.id);
    },

    dropAnimal(event) {
      event.preventDefault();

      if (!this.currentDraggedAnimal || this.currentDraggedAnimal.placed) {
        return;
      }

      // Calculate position relative to the garden
      const gardenRect = event.currentTarget.getBoundingClientRect();
      // Adjust position to center the animal on the cursor
      // The animals are 30px in size (font-size: 30px)
      const animalSize = 30;
      const x = event.clientX - gardenRect.left - (animalSize / 2);
      const y = event.clientY - gardenRect.top - (animalSize / 2);

      // Place the animal in the garden with position
      this.currentDraggedAnimal.placed = true;
      this.currentDraggedAnimal.position = { x, y };
      this.placedAnimals.push({ ...this.currentDraggedAnimal });
      this.placedAnimalsCount++;

      // Check if the correct number of animals has been placed
      if (this.placedAnimalsCount === this.currentNumber) {
        // Success! Show positive feedback
        this.showSuccessFeedback();

        // End the game after a delay
        setTimeout(() => {
          this.gameCompleted = true;
          this.$nextTick(() => {
            this.startFireworks();
          });
        }, 2000);
      } else if (this.placedAnimalsCount > this.currentNumber) {
        // Too many animals! Show error feedback
        this.showErrorFeedback();

        // Return the last animal to the enclosure
        this.returnLastAnimal();
      }
    },

    handleDragEnd() {
      this.currentDraggedAnimal = null;
    },

    returnLastAnimal() {
      if (this.placedAnimals.length > 0) {
        const lastAnimal = this.placedAnimals.pop();
        const animalIndex = this.animals.findIndex(a => a.id === lastAnimal.id);

        if (animalIndex !== -1) {
          this.animals[animalIndex].placed = false;
          this.placedAnimalsCount--;
        }
      }
    },

    showSuccessFeedback() {
      this.feedbackSuccess = true;
      this.feedbackMessage = 'Bravo ! C\'est le bon nombre d\'animaux !';
      this.showFeedback = true;

      // Clear any existing feedback timer
      if (this.feedbackTimer) {
        clearTimeout(this.feedbackTimer);
      }

      // Hide feedback after 2 seconds
      this.feedbackTimer = setTimeout(() => {
        this.showFeedback = false;
      }, 2000);
    },

    showErrorFeedback() {
      this.feedbackSuccess = false;
      this.feedbackMessage = 'Tu en as mis un de trop ! Essayons encore.';
      this.showFeedback = true;

      // Clear any existing feedback timer
      if (this.feedbackTimer) {
        clearTimeout(this.feedbackTimer);
      }

      // Hide feedback after 2 seconds
      this.feedbackTimer = setTimeout(() => {
        this.showFeedback = false;
      }, 2000);
    },

    // Method removed as we no longer need to progress through numbers sequentially

    startAnimalsAnimation() {
      // Animate animals in the enclosure
      this.animationTimer = setInterval(() => {
        this.animals.forEach(animal => {
          if (!animal.placed) {
            // Generate new random positions within the enclosure
            animal.enclosurePosition = {
              x: Math.floor(Math.random() * 200),
              y: Math.floor(Math.random() * 200)
            };
          }
        });
      }, 3000);
    },

    stopAnimalsAnimation() {
      if (this.animationTimer) {
        clearInterval(this.animationTimer);
        this.animationTimer = null;
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

      this.initializeGame();
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

.game-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.target-number-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.target-number {
  font-size: 80px;
  font-weight: bold;
  color: #42b983;
  background-color: #f5f5f5;
  border: 3px solid #42b983;
  border-radius: 50%;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.counter {
  font-size: 24px;
  font-weight: bold;
  color: #42b983;
}

.garden-container {
  width: 100%;
  margin-bottom: 30px;
}

.garden {
  height: 300px;
  border: 3px solid #42b983;
  border-radius: 10px;
  background-color: #d7f7e8;
  position: relative;
  overflow: hidden;
}

.garden-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  opacity: 0.3;
  pointer-events: none;
}

.garden-icon {
  font-size: 40px;
  margin: 10px;
}

.container-wrapper {
  width: 100%;
}

.enclosure-wrapper {
  margin-bottom: 30px;
}

.animals-container {
  height: 200px;
  border: 3px solid #42b983;
  border-radius: 10px;
  background-color: #f5f5f5;
  position: relative;
  overflow: hidden;
}

.animal {
  font-size: 30px;
  cursor: grab;
  user-select: none;
  z-index: 10;
}

.animal-in-garden {
  font-size: 30px;
  position: absolute;
  z-index: 5;
}

.container-title {
  margin-bottom: 10px;
  color: #42b983;
}

.feedback-message {
  padding: 15px;
  border-radius: 10px;
  margin: 20px 0;
  text-align: center;
  font-size: 20px;
  animation: fadeIn 0.5s;
}

.feedback-message.success {
  background-color: #d7f7e8;
  color: #42b983;
}

.feedback-message:not(.success) {
  background-color: #ffe6e6;
  color: #ff6b6b;
}

.victory-message {
  margin-top: 40px;
  padding: 20px;
  background-color: #d7f7e8;
  border-radius: 10px;
  animation: fadeIn 1s;
  text-align: center;
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
