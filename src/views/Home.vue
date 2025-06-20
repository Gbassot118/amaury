<template>
  <div class="home">
    <h1>Jeux Éducatifs pour Enfants</h1>
    <div class="game-menu">
      <div class="game-item">
        <div class="game-icon">🔤</div>
        <h2>Jeu de Lettres: AMAURY</h2>
        <p>Tape les lettres du prénom "AMAURY" dans l'ordre</p>
        <router-link to="/game1"><button>Jouer</button></router-link>
      </div>
      <div class="game-item">
        <div class="game-icon">🏫</div>
        <h2>Jeu des Classes</h2>
        <p>Fais glisser le bon nombre d'enfants dans chaque classe</p>
        <router-link to="/game2"><button>Jouer</button></router-link>
      </div>
      <div class="game-item">
        <div class="game-icon">🔢</div>
        <h2>Jeu des Chiffres</h2>
        <p>Tape les chiffres dans l'ordre et compte les fleurs</p>
        <router-link to="/game3"><button>Jouer</button></router-link>
      </div>
      <div class="game-item">
        <div class="game-icon">🌸</div>
        <h2>Jeu des Chiffres (Variante)</h2>
        <p>Compte les fleurs et trouve le bon chiffre</p>
        <router-link to="/game3variant"><button>Jouer</button></router-link>
      </div>
      <div class="game-item">
        <div class="game-icon">🏎️</div>
        <h2>Course de Voitures</h2>
        <p>Parie sur une voiture et regarde la course</p>
        <router-link to="/game4"><button>Jouer</button></router-link>
      </div>
      <div class="game-item">
        <div class="game-icon">📝</div>
        <h2>Jeu de Lettres: Prénom Aléatoire</h2>
        <p>Tape les lettres d'un prénom choisi aléatoirement</p>
        <router-link to="/game5"><button>Jouer</button></router-link>
      </div>
      <div class="game-item">
        <div class="game-icon">➕</div>
        <h2>Jeu d'Addition</h2>
        <p>Calcule la somme des deux nombres et tape le résultat</p>
        <router-link to="/game6"><button>Jouer</button></router-link>
      </div>
      <div class="game-item">
        <div class="game-icon">🎴</div>
        <h2>Jeu de Memory</h2>
        <p>Retourne les cartes pour trouver les paires de chiffres identiques</p>
        <router-link to="/game7"><button>Jouer</button></router-link>
      </div>
      <div class="game-item">
        <div class="game-icon">🐰</div>
        <h2>Le Jardin des Animaux</h2>
        <p>Fais glisser le bon nombre d'animaux dans le jardin pour correspondre au chiffre affiché</p>
        <router-link to="/game8"><button>Jouer</button></router-link>
      </div>
      <div class="game-item">
        <div class="game-icon">🛒</div>
        <h2>Le Marché Magique</h2>
        <p>Aide le client à faire ses courses en plaçant les bons fruits et légumes sur le tapis de caisse</p>
        <router-link to="/game9"><button>Jouer</button></router-link>
      </div>
      <div class="game-item">
        <div class="game-icon">❄️</div>
        <h2>Les Flocons de Cristalia</h2>
        <p>Aide la Reine Cristalia à reconstruire son palais de glace en récoltant les bons nombres de flocons magiques</p>
        <router-link to="/game10"><button>Jouer</button></router-link>
      </div>
      <div class="game-item">
        <div class="game-icon">🚴</div>
        <h2>BMX Numbers Challenge</h2>
        <p>Aide le rider à réussir ses figures en résolvant des défis de comptage et de calcul</p>
        <router-link to="/game11"><button>Jouer</button></router-link>
      </div>
      <div class="game-item">
        <div class="game-icon">🔍</div>
        <h2>Code Caché</h2>
        <p>Retrouve et mémorise les codes à 3 chiffres en explorant l'environnement</p>
        <router-link to="/game12"><button>Jouer</button></router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home {
  padding: 20px;
}

h1 {
  color: #42b983;
  margin-bottom: 40px;
}

.game-menu {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
}

.game-item {
  border: 2px solid #42b983;
  border-radius: 10px;
  padding: 20px;
  width: 250px;
  text-align: center;
  background-color: #f5f5f5;
  transition: transform 0.3s ease;
  position: relative;
}

.game-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.game-item:hover {
  transform: scale(1.05);
}

button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
}

button:hover {
  background-color: #3aa876;
}
</style>
