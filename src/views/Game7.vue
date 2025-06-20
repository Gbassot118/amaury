<template>
  <div class="game-container">
    <h1>Jeu de Memory</h1>

    <div class="instructions">
      <p>Retourne les cartes pour trouver les paires de chiffres identiques</p>
    </div>

    <div class="memory-board">
      <div 
        v-for="(card, index) in cards" 
        :key="index"
        class="memory-card"
        :class="{
          'flipped': card.flipped,
          'matched': card.matched
        }"
        @click="flipCard(index)"
      >
        <div class="card-inner">
          <div class="card-front">
            <span>?</span>
          </div>
          <div class="card-back">
            <span>{{ card.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="gameCompleted" class="victory-message">
      <h2>Bravo !</h2>
      <p>Tu as trouvé toutes les paires !</p>
      <button @click="resetGame" class="reset-button">Rejouer</button>
      <router-link to="/" class="home-button">Menu Principal</router-link>
    </div>

    <Fireworks v-if="gameCompleted" ref="fireworks" class="fireworks-container" />
  </div>
</template>

<script>
import { Fireworks } from '@fireworks-js/vue'

export default {
  name: 'MemoryGame',
  components: {
    Fireworks
  },
  data() {
    return {
      cards: [],
      flippedCards: [],
      matchedPairs: 0,
      totalPairs: 4,
      gameCompleted: false,
      fireworksTimer: null,
      canFlip: true
    }
  },
  mounted() {
    this.initializeGame();
  },
  beforeUnmount() {
    if (this.fireworksTimer) {
      clearTimeout(this.fireworksTimer);
    }
  },
  methods: {
    initializeGame() {
      // Generate 4 random pairs of digits (0-9)
      const digits = [];
      while (digits.length < this.totalPairs) {
        const randomDigit = Math.floor(Math.random() * 10); // 0-9
        if (!digits.includes(randomDigit)) {
          digits.push(randomDigit);
        }
      }
      
      // Create pairs of cards
      const cardPairs = [...digits, ...digits];
      
      // Shuffle the cards
      this.cards = this.shuffleArray(cardPairs).map(value => ({
        value,
        flipped: false,
        matched: false
      }));
      
      this.flippedCards = [];
      this.matchedPairs = 0;
      this.gameCompleted = false;
      this.canFlip = true;
    },
    
    shuffleArray(array) {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    },
    
    flipCard(index) {
      // Prevent flipping if game is completed or card is already flipped/matched
      if (
        !this.canFlip || 
        this.gameCompleted || 
        this.cards[index].flipped || 
        this.cards[index].matched ||
        this.flippedCards.length >= 2
      ) {
        return;
      }
      
      // Flip the card
      this.cards[index].flipped = true;
      this.flippedCards.push(index);
      
      // Check if two cards are flipped
      if (this.flippedCards.length === 2) {
        this.canFlip = false;
        setTimeout(() => {
          this.checkMatch();
        }, 1000);
      }
    },
    
    checkMatch() {
      const [firstIndex, secondIndex] = this.flippedCards;
      const firstCard = this.cards[firstIndex];
      const secondCard = this.cards[secondIndex];
      
      if (firstCard.value === secondCard.value) {
        // Match found
        firstCard.matched = true;
        secondCard.matched = true;
        this.matchedPairs++;
        
        // Check if all pairs are found
        if (this.matchedPairs === this.totalPairs) {
          this.gameCompleted = true;
          this.$nextTick(() => {
            this.startFireworks();
          });
        }
      } else {
        // No match, flip cards back
        firstCard.flipped = false;
        secondCard.flipped = false;
      }
      
      // Reset flipped cards
      this.flippedCards = [];
      this.canFlip = true;
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

.memory-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 15px;
  margin-bottom: 50px;
  perspective: 1000px;
}

.memory-card {
  height: 120px;
  cursor: pointer;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s;
}

.memory-card.flipped {
  transform: rotateY(180deg);
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transform-style: preserve-3d;
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 40px;
  font-weight: bold;
}

.card-front {
  background-color: #42b983;
  color: white;
}

.card-back {
  background-color: white;
  border: 3px solid #42b983;
  color: #42b983;
  transform: rotateY(180deg);
}

.memory-card.matched .card-back {
  background-color: #d7f7e8;
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