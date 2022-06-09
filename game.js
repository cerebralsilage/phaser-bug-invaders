function preload() {
  this.load.image('bug1', 'assets/images/bug1.png');
  this.load.image('bug2', 'assets/images/bug2.png');
  this.load.image('bug3', 'assets/images/bug3.png');
  this.load.image('platform', 'https://content.codecademy.com/courses/learn-phaser/physics/platform.png');
  this.load.image('codey', 'https://content.codecademy.com/courses/learn-phaser/Bug%20Invaders/codey.png');
  this.load.image('bugPellet', 'https://content.codecademy.com/courses/learn-phaser/Bug%20Invaders/bugPellet.png');
  this.load.image('bugRepellent', 'https://content.codecademy.com/courses/learn-phaser/Bug%20Invaders/bugRepellent.png');
  // audio snippets by ZAPSPLAT
  this.load.audio('bugRepAudio', 'assets/audio/gunsound.mp3');
  this.load.audio('bughit', 'assets/audio/bughit.mp3');
  this.load.audio('bugpellet', 'assets/audio/bugpellet.mp3');
  this.load.audio('playerhit', 'assets/audio/playerhit.mp3');
  this.load.audio('endscene', 'assets/audio/endscene.mp3');
};

// Helper Methods below:
// sortedEnemies() returns an array of enemy sprites sorted by their x coordinate
function sortedEnemies(){
  const orderedByXCoord = gameState.enemies.getChildren().sort((a, b) => 
    a.x - b.x);
  return orderedByXCoord;
};
// numOfTotalEnemies() returns the number of total enemies 
function numOfTotalEnemies() {
	const totalEnemies = gameState.enemies.getChildren().length;
  return totalEnemies;
};
// create high score 
function createHighScore() {
  if (gameState.score > highScore) {
    gameState.highScoreText.setText(`High Score: ${gameState.score}`);
    highScore = gameState.score;
  };
};



let highScore = 0;

const gameState = {
  enemyVelocity: 1
};

function create() {
	// When gameState.active is true, the game is being played and not over. When gameState.active is false, then it's game over
	gameState.active = true;

	// When gameState.active is false, the game will listen for a pointerup event and restart when the event happens
	this.input.on('pointerup', () => {
		if (gameState.active === false) {
      this.endScene.destroy();
			this.scene.restart();
		}
	});
  
	// Creating static platforms
	const platforms = this.physics.add.staticGroup();
	platforms.create(225, 490, 'platform').setScale(1.1, .3).refreshBody();

  // Displays the initial number of bugs, this value is initially hardcoded as 24 
	gameState.bugsLeftText = this.add.text(5, 482, 'Bugs Left: 24', { 
    fontSize: '15px', fill: '#000000' });

  // create score system
  gameState.score = 0;
  gameState.scoreText = this.add.text(190, 482, `Score: ${gameState.score}`, { fontSize: '15px', fill: '#000000' });

  //  create high score 
  gameState.highScoreText = this.add.text(321, 482, `High Score: ${highScore}`, { fontSize: '15px', fill: '#000000' });


	// Uses the physics plugin to create Codey
	gameState.player = this.physics.add.sprite(225, 450, 'codey').setScale(.5);

	// Create Collider objects
	gameState.player.setCollideWorldBounds(true);
	this.physics.add.collider(gameState.player, platforms);
	
	// Creates cursor objects to be used in update()
	gameState.cursors = this.input.keyboard.createCursorKeys();

	// Create bug group
	gameState.enemies = this.physics.add.group(); 
 // bug spacing
  for (let yVal = 1; yVal < 4; yVal++) {
    for (let xVal = 1; xVal < 9; xVal++) {
      // setscale for size,setgravity to stay in place, and create bugs
      function createRandomBug() {
        let randomBug = Math.floor(Math.random() * 9);
        if (randomBug === 0 || randomBug === 1 || randomBug === 2 ||
          randomBug === 3) {
          return 'bug1';
        } else if (randomBug === 4 || randomBug === 5 || randomBug === 6) {
          return 'bug2';
        } else {
          return 'bug3';
        };
      };
      gameState.enemies.create(50 * xVal, 50 * yVal, createRandomBug()).setScale(.09).setGravityY(-200);
    }
  };
  // add bug pellets
  const pellets = this.physics.add.group();
  // generate pellets
  function genPellet() {
    let randomBug = Phaser.Utils.Array.GetRandom(gameState.enemies.getChildren());
    pellets.create(randomBug.x, randomBug.y, 'bugPellet');
    this.bugPellet.play();
  };
  // make bugs continuously create pellets
  gameState.pelletsLoop = this.time.addEvent({
    delay: 200,
    callback: genPellet,
    callbackScope: this,
    loop: true,
  });
  //  make pellet collider for ground
  this.physics.add.collider(pellets, platforms, function(pellet) {
    pellet.destroy();
  });

  // create audio
  this.blaster = this.sound.add('bugRepAudio', {
    mute: false,
    volume: .5 ,
    rate: .5,
    detune: 0,
    seek: 0,
    loop: false,
    delay: 0
  });

  this.playerHit = this.sound.add('playerhit', {
    mute: false,
    volume: 1,
    rate: 1,
    detune: 0,
    seek: 0,
    loop: false,
    delay: -5
  }); 

  this.bugPellet = this.sound.add('bugpellet', {
    mute: false,
    volume: .2,
    rate: .5,
    detune: 0,
    seek: 0,
    loop: false,
    delay: 0
  }); 

  this.bugHit = this.sound.add('bughit', {
    mute: false,
    volume: 1,
    rate: 1,
    detune: 0,
    seek: 0,
    loop: false,
    delay: 0
  }); 

  this.endScene = this.sound.add('endscene', {
    mute: false,
    volume: 1,
    rate: 1,
    detune: 0,
    seek: 0,
    loop: true,
    delay: 0
  }); 

  // make collider for player and pellets to end game
  this.physics.add.collider(pellets, gameState.player, () => {
    this.playerHit.play();
    this.endScene.play();
    // reset enemy velocity
    gameState.enemyVelocity = 1;
    // take away player controls
    gameState.active = false;
    // stop pellet generation
    gameState.pelletsLoop.destroy();
    // pause game pysics
    this.physics.pause();
    // check and set high score
    createHighScore();
    // Add gameover text
    this.add.text(210, 250, 'Game Over \n Click to restart', 
      { fontSize: '15px', fill: '#000'});
  });

  // collider for bugs and player to end game
  this.physics.add.collider(gameState.enemies, gameState.player, () => {
    this.playerHit.play();
    this.endScene.play();
    gameState.active = false;
    gameState.enemyVelocity = 1;
    gameState.pelletsLoop.destroy();
    this.physics.pause();
    createHighScore();
    this.add.text(210, 250, 'Game Over \n Click to restart', 
    { fontSize: '15px', fill: '#000'});
  });

  // give player firing ability
  gameState.bugRepellent = this.physics.add.group();
  

  // collider for player ammo and bugs
  this.physics.add.collider(gameState.enemies, gameState.bugRepellent, (bug , repellent) => {
    this.bugHit.play();
    // sort bugs to create different bug scores
    if (bug.texture.key === 'bug1') {
      gameState.score += 5;
    } else if (bug.texture.key === 'bug2') {
      gameState.score += 10;
    } else {
      gameState.score += 15;
    };
    
    bug.destroy();
    repellent.destroy();
    gameState.scoreText.setText(`Score: ${gameState.score}`);
    gameState.bugsLeftText.setText(`Bugs Left: ${numOfTotalEnemies()}`);
  });

  //  collider for bugs and ground
  this.physics.add.collider(gameState.enemies, platforms, () => {
    gameState.active = false;
    gameState.enemyVelocity = 1;
    gameState.pelletsLoop.destroy();
    this.endScene.play();
    this.physics.pause();
    createHighScore();
    this.add.text(210, 250, 'Game Over \n Click to restart', 
    { fontSize: '15px', fill: '#000'});
  });
  

}; // end create()


function update() {
	if (gameState.active) {
		// If the game is active, then players can control Codey
		if (gameState.cursors.left.isDown) {
			gameState.player.setVelocityX(-160);
		} else if (gameState.cursors.right.isDown) {
			gameState.player.setVelocityX(160);
		} else {
			gameState.player.setVelocityX(0);
		};

		// Execute code if the spacebar key is pressed
    if (Phaser.Input.Keyboard.JustDown(gameState.cursors.space)) {
      gameState.bugRepellent.create(gameState.player.x, gameState.player.y, 'bugRepellent').setGravityY(-400);
      // gun audio
      this.blaster.play();
    };

      // Add logic for winning condition and enemy movements below:
    if (numOfTotalEnemies() === 0) {
      gameState.enemyVelocity = 1;
      gameState.active = false;
      gameState.pelletsLoop.destroy();
      this.physics.pause();
      this.endScene.play();
      createHighScore();
      this.add.text(210, 250, 'You Win \n Click to restart', 
      { fontSize: '15px', fill: '#000'});
    } else { //enemy movement
      gameState.enemies.getChildren().forEach(bug => {
        bug.x += gameState.enemyVelocity;
      });
      gameState.leftMostBug = sortedEnemies()[0];
      gameState.rightMostBug = sortedEnemies()[sortedEnemies().length - 1];

      if (gameState.leftMostBug.x < 10 || gameState.rightMostBug.x > 440) 
      {
        gameState.enemyVelocity *= -1;
        gameState.enemies.getChildren().forEach(enemy => {
          enemy.y += 10;
        });
      };

    }; // end else
  }; // end if gameState.isActive
}; // end update()

const config = {
	type: Phaser.AUTO,
	width: 460,
	height: 500,
  autoCenter: Phaser.Scale.CENTER_BOTH,
	backgroundColor: "b9eaff",
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 },
			enableBody: true,
		}
	},
	scene: {
		preload,
		create,
		update
	}
};


const game = new Phaser.Game(config);