<template>
  <div class="game-container">
    <h1>Jeu des Classes</h1>

    <div class="instructions">
      <p>Attrape les enfants qui bougent dans la cour et fais-les glisser dans la bonne classe</p>
    </div>

    <div class="game-area">
      <!-- Children waiting area (left side) -->
      <div class="container-wrapper playground-wrapper">
        <h3 class="container-title">Cour de Récréation</h3>
        <div class="children-container">
          <div class="playground-decoration">
            <div class="playground-icon">⚽</div>
            <div class="playground-icon">🏀</div>
            <div class="playground-icon">🌳</div>
            <div class="playground-icon">🪁</div>
          </div>
          <div 
            v-for="(child, index) in children" 
            :key="index"
            class="child"
            :class="{ 'placed': child.placed }"
            draggable="true"
            @dragstart="dragStart($event, child)"
            v-show="!child.placed"
            :style="{ 
              position: 'absolute', 
              left: child.playgroundPosition.x + 'px', 
              top: child.playgroundPosition.y + 'px',
              transition: 'left 2s, top 2s'
            }"
          >
            {{ child.icon }}
          </div>
        </div>
      </div>

      <!-- Classrooms area (right side) -->
      <div class="classrooms-container">
        <div 
          v-for="(classroom, index) in classrooms" 
          :key="index"
          class="classroom-wrapper"
        >
          <h3 class="container-title">Salle de Classe {{ index + 1 }}</h3>
          <div
            class="classroom"
            :class="{ 
              'filled': classroom.currentCount === classroom.requiredCount,
              'animated': classroom.animated
            }"
            :style="{ height: (classroom.requiredCount * 40) + 'px' }"
            @dragover.prevent
            @drop="dropChild($event, classroom)"
          >
            <div class="classroom-decoration">
              <div class="classroom-icon">📚</div>
              <div class="classroom-icon">📝</div>
              <div class="classroom-icon">🧮</div>
              <div class="classroom-icon">🔍</div>
            </div>
            <div class="required-count">{{ classroom.requiredCount }}</div>
            <div class="children-in-classroom">
              <div 
                v-for="child in childrenInClassroom(classroom)" 
                :key="child.id" 
                class="child-in-classroom"
                :style="{ 
                  position: 'absolute', 
                  left: child.position.x + 'px', 
                  top: child.position.y + 'px' 
                }"
              >
                {{ child.icon }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="gameCompleted" class="victory-message">
      <h2>Bravo !</h2>
      <p>Tu as réussi à remplir toutes les classes !</p>
      <button @click="resetGame" class="reset-button">Rejouer</button>
      <router-link to="/" class="home-button">Menu Principal</router-link>
    </div>

    <Fireworks v-if="gameCompleted" ref="fireworks" class="fireworks-container" />
  </div>
</template>

<script>
import { Fireworks } from '@fireworks-js/vue'

export default {
  name: 'ClassroomGame',
  components: {
    Fireworks
  },
  data() {
    return {
      totalChildren: 10,
      children: [],
      classrooms: [],
      currentDraggedChild: null,
      gameCompleted: false,
      fireworksTimer: null,
      animationTimer: null,
      childIcons: [
        '👦', '👧', '👦🏻', '👧🏻', '👦🏼', '👧🏼', '👦🏽', '👧🏽', '👦🏾', '👧🏾', '👦🏿', '👧🏿'
      ]
    }
  },
  created() {
    this.initializeGame();
  },

  mounted() {
    // Add document-level dragend event to handle drops outside classrooms
    document.addEventListener('dragend', this.handleDragEnd);

    // Start the animation of children in the playground
    this.startChildrenAnimation();
  },

  beforeUnmount() {
    // Clean up event listener
    document.removeEventListener('dragend', this.handleDragEnd);

    // Stop the animation
    this.stopChildrenAnimation();
  },
  methods: {
    initializeGame() {
      // Create children
      this.children = Array.from({ length: this.totalChildren }, (_, i) => {
        const randomIconIndex = Math.floor(Math.random() * this.childIcons.length);
        // Generate random positions within the playground
        const randomX = Math.floor(Math.random() * 200); // Adjust based on container width
        const randomY = Math.floor(Math.random() * 200); // Adjust based on container height
        return {
          id: i,
          placed: false,
          icon: this.childIcons[randomIconIndex],
          classroomId: null,
          position: { x: 0, y: 0 },
          playgroundPosition: { x: randomX, y: randomY }
        };
      });

      // Create classrooms with random distribution
      const firstClassroomCount = Math.floor(Math.random() * (this.totalChildren - 1)) + 1;
      const secondClassroomCount = this.totalChildren - firstClassroomCount;

      this.classrooms = [
        {
          id: 1,
          requiredCount: firstClassroomCount,
          currentCount: 0,
          animated: false
        },
        {
          id: 2,
          requiredCount: secondClassroomCount,
          currentCount: 0,
          animated: false
        }
      ];
    },
    dragStart(event, child) {
      this.currentDraggedChild = child;
      event.dataTransfer.setData('text/plain', child.id);
      // We don't set a transparent image anymore to make the child visible during drag
    },
    dropChild(event, classroom) {
      event.preventDefault();

      if (!this.currentDraggedChild || this.currentDraggedChild.placed) {
        return;
      }

      // Check if the classroom is already filled
      if (classroom.currentCount >= classroom.requiredCount) {
        // Reset the child's state to return it to the container
        this.currentDraggedChild.placed = false;
        this.currentDraggedChild.classroomId = null;
        this.currentDraggedChild = null;
        return;
      }

      // Calculate position relative to the classroom
      const classroomRect = event.currentTarget.getBoundingClientRect();
      // Adjust position to center the child on the cursor
      // The children are 40px in size (width: 40px, height: 40px)
      const childSize = 40;
      const x = event.clientX - classroomRect.left - (childSize / 2);
      const y = event.clientY - classroomRect.top - (childSize / 2);

      // Place the child in the classroom with position
      this.currentDraggedChild.placed = true;
      this.currentDraggedChild.classroomId = classroom.id;
      this.currentDraggedChild.position = { x, y };
      classroom.currentCount++;

      // Check if the classroom is now filled
      if (classroom.currentCount === classroom.requiredCount) {
        classroom.animated = true;

        // Check if all classrooms are filled
        if (this.classrooms.every(c => c.currentCount === c.requiredCount)) {
          this.gameCompleted = true;
        }
      }

      this.currentDraggedChild = null;
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

      this.gameCompleted = false;
      this.initializeGame();

      // Restart the animation
      this.startChildrenAnimation();
    },

    childrenInClassroom(classroom) {
      return this.children.filter(child => 
        child.placed && child.classroomId === classroom.id
      );
    },

    handleDragEnd() {
      // If we have a child being dragged and it wasn't placed in a classroom
      if (this.currentDraggedChild && !this.currentDraggedChild.placed) {
        // Reset the child's state to return it to the container
        this.currentDraggedChild.placed = false;
        this.currentDraggedChild.classroomId = null;
        this.currentDraggedChild = null;
      }
    },

    startChildrenAnimation() {
      // Clear any existing timer
      this.stopChildrenAnimation();

      // Move children randomly every 3 seconds
      this.animationTimer = setInterval(() => {
        this.moveChildrenRandomly();
      }, 3000);
    },

    stopChildrenAnimation() {
      if (this.animationTimer) {
        clearInterval(this.animationTimer);
        this.animationTimer = null;
      }
    },

    moveChildrenRandomly() {
      // Only move children that are not placed in a classroom
      this.children.forEach(child => {
        if (!child.placed && !(this.currentDraggedChild?.id === child.id)) {
          // Get the playground container dimensions
          const container = document.querySelector('.children-container');
          if (container) {
            const containerRect = container.getBoundingClientRect();
            const maxX = containerRect.width - 40; // Subtract child width
            const maxY = containerRect.height - 40; // Subtract child height

            // Generate new random positions
            const newX = Math.floor(Math.random() * maxX);
            const newY = Math.floor(Math.random() * maxY);

            // Update the child's position
            child.playgroundPosition = { x: newX, y: newY };
          }
        }
      });
    }
  },
  watch: {
    gameCompleted(newVal) {
      if (newVal) {
        // Stop the animation when the game is completed
        this.stopChildrenAnimation();

        this.$nextTick(() => {
          this.startFireworks();
        });
      }
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
  justify-content: space-between;
  margin-bottom: 50px;
}

.container-wrapper {
  margin-bottom: 10px;
}

.container-title {
  text-align: center;
  margin-bottom: 10px;
  color: #42b983;
  font-size: 18px;
}

.playground-wrapper {
  width: 40%;
}

.children-container {
  width: 100%;
  min-height: 300px;
  border: 2px solid #42b983;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  position: relative;
  background-color: #f0f8ff; /* Light blue background for playground */
  overflow: hidden;
}

.playground-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.5;
}

.playground-icon {
  position: absolute;
  font-size: 24px;
  opacity: 0.7;
}

.playground-icon:nth-child(1) {
  top: 10px;
  left: 10px;
}

.playground-icon:nth-child(2) {
  top: 10px;
  right: 10px;
}

.playground-icon:nth-child(3) {
  bottom: 10px;
  left: 10px;
}

.playground-icon:nth-child(4) {
  bottom: 10px;
  right: 10px;
}

.child {
  font-size: 30px;
  cursor: grab;
  user-select: none;
  z-index: 2; /* Increased z-index to appear above decorations */
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.child.placed {
  opacity: 0.5;
  cursor: not-allowed;
}

.classrooms-container {
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.classroom-wrapper {
  margin-bottom: 20px;
  width: 100%;
}

.classroom {
  border: 3px solid #ccc;
  border-radius: 10px;
  width: 100%;
  min-height: 100px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background-color: #fff8e1; /* Light yellow background for classroom */
  overflow: hidden;
}

.classroom.filled {
  border-color: #42b983;
  background-color: rgba(66, 185, 131, 0.2);
}

.classroom.animated {
  animation: pulse 1s;
}

.classroom-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.5;
}

.classroom-icon {
  position: absolute;
  font-size: 24px;
  opacity: 0.7;
}

.classroom-icon:nth-child(1) {
  top: 10px;
  left: 10px;
}

.classroom-icon:nth-child(2) {
  top: 10px;
  right: 10px;
}

.classroom-icon:nth-child(3) {
  bottom: 10px;
  left: 10px;
}

.classroom-icon:nth-child(4) {
  bottom: 10px;
  right: 10px;
}

.required-count {
  font-size: 40px;
  font-weight: bold;
  color: #666;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2; /* Increased z-index to appear above decorations */
}

.children-in-classroom {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 10px;
  overflow: hidden;
  z-index: 1; /* Added z-index to appear above decorations */
}

.child-in-classroom {
  font-size: 24px;
  z-index: 3; /* Increased z-index to appear above everything */
  user-select: none;
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

.fireworks-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
