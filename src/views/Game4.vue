<template>
  <div class="game-container">
    <h1>Course de Voitures</h1>

    <div class="instructions" v-if="!raceStarted">
      <p>Choisis une voiture sur laquelle parier, puis clique sur le drapeau vert pour démarrer la course!</p>
    </div>

    <div class="betting-section" v-if="!raceStarted">
      <div class="car-options">
        <div 
          v-for="(car, index) in cars" 
          :key="index" 
          class="car-option"
          :class="{ 'selected': selectedCar === car.color }"
          @click="selectCar(car.color)"
        >
          <div class="car-preview" :style="{ backgroundColor: car.color }"></div>
          <p>{{ car.name }}</p>
        </div>
      </div>

      <button 
        @click="startRace" 
        class="start-button" 
        :disabled="!selectedCar"
      >
        <span class="flag">🚩</span> Démarrer la course
      </button>
    </div>

    <div class="race-track-container">
      <canvas ref="raceTrack" width="1000" height="1000" class="race-track"></canvas>
      {{cars[0].position}}
    </div>

    <div v-if="raceFinished" class="podium-container">
      <h2>Résultats de la course</h2>
      <div class="podium">
        <div class="podium-place second-place">
          <div class="car-icon" :style="{ backgroundColor: finishOrder[1]?.color }"></div>
          <div class="place-number">2</div>
        </div>
        <div class="podium-place first-place">
          <div class="car-icon" :style="{ backgroundColor: finishOrder[0]?.color }"></div>
          <div class="place-number">1</div>
        </div>
        <div class="podium-place third-place">
          <div class="car-icon" :style="{ backgroundColor: finishOrder[2]?.color }"></div>
          <div class="place-number">3</div>
        </div>
      </div>

      <div class="result-message">
        <h2 v-if="playerWon">Bravo! Tu as gagné!</h2>
        <h2 v-else>Dommage! Tu as perdu.</h2>
        <p v-if="playerWon">Ta voiture {{ getCarName(selectedCar) }} a gagné la course!</p>
        <p v-else>La voiture {{ getCarName(finishOrder[0]?.color) }} a gagné la course.</p>
        <button @click="resetGame" class="reset-button">Rejouer</button>
        <router-link to="/" class="home-button">Menu Principal</router-link>
      </div>
    </div>

    <Fireworks v-if="raceFinished && playerWon" ref="fireworks" class="fireworks-container" />
  </div>
</template>

<script>
import { Fireworks } from '@fireworks-js/vue'

export default {
  name: 'RaceGame',
  components: {
    Fireworks
  },
  data() {
    return {
      cars: [
        { color: 'red', name: 'Rouge', position: 0, angle: 0, speed: 0, finished: false, lap: 0 },
        { color: 'blue', name: 'Bleue', position: 0, angle: 0, speed: 0, finished: false, lap: 0 },
        { color: 'green', name: 'Verte', position: 0, angle: 0, speed: 0, finished: false, lap: 0 },
        { color: 'gold', name: 'Jaune', position: 0, angle: 0, speed: 0, finished: false, lap: 0 }
      ],
      selectedCar: null,
      raceStarted: false,
      raceFinished: false,
      playerWon: false,
      finishOrder: [],
      animationId: null,
      trackLength: 0,
      fireworksTimer: null,
      ctx: null,
      trackPath: [],
      centerX: 0,
      centerY: 0
    }
  },
  mounted() {
    this.initializeCanvas();
    this.loadImages();
  },
  beforeUnmount() {
    this.stopRace();
    if (this.fireworksTimer) {
      clearTimeout(this.fireworksTimer);
    }
  },
  methods: {
    initializeCanvas() {
      const canvas = this.$refs.raceTrack;
      this.ctx = canvas.getContext('2d');

      // Set center of the canvas
      this.centerX = canvas.width / 2;
      this.centerY = canvas.height / 2;

      // Calculate track length for the oval track
      // Reduce radius to ensure the entire track is visible within the canvas
      const radius = Math.min(canvas.width, canvas.height) * 0.35; 
      // Approximate length of oval using the formula 2π * sqrt((a² + b²)/2) where a and b are the semi-major and semi-minor axes

      this.trackLength = 300;

      // Create track path points for oval
      this.createTrackPath(radius);
    },

    createTrackPath(radius) {
      this.trackPath = [];

      // Create points for an oval track
      const steps = 100; // Number of points to create a smooth path
      const ovalWidth = radius * 1.2;
      const ovalHeight = radius;

      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * Math.PI * 2;

        // Oval parametric equations
        const x = this.centerX + ovalWidth * Math.cos(angle);
        const y = this.centerY + ovalHeight * Math.sin(angle);

        this.trackPath.push({ x, y, angle });
      }
    },
    loadImages() {
      // Draw the track directly without loading an image
      this.drawTrack();
    },
    selectCar(color) {
      this.selectedCar = color;
    },
    getCarName(color) {
      const car = this.cars.find(c => c.color === color);
      return car ? car.name : '';
    },
    startRace() {
      if (!this.selectedCar) return;

      this.raceStarted = true;

      // Reset car positions and speeds
      this.cars.forEach(car => {
        car.position = 0;
        car.angle = 0;
        car.speed = 0;
        car.finished = false;
        car.lap = 0;
      });

      this.finishOrder = [];
      this.raceFinished = false;
      this.playerWon = false;

      // Start animation
      this.animateRace();
    },
    animateRace() {
      // Clear previous animation frame
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }

      const animate = () => {
        this.updateCarPositions();
        this.drawTrack();
        this.drawCars();

        // Check if race is finished
        if (this.finishOrder.length < 4 && this.raceStarted) {
          this.animationId = requestAnimationFrame(animate);
        } else if (this.finishOrder.length === 4 && !this.raceFinished) {
          this.finishRace();
        }
      };

      this.animationId = requestAnimationFrame(animate);
    },
    updateCarPositions() {
      this.cars.forEach(car => {
        if (car.finished) return;

        // Random acceleration with some variability to create suspense
        // Reduced acceleration for slower race
        const acceleration = Math.random() * 0.02 + 0.005;

        // Add some randomness to create overtaking and suspense
        // Reduced randomness for more predictable movement
        const randomFactor = Math.random() * 0.15 - 0.075; // -0.075 to 0.075

        car.speed += acceleration + randomFactor;

        // Add more drag to slow down cars
        car.speed *= 0.9;

        // Ensure minimum speed (reduced)
        car.speed = Math.max(car.speed, 0.02);

        // Update position along the track path
        car.position += car.speed;

        // Calculate the index in the track path
        const pathIndex = Math.floor(car.position % this.trackPath.length);
        const nextPathIndex = (pathIndex + 1) % this.trackPath.length;

        // Get the current point and next point on the track
        const currentPoint = this.trackPath[pathIndex];
        const nextPoint = this.trackPath[nextPathIndex];

        // Calculate car's angle based on direction between points
        car.angle = Math.atan2(
          nextPoint.y - currentPoint.y,
          nextPoint.x - currentPoint.x
        );

        // Check if car has completed a lap
        if (car.position >= this.trackLength && !car.finished) {
          car.lap += 1;

          // After completing one lap, mark as finished
          if (car.lap >= 1) {
            car.finished = true;
            this.finishOrder.push(car);
          }
        }
      });
    },
    drawTrack() {
      const canvas = this.$refs.raceTrack;
      const ctx = this.ctx;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw track background
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Track width
      const trackWidth = 100; // Adjusted for 1200x1200 canvas

      // Draw the oval track
      ctx.beginPath();
      ctx.moveTo(this.trackPath[0].x, this.trackPath[0].y);

      for (let i = 1; i < this.trackPath.length; i++) {
        ctx.lineTo(this.trackPath[i].x, this.trackPath[i].y);
      }

      // Close the path by connecting back to the first point
      ctx.lineTo(this.trackPath[0].x, this.trackPath[0].y);

      // Set track style
      ctx.strokeStyle = '#d0d0d0';
      ctx.lineWidth = trackWidth;
      ctx.stroke();

      // Draw outer track (asphalt)
      ctx.beginPath();
      ctx.moveTo(this.trackPath[0].x, this.trackPath[0].y);

      for (let i = 1; i < this.trackPath.length; i++) {
        ctx.lineTo(this.trackPath[i].x, this.trackPath[i].y);
      }

      // Close the path
      ctx.lineTo(this.trackPath[0].x, this.trackPath[0].y);

      ctx.strokeStyle = '#888';
      ctx.lineWidth = trackWidth + 8; // Reduced outer track width for 1200x1200 canvas
      ctx.stroke();

      // Draw start/finish line
      this.drawStartFinishLine(ctx, trackWidth);
    },

    drawRumbleStrips(ctx, trackWidth) {
      // Identify curve sections (where the track changes direction significantly)
      const curvePoints = [];

      // Find points where the track curves the most
      for (let i = 0; i < this.trackPath.length; i++) {
        const prev = this.trackPath[(i - 1 + this.trackPath.length) % this.trackPath.length];
        const current = this.trackPath[i];
        const next = this.trackPath[(i + 1) % this.trackPath.length];

        // Calculate angle change to detect curves
        const dx1 = current.x - prev.x;
        const dy1 = current.y - prev.y;
        const dx2 = next.x - current.x;
        const dy2 = next.y - current.y;

        const angle1 = Math.atan2(dy1, dx1);
        const angle2 = Math.atan2(dy2, dx2);

        // If angle change is significant, it's a curve
        if (Math.abs(angle1 - angle2) > 0.2) {
          curvePoints.push(i);
        }
      }

      // Draw red and white rumble strips at curve points
      for (const pointIndex of curvePoints) {
        const point = this.trackPath[pointIndex];

        // Draw a small red and white striped section
        ctx.save();
        ctx.translate(point.x, point.y);

        // Determine angle of the track at this point
        const nextPoint = this.trackPath[(pointIndex + 1) % this.trackPath.length];
        const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x);
        ctx.rotate(angle);

        // Draw alternating red and white stripes
        const stripeWidth = 10;
        const stripeCount = 5;
        const totalWidth = stripeWidth * stripeCount * 2;

        for (let i = 0; i < stripeCount; i++) {
          // Red stripe
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(-totalWidth/2 + i * stripeWidth * 2, -trackWidth/2 - 5, stripeWidth, 10);

          // White stripe
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-totalWidth/2 + i * stripeWidth * 2 + stripeWidth, -trackWidth/2 - 5, stripeWidth, 10);

          // Bottom side of track
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(-totalWidth/2 + i * stripeWidth * 2, trackWidth/2 - 5, stripeWidth, 10);

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-totalWidth/2 + i * stripeWidth * 2 + stripeWidth, trackWidth/2 - 5, stripeWidth, 10);
        }

        ctx.restore();
      }
    },

    drawStartFinishLine(ctx, trackWidth) {
      // Draw start/finish line at the center bottom of the track
      const startPoint = this.trackPath[0]; // First point is at the bottom center

      ctx.save();
      ctx.translate(startPoint.x, startPoint.y);

      // Draw black and white checkered pattern
      const squareSize = 10;
      const squares = Math.floor(trackWidth / squareSize);

      for (let i = 0; i < squares; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#000' : '#fff';
        ctx.fillRect(-trackWidth/2 + i * squareSize, -5, squareSize, 10);
      }

      ctx.restore();
    },
    drawCars() {
      const ctx = this.ctx;

      this.cars.forEach((car, index) => {
        // Calculate the position on the track path
        const pathIndex = Math.floor(car.position % this.trackPath.length);

        // Get the point on the track
        const point = this.trackPath[pathIndex];

        // Calculate offset for each car to avoid overlap
        // Create a perpendicular offset to the track direction
        const offsetDistance = 15 * (index - 1.5); // -22.5, -7.5, 7.5, 22.5
        const offsetAngle = car.angle + Math.PI/2; // Perpendicular to car direction

        // Calculate the offset position
        const offsetX = Math.cos(offsetAngle) * offsetDistance;
        const offsetY = Math.sin(offsetAngle) * offsetDistance;

        // Final car position with offset
        const x = point.x + offsetX;
        const y = point.y + offsetY;

        // Save the current context state
        ctx.save();

        // Translate to the car position
        ctx.translate(x, y);

        // Rotate to match the car's direction
        ctx.rotate(car.angle);

        // Draw car body (centered at origin)
        ctx.fillStyle = car.color;
        ctx.fillRect(-20, -15, 40, 30);

        // Draw car details
        ctx.fillStyle = '#000';
        ctx.fillRect(10, -10, 10, 20); // Front
        ctx.fillRect(-15, -5, 20, 10); // Window

        // Restore the context
        ctx.restore();
      });
    },
    finishRace() {
      this.raceFinished = true;

      // Check if player won
      this.playerWon = this.finishOrder[0].color === this.selectedCar;

      // Start fireworks if player won
      if (this.playerWon) {
        this.$nextTick(() => {
          this.startFireworks();
        });
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
    stopRace() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    },
    resetGame() {
      this.stopRace();

      if (this.$refs.fireworks) {
        this.$refs.fireworks.stop();
      }

      // Clear the fireworks timer if it exists
      if (this.fireworksTimer) {
        clearTimeout(this.fireworksTimer);
        this.fireworksTimer = null;
      }

      this.selectedCar = null;
      this.raceStarted = false;
      this.raceFinished = false;
      this.playerWon = false;
      this.finishOrder = [];

      // Reset car positions and speeds
      this.cars.forEach(car => {
        car.position = 0;
        car.angle = 0;
        car.speed = 0;
        car.finished = false;
        car.lap = 0;
      });

      this.drawTrack();
    }
  }
}
</script>

<style scoped>
.game-container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #42b983;
  margin-bottom: 30px;
}

.instructions {
  margin-bottom: 20px;
  font-size: 18px;
}

.betting-section {
  margin-bottom: 30px;
}

.car-options {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.car-option {
  border: 2px solid #ccc;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
}

.car-option:hover {
  transform: scale(1.05);
}

.car-option.selected {
  border-color: #42b983;
  background-color: #f0f8f4;
}

.car-preview {
  width: 60px;
  height: 30px;
  margin: 0 auto 10px;
  border-radius: 5px;
}

.start-button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 18px;
  display: block;
  margin: 0 auto;
}

.start-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.start-button:hover:not(:disabled) {
  background-color: #3aa876;
}

.flag {
  font-size: 20px;
  margin-right: 8px;
}

.race-track-container {
  margin: 30px auto;
  width: 1000px;
  height: 1000px;
  max-width: 100%;
  position: relative;
}

.race-track {
  border: 2px solid #333;
  border-radius: 10px;
  display: block;
  margin: 0 auto;
  width: 100%;
  height: 100%;
}

.podium-container {
  margin-top: 40px;
  text-align: center;
}

.podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 150px;
  margin: 30px 0;
}

.podium-place {
  width: 100px;
  background-color: #f0f0f0;
  border: 2px solid #333;
  border-top: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 10px;
}

.first-place {
  height: 120px;
  z-index: 3;
}

.second-place {
  height: 90px;
  z-index: 2;
}

.third-place {
  height: 60px;
  z-index: 1;
}

.car-icon {
  width: 40px;
  height: 20px;
  margin-bottom: 10px;
  border-radius: 3px;
}

.place-number {
  font-size: 24px;
  font-weight: bold;
}

.result-message {
  margin-top: 40px;
  padding: 20px;
  background-color: #f0f8f4;
  border-radius: 10px;
  animation: fadeIn 1s;
}

.result-message h2 {
  color: #42b983;
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
