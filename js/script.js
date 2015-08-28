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

var textCanvas = document.getElementById('text');
var textContext = textCanvas.getContext('2d');

var p1textBox = $('#p1text');

var timerDiv = $('#timer');

var p1winScreen = $('#p1win');
var p2winScreen = $('#p2win');
var timeoutScreen = $('#timeout');

// IMAGE DATA

var bgtile = new Image();
bgtile.src = "images/tileset.png";

var police1Image = new Image();
police1Image.src = "images/police_black_2.png";

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

var portalImage = new Image();
portalImage.src = "images/portal2.png";

var pushStrength = 10;

// PARAMETERS

var spriteIndex = 0;
var sprites = [];

var sightWidth = 10;
var sightHeight = 150;

var policeFPS = 14;
var player1FPS = 14;
var player2FPS = 14;

var player1Win = false;
var player2Win = false;

var maxTime = 30;
var timer = maxTime;
var gameStarted = false;

var p1wins = 0;
var p2wins = 0;

// SPRITE CLASS

function Sprite(name, image, x0, y0, width, height, numOfFrames) {
	this.index = 0;
	this.name = name;
	this.image = image;
	this.width = width;
	this.height = height;
	this.collision = true;

	this.frameIndex = 0;
	this.numOfFrames = numOfFrames;
	this.x0 = x0;
	this.y0 = y0;
	this.xPos = this.x0;
	this.yPos = this.y0;
	this.speed = 0;
	this.superSlowSpeed = 1;
	this.slowSpeed = 2;
	this.walkSpeed = 4;
	this.slowRunSpeed = 6;
	this.runSpeed = 8;
	this.superSpeed = 12;
	this.direction = 0;

	this.init = function() {
		this.index = spriteIndex;
		spriteIndex++;
	};

	this.walk = function() {
		if (this.onGrass()) { this.speed = this.slowSpeed }
		else if (this.inBush()) { this.speed = this.superSlowSpeed }
		else { this.speed = this.walkSpeed }
	};

	this.run = function() {
		if (this.onGrass()) { this.speed = this.slowRunSpeed }
		else if (this.inBush()) { this.speed = this.slowSpeed }
		else { this.speed = this.runSpeed }
	};

	this.onGrass = function() {
		for (var i=0; i<map.length; i++) {
			for (var j=0; j<map[i].length; j++) {
				if (didGet(this, map[i][j])) {
					if (map[i][j].type === 'grass') {
						return true;
					}
				}
			}
		}
		return false;
	};

	this.inBush = function() {
		for (var i=0; i<map.length; i++) {
			for (var j=0; j<map[i].length; j++) {
				if (didGet(this, map[i][j])) {
					if (map[i][j].type === 'bush') {
						return true;
					}
				}
			}
		}
		return false;
	};

	this.speak = function(text) {
		textContext.font = "bolder 30px Vollkorn";
		textContext.fillStyle = "#fff";
		textContext.textAlign = "center";
		textContext.fillText(text, this.xPos + 13, this.yPos);
		setTimeout(function() {
			textContext.clearRect(0,0,textCanvas.width, textCanvas.height);
		},500);
	}

	this.moveAllowed = function(object, dx,dy) {
		for (var i=0; i<sprites.length; i++) {
			if (sprites[i].collision) {
				if (sprites[i].index != object.index) {
					if (willCollide(object, dx, dy, sprites[i])) {
						return false;
					}
				}
			}
		}
		return true;
	};

	this.moveUp = function() {
		this.direction = 3;
		if (this.moveAllowed(this, 0, -this.speed)) { this.yPos -= this.speed }
	};

	this.moveDown = function() {
		this.direction = 0;
		if (this.moveAllowed(this, 0, this.speed)) { this.yPos += this.speed }
	};

	this.moveLeft = function() {
		this.direction = 1;
		if (this.moveAllowed(this, -this.speed, 0)) { this.xPos -= this.speed }
	};

	this.moveRight = function() {
		this.direction = 2;
		if (this.moveAllowed(this, this.speed, 0)) { this.xPos += this.speed }
	};

	this.speedUp = function() {
		this.runSpeed = this.superSpeed;
	}

	this.push = function() {
		for (var i=0; i<sprites.length; i++) {
			if (sprites[i].index != this.index) {
				if (sprites[i].collision) {
					if (willCollide(this, pushStrength, 0, sprites[i])) {
						if (this.moveAllowed(sprites[i], pushStrength, 0)) { sprites[i].xPos += pushStrength }
					} else if (willCollide(this, -pushStrength, 0, sprites[i])) {
						if (this.moveAllowed(sprites[i], -pushStrength, 0)) { sprites[i].xPos -= pushStrength }
					} else if (willCollide(this, 0, pushStrength, sprites[i])) {
						if (this.moveAllowed(sprites[i], 0, pushStrength)) { sprites[i].yPos += pushStrength }
					} else if (willCollide(this, 0, -pushStrength, sprites[i])) {
						if (this.moveAllowed(sprites[i], 0, -pushStrength)) { sprites[i].yPos -= pushStrength }
					}
				}
			}
		}
	};

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


function Player (name, image, x, y, width, height, numOfFrames) {

	Sprite.call(this, name, image, x, y, width, height, numOfFrames);

	this.type = "player";

	this.invisible = false;

	this.goInvisible = function() {
		this.invisible = true;
		if (this.name === 'player1') {
			player1FPS = 24;
		} else {
			player2FPS = 24;
		}
	}

}

function Guard (name, image, x, y, width, height, numOfFrames) {

	Sprite.call(this, name, image, x, y, width, height, numOfFrames);

	this.type = "guard";

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

		if (!player1.invisible && didSee(player1, this.view)) { this.speak("!"); this.chaseP1 = true }

		if (!player2.invisible && didSee(player2, this.view)) { this.speak("!"); this.chaseP2 = true }

	}

	this.moveTowardsPlayer = function(target) {
		if (Math.abs(this.xPos - target.xPos) > 2 || Math.abs(this.yPos - target.yPos) > 2) {
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
	if (e.keyCode === 32) { 
		if (!gameStarted) { start() }
		else { reset() }
	};
	if (keysdown[e.keyCode]) { return; }
	keysdown[e.keyCode] = true;
	console.log(e.keyCode);
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

var mapObject = function(type, image, layer, imageX, imageY, x, y, collision) {
	this.type = type;
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
f = 'flower';
btl = 'bush-top-left';
bt = 'bush-top';
btr = 'bush-top-right';
t = 'tile';
tt = 'tile-top';
tb = 'tile-bottom';
tl = 'tile-left';
tr = 'tile-right';
t1 = 'tile-1';
t2 = 'tile-2';
t3 = 'tile-3';
t4 = 'tile-4';
t5 = 'tile-5';
t6 = 'tile-6';
t7 = 'tile-7';
t8 = 'tile-8';
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
w11 = 'water11';
w12 = 'water12';
w13 = 'water13';
w21 = 'water21';
w22 = 'water22';
w23 = 'water23';
w31 = 'water31';
w32 = 'water32';
w33 = 'water33';
b11 = 'building11';
b12 = 'building12';
b13 = 'building13';
b14 = 'building14';
b21 = 'building21';
b22 = 'building22';
b23 = 'building23';
b24 = 'building24';
b31 = 'building31';
b32 = 'building32';
b33 = 'building33';
b34 = 'building34';
b41 = 'building41';
b42 = 'building42';
b43 = 'building43';
b44 = 'building44';

var map =  [[ftl ,ft   ,ft   ,ft   ,ft  ,ft  ,ft  ,ft  ,ft  ,ft  ,ft  ,ft  ,ft  ,ft  ,ft  ,ftr ,b   ,b   ,b   ,b   ,b   ,b21   ,b22   ,b23   ,b23   ,b23   ,b24   ,b   ,b   ,b   ,b   ,b   ,g   ,g   ,g   ],
			[fl  ,b   ,t3   ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,tt  ,t4  ,fr  ,b   ,b   ,b   ,b   ,b   ,b31   ,b32   ,b33   ,b32   ,b33   ,b34   ,b   ,b   ,b   ,b   ,b   ,g   ,g   ,g   ],
			[b   ,b   ,tl  ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,t   ,tr  ,fr  ,b   ,w11 ,w12 ,w13 ,b   ,b41   ,b42   ,b43   ,b42   ,b43   ,b41   ,b   ,w11   ,w12   ,w13   ,b   ,g   ,g   ,g   ],
			[b   ,g   ,tl  ,t   ,t5   ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,t6   ,t   ,tr  ,lrt ,b   ,w21 ,w22 ,w23 ,b   ,f   ,tl   ,t   ,t   ,tr   ,f   ,b   ,w21   ,w22   ,w23   ,b   ,g   ,g   ,g   ],
			[b   ,g   ,tl  ,t   ,tr  ,lrt ,b   ,g   ,g   ,b   ,b   ,b   ,tl  ,t   ,tr  ,lrm ,b   ,w21 ,w22 ,w23 ,b   ,g   ,tl   ,t   ,t   ,tr   ,g   ,b   ,w21   ,w22   ,w23   ,b   ,g   ,g   ,g   ],
			[b   ,g   ,tl  ,t   ,tr  ,lrm ,b   ,g   ,g   ,b   ,f   ,b   ,tl  ,t   ,tr  ,lrb ,b   ,w31 ,w32 ,w33 ,b   ,g   ,tl   ,t   ,t   ,tr   ,g   ,b   ,w31   ,w32   ,w33   ,b   ,g   ,g   ,g   ],
			[b   ,g   ,tl  ,t   ,tr  ,lrb ,b   ,g   ,g   ,b   ,b   ,b   ,tl  ,t   ,tr  ,fr  ,b   ,b   ,b   ,b  ,b   ,g   ,tl   ,t   ,t   ,tr   ,g   ,b   ,b   ,b   ,b   ,b   ,g   ,g   ,g   ],
			[b   ,g   ,tl  ,t   ,tr  ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,tl  ,t   ,tr  ,g   ,b   ,b   ,b   ,b   ,g   ,g   ,tl   ,t   ,t   ,tr   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,g   ],
			[b   ,g   ,tl  ,t   ,tr  ,g   ,g   ,g   ,g   ,g   ,g   ,g   ,tl  ,t   ,tr  ,b  ,b  ,b  ,b  ,t3   ,tt   ,tt   ,t8   ,t   ,t   ,t7   ,tt   ,tt   ,tt   ,tt   ,t4   ,g   ,g   ,g   ],
			[b   ,g   ,tl  ,t   ,tr  ,g   ,b   ,b   ,b   ,b   ,b   ,g   ,tl  ,t   ,tr  ,b  ,b  ,b  ,t3   ,t   ,t5   ,tb   ,tb   ,tb   ,t6   ,t   ,t5   ,tb   ,tb   ,t6   ,tr  ,lrt ,g  ],
			[b   ,g   ,tl  ,t   ,tr  ,g   ,b   ,b   ,ftl ,ft  ,ftr ,g   ,tl  ,t   ,tr  ,b   ,f   ,b   ,tl  ,t   ,tr  ,b   ,b   ,f   ,tl  ,t   ,tr  ,b   ,b   ,tl   ,tr   ,lrm ,g   ],
			[b   ,llt ,tl  ,t   ,tr  ,g   ,b   ,f   ,fl  ,g   ,fr  ,g   ,tl  ,t   ,t7  ,tt   ,tt   ,tt   ,t8  ,t   ,tr  ,b   ,f   ,b   ,tl  ,t   ,tr  ,b   ,b   ,tl   ,tr   ,lrb ,g  ],
			[b   ,llm ,tl  ,t   ,tr  ,g   ,b   ,b   ,fl  ,g   ,fr  ,g   ,tl  ,t   ,t  ,t  ,t  ,t  ,t   ,t   ,t7   ,tt  ,tt  ,tt  ,t8   ,t   ,t7   ,tt  ,tt   ,t8   ,tr   ,fr  ,g  ],
			[b   ,llb ,tl  ,t   ,tr  ,g   ,b   ,f   ,fl  ,g   ,fr  ,g   ,g   ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb  ,tb   ,tb   ,t2   ,fr  ,g  ],
			[b   ,fl  ,tl  ,t   ,tr  ,g   ,b   ,b   ,fl  ,g   ,fr  ,fb  ,fb  ,fb  ,fb  ,fb  ,fb  ,fb  ,fb  ,fb  ,b   ,b  ,b   ,fb  ,fb  ,fb  ,fb  ,fb  ,fb  ,fb  ,b  ,b  ,b  ,b  ,b  ]
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
				case 'bush': map[x][y] = new mapObject("bush", bgtile, context, 7, 0, 35*y, 35*x, false); break;
				case 'flower': map[x][y] = new mapObject("bush", bgtile, context, 7, 2, 35*y, 35*x, false); break;
				case 'bush-top-left': map[x][y] = new mapObject("wall", bgtile, context, 6, 22, 35*y, 35*x, true); break;
				case 'bush-top': map[x][y] = new mapObject("wall", bgtile, context, 7, 22, 35*y, 35*x, true); break;
				case 'bush-top-right': map[x][y] = new mapObject("wall", bgtile, context, 8, 22, 35*y, 35*x, true); break;
				case 'tile': map[x][y] = new mapObject("tile", bgtile, context, 0, 15, 35*y, 35*x, false); break;
				case 'tile-top': map[x][y] = new mapObject("tile", bgtile, context, 3, 15, 35*y, 35*x, false); break;
				case 'tile-bottom': map[x][y] = new mapObject("tile", bgtile, context, 4, 15, 35*y, 35*x, false); break;
				case 'tile-left': map[x][y] = new mapObject("tile", bgtile, context, 1, 15, 35*y, 35*x, false); break;
				case 'tile-right': map[x][y] = new mapObject("tile", bgtile, context, 2, 15, 35*y, 35*x, false); break;
				case 'tile-1': map[x][y] = new mapObject("tile", bgtile, context, 1, 16, 35*y, 35*x, false); break;
				case 'tile-2': map[x][y] = new mapObject("tile", bgtile, context, 2, 16, 35*y, 35*x, false); break;
				case 'tile-3': map[x][y] = new mapObject("tile", bgtile, context, 3, 16, 35*y, 35*x, false); break;
				case 'tile-4': map[x][y] = new mapObject("tile", bgtile, context, 4, 16, 35*y, 35*x, false); break;
				case 'tile-5': map[x][y] = new mapObject("tile", bgtile, context, 1, 17, 35*y, 35*x, false); break;
				case 'tile-6': map[x][y] = new mapObject("tile", bgtile, context, 2, 17, 35*y, 35*x, false); break;
				case 'tile-7': map[x][y] = new mapObject("tile", bgtile, context, 3, 17, 35*y, 35*x, false); break;
				case 'tile-8': map[x][y] = new mapObject("tile", bgtile, context, 4, 17, 35*y, 35*x, false); break;
				
				case 'fence-top': map[x][y] = new mapObject("wall", bgtile, context, 7, 11, 35*y, 35*x, true); break;
				case 'fence-top-left': map[x][y] = new mapObject("wall", bgtile, context, 6, 11, 35*y, 35*x, true); break;
				case 'fence-top-right': map[x][y] = new mapObject("wall", bgtile, context, 8, 11, 35*y, 35*x, true); break;
				case 'fence-left': map[x][y] = new mapObject("wall", bgtile, context, 6, 12, 35*y, 35*x, true); break;
				case 'fence-right': map[x][y] = new mapObject("wall", bgtile, context, 8, 12, 35*y, 35*x, true); break;
				case 'fence-bottom-left': map[x][y] = new mapObject("wall", bgtile, context, 6, 13, 35*y, 35*x, true); break;
				case 'fence-bottom-right': map[x][y] = new mapObject("wall", bgtile, context, 8, 13, 35*y, 35*x, true); break;
				case 'fence-bottom': map[x][y] = new mapObject("wall", bgtile, context, 7, 13, 35*y, 35*x, true); break;
				
				case 'lamp-right-top': map[x][y] = new mapObject("wall", bgtile, context, 7, 18, 35*y, 35*x, true); break;
				case 'lamp-right-middle': map[x][y] = new mapObject("wall", bgtile, context, 7, 19, 35*y, 35*x, true); break;
				case 'lamp-right-bottom': map[x][y] = new mapObject("wall", bgtile, context, 7, 20, 35*y, 35*x, true); break;
				case 'lamp-left-top': map[x][y] = new mapObject("wall", bgtile, context, 6, 18, 35*y, 35*x, true); break;
				case 'lamp-left-middle': map[x][y] = new mapObject("wall", bgtile, context, 6, 19, 35*y, 35*x, true); break;
				case 'lamp-left-bottom': map[x][y] = new mapObject("wall", bgtile, context, 6, 20, 35*y, 35*x, true); break;

				case 'water11': map[x][y] = new mapObject("wall", bgtile, context, 15, 21, 35*y, 35*x, false); break;
				case 'water12': map[x][y] = new mapObject("wall", bgtile, context, 16, 21, 35*y, 35*x, false); break;
				case 'water13': map[x][y] = new mapObject("wall", bgtile, context, 17, 21, 35*y, 35*x, false); break;
				case 'water21': map[x][y] = new mapObject("wall", bgtile, context, 15, 22, 35*y, 35*x, true); break;
				case 'water22': map[x][y] = new mapObject("wall", bgtile, context, 16, 22, 35*y, 35*x, true); break;
				case 'water23': map[x][y] = new mapObject("wall", bgtile, context, 17, 22, 35*y, 35*x, true); break;
				case 'water31': map[x][y] = new mapObject("wall", bgtile, context, 15, 23, 35*y, 35*x, true); break;
				case 'water32': map[x][y] = new mapObject("wall", bgtile, context, 16, 23, 35*y, 35*x, true); break;
				case 'water33': map[x][y] = new mapObject("wall", bgtile, context, 17, 23, 35*y, 35*x, true); break;

				case 'building11': map[x][y] = new mapObject("wall", bgtile, context, 24, 0, 35*y, 35*x, true); break;
				case 'building12': map[x][y] = new mapObject("wall", bgtile, context, 25, 0, 35*y, 35*x, true); break;
				case 'building13': map[x][y] = new mapObject("wall", bgtile, context, 26, 0, 35*y, 35*x, true); break;
				case 'building14': map[x][y] = new mapObject("wall", bgtile, context, 27, 0, 35*y, 35*x, true); break;
				case 'building21': map[x][y] = new mapObject("wall", bgtile, context, 24, 1, 35*y, 35*x, true); break;
				case 'building22': map[x][y] = new mapObject("wall", bgtile, context, 25, 1, 35*y, 35*x, true); break;
				case 'building23': map[x][y] = new mapObject("wall", bgtile, context, 26, 1, 35*y, 35*x, true); break;
				case 'building24': map[x][y] = new mapObject("wall", bgtile, context, 27, 1, 35*y, 35*x, true); break;
				case 'building31': map[x][y] = new mapObject("wall", bgtile, context, 24, 2, 35*y, 35*x, true); break;
				case 'building32': map[x][y] = new mapObject("wall", bgtile, context, 25, 2, 35*y, 35*x, true); break;
				case 'building33': map[x][y] = new mapObject("wall", bgtile, context, 26, 2, 35*y, 35*x, true); break;
				case 'building34': map[x][y] = new mapObject("wall", bgtile, context, 27, 2, 35*y, 35*x, false); break;
				case 'building41': map[x][y] = new mapObject("wall", bgtile, context, 24, 3, 35*y, 35*x, false); break;
				case 'building42': map[x][y] = new mapObject("wall", bgtile, context, 25, 3, 35*y, 35*x, false); break;
				case 'building43': map[x][y] = new mapObject("wall", bgtile, context, 26, 3, 35*y, 35*x, false); break;
				case 'building44': map[x][y] = new mapObject("wall", bgtile, context, 27, 3, 35*y, 35*x, false); break;
	
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

var police1X = 200;
var police1Y = 50;
var police2X = 50;
var police2Y = 150;
var police3X = 450;
var police3Y = 240;
var police4X = 660;
var police4Y = 400;
var police5X = 850;
var police5Y = 270;
var police6X = 900;
var police6Y = 340;
var police7X = 800;
var police7Y = 200;
var police8X = 100;
var police8Y = 300;
var police9X = 430;
var police9Y = 440;
var police10X = 825;
var police10Y = 125;

var player1X = 80;
var player1Y = 470;
var player2X = 150;
var player2Y = 470;

var police1 = new Guard("police1", police1Image, police1X, police1Y, 32, 43, 4);
sprites.push(police1);

var police2 = new Guard("police2", police2Image, police2X, police2Y, 32, 50, 4);
sprites.push(police2);

var police3 = new Guard("police3", police1Image, police3X, police3Y, 32, 43, 4);
sprites.push(police3);

var police4 = new Guard("police4", police2Image, police4X, police4Y, 32, 50, 4);
sprites.push(police4);

var police5 = new Guard("police5", police2Image, police5X, police5Y, 32, 50, 4);
sprites.push(police5);

var police6 = new Guard("police6", police1Image, police6X, police6Y, 32, 43, 4);
sprites.push(police6);

var police7 = new Guard("police7", police1Image, police7X, police7Y, 32, 43, 4);
sprites.push(police7);

var police8 = new Guard("police8", police1Image, police8X, police8Y, 32, 43, 4);
sprites.push(police8);

var police9 = new Guard("police9", police2Image, police9X, police9Y, 32, 50, 4);
sprites.push(police9);

var police10 = new Guard("police10", police2Image, police10X, police10Y, 32, 50, 4);
sprites.push(police10);

var player1 = new Player("player1", player1Image, player1X, player1Y, 32, 40, 4);
sprites.push(player1);

var player2 = new Player("player2", player2Image, player2X, player2Y, 32, 40, 4);
sprites.push(player2);

// var portal = new Sprite("portal", portalImage, 260, 180, 46, 46, 6);
// sprites.push(portal);

var bootsUsed = false;

var boots = {
	image: bootImage,
	xPos: 325,
	yPos: 400,
	width: 20,
	height: 25
};

var goal = {
	xPos: 800,
	yPos: 90,
	width: 100,
	height: 30,
}

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

		// GOAL

		if (didGet(player1, goal)) {
			p1wins++; 
			p1winScreen.show("bounce", 1000);
			setTimeout(function() {
				p1winScreen.hide('bounce', 1000);
				reset();
			}, 3000);
		};

		if (didGet(player2, goal)) {
			p2wins++; 
			p2winScreen.show("bounce", 1000);
			setTimeout(function() {
				p2winScreen.hide('bounce', 1000);
				reset();
			}, 3000);
		};

		// ADD SPRITES

		police1.update(true, 120, 400);
		police2.update(false, 90, 300);
		police3.update(true, 400, 490);
		police4.update(false, 310, 430);
		police5.update(true, 800, 1000);
		police6.update(false, 310, 430);
		police7.update(true, 750, 900);
		police8.update(true, 50, 150);
		police9.update(true, 400, 460);
		police10.update(false, 100, 150);

		// portal.animate();
		// portal.render();

	}, 1000 / policeFPS);

		// Player 1 and 2 Controls

	setTimeout(function() {

		if (!player1.captured) {
			if (keysdown[16]) { player1.run() } else { player1.walk() };
			if (keysdown[90]) { player1.push() };
			if (keysdown[87]) { player1.moveUp() }; // w
			if (keysdown[65]) { player1.moveLeft() }; // a
			if (keysdown[83]) { player1.moveDown() }; // s
			if (keysdown[68]) { player1.moveRight() }; // d
			if (keysdown[87] || keysdown[65] || keysdown[83] || keysdown[68]) { player1.animate() }
		}

		player1.render();

	}, 1000 / player1FPS);

	setTimeout(function() {

		if (!player2.captured) {
			if (keysdown[77]) { player2.run() } else { player2.walk() };
			if (keysdown[188]) { player2.push() };
			if (keysdown[38]) { player2.moveUp() }; // up
			if (keysdown[37]) { player2.moveLeft() }; // left
			if (keysdown[40]) { player2.moveDown() }; // down
			if (keysdown[39]) { player2.moveRight() }; // right
			if (keysdown[37] || keysdown[38] || keysdown[39] || keysdown[40]) { player2.animate() }
		}

		player2.render();

	}, 1000 / player2FPS);
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
var y1 = 130;
var x1 = 420;
var y2 = 25;
var x2 = 787;
var y3 = 60;
var x3 = 787;

building[0] = new mapObject("wall", bgtile, overlayContext, 19, 0, x1+35*0, y1+35*0, false);
building[1] = new mapObject("wall", bgtile, overlayContext, 20, 0, x1+35*1, y1+35*0, false);
building[2] = new mapObject("wall", bgtile, overlayContext, 21, 0, x1+35*2, y1+35*0, false);
building[3] = new mapObject("wall", bgtile, overlayContext, 19, 1, x1+35*0, y1+35*1, false);
building[4] = new mapObject("wall", bgtile, overlayContext, 20, 1, x1+35*1, y1+35*1, false);
building[5] = new mapObject("wall", bgtile, overlayContext, 21, 1, x1+35*2, y1+35*1, false);
building[6] = new mapObject("wall", bgtile, overlayContext, 19, 2, x1+35*0, y1+35*2, true);
building[7] = new mapObject("wall", bgtile, overlayContext, 21, 2, x1+35*2, y1+35*2, true);

building[8] = new mapObject("wall", bgtile, overlayContext, 19, 0, x2+35*0, y2+35*0, false);
building[9] = new mapObject("wall", bgtile, overlayContext, 20, 0, x2+35*1, y2+35*0, false);
building[10] = new mapObject("wall", bgtile, overlayContext, 21, 0, x2+35*2, y2+35*0, false);
building[11] = new mapObject("wall", bgtile, overlayContext, 19, 1, x2+35*0, y2+35*1, false);
building[12] = new mapObject("wall", bgtile, overlayContext, 20, 1, x2+35*1, y2+35*1, false);
building[13] = new mapObject("wall", bgtile, overlayContext, 21, 1, x2+35*2, y2+35*1, false);
building[14] = new mapObject("wall", bgtile, overlayContext, 19, 2, x2+35*0, y2+35*2, true);
building[15] = new mapObject("wall", bgtile, overlayContext, 21, 2, x2+35*2, y2+35*2, true);

building[16] = new mapObject("wall", bgtile, overlayContext, 19, 0, x3+35*0, y3+35*0, true);
building[17] = new mapObject("wall", bgtile, overlayContext, 20, 0, x3+35*1, y3+35*0, true);
building[18] = new mapObject("wall", bgtile, overlayContext, 21, 0, x3+35*2, y3+35*0, true);
building[19] = new mapObject("wall", bgtile, overlayContext, 19, 1, x3+35*0, y3+35*1, true);
building[20] = new mapObject("wall", bgtile, overlayContext, 20, 1, x3+35*1, y3+35*1, true);
building[21] = new mapObject("wall", bgtile, overlayContext, 21, 1, x3+35*2, y3+35*1, true);
building[22] = new mapObject("wall", bgtile, overlayContext, 19, 2, x3+35*0, y3+35*2, true);
building[23] = new mapObject("wall", bgtile, overlayContext, 21, 2, x3+35*2, y3+35*2, true);

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

function addLights() {
	lightingContext.fillStyle= '#000';
	lightingContext.fillRect(0,0,canvas.width,canvas.height);
	lightingContext.globalCompositeOperation = "destination-out";

	// ADD LIGHTS (X1, X2, Y1, Y2, SIZE, OPACITY)

	// Lamp Post #1
	addLight(55, 55, 400, 400, 15, 1.0);
	addLight(55, 130, 450, 450, 150, 1.0);
	//LampPost #2
	addLight(180, 180, 160, 160, 15, 1.0);
	addLight(180, 120, 250, 250, 150, 1.0);
	//LampPost #3
	addLight(530, 530, 125, 125, 15, 1.0);
	addLight(540, 460, 220, 220, 150, 1.0);
	//LampPost #4
	addLight(1090, 1090, 340, 340, 15, 1.0);
	addLight(1090, 990, 400, 400, 150, 1.0);
	//Moonlight
	addLight(1000, 800, 0, 100, 300, 0.9);
}

$(document).ready(function() {

	loadMap();
	draw();
	addLights();

	bgtile.onload = function() {
		renderMap();
		for (var x=0; x < building.length; x++) {
			building[x].render();
		}
	}

	treeImage.onload = function() {
		overlayContext.drawImage(treeImage, 0, 0, 48, 60, 200, 240, 100, 120);
		overlayContext.drawImage(treeImage, 0, 0, 48, 60, 300, 240, 100, 120);
		overlayContext.drawImage(treeImage, 0, 0, 48, 60, -70, 450, 160, 200);
		overlayContext.drawImage(treeImage, 0, 0, 48, 60, 340, 420, 150, 180);
		overlayContext.drawImage(treeImage, 0, 0, 48, 60, 400, 470, 200, 220);
		overlayContext.drawImage(treeImage, 0, 0, 48, 60, 740, 310, 100, 120);
	}

	overlayContext.globalAlpha = 0.9;
	spriteContext.globalAlpha = 0;

})

function decrementTimer() {
	if (gameStarted) {
		if (timer > 0) {
			timer--;
			timerDiv.html(timer);
		} else {
			timeoutScreen.show('bounce', 1000);
			setTimeout(function() {
				timeoutScreen.hide("bounce", 1000);
				reset();
			}, 3000);
		}
	}
}

function start() {
	gameStarted = true;
	timerDiv.html(timer);
	setInterval(function() {
		spriteContext.globalAlpha += 0.1;
	}, 100);
	setInterval(function() {
		decrementTimer();
	}, 1000);
}

function reset() {
	timer = maxTime;
	timerDiv.html(timer);
	for (var i=0; i<sprites.length; i++) {
		sprites[i].xPos = sprites[i].x0;
		sprites[i].yPos = sprites[i].y0;
		sprites[i].chaseP1 = false;
		sprites[i].chaseP2 = false;
	}
}

function p1win() {
	textCanvas.style.background('red');
}


