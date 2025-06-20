<template>
  <div class="game-container">
    <h1>Le Marché Magique</h1>

    <div class="instructions">
      <p>Aide le client à faire ses courses en plaçant les bons fruits et légumes sur le tapis de caisse</p>
    </div>

    <div class="game-area">
      <!-- Customer with shopping list -->
      <div class="customer-container">
        <div class="customer">
          {{ currentCustomer.icon }}
        </div>
        <div class="shopping-list">
          <h3>Liste de courses</h3>
          <div class="shopping-items">
            <div v-for="(item, index) in currentLevel.shoppingList" :key="index" class="shopping-item">
              <div class="item-icon">{{ item.icon }}</div>
              <div class="item-quantity">{{ item.quantity }}</div>
              <div class="item-counter">{{ getItemCount(item.type) }}/{{ item.quantity }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Checkout area (drop zone) -->
      <div 
        class="checkout-container"
        @dragover.prevent
        @drop="dropItem($event)"
      >
        <h3 class="container-title">Tapis de caisse</h3>
        <div class="checkout-area">
          <div 
            v-for="item in placedItems" 
            :key="item.id" 
            class="item-in-checkout"
            :style="{ 
              position: 'absolute', 
              left: item.position.x + 'px', 
              top: item.position.y + 'px' 
            }"
          >
            {{ item.icon }}
          </div>
        </div>
      </div>

      <!-- Market stall (source) -->
      <div class="container-wrapper stall-wrapper">
        <h3 class="container-title">Étalage du marché</h3>
        <div class="stall-container">
          <div 
            v-for="(item, index) in marketItems" 
            :key="index"
            class="market-item"
            :class="{ 'placed': item.placed }"
            draggable="true"
            @dragstart="dragStart($event, item)"
            v-show="!item.placed"
            :style="{ 
              position: 'absolute', 
              left: item.stallPosition.x + 'px', 
              top: item.stallPosition.y + 'px'
            }"
          >
            {{ item.icon }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="showFeedback" class="feedback-message" :class="{ 'success': feedbackSuccess }">
      <p>{{ feedbackMessage }}</p>
    </div>

    <div v-if="levelCompleted" class="level-complete-message">
      <h2>Bravo !</h2>
      <p>Tu as bien rempli la commande du client !</p>
      <button @click="nextLevel" class="next-button">Client suivant</button>
    </div>

    <div v-if="gameCompleted" class="victory-message">
      <h2>Félicitations !</h2>
      <p>Tu es devenu un Super Marchand ! 🏅</p>
      <p>Tu as servi tous les clients du Marché Magique !</p>
      <button @click="resetGame" class="reset-button">Rejouer</button>
      <router-link to="/" class="home-button">Menu Principal</router-link>
    </div>

    <Fireworks v-if="gameCompleted" ref="fireworks" class="fireworks-container" />
  </div>
</template>

<script>
import { Fireworks } from '@fireworks-js/vue'

export default {
  name: 'MagicMarketGame',
  components: {
    Fireworks
  },
  data() {
    return {
      currentLevel: null,
      currentLevelIndex: 0,
      levels: [
        // Level 1: 1 type of item, quantity 1-3
        {
          shoppingList: [
            { type: 'carrot', icon: '🥕', quantity: 2 }
          ]
        },
        // Level 2: 1 type of item, quantity 1-3
        {
          shoppingList: [
            { type: 'apple', icon: '🍎', quantity: 3 }
          ]
        },
        // Level 3: 2 types of items, quantity 1-3
        {
          shoppingList: [
            { type: 'banana', icon: '🍌', quantity: 1 },
            { type: 'tomato', icon: '🍅', quantity: 2 }
          ]
        },
        // Level 4: 2 types of items, quantity 1-3
        {
          shoppingList: [
            { type: 'lemon', icon: '🍋', quantity: 3 },
            { type: 'strawberry', icon: '🍓', quantity: 2 }
          ]
        },
        // Level 5: 2 types of items, quantity 1-5
        {
          shoppingList: [
            { type: 'carrot', icon: '🥕', quantity: 4 },
            { type: 'apple', icon: '🍎', quantity: 3 }
          ]
        },
        // Level 6: 3 types of items, quantity 1-5
        {
          shoppingList: [
            { type: 'banana', icon: '🍌', quantity: 2 },
            { type: 'tomato', icon: '🍅', quantity: 3 },
            { type: 'lemon', icon: '🍋', quantity: 1 }
          ]
        },
        // Level 7: 3 types of items, quantity 1-5
        {
          shoppingList: [
            { type: 'strawberry', icon: '🍓', quantity: 4 },
            { type: 'carrot', icon: '🥕', quantity: 2 },
            { type: 'apple', icon: '🍎', quantity: 3 }
          ]
        },
        // Level 8: 3 types of items, quantity 1-7
        {
          shoppingList: [
            { type: 'banana', icon: '🍌', quantity: 5 },
            { type: 'tomato', icon: '🍅', quantity: 3 },
            { type: 'lemon', icon: '🍋', quantity: 4 }
          ]
        },
        // Level 9: 4 types of items, quantity 1-7
        {
          shoppingList: [
            { type: 'strawberry', icon: '🍓', quantity: 6 },
            { type: 'carrot', icon: '🥕', quantity: 3 },
            { type: 'apple', icon: '🍎', quantity: 4 },
            { type: 'banana', icon: '🍌', quantity: 2 }
          ]
        },
        // Level 10: 4 types of items, quantity 1-10
        {
          shoppingList: [
            { type: 'tomato', icon: '🍅', quantity: 7 },
            { type: 'lemon', icon: '🍋', quantity: 5 },
            { type: 'strawberry', icon: '🍓', quantity: 8 },
            { type: 'carrot', icon: '🥕', quantity: 4 }
          ]
        }
      ],
      customers: [
        { icon: '🐰', name: 'Lapin' },
        { icon: '🦊', name: 'Renard' },
        { icon: '🐸', name: 'Grenouille' },
        { icon: '🦁', name: 'Lion' },
        { icon: '🐻', name: 'Ours' },
        { icon: '🐼', name: 'Panda' },
        { icon: '🦄', name: 'Licorne' },
        { icon: '🐢', name: 'Tortue' },
        { icon: '🦉', name: 'Hibou' },
        { icon: '🐿️', name: 'Écureuil' }
      ],
      currentCustomer: null,
      marketItems: [],
      placedItems: [],
      currentDraggedItem: null,
      levelCompleted: false,
      gameCompleted: false,
      fireworksTimer: null,
      showFeedback: false,
      feedbackMessage: '',
      feedbackSuccess: false,
      feedbackTimer: null,
      itemTypes: [
        { type: 'carrot', icon: '🥕' },
        { type: 'apple', icon: '🍎' },
        { type: 'banana', icon: '🍌' },
        { type: 'tomato', icon: '🍅' },
        { type: 'lemon', icon: '🍋' },
        { type: 'strawberry', icon: '🍓' }
      ]
    }
  },
  created() {
    this.initializeGame();
  },
  mounted() {
    // Add document-level dragend event to handle drops outside checkout
    document.addEventListener('dragend', this.handleDragEnd);
  },
  beforeUnmount() {
    // Clean up event listeners and timers
    document.removeEventListener('dragend', this.handleDragEnd);

    if (this.fireworksTimer) {
      clearTimeout(this.fireworksTimer);
    }

    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
    }
  },
  methods: {
    initializeGame() {
      this.currentLevelIndex = 0;
      this.loadLevel();
      this.gameCompleted = false;
    },

    loadLevel() {
      this.currentLevel = this.levels[this.currentLevelIndex];
      this.currentCustomer = this.customers[this.currentLevelIndex];
      this.levelCompleted = false;
      this.placedItems = [];
      this.generateMarketItems();
    },

    generateMarketItems() {
      // Create market items
      this.marketItems = [];
      let id = 0;

      // Define the minimum distance between items (based on font size)
      const itemSize = 30; // font-size of market-item
      const minDistance = itemSize + 5; // Add some padding

      // Helper function to check if a position would overlap with existing items
      const wouldOverlap = (x, y, existingItems) => {
        for (const item of existingItems) {
          const dx = Math.abs(item.stallPosition.x - x);
          const dy = Math.abs(item.stallPosition.y - y);
          // Calculate the distance between centers
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < minDistance) {
            return true; // Would overlap
          }
        }
        return false; // No overlap
      };

      // Helper function to generate a non-overlapping position
      const generateNonOverlappingPosition = (existingItems) => {
        // Get stall container dimensions
        const maxX = 300 - itemSize;
        const maxY = 150 - itemSize;

        // Try to find a non-overlapping position (max 50 attempts)
        let attempts = 0;
        let x, y;
        do {
          x = Math.floor(Math.random() * maxX);
          y = Math.floor(Math.random() * maxY);
          attempts++;
        } while (wouldOverlap(x, y, existingItems) && attempts < 50);

        return { x, y };
      };

      // Add items from the shopping list with the exact quantities needed
      this.currentLevel.shoppingList.forEach(shoppingItem => {
        for (let i = 0; i < shoppingItem.quantity; i++) {
          // Generate non-overlapping position
          const position = generateNonOverlappingPosition(this.marketItems);

          this.marketItems.push({
            id: id++,
            type: shoppingItem.type,
            icon: shoppingItem.icon,
            placed: false,
            position: { x: 0, y: 0 },
            stallPosition: position
          });
        }
      });

      // Add some extra items (distractors)
      const extraItemCount = 10; // Add 10 extra items
      for (let i = 0; i < extraItemCount; i++) {
        const randomItemType = this.itemTypes[Math.floor(Math.random() * this.itemTypes.length)];
        // Generate non-overlapping position
        const position = generateNonOverlappingPosition(this.marketItems);

        this.marketItems.push({
          id: id++,
          type: randomItemType.type,
          icon: randomItemType.icon,
          placed: false,
          position: { x: 0, y: 0 },
          stallPosition: position
        });
      }

      // Shuffle the market items
      this.marketItems = this.shuffleArray(this.marketItems);
    },

    shuffleArray(array) {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    },

    dragStart(event, item) {
      this.currentDraggedItem = item;
      event.dataTransfer.setData('text/plain', item.id);
    },

    dropItem(event) {
      event.preventDefault();

      if (!this.currentDraggedItem || this.currentDraggedItem.placed || this.levelCompleted) {
        return;
      }

      // Calculate position relative to the checkout area
      const checkoutRect = event.currentTarget.getBoundingClientRect();
      // Adjust position to center the item on the cursor
      // The market items are 30px in size (font-size: 30px)
      const itemSize = 30;
      const x = event.clientX - checkoutRect.left - (itemSize / 2);
      const y = event.clientY - checkoutRect.top - (itemSize / 2);

      // Check if this item is needed for the shopping list
      const shoppingItem = this.currentLevel.shoppingList.find(item => item.type === this.currentDraggedItem.type);

      if (shoppingItem) {
        const currentCount = this.getItemCount(this.currentDraggedItem.type);

        if (currentCount < shoppingItem.quantity) {
          // Place the item in the checkout with position
          this.currentDraggedItem.placed = true;
          this.currentDraggedItem.position = { x, y };
          this.placedItems.push({ ...this.currentDraggedItem });

          // Check if the shopping list is complete
          if (this.isShoppingListComplete()) {
            // Success! Show positive feedback
            this.showSuccessFeedback();

            // Complete the level after a delay
            setTimeout(() => {
              this.levelCompleted = true;

              // If this was the last level, complete the game
              if (this.currentLevelIndex === this.levels.length - 1) {
                setTimeout(() => {
                  this.gameCompleted = true;
                  this.$nextTick(() => {
                    this.startFireworks();
                  });
                }, 2000);
              }
            }, 1000);
          }
        } else {
          // Too many of this item! Show error feedback
          this.showErrorFeedback("Tu as déjà assez de " + this.getItemName(this.currentDraggedItem.type) + "!");
          return;
        }
      } else {
        // Item not in shopping list! Show error feedback
        this.showErrorFeedback("Ce n'est pas ce que le client a demandé!");
        return;
      }
    },

    handleDragEnd() {
      this.currentDraggedItem = null;
    },

    getItemCount(type) {
      return this.placedItems.filter(item => item.type === type).length;
    },

    getItemName(type) {
      switch(type) {
        case 'carrot': return 'carottes';
        case 'apple': return 'pommes';
        case 'banana': return 'bananes';
        case 'tomato': return 'tomates';
        case 'lemon': return 'citrons';
        case 'strawberry': return 'fraises';
        default: return type;
      }
    },

    isShoppingListComplete() {
      return this.currentLevel.shoppingList.every(item => 
        this.getItemCount(item.type) === item.quantity
      );
    },

    showSuccessFeedback() {
      this.feedbackSuccess = true;
      this.feedbackMessage = 'Bravo ! Tu as bien rempli la commande !';
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

    nextLevel() {
      this.currentLevelIndex++;
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
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.customer-container {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
  background-color: #f5f5f5;
  border-radius: 10px;
  padding: 15px;
  border: 2px solid #42b983;
  /* Ensure this spans the full width */
  flex-basis: 100%;
}

.customer {
  font-size: 60px;
  margin-right: 20px;
}

.shopping-list {
  flex-grow: 1;
}

.shopping-list h3 {
  color: #42b983;
  margin-bottom: 10px;
}

.shopping-items {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.shopping-item {
  display: flex;
  align-items: center;
  background-color: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.item-icon {
  font-size: 24px;
  margin-right: 8px;
}

.item-quantity {
  font-size: 20px;
  font-weight: bold;
  margin-right: 8px;
}

.item-counter {
  font-size: 14px;
  color: #42b983;
}

.checkout-container {
  width: 48%;
  margin-bottom: 20px;
}

.checkout-area {
  height: 200px;
  border: 3px solid #42b983;
  border-radius: 10px;
  background-color: #d7f7e8;
  position: relative;
  overflow: hidden;
}

.container-wrapper {
  /* Width is now controlled by specific wrapper classes */
}

.stall-wrapper {
  width: 48%;
  margin-bottom: 20px;
}

.stall-container {
  height: 200px;
  border: 3px solid #42b983;
  border-radius: 10px;
  background-color: #f5f5f5;
  position: relative;
  overflow: hidden;
}

.market-item {
  font-size: 30px;
  cursor: grab;
  user-select: none;
  z-index: 10;
}

.item-in-checkout {
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
