<template>
  <div class="game-container">
    <h1>Les Flocons de Cristalia</h1>

    <div class="instructions">
      <p>{{ currentLevel.instructions }}</p>
    </div>

    <div class="game-area">
      <!-- Map with locations (only shown on first screen) -->
      <div v-if="!currentLocation" class="map-container">
        <h2>Carte du Royaume de Cristalia</h2>
        <div class="map-locations">
          <div 
            v-for="(location, index) in locations" 
            :key="index"
            class="location"
            :class="{ 'unlocked': index <= unlockedLocationIndex, 'current': index === currentLocationIndex }"
            @click="selectLocation(index)"
          >
            <div class="location-icon">{{ location.icon }}</div>
            <div class="location-name">{{ location.name }}</div>
          </div>
        </div>
      </div>

      <!-- Location view (shown when a location is selected) -->
      <div v-if="currentLocation" class="location-view">
        <div class="location-header">
          <div class="location-title">
            <div class="location-icon large">{{ currentLocation.icon }}</div>
            <h2>{{ currentLocation.name }}</h2>
          </div>
          <div class="mission-container">
            <h3>Mission</h3>
            <p>{{ currentLevel.mission }}</p>
          </div>
        </div>

        <!-- Snowflake collection area -->
        <div class="collection-area">
          <div class="snowflake-types">
            <div 
              v-for="(flake, index) in currentLevel.availableFlakes" 
              :key="index"
              class="snowflake-type"
            >
              <div class="flake-icon">{{ flake.icon }}</div>
              <div class="flake-name">{{ flake.name }}</div>
              <div class="flake-controls">
                <button 
                  @click="removeFlake(flake.type)" 
                  :disabled="getFlakeCount(flake.type) <= 0"
                  class="flake-button"
                >-</button>
                <span class="flake-count">{{ getFlakeCount(flake.type) }}</span>
                <button 
                  @click="addFlake(flake.type)" 
                  :disabled="getFlakeCount(flake.type) >= flake.max || totalFlakes >= currentLevel.targetTotal"
                  class="flake-button"
                >+</button>
              </div>
            </div>
          </div>

          <div class="magic-bag">
            <h3>Sac Magique</h3>
            <div class="bag-content">
              <div v-for="(group, type) in collectedFlakes" :key="type" class="flake-group">
                <div v-for="n in group.count" :key="`${type}-${n}`" class="collected-flake">
                  {{ group.icon }}
                </div>
              </div>
            </div>
            <div class="bag-counter">
              <span>{{ totalFlakes }} / {{ currentLevel.targetTotal }}</span>
              <div v-if="currentLevel.exactTotal && totalFlakes > 0" class="counter-status" :class="{ 'success': totalFlakes === currentLevel.targetTotal, 'error': totalFlakes !== currentLevel.targetTotal }">
                {{ totalFlakes === currentLevel.targetTotal ? '✓' : totalFlakes < currentLevel.targetTotal ? 'Il te manque des flocons' : 'Trop de flocons !' }}
              </div>
            </div>
          </div>

          <button 
            @click="validateMission" 
            class="validate-button"
            :disabled="!canValidate"
          >
            Valider
          </button>
        </div>
      </div>
    </div>

    <div v-if="showFeedback" class="feedback-message" :class="{ 'success': feedbackSuccess }">
      <p>{{ feedbackMessage }}</p>
    </div>

    <div v-if="missionCompleted && !gameCompleted" class="mission-complete-message">
      <h2>Bravo !</h2>
      <p>Tu as réussi la mission à {{ currentLocation.name }} !</p>
      <p>Une partie du palais de la Reine Cristalia a été reconstruite !</p>
      <button @click="returnToMap" class="next-button">Retour à la carte</button>
    </div>

    <div v-if="gameCompleted" class="victory-message">
      <h2>Félicitations !</h2>
      <p>Tu as aidé la Reine Cristalia à reconstruire son palais de glace ! 🏰❄️</p>
      <p>Le Royaume de Cristalia est sauvé grâce à toi !</p>
      <button @click="resetGame" class="reset-button">Rejouer</button>
      <router-link to="/" class="home-button">Menu Principal</router-link>
    </div>

    <Fireworks v-if="gameCompleted" ref="fireworks" class="fireworks-container" />
  </div>
</template>

<script>
import { Fireworks } from '@fireworks-js/vue'

export default {
  name: 'CristaliaGame',
  components: {
    Fireworks
  },
  data() {
    return {
      currentLocationIndex: null,
      unlockedLocationIndex: 0,
      currentLocation: null,
      missionCompleted: false,
      gameCompleted: false,
      showFeedback: false,
      feedbackMessage: '',
      feedbackSuccess: false,
      feedbackTimer: null,
      fireworksTimer: null,
      collectedFlakes: {},
      locations: [
        { name: "Forêt Gelée", icon: "🌲", completed: false },
        { name: "Lac de Glace", icon: "❄️", completed: false },
        { name: "Grotte de Cristal", icon: "💎", completed: false },
        { name: "Montagne Enneigée", icon: "⛰️", completed: false },
        { name: "Palais de Cristalia", icon: "🏰", completed: false }
      ],
      levels: [
        // Level 1: Simple counting up to 5
        {
          instructions: "Bienvenue dans le Royaume de Cristalia ! La Reine a besoin de ton aide pour reconstruire son palais de glace. Choisis un lieu à explorer pour récolter des flocons magiques.",
          mission: "Collecte exactement 5 flocons ronds pour commencer la reconstruction du palais.",
          targetTotal: 5,
          exactTotal: true,
          constraints: [
            { type: "round", min: 0, max: 5 }
          ],
          availableFlakes: [
            { type: "round", name: "Flocons ronds", icon: "❄️", max: 10 }
          ]
        },
        // Level 2: Counting up to 10 with 2 types
        {
          instructions: "Continue ton aventure dans le Royaume de Cristalia ! Explore un nouveau lieu pour récolter plus de flocons magiques.",
          mission: "Collecte exactement 10 flocons en utilisant des flocons ronds et étoilés.",
          targetTotal: 10,
          exactTotal: true,
          constraints: [
            { type: "round", min: 1, max: 10 },
            { type: "star", min: 1, max: 10 }
          ],
          availableFlakes: [
            { type: "round", name: "Flocons ronds", icon: "❄️", max: 10 },
            { type: "star", name: "Flocons étoilés", icon: "✳️", max: 10 }
          ]
        },
        // Level 3: Exact total with specific constraint
        {
          instructions: "La magie du palais commence à se restaurer ! Explore un nouveau lieu pour trouver des flocons spéciaux.",
          mission: "Collecte exactement 7 flocons en utilisant exactement 2 types différents de flocons.",
          targetTotal: 7,
          exactTotal: true,
          constraints: [
            { type: "round", min: 0, max: 7 },
            { type: "star", min: 0, max: 7 },
            { type: "crystal", min: 0, max: 7 },
            { typeCount: 2 }
          ],
          availableFlakes: [
            { type: "round", name: "Flocons ronds", icon: "❄️", max: 7 },
            { type: "star", name: "Flocons étoilés", icon: "✳️", max: 7 },
            { type: "crystal", name: "Flocons cristaux", icon: "❇️", max: 7 }
          ]
        },
        // Level 4: Multiple valid combinations
        {
          instructions: "Le palais prend forme ! Explore un nouvel endroit pour trouver des flocons encore plus puissants.",
          mission: "Collecte exactement 15 flocons en utilisant au moins 3 types différents, avec au maximum 6 flocons de chaque type.",
          targetTotal: 15,
          exactTotal: true,
          constraints: [
            { type: "round", min: 0, max: 6 },
            { type: "star", min: 0, max: 6 },
            { type: "crystal", min: 0, max: 6 },
            { type: "diamond", min: 0, max: 6 },
            { typeCount: 3, min: 3 }
          ],
          availableFlakes: [
            { type: "round", name: "Flocons ronds", icon: "❄️", max: 6 },
            { type: "star", name: "Flocons étoilés", icon: "✳️", max: 6 },
            { type: "crystal", name: "Flocons cristaux", icon: "❇️", max: 6 },
            { type: "diamond", name: "Flocons diamants", icon: "💠", max: 6 }
          ]
        },
        // Level 5: Complex constraints with "frozen" flakes
        {
          instructions: "C'est le moment de terminer la reconstruction du palais ! Rends-toi au Palais de Cristalia pour l'ultime mission.",
          mission: "Collecte exactement 20 flocons magiques. Attention, les flocons diamants sont gelés et comptent double !",
          targetTotal: 20,
          exactTotal: true,
          constraints: [
            { type: "round", min: 0, max: 10 },
            { type: "star", min: 0, max: 10 },
            { type: "crystal", min: 0, max: 10 },
            { type: "diamond", min: 0, max: 5, multiplier: 2 }
          ],
          availableFlakes: [
            { type: "round", name: "Flocons ronds", icon: "❄️", max: 10 },
            { type: "star", name: "Flocons étoilés", icon: "✳️", max: 10 },
            { type: "crystal", name: "Flocons cristaux", icon: "❇️", max: 10 },
            { type: "diamond", name: "Flocons diamants (comptent double)", icon: "💠", max: 5 }
          ]
        }
      ]
    }
  },
  computed: {
    currentLevel() {
      return this.levels[this.unlockedLocationIndex] || this.levels[0];
    },
    totalFlakes() {
      let total = 0;
      for (const type in this.collectedFlakes) {
        const multiplier = this.getMultiplier(type);
        total += this.collectedFlakes[type].count * multiplier;
      }
      return total;
    },
    canValidate() {
      // Check if the total is correct
      if (this.currentLevel.exactTotal && this.totalFlakes !== this.currentLevel.targetTotal) {
        return false;
      }

      // Check all constraints
      for (const constraint of this.currentLevel.constraints) {
        // Type-specific constraints
        if (constraint.type) {
          const count = this.getFlakeCount(constraint.type);
          if (constraint.min !== undefined && count < constraint.min) return false;
          if (constraint.max !== undefined && count > constraint.max) return false;
        }

        // Type count constraint (number of different types used)
        if (constraint.typeCount !== undefined) {
          const typesUsed = Object.keys(this.collectedFlakes).filter(type => this.collectedFlakes[type].count > 0).length;
          if (constraint.min !== undefined && typesUsed < constraint.min) return false;
          if (typesUsed !== constraint.typeCount) return false;
        }
      }

      return true;
    }
  },
  created() {
    this.initializeGame();
  },
  mounted() {
    // Initialize any necessary event listeners
  },
  beforeUnmount() {
    // Clean up timers and event listeners
    if (this.fireworksTimer) {
      clearTimeout(this.fireworksTimer);
    }

    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
    }
  },
  methods: {
    initializeGame() {
      this.currentLocationIndex = null;
      this.unlockedLocationIndex = 0;
      this.currentLocation = null;
      this.missionCompleted = false;
      this.gameCompleted = false;
      this.resetCollectedFlakes();

      // Reset all locations
      this.locations.forEach(location => {
        location.completed = false;
      });
    },

    resetCollectedFlakes() {
      this.collectedFlakes = {};
      // Initialize with all available flake types
      if (this.currentLevel) {
        this.currentLevel.availableFlakes.forEach(flake => {
          this.collectedFlakes[flake.type] = {
            count: 0,
            icon: flake.icon
          };
        });
      }
    },

    selectLocation(index) {
      // Only allow selecting unlocked locations
      if (index <= this.unlockedLocationIndex) {
        this.currentLocationIndex = index;
        this.currentLocation = this.locations[index];
        this.missionCompleted = false;
        this.resetCollectedFlakes();
      }
    },

    returnToMap() {
      // Unlock next location if current location is completed and is the highest unlocked so far
      if (this.currentLocationIndex !== null && 
          this.locations[this.currentLocationIndex].completed && 
          this.currentLocationIndex === this.unlockedLocationIndex && 
          this.unlockedLocationIndex < this.locations.length - 1) {
        this.unlockedLocationIndex++;
      }

      this.currentLocation = null;
      this.missionCompleted = false;
    },

    addFlake(type) {
      if (!this.collectedFlakes[type]) {
        this.collectedFlakes[type] = {
          count: 0,
          icon: this.currentLevel.availableFlakes.find(f => f.type === type).icon
        };
      }

      const flakeType = this.currentLevel.availableFlakes.find(f => f.type === type);
      if (this.collectedFlakes[type].count < flakeType.max && this.totalFlakes < this.currentLevel.targetTotal) {
        this.collectedFlakes[type].count++;
      }
    },

    removeFlake(type) {
      if (this.collectedFlakes[type] && this.collectedFlakes[type].count > 0) {
        this.collectedFlakes[type].count--;
      }
    },

    getFlakeCount(type) {
      return this.collectedFlakes[type] ? this.collectedFlakes[type].count : 0;
    },

    getMultiplier(type) {
      const constraint = this.currentLevel.constraints.find(c => c.type === type && c.multiplier);
      return constraint ? constraint.multiplier : 1;
    },

    validateMission() {
      if (this.canValidate) {
        // Success!
        this.showSuccessFeedback();

        // Mark current location as completed
        this.locations[this.currentLocationIndex].completed = true;

        // Show mission completed message
        setTimeout(() => {
          this.missionCompleted = true;

          // Scroll to mission complete message
          this.$nextTick(() => {
            const messageElement = document.querySelector('.mission-complete-message');
            if (messageElement) {
              messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });

          // If all locations are completed, show game completed
          if (this.locations.every(loc => loc.completed)) {
            setTimeout(() => {
              this.gameCompleted = true;
              this.$nextTick(() => {
                this.startFireworks();

                // Scroll to victory message
                const victoryElement = document.querySelector('.victory-message');
                if (victoryElement) {
                  victoryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              });
            }, 2000);
          }
        }, 1000);
      } else {
        // Show error feedback
        if (this.currentLevel.exactTotal && this.totalFlakes !== this.currentLevel.targetTotal) {
          this.showErrorFeedback(`Tu dois collecter exactement ${this.currentLevel.targetTotal} flocons !`);
        } else {
          this.showErrorFeedback("Vérifie bien les contraintes de la mission !");
        }
      }
    },

    showSuccessFeedback() {
      this.feedbackSuccess = true;
      this.feedbackMessage = 'Bravo ! Tu as réussi la mission !';
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

    showErrorFeedback(message) {
      this.feedbackSuccess = false;
      this.feedbackMessage = message;
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
            min: 180,  // Blue-ish colors for winter theme
            max: 240
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
  text-align: center;
}

.instructions {
  margin-bottom: 40px;
  font-size: 20px;
  text-align: center;
}

.game-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

/* Map styles */
.map-container {
  width: 100%;
  background-color: #e6f7ff;
  border-radius: 15px;
  padding: 20px;
  border: 3px solid #42b983;
  margin-bottom: 20px;
}

.map-locations {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.location {
  width: 120px;
  height: 120px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.location.unlocked {
  background-color: #d7f7e8;
  border: 2px solid #42b983;
  cursor: pointer;
  opacity: 1;
}

.location.current {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(66, 185, 131, 0.5);
}

.location-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.location-icon.large {
  font-size: 60px;
}

.location-name {
  font-weight: bold;
}

/* Location view styles */
.location-view {
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 15px;
  padding: 20px;
  border: 3px solid #42b983;
}

.location-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.location-title {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.mission-container {
  flex-grow: 1;
  background-color: #e6f7ff;
  padding: 10px;
  border-radius: 10px;
  border: 2px solid #42b983;
}

/* Snowflake collection area */
.collection-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.snowflake-types {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.snowflake-type {
  background-color: white;
  border-radius: 10px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  width: 120px;
}

.flake-icon {
  font-size: 30px;
  margin-bottom: 5px;
}

.flake-name {
  font-size: 14px;
  text-align: center;
  margin-bottom: 10px;
  height: 40px;
  display: flex;
  align-items: center;
}

.flake-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.flake-button {
  background-color: #42b983;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flake-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.flake-count {
  font-size: 18px;
  font-weight: bold;
}

/* Magic bag styles */
.magic-bag {
  background-color: #d7f7e8;
  border-radius: 15px;
  padding: 20px;
  width: 100%;
  max-width: 500px;
  border: 3px solid #42b983;
  margin-bottom: 20px;
}

.bag-content {
  min-height: 150px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 15px 0;
  justify-content: center;
}

.flake-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.collected-flake {
  font-size: 24px;
  animation: fadeIn 0.3s;
}

.bag-counter {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: #42b983;
}

.counter-status {
  margin-top: 5px;
  font-size: 16px;
}

.counter-status.success {
  color: #42b983;
}

.counter-status.error {
  color: #ff6b6b;
}

.validate-button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.validate-button:hover:not(:disabled) {
  background-color: #3aa876;
}

.validate-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Feedback and completion messages */
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

.mission-complete-message, .victory-message {
  margin-top: 40px;
  padding: 20px;
  background-color: #d7f7e8;
  border-radius: 10px;
  animation: fadeIn 1s;
  text-align: center;
}

.mission-complete-message h2, .victory-message h2 {
  color: #42b983;
  font-size: 36px;
  margin-bottom: 10px;
}

.next-button, .reset-button, .home-button {
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

.next-button:hover, .reset-button:hover, .home-button:hover {
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
