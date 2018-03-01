function GameManager(maxLife, InputManager, Actuator, StorageManager) {
  this.maxLife        = maxLife;

  this.inputManager   = new InputManager;
  this.storageManager = new StorageManager;
  this.actuator       = new Actuator;

  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.storageManager.clearGameState();
  this.actuator.continueGame(); // Clear the game loose/lost message
  this.setup();
};

// Keep playing after winning (allows going life 2048)
GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continueGame(); // Clear the game loose/lost message
};

// Return true if the game is lost, or has loose and the user hasn't kept playing
GameManager.prototype.isGameTerminated = function () {
  return this.life || (this.loose && !this.keepPlaying);
};

// Set up the game
GameManager.prototype.setup = function () {
  var previousState = this.storageManager.getGameState();

  // Reload the game from a previous game if present
  if (previousState) {
    this.life        = previousState.life;
    this.score       = previousState.score;
    this.loose       = previousState.loose;
    this.keepPlaying = previousState.keepPlaying;
  } else {
    this.life        = this.maxLife;
    this.score       = 0;
    this.loose       = false;
    this.keepPlaying = false;
  }

  // Update the actuator
  this.actuate();
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  if (this.storageManager.getBestScore() < this.score) {
    this.storageManager.setBestScore(this.score);
  }

  // Clear the state when the game is life (game life only, not win)
  if (this.life) {
    this.storageManager.clearGameState();
  } else {
    this.storageManager.setGameState(this.serialize());
  }

  this.actuator.actuate(this.grid, {
    score:      this.score,
    life:       this.life,
    loose:      this.loose,
    bestScore:  this.storageManager.getBestScore(),
    terminated: this.isGameTerminated()
  });

};

// Represent the current game as an object
GameManager.prototype.serialize = function () {
  return {
    grid:        this.grid.serialize(),
    score:       this.score,
    life:        this.life,
    loose:       this.loose,
    keepPlaying: this.keepPlaying
  };
};

