var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

var spriteCanvas = document.getElementById('sprites');
var spriteContext = spriteCanvas.getContext('2d');

var overlayCanvas = document.getElementById('overlay');
var overlayContext = overlayCanvas.getContext('2d');

var lightingCanvas = document.getElementById('lighting');
var lightingContext = lightingCanvas.getContext('2d');

var spotlightCanvas = document.getElementById('spotlight');
var spotlightContext = spotlightCanvas.getContext('2d');

var debugCanvas = document.getElementById('debug');
var debugContext = debugCanvas.getContext('2d');

var gameOverScreen = document.getElementById('gameOver');

var bgtile = new Image();
bgtile.src = "images/tileset.png";

var spriteIndex = 0;
var sprites = [];

var sightWidth = 10;
var sightHeight = 150;

// SPRITE CLASS

function Sprite(name, image, x, y, width, height, numOfFrames) {
	this.index = 0;
	this.name = name;
	this.image = image;
	this.width = width;
	this.height = height;
	this.collision = true;

	this.frameIndex = 0;
	this.numOfFrames = numOfFrames;
	this.xPosLast = 0;
	this.yPosLast = 0;
	this.xPos = x;
	this.yPos = y;
	this.speed = 0;
	this.walkSpeed = 4;
	this.runSpeed = 8;
	this.superSpeed = 12;
	this.direction = 0;

	this.init = function() {
		this.index = spriteIndex;
		spriteIndex++;
	};

	this.walk = function() {
		this.speed = this.walkSpeed;
	};

	this.run = function() {
		this.speed = this.runSpeed;
	};

	this.moveUp = function() {
		this.direction = 3;
		//this.clear(this.xPos, this.yPos);
		var allowed = true;
		for (var i=0; i<sprites.length; i++) {
			if (sprites[i].index != this.index) {
				if (sprites[i].collision) {
					if (willCollide(this, 0, -this.speed, sprites[i])) {
						allowed = false;
					}
				}
			}
		}
		if (allowed) {
			this.yPos -= this.speed;
		}
	};

	this.moveDown = function() {
		this.direction = 0;
		//this.clear(this.xPos, this.yPos);
		var allowed = true;
		for (var i=0; i<sprites.length; i++) {
			if (sprites[i].index != this.index) {
				if (sprites[i].collision) {
					if (willCollide(this, 0, this.speed, sprites[i])) {
						allowed = false;
					}
				}
			}
		}
		if (allowed) {
			this.yPos += this.speed;
		}
	};

	this.moveLeft = function() {
		this.direction = 1;
		//this.clear(this.xPos, this.yPos);
		var allowed = true;
		for (var i=0; i<sprites.length; i++) {
			if (sprites[i].collision) {
				if (sprites[i].index != this.index) {
					if (willCollide(this, -this.speed, 0, sprites[i])) {
						allowed = false;
					}
				}
			}
		}
		if (allowed) {
			this.xPos -= this.speed;
		}
	};

	this.moveRight = function() {
		this.direction = 2;
		//this.clear(this.xPos, this.yPos);
		var allowed = true;
		for (var i=0; i<sprites.length; i++) {
			if (sprites[i].index != this.index) {
				if (sprites[i].collision) {
					if (willCollide(this, this.speed, 0, sprites[i])) {
						allowed = false;
					}
				}
			}
		}
		if (allowed) {
			this.xPos += this.speed;
		}
	};

	this.speedUp = function() {
		this.runSpeed = this.superSpeed;
	}

	this.update = function() {
		if (this.frameIndex < this.numOfFrames - 1) {
			this.frameIndex++;
		} else {
			this.frameIndex = 0;
		}
	};

	this.clear = function(xPos, yPos) {
		spriteContext.clearRect(xPos, yPos, this.width, this.height);
	};

	this.render = function() {
		spriteContext.drawImage(
			this.image,
			this.width * this.frameIndex,
			this.height * this.direction,
			this.width,
			this.height,
			this.xPos,
			this.yPos,
			this.width,
			this.height
		);
	}

	this.init();
}

function Guard(name, image, x, y, width, height, numOfFrames) {

	Sprite.call(this, name, image, x, y, width, height, numOfFrames);

	this.x1 = 0;
	this.y1 = 0;
	this.x2 = 0;
	this.y2 = 0;
	this.spotlight;

	this.patrol = function() {
		//direction 3 up 0 down 1 left 2 right

		switch(this.direction) {
			case 3: // up
				this.x1 = this.xPos - sightWidth;
				this.y1 = this.yPos + this.height - sightHeight;
				this.x2 = this.xPos + this.width + sightWidth;
				this.y2 = this.yPos + this.height;
				break;
			case 0: // down
				this.x1 = this.xPos - sightWidth,
				this.y1 = this.yPos,
				this.x2 = this.xPos + this.width + sightWidth,
				this.y2 = this.yPos + sightHeight
				break;m
			case 1: // left
				this.x1 = this.xPos + this.width - sightHeight;
				this.y1 = this.yPos - sightWidth;
				this.x2 = this.xPos + this.width;
				this.y2 = this.yPos + this.height + sightWidth;
				break;
			case 2: // right
				this.x1 = this.xPos;
				this.y1 = this.yPos - sightWidth;
				this.x2 = this.xPos + sightHeight;
				this.y2 = this.yPos + this.height + sightWidth;
				break;
		}

		this.view = {
			x1: this.x1,
			y1: this.y1,
			x2: this.x2,
			y2: this.y2
		};

		debugContext.fillRect(this.view.x1, this.view.y1, this.view.x2-this.view.x1, this.view.y2-this.view.y1);

		if (didCollide(player1, this.view)) {
			gameOverScreen.innerHTML = "YOU LOSE <br>PLAYER 1";
			gameOverScreen.style.opacity = '0.7';
		}

		if (didCollide(player2, this.view)) {
			gameOverScreen.innerHTML = "YOU LOSE <br>PLAYER 2";
			gameOverScreen.style.opacity = '0.7';
		}

	}

	this.flashlight = function() {
		spotlightContext.clearRect(0,0,1000,1000);
		this.spotlight = spotlightContext.createRadialGradient((this.view.x1+this.view.x2)/2, (this.view.y1 + this.view.y2)/2, 0, (this.view.x1+this.view.x2)/2, (this.view.y1 + this.view.y2)/2, 50);
		this.spotlight.addColorStop(0, "rgba(255, 255, 255, 1.0)");
		this.spotlight.addColorStop(1, "rgba(255, 255, 255, 0)");
		spotlightContext.fillStyle = this.spotlight;
		spotlightContext.fillRect(0, 0, canvas.width, canvas.height);
	}
}

// KEY PRESS EVENT LISTENERS

var keysdown = {};

// Check key down
$(document).keydown(function(e) {
	if (keysdown[e.keyCode]) { return; }
	keysdown[e.keyCode] = true;
    e.preventDefault();
});

// Check key up
$(document).keyup(function(e){
  delete keysdown[e.keyCode];
});

// COLLISION DETECTION FUNCTION

function willCollide(sprite1, dx, dy, sprite2) {
	return ((sprite1.xPos + dx + sprite1.width > sprite2.xPos) &&
	(sprite1.yPos + dy + sprite1.height > sprite2.yPos) &&
	(sprite1.xPos + dx < sprite2.xPos + sprite2.width) &&
	(sprite1.yPos + dy < sprite2.yPos + sprite2.height));
}

function didCollide(sprite, view) {
	return ((sprite.xPos + sprite.width > view.x1) &&
	(sprite.yPos + sprite.height > view.y1) &&
	(sprite.xPos < view.x2) &&
	(sprite.yPos < view.y2));
}

function didGet(sprite, item) {
	return ((sprite.xPos + sprite.width > item.xPos) &&
	(sprite.yPos + sprite.height > item.yPos) &&
	(sprite.xPos < item.xPos + item.width) &&
	(sprite.yPos < item.yPos + item.height));
}


// MAP DATA

var mapObject = function(name, image, layer, imageX, imageY, x, y, collision) {
	this.name = name;
	this.image = image;
	this.layer = layer;
	this.imageX = imageX;
	this.imageY = imageY;
	this.width = 36;
	this.height = 36;
	this.xPos = x;
	this.yPos = y;
	this.collision = collision;

	this.render = function() {
		this.layer.drawImage(this.image, 1+(16+1)*this.imageX, 1+(16+1)*this.imageY, 16, 16, x, y, this.width, this.height);
	}
}

g = 'grass';
b = 'bush';
btl = 'bush-top-left';
bt = 'bush-top';
btr = 'bush-top-right';
t = 'tile';
tt = 'tile-top';
tb = 'tile-bottom';
tl = 'tile-left';
tr = 'tile-right';
ttrt = 'tile-turn-right-top';
ttrb = 'tile-turn-right-bottom';
ft = 'fence-top';
ftl = 'fence-top-left';
ftr = 'fence-top-right';
fl = 'fence-left';
fr = 'fence-right';
fbl = 'fence-bottom-left';
fbr = 'fence-bottom-right';
fb = 'fence-bottom';
lrt = 'lamp-right-top';
lrm = 'lamp-right-middle';
lrb = 'lamp-right-bottom';
llt = 'lamp-left-top';
llm = 'lamp-left-middle';
llb = 'lamp-left-bottom';
t11 = 'tree11';
t12 = 'tree12';
t13 = 'tree13';
t21 = 'tree21';
t22 = 'tree22';
t23 = 'tree23';
t31 = 'tree31';
t32 = 'tree32';
t33 = 'tree33';
t41 = 'tree41';
t42 = 'tree42';
t43 = 'tree43';


var map =  [[ftl ,ft   ,ft   ,ft   ,ft   ,ft   ,ft   ,ft   ,ft   ,ft   ,ft   ,ft   ,ft   ,ft   ,ft   ,ftr   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[fl  ,b   ,b   ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,fr  ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[t13 ,b   ,tl  ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,tr   ,fr  ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[t23 ,g   ,tl  ,t   ,t   ,tb  ,tb  ,tb  ,tb   ,tb   ,tb   ,tb   ,t   ,t  ,tr  ,lrt  ,g ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[t33 ,g   ,tl  ,t   ,tr  ,lrt ,b ,g   ,g   ,b   ,b   ,b   ,tl   ,t   ,tr   ,lrm  ,g ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[t43 ,g   ,tl  ,t   ,tr  ,lrm ,t11 ,t12 ,t13   ,b   ,b   ,b   ,tl   ,t   ,tr   ,lrb  ,g ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[b   ,g   ,tl  ,t   ,tr  ,lrb ,t21 ,t22 ,t23   ,b   ,b   ,b   ,tl   ,t   ,tr   ,fr  ,g  ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[b   ,g   ,tl  ,t   ,tr  ,g   ,t31 ,t32 ,t33   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g  ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[b   ,g   ,tl  ,t   ,tr  ,g   ,t41 ,t42 ,t43   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[b   ,g   ,tl  ,t   ,tr  ,g   ,g   ,b   ,b ,b  ,b  ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[b   ,g   ,tl  ,t   ,tr  ,g   ,b   ,b   ,ftl  ,ft  ,ftr   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[b   ,llt ,tl  ,t   ,tr  ,g   ,b   ,b   ,fl  ,g   ,fr  ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[b   ,llm ,tl  ,t   ,tr  ,g   ,b   ,b   ,fl  ,g   ,fr  ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[b   ,llb ,tl  ,t   ,tr  ,g   ,b   ,b   ,fl  ,g   ,fr  ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[b   ,fl  ,tl  ,t   ,tr  ,g   ,b   ,b   ,fl  ,g   ,fr  ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ]
		];

function loadMap() {
	for (var x=0; x<map.length; x++) {
		for (var y=0; y<map[x].length; y++) {
			switch (map[x][y]) {
				case 'grass': 
					var randomNum = Math.random();
					if (randomNum < 0.33) {
						map[x][y] = new mapObject("grass", bgtile, context, 6, 0, 35*y, 35*x, false); 
					} else if (randomNum >= 0.33 && randomNum < 0.66) {
						map[x][y] = new mapObject("grass", bgtile, context, 6, 1, 35*y, 35*x, false);
					} else {
						map[x][y] = new mapObject("grass", bgtile, context, 7, 1, 35*y, 35*x, false);
					}
					break;
				case 'bush': map[x][y] = new mapObject("bush", bgtile, context, 7, 0, 35*y, 35*x, true); break;
				case 'bush-top-left': map[x][y] = new mapObject("bush", bgtile, context, 6, 22, 35*y, 35*x, true); break;
				case 'bush-top': map[x][y] = new mapObject("bush", bgtile, context, 7, 22, 35*y, 35*x, true); break;
				case 'bush-top-right': map[x][y] = new mapObject("bush", bgtile, context, 8, 22, 35*y, 35*x, true); break;
				case 'tile': map[x][y] = new mapObject("bush", bgtile, context, 0, 15, 35*y, 35*x, false); break;
				case 'tile-top': map[x][y] = new mapObject("bush", bgtile, context, 3, 15, 35*y, 35*x, false); break;
				case 'tile-bottom': map[x][y] = new mapObject("bush", bgtile, context, 4, 15, 35*y, 35*x, false); break;
				case 'tile-left': map[x][y] = new mapObject("bush", bgtile, context, 1, 15, 35*y, 35*x, false); break;
				case 'tile-right': map[x][y] = new mapObject("bush", bgtile, context, 2, 15, 35*y, 35*x, false); break;
				case 'tile-turn-right-top': map[x][y] = new mapObject("bush", bgtile, context, 4, 16, 35*y, 35*x, false); break;
				case 'tile-turn-right-bottom': map[x][y] = new mapObject("bush", bgtile, context, 2, 17, 35*y, 35*x, false); break;

				case 'fence-top': map[x][y] = new mapObject("grass", bgtile, context, 7, 11, 35*y, 35*x, true); break;
				case 'fence-top-left': map[x][y] = new mapObject("grass", bgtile, context, 6, 11, 35*y, 35*x, true); break;
				case 'fence-top-right': map[x][y] = new mapObject("grass", bgtile, context, 8, 11, 35*y, 35*x, true); break;
				case 'fence-left': map[x][y] = new mapObject("grass", bgtile, context, 6, 12, 35*y, 35*x, true); break;
				case 'fence-right': map[x][y] = new mapObject("grass", bgtile, context, 8, 12, 35*y, 35*x, true); break;
				case 'fence-bottom-left': map[x][y] = new mapObject("grass", bgtile, context, 6, 13, 35*y, 35*x, true); break;
				case 'fence-bottom-right': map[x][y] = new mapObject("grass", bgtile, context, 8, 13, 35*y, 35*x, true); break;
				case 'fence-bottom': map[x][y] = new mapObject("grass", bgtile, context, 7, 13, 35*y, 35*x, true); break;
				
				case 'lamp-right-top': map[x][y] = new mapObject("grass", bgtile, context, 7, 18, 35*y, 35*x, true); break;
				case 'lamp-right-middle': map[x][y] = new mapObject("grass", bgtile, context, 7, 19, 35*y, 35*x, true); break;
				case 'lamp-right-bottom': map[x][y] = new mapObject("grass", bgtile, context, 7, 20, 35*y, 35*x, true); break;
				case 'lamp-left-top': map[x][y] = new mapObject("grass", bgtile, context, 6, 18, 35*y, 35*x, true); break;
				case 'lamp-left-middle': map[x][y] = new mapObject("grass", bgtile, context, 6, 19, 35*y, 35*x, true); break;
				case 'lamp-left-bottom': map[x][y] = new mapObject("grass", bgtile, context, 6, 20, 35*y, 35*x, true); break;

				case 'tree11': map[x][y] = new mapObject("grass", bgtile, overlayContext, 14, 0, 35*y, 35*x, false); break;
				case 'tree12': map[x][y] = new mapObject("grass", bgtile, overlayContext, 15, 0, 35*y, 35*x, false); break;
				case 'tree13': map[x][y] = new mapObject("grass", bgtile, overlayContext, 16, 0, 35*y, 35*x, false); break;
				case 'tree21': map[x][y] = new mapObject("grass", bgtile, overlayContext, 14, 1, 35*y, 35*x, false); break;
				case 'tree22': map[x][y] = new mapObject("grass", bgtile, overlayContext, 15, 1, 35*y, 35*x, false); break;
				case 'tree23': map[x][y] = new mapObject("grass", bgtile, overlayContext, 16, 1, 35*y, 35*x, false); break;
				case 'tree31': map[x][y] = new mapObject("grass", bgtile, overlayContext, 14, 2, 35*y, 35*x, true); break;
				case 'tree32': map[x][y] = new mapObject("grass", bgtile, overlayContext, 15, 2, 35*y, 35*x, true); break;
				case 'tree33': map[x][y] = new mapObject("grass", bgtile, overlayContext, 16, 2, 35*y, 35*x, true); break;
				case 'tree41': map[x][y] = new mapObject("grass", bgtile, context, 14, 3, 35*y, 35*x, true); break;
				case 'tree42': map[x][y] = new mapObject("grass", bgtile, context, 15, 3, 35*y, 35*x, true); break;
				case 'tree43': map[x][y] = new mapObject("grass", bgtile, context, 16, 3, 35*y, 35*x, true); break;


			}
			sprites.push(map[x][y]);
		}
	}
}

function renderMap() {
	for (var x=0; x<map.length; x++) {
		for (var y=0; y<map[x].length; y++) {
			if (map[x][y] != null) {
				map[x][y].render();
			}
		}
	}
}

// SPRITE DATA

var police1Image = new Image();
police1Image.src = "images/police_black.png";

var police2Image = new Image();
police2Image.src = "images/police_blue.png";

var player1Image = new Image();
player1Image.src = "images/player1.png";

var player2Image = new Image();
player2Image.src = "images/player2.png";

var police1 = new Guard("police1", police1Image, 200, 50, 32, 48, 4);
sprites.push(police1);

var police2 = new Guard("police2", police2Image, 50, 150, 32, 50, 4);
sprites.push(police2);

var police3 = new Guard("police3", police1Image, 400, 250, 32, 48, 4);
sprites.push(police3);

var police4 = new Guard("police4", police2Image, 500, 300, 32, 50, 4);
sprites.push(police4);

var player1 = new Sprite("player1", player1Image, 80, 470, 32, 40, 4);
sprites.push(player1);

var player2 = new Sprite("player2", player2Image, 150, 470, 32, 40, 4);
sprites.push(player2);

var bootImage = new Image();
bootImage.src = "images/boots.png";
var bootsUsed = false;
var boots = {
	image: bootImage,
	xPos: 325,
	yPos: 400,
	width: 20,
	height: 25
};

var police1switch = true;
var police2switch = true;
var police3switch = true;
var police4switch = true;

var fps = 14;

function draw() {

	setTimeout(function() {
		requestAnimationFrame(draw);

		renderMap();

		for (var x=0; x < building.length; x++) {
			building[x].render();
		}

		if (!bootsUsed) {
			context.drawImage(bootImage,0,0, 39, 45, 325, 400, 20, 25)
		};

		if (didGet(player1, boots)) {
			player1.speedUp();
			bootsUsed = true;
		}

		if (didGet(player2, boots)) {
			player2.speedUp();
			bootsUsed = true;
		}

		// AI LOGIC

		police1.walk();
		police1.update();
		police1.render();
		police1.patrol();

		if (police1switch) { police1.moveRight() }
		else { police1.moveLeft() }

		if (police1.xPos <= 200 || police1.xPos >= 400) {
			if (police1switch) { police1switch = false }
			else { police1switch = true};
		}

		police2.walk();
		police2.update();
		police2.render();
		police2.patrol();

		if (police2switch) { police2.moveDown() }
		else { police2.moveUp() }

		if (police2.yPos <= 150 || police2.yPos >= 300) {
			if (police2switch) { police2switch = false }
			else { police2switch = true};
		}

		police3.walk();
		police3.update();
		police3.render();
		police3.patrol();

		if (police3switch) { police3.moveLeft() }
		else { police3.moveRight() }

		if (police3.xPos <= 350 || police3.xPos >= 450) {
			if (police3switch) { police3switch = false }
			else { police3switch = true};
		}

		police4.walk();
		police4.update();
		police4.render();
		police4.patrol();

		if (police4switch) { police4.moveLeft() }
		else { police4.moveRight() }

		if (police4.xPos <= 400 || police4.xPos >= 600) {
			if (police4switch) { police4switch = false }
			else { police4switch = true};
		}

		if (keysdown[77]) { player1.run() } else { player1.walk() };
		if (keysdown[38]) { player1.moveUp() }; // up
		if (keysdown[37]) { player1.moveLeft() }; // left
		if (keysdown[40]) { player1.moveDown() }; // down
		if (keysdown[39]) { player1.moveRight() }; // right
		if (keysdown[37] || keysdown[38] || keysdown[39] || keysdown[40]) { player1.update() }
		player1.render();

		if (keysdown[16]) { player2.run() } else { player2.walk() };
		if (keysdown[87]) { player2.moveUp() }; // w
		if (keysdown[65]) { player2.moveLeft() }; // a
		if (keysdown[83]) { player2.moveDown() }; // s
		if (keysdown[68]) { player2.moveRight() }; // d
		if (keysdown[87] || keysdown[65] || keysdown[83] || keysdown[68]) { player2.update() }
		player2.render();

	}, 1000 / fps);

}

function circle(x, y, r, c) {
    lightingContext.beginPath();
    var rad = context.createRadialGradient(x, y, 1, x, y, r);
    rad.addColorStop(0, 'rgba('+c+',0.3)');
    rad.addColorStop(1, 'rgba('+c+',0)');
    lightingContext.fillStyle = rad;
    lightingContext.arc(x, y, r, 0, Math.PI*2, false);
    lightingContext.fill();
}


var building = [];
var y = 130;
var x = 420;

building[0] = new mapObject("grass", bgtile, overlayContext, 19, 0, x+35*0, y+35*0, false);
building[1] = new mapObject("grass", bgtile, overlayContext, 20, 0, x+35*1, y+35*0, false);
building[2] = new mapObject("grass", bgtile, overlayContext, 21, 0, x+35*2, y+35*0, false);
building[3] = new mapObject("grass", bgtile, overlayContext, 19, 1, x+35*0, y+35*1, false);
building[4] = new mapObject("grass", bgtile, overlayContext, 20, 1, x+35*1, y+35*1, false);
building[5] = new mapObject("grass", bgtile, overlayContext, 21, 1, x+35*2, y+35*1, false);
building[6] = new mapObject("grass", bgtile, overlayContext, 19, 2, x+35*0, y+35*2, true);
building[7] = new mapObject("grass", bgtile, overlayContext, 21, 2, x+35*2, y+35*2, true);


$(document).ready(function() {

lightingContext.fillStyle= '#000';
lightingContext.fillRect(0,0,canvas.width,canvas.height);

// Turn canvas into mask
lightingContext.globalCompositeOperation = "destination-out";

// LAMP POST #1

gradient = lightingContext.createRadialGradient(55, 325, 0, 55, 325, 20);
gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
lightingContext.fillStyle = gradient;
lightingContext.fillRect(0, 0, canvas.width, canvas.height);

gradient = lightingContext.createRadialGradient(55, 390, 0, 130, 390, 160);
gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
lightingContext.fillStyle = gradient;
lightingContext.fillRect(0, 0, canvas.width, canvas.height);

// LAMP POST #2

gradient = lightingContext.createRadialGradient(145, 130, 0, 145, 130, 15);
gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
lightingContext.fillStyle = gradient;
lightingContext.fillRect(0, 0, canvas.width, canvas.height);

gradient = lightingContext.createRadialGradient(130, 180, 0, 90, 180, 90);
gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
lightingContext.fillStyle = gradient;
lightingContext.fillRect(0, 0, canvas.width, canvas.height);

// LAMP POST #3

gradient = lightingContext.createRadialGradient(425, 101, 0, 425, 101, 15);
gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
lightingContext.fillStyle = gradient;
lightingContext.fillRect(0, 0, canvas.width, canvas.height);

gradient = lightingContext.createRadialGradient(420, 190, 0, 380, 190, 100);
gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
lightingContext.fillStyle = gradient;
lightingContext.fillRect(0, 0, canvas.width, canvas.height);

// MOON LIGHT #1

gradient = lightingContext.createRadialGradient(800, 0, 0, 700, 100, 500);
gradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
lightingContext.fillStyle = gradient;
lightingContext.fillRect(0, 0, canvas.width, canvas.height);


})

loadMap();

draw();






