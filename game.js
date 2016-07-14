const Player = require('./player.js');
const Sight = require('./sight.js');
const Exit = require('./exit.js');
// const GameView = require('./game_view.js');

function Game(board, newGame, playerPos) {
  this.newGame = newGame;
  this.dimY = window.innerHeight;
  this.dimX = window.innerWidth;
  this.board = board

  playerPos = playerPos || [(this.dimX / 2), (this.dimY / 2)]

  this.mouse = playerPos;
  this.player = new Player(playerPos, this);
  this.exit = new Exit (this);
  this.sight = new Sight(this);

  this.allObjects = [this.player];
};

Game.prototype.setup = function(ctx) {
  ctx.clearRect(0, 0, this.dimX, this.dimY);
  this.board.render();
  this.player.draw(ctx);
  this.exit.draw(ctx);
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
    this.stepping = false;
  } else {
    this.board.render();
  }

  if (this.hitWall(ctx, this.player)) {
    this.player.moveBack();
  }
  this.fog(ctx);
  this.player.draw(ctx);
  this.exit.draw(ctx);
  this.sight.draw(ctx);
};

Game.prototype.fog = function (ctx) {
  let pX = this.player.pos[0];
  let pY = this.player.pos[1];
  let gradient = ctx.createRadialGradient(pX, pY, 100, pX, pY, 500);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,1)");
  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fillRect(0,0,this.dimX,this.dimY)
  ctx.restore();
};

Game.prototype.moveObjects = function () {
  this.allObjects.forEach((object) => {
    object.move();
  });
};

Game.prototype.step = function () {
  this.moveObjects();
  this.win();
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
    (this.player.pos[0] < this.exit.pos[0] + 40)) &&
   ((this.player.pos[1] > this.exit.pos[1]) &&
    (this.player.pos[1] < this.exit.pos[1] + 40))) {
      this.player.vel = [0, 0];
      this.newGame(this.player.pos);
    }
};

// Game.prototype.newGame = function () {
//   const canvasEl = document.getElementById("world");
//   canvasEl.height = window.innerHeight;
//   canvasEl.width = window.innerWidth;
//   const ctx = canvasEl.getContext('2d');
//
//   const new = GameView.new(ctx);
//   newGame.start();
// };

module.exports = Game;
