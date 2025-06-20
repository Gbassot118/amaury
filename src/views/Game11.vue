<template>
  <div class="game-container">
    <h1>BMX Numbers Challenge</h1>

    <div class="instructions">
      <p>Aide le rider à réussir ses figures en résolvant des défis de comptage et de calcul</p>
    </div>

    <div class="game-area">
      <!-- BMX Track with rider -->
      <div class="track-container">
        <div class="rider" 
          :class="{ 'performing': performing, 'success': trickSuccess, 'fail': trickFail }"
          :style="{ left: (currentSegment * 10) + '%' }">
          {{ riderEmoji }}
        </div>
        <div class="track">
          <div 
            v-for="(segment, index) in 10" 
            :key="index" 
            class="track-segment"
            :class="{ 'current': currentSegment === index, 'completed': index < currentSegment }"
          >
            {{ index + 1 }}
          </div>
        </div>
      </div>

      <!-- Current Challenge -->
      <div class="challenge-container">
        <h3>Défi {{ currentLevel + 1 }}</h3>
        <div class="challenge-description">
          <p>{{ currentChallenge.description }}</p>
          <div v-if="currentChallenge.type === 'accumulate'" class="energy-meter">
            <div class="energy-label">Énergie: {{ currentEnergy }} / {{ currentChallenge.target }}</div>
            <div class="energy-bar">
              <div 
                class="energy-fill" 
                :style="{ width: (currentEnergy / currentChallenge.target * 100) + '%' }"
                :class="{ 'overflow': currentEnergy > currentChallenge.target }"
              ></div>
            </div>
          </div>
          <div v-if="currentChallenge.type === 'sequence'" class="sequence-display">
            <div 
              v-for="(num, idx) in currentChallenge.sequence" 
              :key="idx" 
              class="sequence-item"
            >
              {{ num === null ? '?' : num }}
            </div>
          </div>
          <div v-if="currentChallenge.type === 'distribute'" class="distribute-container">
            <div class="trick-container">
              <div class="trick-label">Trick 1: {{ trick1Energy }} / {{ currentChallenge.trick1Target }}</div>
              <div class="energy-bar">
                <div 
                  class="energy-fill" 
                  :style="{ width: (trick1Energy / currentChallenge.trick1Target * 100) + '%' }"
                  :class="{ 'overflow': trick1Energy > currentChallenge.trick1Target }"
                ></div>
              </div>
            </div>
            <div class="trick-container">
              <div class="trick-label">Trick 2: {{ trick2Energy }} / {{ currentChallenge.trick2Target }}</div>
              <div class="energy-bar">
                <div 
                  class="energy-fill" 
                  :style="{ width: (trick2Energy / currentChallenge.trick2Target * 100) + '%' }"
                  :class="{ 'overflow': trick2Energy > currentChallenge.trick2Target }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Number Bank -->
      <div class="number-bank">
        <div 
          v-for="(booster, index) in currentChallenge.boosters" 
          :key="index"
          class="booster"
          @click="selectBooster(booster)"
          :class="{ 'selected': selectedBoosters.includes(booster) }"
        >
          {{ booster }}
        </div>
      </div>

      <!-- Action Area -->
      <div class="action-area">
        <div class="selected-boosters">
          <div 
            v-for="(booster, index) in selectedBoosters" 
            :key="index"
            class="selected-booster"
          >
            {{ booster }}
            <button class="remove-booster" @click="removeBooster(index)">×</button>
          </div>
        </div>
        <div class="action-buttons">
          <button class="clear-button" @click="clearSelection">Effacer</button>
          <button class="perform-button" @click="performTrick">Lancer la figure</button>
        </div>
      </div>
    </div>

    <div v-if="showFeedback" class="feedback-message" :class="{ 'success': feedbackSuccess }">
      <p>{{ feedbackMessage }}</p>
    </div>

    <div v-if="levelCompleted && !gameCompleted" class="level-complete-message">
      <h2>Bravo !</h2>
      <p>{{ completionMessage }}</p>
      <button @click="nextLevel" class="next-button">Prochaine figure</button>
    </div>

    <div v-if="gameCompleted" class="victory-message">
      <h2>Félicitations !</h2>
      <p>Tu es devenu un Champion de BMX Freestyle ! 🏆</p>
      <p>Tu as réussi tous les défis numériques !</p>
      <button @click="resetGame" class="reset-button">Rejouer</button>
      <router-link to="/" class="home-button">Menu Principal</router-link>
    </div>

    <Fireworks v-if="gameCompleted" ref="fireworks" class="fireworks-container" />
  </div>
</template>

<script>
import { Fireworks } from '@fireworks-js/vue'

export default {
  name: 'BMXNumbersChallenge',
  components: {
    Fireworks
  },
  data() {
    return {
      currentLevel: 0,
      levels: [
        // Level 1: Simple accumulation
        {
          type: 'accumulate',
          description: "Pour faire un Bunny Hop, tu dois accumuler exactement 10 points d'énergie en utilisant des boosters de 2, 3 et 5 points.",
          target: 10,
          boosters: [2, 3, 5],
          trickName: "Bunny Hop"
        },
        // Level 2: Sequence
        {
          type: 'sequence',
          description: "Pour faire un Manual, tu dois compléter la séquence logique. Quel nombre vient ensuite ?",
          sequence: [2, 4, 6, 8, null],
          answer: 10,
          boosters: [5, 7, 9, 10, 12],
          trickName: "Manual"
        },
        // Level 3: Accumulation with constraint
        {
          type: 'accumulate',
          description: "Pour faire un Tailwhip, tu dois accumuler exactement 15 points d'énergie. Attention, ne dépasse pas 15 ou tu perdras l'équilibre !",
          target: 15,
          boosters: [3, 5, 7, 8],
          trickName: "Tailwhip"
        },
        // Level 4: Distribution between two tricks
        {
          type: 'distribute',
          description: "Pour enchaîner un 180° suivi d'un X-Up, tu dois répartir ton énergie. Le 180° nécessite 12 points et le X-Up nécessite 8 points.",
          trick1Target: 12,
          trick2Target: 8,
          boosters: [2, 3, 5, 7, 10],
          trickName: "180° + X-Up"
        },
        // Level 5: Simple accumulation
        {
          type: 'accumulate',
          description: "Pour faire un Backflip, tu dois accumuler exactement 17 points d'énergie.",
          target: 17,
          boosters: [3, 6, 8, 10],
          trickName: "Backflip"
        },
        // Level 6: Complex sequence
        {
          type: 'sequence',
          description: "Pour faire un 360°, complète cette séquence plus complexe. Quel nombre vient ensuite ?",
          sequence: [3, 6, 12, 24, null],
          answer: 48,
          boosters: [30, 36, 42, 48, 54],
          trickName: "360°"
        },
        // Level 7: Accumulation with multiple constraints
        {
          type: 'accumulate',
          description: "Pour faire un Superman, tu dois accumuler exactement 25 points d'énergie en utilisant au moins un booster de chaque type.",
          target: 25,
          boosters: [5, 7, 8],
          requireAllTypes: true,
          trickName: "Superman"
        },
        // Level 8: Distribution between two tricks
        {
          type: 'distribute',
          description: "Pour enchaîner un Barspin et un No Footer, tu dois répartir ton énergie. Le Barspin nécessite 13 points et le No Footer 10 points.",
          trick1Target: 13,
          trick2Target: 10,
          boosters: [3, 5, 8, 10, 12],
          trickName: "Barspin + No Footer"
        },
        // Level 9: Complex accumulation
        {
          type: 'accumulate',
          description: "Pour faire un Double Backflip, tu dois accumuler exactement 30 points d'énergie, mais tu ne peux pas utiliser plus de 5 boosters au total.",
          target: 30,
          boosters: [4, 6, 8, 10, 12],
          maxBoosters: 5,
          trickName: "Double Backflip"
        },
        // Level 10: Final challenge - distribution
        {
          type: 'distribute',
          description: "Pour la figure finale, un Flair suivi d'un Decade, tu dois accumuler 15 points pour le Flair et 20 points pour le Decade.",
          trick1Target: 15,
          trick2Target: 20,
          boosters: [5, 8, 10, 12, 15],
          maxBoosters: 6,
          trickName: "Flair + Decade"
        }
      ],
      currentChallenge: null,
      currentEnergy: 0,
      trick1Energy: 0,
      trick2Energy: 0,
      selectedBoosters: [],
      performing: false,
      trickSuccess: false,
      trickFail: false,
      levelCompleted: false,
      gameCompleted: false,
      showFeedback: false,
      feedbackMessage: '',
      feedbackSuccess: false,
      feedbackTimer: null,
      fireworksTimer: null,
      currentSegment: 0,
      riderEmoji: '🚴',
      completionMessage: ''
    }
  },
  created() {
    this.initializeGame();
  },
  mounted() {
    // Initialize the first level
    this.loadLevel();
  },
  beforeUnmount() {
    // Clean up timers
    if (this.fireworksTimer) {
      clearTimeout(this.fireworksTimer);
    }
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
    }
  },
  methods: {
    initializeGame() {
      this.currentLevel = 0;
      this.currentSegment = 0;
      this.gameCompleted = false;
      this.loadLevel();
    },

    loadLevel() {
      this.currentChallenge = this.levels[this.currentLevel];
      this.currentEnergy = 0;
      this.trick1Energy = 0;
      this.trick2Energy = 0;
      this.selectedBoosters = [];
      this.performing = false;
      this.trickSuccess = false;
      this.trickFail = false;
      this.levelCompleted = false;
    },

    selectBooster(booster) {
      if (this.levelCompleted || this.performing) return;

      // Check if we have a max boosters constraint
      if (this.currentChallenge.maxBoosters && this.selectedBoosters.length >= this.currentChallenge.maxBoosters) {
        this.showErrorFeedback(`Tu ne peux pas utiliser plus de ${this.currentChallenge.maxBoosters} boosters !`);
        return;
      }

      this.selectedBoosters.push(booster);

      // Update energy based on challenge type
      if (this.currentChallenge.type === 'accumulate') {
        this.currentEnergy += booster;
      } else if (this.currentChallenge.type === 'distribute') {
        // For distribute challenges, alternate between trick1 and trick2
        if (this.selectedBoosters.length % 2 === 1) {
          this.trick1Energy += booster;
        } else {
          this.trick2Energy += booster;
        }
      }
    },

    removeBooster(index) {
      if (this.levelCompleted || this.performing) return;

      const booster = this.selectedBoosters[index];
      this.selectedBoosters.splice(index, 1);

      // Update energy based on challenge type
      if (this.currentChallenge.type === 'accumulate') {
        this.currentEnergy -= booster;
      } else if (this.currentChallenge.type === 'distribute') {
        // For distribute challenges, we need to recalculate both energies
        this.trick1Energy = 0;
        this.trick2Energy = 0;
        this.selectedBoosters.forEach((b, i) => {
          if (i % 2 === 0) {
            this.trick1Energy += b;
          } else {
            this.trick2Energy += b;
          }
        });
      }
    },

    clearSelection() {
      if (this.levelCompleted || this.performing) return;

      this.selectedBoosters = [];
      this.currentEnergy = 0;
      this.trick1Energy = 0;
      this.trick2Energy = 0;
    },

    performTrick() {
      if (this.levelCompleted || this.performing) return;

      this.performing = true;

      // Check if the challenge is completed based on its type
      let success = false;
      let message = '';

      if (this.currentChallenge.type === 'accumulate') {
        // Use the target value directly
        const displayTarget = this.currentChallenge.target;

        // Check if all booster types are required
        if (this.currentChallenge.requireAllTypes) {
          const uniqueBoosters = new Set(this.selectedBoosters);
          if (uniqueBoosters.size < this.currentChallenge.boosters.length) {
            success = false;
            message = `Tu dois utiliser au moins un booster de chaque type !`;
          } else if (this.currentEnergy === this.currentChallenge.target) {
            success = true;
            message = `Parfait ! Tu as accumulé exactement ${displayTarget} points !`;
          } else if (this.currentEnergy < this.currentChallenge.target) {
            success = false;
            message = `Pas assez d'énergie ! Tu as ${this.currentEnergy} points, il te faut ${this.currentChallenge.target} points.`;
          } else {
            success = false;
            message = `Trop d'énergie ! Tu as ${this.currentEnergy} points, il te faut exactement ${this.currentChallenge.target} points.`;
          }
        } else if (this.currentEnergy === this.currentChallenge.target) {
          success = true;
          message = `Parfait ! Tu as accumulé exactement ${displayTarget} points !`;
        } else if (this.currentEnergy < this.currentChallenge.target) {
          success = false;
          message = `Pas assez d'énergie ! Tu as ${this.currentEnergy} points, il te faut ${this.currentChallenge.target} points.`;
        } else {
          success = false;
          message = `Trop d'énergie ! Tu as ${this.currentEnergy} points, il te faut exactement ${this.currentChallenge.target} points.`;
        }
      } else if (this.currentChallenge.type === 'sequence') {
        if (this.selectedBoosters.length === 1 && this.selectedBoosters[0] === this.currentChallenge.answer) {
          success = true;
          message = `Bravo ! ${this.selectedBoosters[0]} est le bon nombre qui complète la séquence !`;
        } else {
          success = false;
          message = `Ce n'est pas le bon nombre pour compléter la séquence.`;
        }
      } else if (this.currentChallenge.type === 'distribute') {
        // Use the target values directly

        if (this.trick1Energy === this.currentChallenge.trick1Target && this.trick2Energy === this.currentChallenge.trick2Target) {
          success = true;
          message = `Parfait ! Tu as réparti correctement l'énergie pour les deux figures !`;
        } else if (this.trick1Energy !== this.currentChallenge.trick1Target) {
          success = false;
          message = `La première figure a besoin de ${this.currentChallenge.trick1Target} points, tu as ${this.trick1Energy} points.`;
        } else {
          success = false;
          message = `La deuxième figure a besoin de ${this.currentChallenge.trick2Target} points, tu as ${this.trick2Energy} points.`;
        }
      }

      // Show animation and feedback
      if (success) {
        this.trickSuccess = true;
        this.showSuccessFeedback(message);
        this.completionMessage = `Tu as réussi le ${this.currentChallenge.trickName} !`;

        // Complete the level after animation
        setTimeout(() => {
          this.levelCompleted = true;
          this.currentSegment++;

          // Scroll to the success message
          this.$nextTick(() => {
            const successMessage = document.querySelector('.level-complete-message');
            if (successMessage) {
              successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });

          // If this was the last level, complete the game
          if (this.currentLevel === this.levels.length - 1) {
            setTimeout(() => {
              this.gameCompleted = true;
              this.$nextTick(() => {
                this.startFireworks();
                // Scroll to the victory message
                const victoryMessage = document.querySelector('.victory-message');
                if (victoryMessage) {
                  victoryMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              });
            }, 2000);
          } else {
            // Automatically advance to the next level after a delay
            setTimeout(() => {
              this.nextLevel();
            }, 3000);
          }
        }, 2000);
      } else {
        this.trickFail = true;
        this.showErrorFeedback(message);

        // Reset after animation
        setTimeout(() => {
          this.performing = false;
          this.trickFail = false;
        }, 2000);
      }
    },

    showSuccessFeedback(message) {
      this.feedbackSuccess = true;
      this.feedbackMessage = message;
      this.showFeedback = true;

      // Clear any existing feedback timer
      if (this.feedbackTimer) {
        clearTimeout(this.feedbackTimer);
      }

      // Scroll to the feedback message
      this.$nextTick(() => {
        const feedbackMessage = document.querySelector('.feedback-message');
        if (feedbackMessage) {
          feedbackMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

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

      // Scroll to the feedback message
      this.$nextTick(() => {
        const feedbackMessage = document.querySelector('.feedback-message');
        if (feedbackMessage) {
          feedbackMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      // Hide feedback after 2 seconds
      this.feedbackTimer = setTimeout(() => {
        this.showFeedback = false;
      }, 2000);
    },

    nextLevel() {
      this.currentLevel++;
      this.performing = false;
      this.trickSuccess = false;
      this.loadLevel();
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
  gap: 20px;
}

.track-container {
  width: 100%;
  position: relative;
  margin-bottom: 20px;
}

.rider {
  font-size: 60px;
  position: absolute;
  top: -70px;
  left: 0;
  transition: left 1s ease, transform 0.5s ease;
  z-index: 10;
}

.rider.performing {
  animation: jump 2s ease;
}

.rider.success {
  animation: successTrick 2s ease;
}

.rider.fail {
  animation: failTrick 2s ease;
}

.track {
  display: flex;
  width: 100%;
  height: 50px;
  background-color: #f5f5f5;
  border-radius: 25px;
  overflow: hidden;
  border: 3px solid #42b983;
}

.track-segment {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: #666;
  border-right: 2px dashed #42b983;
  position: relative;
  transition: background-color 0.3s ease;
}

.track-segment:last-child {
  border-right: none;
}

.track-segment.current {
  background-color: #d7f7e8;
  color: #42b983;
}

.track-segment.completed {
  background-color: #b3e6cc;
  color: #2c805c;
}

.challenge-container {
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  border: 2px solid #42b983;
}

.challenge-container h3 {
  color: #42b983;
  margin-bottom: 15px;
}

.challenge-description {
  font-size: 18px;
  margin-bottom: 15px;
}

.energy-meter {
  margin-top: 15px;
}

.energy-label {
  margin-bottom: 5px;
  font-weight: bold;
}

.energy-bar {
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.energy-fill {
  height: 100%;
  background-color: #42b983;
  transition: width 0.3s ease;
}

.energy-fill.overflow {
  background-color: #ff6b6b;
}

.sequence-display {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
}

.sequence-item {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #d7f7e8;
  border: 2px solid #42b983;
  border-radius: 8px;
  font-size: 20px;
  font-weight: bold;
}

.distribute-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
}

.trick-container {
  width: 100%;
}

.trick-label {
  margin-bottom: 5px;
  font-weight: bold;
}

.number-bank {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
  width: 100%;
}

.booster {
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #d7f7e8;
  border: 3px solid #42b983;
  border-radius: 50%;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.booster:hover {
  transform: scale(1.1);
  background-color: #b3e6cc;
}

.booster.selected {
  opacity: 0.6;
}

.action-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.selected-boosters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  min-height: 70px;
  width: 100%;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 10px;
  border: 2px dashed #42b983;
}

.selected-booster {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #d7f7e8;
  border: 2px solid #42b983;
  border-radius: 50%;
  font-size: 20px;
  font-weight: bold;
  position: relative;
}

.remove-booster {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #ff6b6b;
  color: white;
  border: none;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.clear-button, .perform-button {
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  border: none;
}

.clear-button {
  background-color: #f5f5f5;
  color: #666;
  border: 2px solid #666;
}

.perform-button {
  background-color: #42b983;
  color: white;
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

.level-complete-message, .victory-message {
  margin-top: 40px;
  padding: 20px;
  background-color: #d7f7e8;
  border-radius: 10px;
  animation: fadeIn 1s;
  text-align: center;
}

.level-complete-message h2, .victory-message h2 {
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

@keyframes jump {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-50px) rotate(180deg); }
  100% { transform: translateY(0) rotate(360deg); }
}

@keyframes successTrick {
  0% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-70px) rotate(180deg); }
  50% { transform: translateY(-30px) rotate(360deg); }
  75% { transform: translateY(-50px) rotate(540deg); }
  100% { transform: translateY(0) rotate(720deg); }
}

@keyframes failTrick {
  0% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-30px) rotate(45deg); }
  50% { transform: translateY(-10px) rotate(90deg); }
  75% { transform: translateY(-5px) rotate(135deg); }
  100% { transform: translateY(0) rotate(180deg); }
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
