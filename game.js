const Player = require('./player.js');
const Sight = require('./sight.js');
const Exit = require('./exit.js');
const Ghost = require('./ghost.js');
const Util = require('./util.js');
const util = new Util();
// const GameView = require('./game_view.js');

function Game(board, newGame, playerPos, ghosts, tutorial) {
  this.newGame = newGame;
  this.dimY = window.innerHeight;
  this.dimX = window.innerWidth;
  this.board = board;
  this.opacity = 1;

  if (tutorial) {
    this.opacity = .01
  }

  playerPos = playerPos || [(this.dimX / 2), (this.dimY / 2)]

  this.mouse = playerPos;
  this.player = new Player(playerPos, this);
  this.ghosts = [];
  if (ghosts > 0) {
    for (var i = 0; i < ghosts; i++) {
      this.ghosts.push(new Ghost (util.randomPos(this.player.pos, 80), this));
    }
  }
  this.allObjects = [this.player].concat(this.ghosts);
  // this.vision = 300;
  this.exit = new Exit (this, tutorial, 500);
  this.sight = new Sight(this, tutorial);
  this.gameOver = false;
  window.setTimeout(() => {
    this.exit.tutorial = false;

  }, 40000)
};

Game.prototype.setup = function(ctx) {
  ctx.clearRect(0, 0, this.dimX, this.dimY);
  this.board.render();
  // const canvas = document.getElementById('world');
  // canvas.className = "fade-in"
  this.player.draw(ctx);
  this.exit.draw(ctx);
  this.sight.draw(ctx);
  this.ghosts.forEach((ghost) => {
    ghost.draw(ctx);
  })
  window.addEventListener('mousemove', (e) => {
    this.mouse = [e.clientX, e.clientY]
  });
  this.boardSetup();
};

Game.prototype.boardSetup = function() {
  for (var i = 0; i < 10; i++) {
    this.board.step();
  }
  this.interval = setInterval(() => {
    this.stepping = true;
  }, 10000)
};

Game.prototype.draw = function(ctx) {
  ctx.clearRect(0, 0, this.dimX, this.dimY);
  if (this.stepping) {
    this.board.step();
  } else {
    this.board.render();
  }

  if (this.hitWall(ctx, this.player)) {
    this.player.setMax(.4);
  } else {
    this.player.setMax(2);
  }
  this.player.draw(ctx);
  this.exit.draw(ctx);
  this.fog(ctx);
  this.ghosts.forEach((ghost) => {
    ghost.draw(ctx);
  });
  this.sight.draw(ctx);
  this.ghosts.forEach((ghost) => {
    ghost.flicker(ctx, this.stepping);
  })
  this.stepping = false;
};

Game.prototype.fog = function (ctx) {
  let pX = this.player.pos[0];
  let pY = this.player.pos[1];
  let gradient = ctx.createRadialGradient(pX, pY, 150, pX, pY, 340);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, `rgba(0,0,0,${this.opacity})`);
  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fillRect(0,0,this.dimX,this.dimY)
  ctx.restore();

  if (this.opacity < 1) {
    this.opacity += .00025
  }
};

Game.prototype.moveObjects = function () {
  this.allObjects.forEach((object) => {
    object.move();
  });
};

Game.prototype.step = function () {
  this.moveObjects();
  // this.vision -= .01;
  this.win();
  if (this.ghosts.length > 0) {
    this.over();
  }
};

Game.prototype.hitWall = function (ctx, player) {
  let x = player.pos[0] - player.radius/2;
  let y = player.pos[1] - player.radius/2;
  const imgData = ctx.getImageData(x, y, player.radius, player.radius);
  const pix = imgData.data;
  for (let i = 0; i < pix.length; i++) {
    if (pix[i] !== 0) {
      return true
    }
  }
  return false
};

Game.prototype.win = function() {
  if (((this.player.pos[0] > this.exit.pos[0]) &&
    (this.player.pos[0] < this.exit.pos[0] + 60)) &&
   ((this.player.pos[1] > this.exit.pos[1]) &&
    (this.player.pos[1] < this.exit.pos[1] + 60)) &&
     (!this.exit.tutorial)) {
      this.player.vel = [0, 0];
      window.cancelAnimationFrame(window.animation);
      window.animation = undefined;
      const canvas = document.getElementById('world');
      // canvas.className = "fade-out"
      this.newGame(this.player.pos, 1);
    }
};

Game.prototype.over = function() {
  this.ghosts.forEach((ghost) => {
    if (((this.player.pos[0] > ghost.pos[0] - ghost.radius) &&
      (this.player.pos[0] < ghost.pos[0] + ghost.radius)) &&
     ((this.player.pos[1] > ghost.pos[1] - ghost.radius) &&
      (this.player.pos[1] < ghost.pos[1] + ghost.radius))) {
        this.gameOver = true
      }
    });
};


module.exports = Game;
