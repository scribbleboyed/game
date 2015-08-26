// HTML ELEMENTS

var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

var spriteCanvas = document.getElementById('sprite');
var spriteContext = spriteCanvas.getContext('2d');

var overlayCanvas = document.getElementById('overlay');
var overlayContext = overlayCanvas.getContext('2d');

var lightingCanvas = document.getElementById('lighting');
var lightingContext = lightingCanvas.getContext('2d');

var debugCanvas = document.getElementById('debug');
var debugContext = debugCanvas.getContext('2d');

var speech = document.getElementById('speech');

// IMAGE DATA

var bgtile = new Image();
bgtile.src = "images/tileset.png";

var police1Image = new Image();
police1Image.src = "images/police_black.png";

var police2Image = new Image();
police2Image.src = "images/police_blue.png";

var player1Image = new Image();
player1Image.src = "images/player1.png";

var player2Image = new Image();
player2Image.src = "images/player2.png";

var bootImage = new Image();
bootImage.src = "images/boots.png";

var treeImage = new Image();
treeImage.src = "images/tree.gif";

// PARAMETERS

var spriteIndex = 0;
var sprites = [];

var sightWidth = 10;
var sightHeight = 150;

var fps = 14;

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

	this.animate = function() {
		if (this.frameIndex < this.numOfFrames - 1) {
			this.frameIndex++;
		} else {
			this.frameIndex = 0;
		}
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

function Guard (name, image, x, y, width, height, numOfFrames) {

	Sprite.call(this, name, image, x, y, width, height, numOfFrames);

	this.x1 = 0;
	this.y1 = 0;
	this.x2 = 0;
	this.y2 = 0;
	this.switchDirection = true;
	this.chaseP1 = false;
	this.chaseP2 = false;
	this.runSpeed = 6;

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

		if (didSee(player1, this.view)) { this.chaseP1 = true }

		if (didSee(player2, this.view)) { this.chaseP2 = true }

	}

	this.moveTowardsPlayer = function(target) {
		if (Math.abs(this.xPos - target.xPos) > 2 || Math.abs(this.yPos - target.yPos) > 2) {
			this.run();
			if (this.xPos < target.xPos) { this.moveRight() }; 
			if (this.xPos > target.xPos) { this.moveLeft() };
			if (this.yPos < target.yPos) { this.moveDown() };
			if (this.yPos > target.yPos) { this.moveUp() };
		}
	}

	this.update = function(horizontal, loc1, loc2) {

			this.animate();
			this.render();

			if (!this.chaseP1 && !this.chaseP2) {
				this.walk();
				this.patrol();

				if (horizontal) {
					if (this.switchDirection) { this.moveRight() }
					else { this.moveLeft() }

					if (this.xPos <= loc1 || this.xPos >= loc2) {
						if (this.switchDirection) { this.switchDirection = false }
						else { this.switchDirection = true};
					}
				} else {
					if (this.switchDirection) { this.moveDown() }
					else { this.moveUp() }

					if (this.yPos <= loc1 || this.yPos >= loc2) {
						if (this.switchDirection) { this.switchDirection = false }
						else { this.switchDirection = true};
					}
				}
			} else if (this.chaseP1) {
				this.walk();
				this.moveTowardsPlayer(player1);
			} else {
				this.walk();
				this.moveTowardsPlayer(player2);
			}
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

function didCatch(sprite1, sprite2) {
	return ((sprite1.xPos + dx + sprite1.width > sprite2.xPos) &&
	(sprite1.yPos + dy + sprite1.height > sprite2.yPos) &&
	(sprite1.xPos + dx < sprite2.xPos + sprite2.width) &&
	(sprite1.yPos + dy < sprite2.yPos + sprite2.height));
}


function didSee(sprite, view) {
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

var mapObject = function(image, layer, imageX, imageY, x, y, collision) {
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

var mapL1 =  [[ftl ,ft   ,ft   ,ft   ,ft  ,ft  ,ft  ,ft  ,ft  ,ft  ,ft  ,ft  ,ft  ,ft  ,ft  ,ftr ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[fl  ,b   ,b   ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,fr  ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[t13 ,b   ,tl  ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,tr  ,fr  ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[t23 ,g   ,tl  ,t   ,t   ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,t   ,t   ,tr  ,lrt ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[t33 ,g   ,tl  ,t   ,tr  ,lrt ,b   ,g   ,g   ,b   ,b   ,b   ,tl  ,t   ,tr  ,lrm ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[t43 ,g   ,tl  ,t   ,tr  ,lrm ,g   ,g   ,g   ,b   ,b   ,b   ,tl  ,t   ,tr  ,lrb ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[b   ,g   ,tl  ,t   ,tr  ,lrb ,g   ,g   ,g   ,b   ,b   ,b   ,tl  ,t   ,tr  ,fr  ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[b   ,g   ,tl  ,t   ,tr  ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,tl  ,t   ,tr  ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[b   ,g   ,tl  ,t   ,tr  ,g   ,b   ,b   ,b   ,g   ,g   ,g   ,tl  ,t   ,tt  ,tt  ,tt  ,tt  ,tt  ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,g   ,g   ,g   ,g   ],
			[b   ,g   ,tl  ,t   ,tr  ,g   ,g   ,b   ,b   ,b   ,b   ,g   ,tl  ,t   ,tb  ,tb  ,tb  ,tb  ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,g   ,g   ,g   ,g   ,g   ],
			[b   ,g   ,tl  ,t   ,tr  ,g   ,b   ,b   ,ftl ,ft  ,ftr ,g   ,tl  ,t   ,tr  ,b   ,b   ,b   ,tl  ,t   ,tr  ,b   ,b   ,b   ,tl  ,t   ,tr  ,b   ,b   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[b   ,llt ,tl  ,t   ,tr  ,g   ,b   ,b   ,fl  ,g   ,fr  ,g   ,tl  ,t   ,tr  ,b   ,b   ,b   ,tl  ,t   ,tr  ,b   ,b   ,b   ,tl  ,t   ,tr  ,b   ,b   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[b   ,llm ,tl  ,t   ,tr  ,g   ,b   ,b   ,fl  ,g   ,fr  ,g   ,tl  ,t   ,t   ,tt  ,tt  ,tt  ,t   ,t   ,t   ,tt  ,tt  ,tt  ,t   ,t   ,t   ,tt  ,tt   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[b   ,llb ,tl  ,t   ,tr  ,g   ,b   ,b   ,fl  ,g   ,fr  ,g   ,g   ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[b   ,fl  ,tl  ,t   ,tr  ,g   ,b   ,b   ,fl  ,g   ,fr  ,fb  ,fb  ,fb  ,fb  ,fb  ,fb  ,fb  ,fb  ,fb  ,b   ,b  ,b   ,fb  ,fb  ,fb  ,fb  ,fb  ,fb  ,fb  ,fb  ,fb  ,fb  ,fb  ,fb  ]
		];

function loadMap() {
	for (var x=0; x<mapL1.length; x++) {
		for (var y=0; y<mapL1[x].length; y++) {
			switch (mapL1[x][y]) {
				case 'grass': 
					var randomNum = Math.random();
					if (randomNum < 0.33) {
						mapL1[x][y] = new mapObject(bgtile, context, 6, 0, 35*y, 35*x, false); 
					} else if (randomNum >= 0.33 && randomNum < 0.66) {
						mapL1[x][y] = new mapObject(bgtile, context, 6, 1, 35*y, 35*x, false);
					} else {
						mapL1[x][y] = new mapObject(bgtile, context, 7, 1, 35*y, 35*x, false);
					}
					break;
				case 'bush': mapL1[x][y] = new mapObject(bgtile, context, 7, 0, 35*y, 35*x, true); break;
				case 'bush-top-left': mapL1[x][y] = new mapObject(bgtile, context, 6, 22, 35*y, 35*x, true); break;
				case 'bush-top': mapL1[x][y] = new mapObject(bgtile, context, 7, 22, 35*y, 35*x, true); break;
				case 'bush-top-right': mapL1[x][y] = new mapObject(bgtile, context, 8, 22, 35*y, 35*x, true); break;
				case 'tile': mapL1[x][y] = new mapObject(bgtile, context, 0, 15, 35*y, 35*x, false); break;
				case 'tile-top': mapL1[x][y] = new mapObject(bgtile, context, 3, 15, 35*y, 35*x, false); break;
				case 'tile-bottom': mapL1[x][y] = new mapObject(bgtile, context, 4, 15, 35*y, 35*x, false); break;
				case 'tile-left': mapL1[x][y] = new mapObject(bgtile, context, 1, 15, 35*y, 35*x, false); break;
				case 'tile-right': mapL1[x][y] = new mapObject(bgtile, context, 2, 15, 35*y, 35*x, false); break;
				case 'tile-turn-right-top': mapL1[x][y] = new mapObject(bgtile, context, 4, 16, 35*y, 35*x, false); break;
				case 'tile-turn-right-bottom': mapL1[x][y] = new mapObject(bgtile, context, 2, 17, 35*y, 35*x, false); break;

				case 'fence-top': mapL1[x][y] = new mapObject(bgtile, context, 7, 11, 35*y, 35*x, true); break;
				case 'fence-top-left': mapL1[x][y] = new mapObject(bgtile, context, 6, 11, 35*y, 35*x, true); break;
				case 'fence-top-right': mapL1[x][y] = new mapObject(bgtile, context, 8, 11, 35*y, 35*x, true); break;
				case 'fence-left': mapL1[x][y] = new mapObject(bgtile, context, 6, 12, 35*y, 35*x, true); break;
				case 'fence-right': mapL1[x][y] = new mapObject(bgtile, context, 8, 12, 35*y, 35*x, true); break;
				case 'fence-bottom-left': mapL1[x][y] = new mapObject(bgtile, context, 6, 13, 35*y, 35*x, true); break;
				case 'fence-bottom-right': mapL1[x][y] = new mapObject(bgtile, context, 8, 13, 35*y, 35*x, true); break;
				case 'fence-bottom': mapL1[x][y] = new mapObject(bgtile, context, 7, 13, 35*y, 35*x, true); break;
				
				case 'lamp-right-top': mapL1[x][y] = new mapObject(bgtile, context, 7, 18, 35*y, 35*x, true); break;
				case 'lamp-right-middle': mapL1[x][y] = new mapObject(bgtile, context, 7, 19, 35*y, 35*x, true); break;
				case 'lamp-right-bottom': mapL1[x][y] = new mapObject(bgtile, context, 7, 20, 35*y, 35*x, true); break;
				case 'lamp-left-top': mapL1[x][y] = new mapObject(bgtile, context, 6, 18, 35*y, 35*x, true); break;
				case 'lamp-left-middle': mapL1[x][y] = new mapObject(bgtile, context, 6, 19, 35*y, 35*x, true); break;
				case 'lamp-left-bottom': mapL1[x][y] = new mapObject(bgtile, context, 6, 20, 35*y, 35*x, true); break;

				case 'tree11': mapL1[x][y] = new mapObject(bgtile, context, 14, 0, 35*y, 35*x, false); break;
				case 'tree12': mapL1[x][y] = new mapObject(bgtile, context, 15, 0, 35*y, 35*x, false); break;
				case 'tree13': mapL1[x][y] = new mapObject(bgtile, context, 16, 0, 35*y, 35*x, false); break;
				case 'tree21': mapL1[x][y] = new mapObject(bgtile, context, 14, 1, 35*y, 35*x, true); break;
				case 'tree22': mapL1[x][y] = new mapObject(bgtile, context, 15, 1, 35*y, 35*x, true); break;
				case 'tree23': mapL1[x][y] = new mapObject(bgtile, context, 16, 1, 35*y, 35*x, true); break;
				case 'tree31': mapL1[x][y] = new mapObject(bgtile, context, 14, 2, 35*y, 35*x, true); break;
				case 'tree32': mapL1[x][y] = new mapObject(bgtile, context, 15, 2, 35*y, 35*x, true); break;
				case 'tree33': mapL1[x][y] = new mapObject(bgtile, context, 16, 2, 35*y, 35*x, true); break;
				case 'tree41': mapL1[x][y] = new mapObject(bgtile, context, 14, 3, 35*y, 35*x, true); break;
				case 'tree42': mapL1[x][y] = new mapObject(bgtile, context, 15, 3, 35*y, 35*x, true); break;
				case 'tree43': mapL1[x][y] = new mapObject(bgtile, context, 16, 3, 35*y, 35*x, true); break;
			}
			sprites.push(mapL1[x][y]);
		}
	}
}

function renderMap() {
	for (var x=0; x<mapL1.length; x++) {
		for (var y=0; y<mapL1[x].length; y++) {
			if (mapL1[x][y] != null) {
				mapL1[x][y].render();
			}
		}
	}
}

// SPRITE DATA

var police1X = 200;
var police1Y = 50;
var police2X = 50;
var police2Y = 150;
var police3X = 400;
var police3Y = 250;
var police4X = 500;
var police4Y = 300;

var player1X = 80;
var player1Y = 470;
var player2X = 150;
var player2Y = 470;

var police1 = new Guard("police1", police1Image, police1X, police1Y, 32, 48, 4);
sprites.push(police1);

var police2 = new Guard("police2", police2Image, police2X, police2Y, 32, 50, 4);
sprites.push(police2);

var police3 = new Guard("police3", police1Image, police3X, police3Y, 32, 48, 4);
sprites.push(police3);

var police4 = new Guard("police4", police2Image, police4X, police4Y, 32, 50, 4);
sprites.push(police4);

var player1 = new Sprite("player1", player1Image, player1X, player1Y, 32, 40, 4);
sprites.push(player1);

var player2 = new Sprite("player2", player2Image, player2X, player2Y, 32, 40, 4);
sprites.push(player2);

var bootsUsed = false;

var boots = {
	image: bootImage,
	xPos: 325,
	yPos: 400,
	width: 20,
	height: 25
};

// SPRITE LAYER UPDATE EVERY FRAME

function draw() {

	setTimeout(function() {

		requestAnimationFrame(draw);

		// CLEAR SPRITE CANVAS

		spriteContext.clearRect(0, 0, spriteCanvas.width, spriteCanvas.height);

		// POWER BOOTS

		if (!bootsUsed) { spriteContext.drawImage(bootImage, 0, 0, 39, 45, 325, 400, 20, 25) }
		if (didGet(player1, boots)) { player1.speedUp(); bootsUsed = true }
		if (didGet(player2, boots)) { player2.speedUp(); bootsUsed = true }

		// ADD SPRITES

		police1.update(true, 120, 400);
		police2.update(false, 150, 300);
		police3.update(true, 350, 450);
		police4.update(true, 400, 600);

		// Player 1 and 2 Controls

		if (!player1.captured) {
			if (keysdown[77]) { player1.run() } else { player1.walk() };
			if (keysdown[38]) { player1.moveUp() }; // up
			if (keysdown[37]) { player1.moveLeft() }; // left
			if (keysdown[40]) { player1.moveDown() }; // down
			if (keysdown[39]) { player1.moveRight() }; // right
			if (keysdown[37] || keysdown[38] || keysdown[39] || keysdown[40]) { player1.animate() }
		}

		if (!player2.captured) {
			if (keysdown[16]) { player2.run() } else { player2.walk() };
			if (keysdown[87]) { player2.moveUp() }; // w
			if (keysdown[65]) { player2.moveLeft() }; // a
			if (keysdown[83]) { player2.moveDown() }; // s
			if (keysdown[68]) { player2.moveRight() }; // d
			if (keysdown[87] || keysdown[65] || keysdown[83] || keysdown[68]) { player2.animate() }
		}

		player1.render();
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

function addLight(x1, x2, y1, y2, size, opacity) {
	gradient = lightingContext.createRadialGradient(x1, y1, 0, x2, y2, size);
	gradient.addColorStop(0, "rgba(255, 255, 255, " + opacity + ")");
	gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
	lightingContext.fillStyle = gradient;
	lightingContext.fillRect(0, 0, canvas.width, canvas.height);
}

// OVERLAY LAYER OBJECTS

var building = [];
var y = 130;
var x = 420;

building[0] = new mapObject(bgtile, overlayContext, 19, 0, x+35*0, y+35*0, false);
building[1] = new mapObject(bgtile, overlayContext, 20, 0, x+35*1, y+35*0, false);
building[2] = new mapObject(bgtile, overlayContext, 21, 0, x+35*2, y+35*0, false);
building[3] = new mapObject(bgtile, overlayContext, 19, 1, x+35*0, y+35*1, false);
building[4] = new mapObject(bgtile, overlayContext, 20, 1, x+35*1, y+35*1, false);
building[5] = new mapObject(bgtile, overlayContext, 21, 1, x+35*2, y+35*1, false);
building[6] = new mapObject(bgtile, overlayContext, 19, 2, x+35*0, y+35*2, true);
building[7] = new mapObject(bgtile, overlayContext, 21, 2, x+35*2, y+35*2, true);

// LOAD GAME

function camera(translateX, translateY) {
		context.translate(0,0);
		spriteContext.translate(0,0);
		overlayContext.translate(0,0);
		lightingContext.translate(0,0);
		context.translate(-translateX,-translateY);
		spriteContext.translate(-translateX,-translateY);
		overlayContext.translate(-translateX,-translateY);
		lightingContext.translate(-translateX,-translateY);
}

var scaleFactor = 1;

$(document).ready(function() {

	context.scale(scaleFactor, scaleFactor);
	spriteContext.scale(scaleFactor, scaleFactor);
	overlayContext.scale(scaleFactor, scaleFactor);
	lightingContext.scale(scaleFactor, scaleFactor);

	loadMap();

	bgtile.onload = function() {
		renderMap();
		for (var x=0; x < building.length; x++) {
			building[x].render();
		}
	}

	treeImage.onload = function() {
		overlayContext.drawImage(treeImage, 0, 0, 50, 60, 220, 200, 100, 120);
		overlayContext.drawImage(treeImage, 0, 0, 48, 60, -70, 450, 160, 200);
		overlayContext.drawImage(treeImage, 0, 0, 48, 60, 340, 420, 150, 180);
		overlayContext.drawImage(treeImage, 0, 0, 48, 60, 400, 470, 200, 220);
		overlayContext.drawImage(treeImage, 0, 0, 48, 60, 740, 310, 100, 120);
	}

	lightingContext.fillStyle= '#000';
	lightingContext.fillRect(0,0,canvas.width,canvas.height);
	lightingContext.globalCompositeOperation = "destination-out";

	// ADD LIGHTS (X1, X2, Y1, Y2, SIZE, OPACITY)

	// Lamp Post #1
	addLight(55, 55, 325, 325, 20, 1.0);
	addLight(55, 130, 390, 390, 160, 1.0);

	//LampPost #2
	addLight(145, 145, 130, 130, 15, 1.0);
	addLight(130, 90, 180, 180, 90, 1.0);

	//LampPost #3
	addLight(425, 425, 101, 101, 15, 1.0);
	addLight(420, 380, 190, 190, 100, 1.0);

	//Moonlight
	addLight(800, 700, 0, 100, 500, 0.6);

	draw();

})






