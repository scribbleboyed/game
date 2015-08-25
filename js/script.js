var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var lightingContext = canvas.getContext('2d');

var bgtile = new Image();
bgtile.src = "images/tileset.png";

var spriteIndex = 0;
var sprites = [];

// SPRITE CLASS

function Sprite(name, image, x, y, width, height, numOfFrames) {
	this.index = 0;
	this.name = name;
	this.image =image;
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
	this.direction = 0;

	this.init = function() {
		this.index = spriteIndex;
		spriteIndex++;
	};

	this.walk = function() {
		this.speed = 4;
	};

	this.run = function() {
		this.speed = 8;
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

	this.update = function() {
		if (this.frameIndex < this.numOfFrames - 1) {
			this.frameIndex++;
		} else {
			this.frameIndex = 0;
		}
	};

	this.clear = function(xPos, yPos) {
		context.clearRect(xPos, yPos, this.width, this.height);
	};

	this.render = function() {
		context.drawImage(
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

// MAP DATA

var mapObject = function(name, image, imageX, imageY, x, y, collision) {
	this.name = name;
	this.image = image;
	this.imageX = imageX;
	this.imageY = imageY;
	this.width = 36;
	this.height = 36;
	this.xPos = x;
	this.yPos = y;
	this.collision = collision;

	this.render = function() {
		context.drawImage(this.image, 1+(16+1)*this.imageX, 1+(16+1)*this.imageY, 16, 16, x, y, this.width, this.height);
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

var map = [[b,b,g,g,g,g,b,b,b,b,b,b,b,b,b,b,b,b,b,b,b,b,b,b,b],
			[b,g,g,g,b,g,g,g,g,g,g,g,g,g,b,g,g,g,g,g,g,g,g,g,b],
			[b,g,g,g,b,g,g,g,g,g,g,g,g,g,b,g,g,g,g,g,g,g,g,g,b],
			[b,g,g,g,b,b,b,b,b,b,g,g,g,g,b,g,g,g,b,b,b,b,g,g,b],
			[b,g,g,g,b,g,g,g,g,b,g,g,g,g,b,g,g,g,g,g,g,b,g,g,b],
			[b,g,g,g,g,g,g,g,g,b,g,g,g,g,b,g,g,g,g,g,g,b,g,g,b],
			[tt,tt,tt,tt,tt,tt,tt,tt,tt,ttrt,g,g,g,g,b,b,b,g,g,g,g,b,g,g,b],
			[t,t,t,t,t,t,t,t,t,tr,g,g,g,g,b,b,b,g,g,b,b,b,g,g,b],
			[tb,tb,tb,tb,tb,tb,tb,ttrb,t,tr,g,g,g,g,b,b,b,g,g,b,g,g,g,g,b],
			[b,g,g,g,g,g,g,tl,t,tr,g,g,g,g,b,g,g,g,g,b,g,g,g,g,b],
			[b,g,g,g,g,g,g,g,g,g,g,g,g,g,b,g,g,g,g,b,g,g,g,g,b],
			[b,g,g,g,g,g,g,g,g,g,g,g,g,g,b,g,g,b,b,b,g,g,g,g,b],
			[b,g,g,g,g,b,b,b,b,b,b,b,b,b,b,g,g,g,g,b,g,g,g,g,b],
			[b,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,b,g,g,g,g,b],
			[b,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,b,b,b,b,b,b]
		];

function loadMap() {
	for (var x=0; x<map.length; x++) {
		for (var y=0; y<map[x].length; y++) {
			switch (map[x][y]) {
				case 'grass': map[x][y] = new mapObject("grass", bgtile, 6, 0, 35*y, 35*x, false); break;
				case 'bush': map[x][y] = new mapObject("bush", bgtile, 7, 0, 35*y, 35*x, true); break;
				case 'bush-top-left': map[x][y] = new mapObject("bush", bgtile, 6, 22, 35*y, 35*x, true); break;
				case 'bush-top': map[x][y] = new mapObject("bush", bgtile, 7, 22, 35*y, 35*x, true); break;
				case 'bush-top-right': map[x][y] = new mapObject("bush", bgtile, 8, 22, 35*y, 35*x, true); break;
				case 'tile': map[x][y] = new mapObject("bush", bgtile, 0, 15, 35*y, 35*x, false); break;
				case 'tile-top': map[x][y] = new mapObject("bush", bgtile, 3, 15, 35*y, 35*x, false); break;
				case 'tile-bottom': map[x][y] = new mapObject("bush", bgtile, 4, 15, 35*y, 35*x, false); break;
				case 'tile-left': map[x][y] = new mapObject("bush", bgtile, 1, 15, 35*y, 35*x, false); break;
				case 'tile-right': map[x][y] = new mapObject("bush", bgtile, 2, 15, 35*y, 35*x, false); break;
				case 'tile-turn-right-top': map[x][y] = new mapObject("bush", bgtile, 4, 16, 35*y, 35*x, false); break;
				case 'tile-turn-right-bottom': map[x][y] = new mapObject("bush", bgtile, 2, 17, 35*y, 35*x, false); break;
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
player1Image.src = "images/player.png";

var player2Image = new Image();
player2Image.src = "images/player.png";

var police1 = new Guard("police1", police2Image, 200, 50, 32, 50, 4);
sprites.push(police1);

var police2 = new Guard("police2", police2Image, 50, 150, 32, 50, 4);
sprites.push(police2);

var player1 = new Sprite("player1", player1Image, 100, 300, 32, 40, 4);
sprites.push(player1);

var player2 = new Sprite("player2", player2Image, 200, 300, 32, 40, 4);
sprites.push(player2);

var police1switch = true;
var police2switch = true;

var fps = 16;

function circle(x, y, r, c) {
    lightingContext.beginPath();
    var rad = context.createRadialGradient(x, y, 1, x, y, r);
    rad.addColorStop(0, 'rgba('+c+',0.3)');
    rad.addColorStop(1, 'rgba('+c+',0)');
    lightingContext.fillStyle = rad;
    lightingContext.arc(x, y, r, 0, Math.PI*2, false);
    lightingContext.fill();
}

function draw() {

	setTimeout(function() {
		requestAnimationFrame(draw);

		renderMap();

		// AI LOGIC

		police1.walk();
		police1.update();
		police1.render();

		if (police1switch) { police1.moveRight() }
		else { police1.moveLeft() }

		if (police1.xPos <= 200 || police1.xPos >= 400) {
			if (police1switch) { police1switch = false }
			else { police1switch = true};
		}

		police2.walk();
		police2.update();
		police2.render();

		if (police2switch) { police2.moveDown() }
		else { police2.moveUp() }

		if (police2.yPos <= 150 || police2.yPos >= 300) {
			if (police2switch) { police2switch = false }
			else { police2switch = true};
		}

		// if (keysdown[77]) { police1.run(); fps=14; } else { police1.walk(); fps=7; };
		// if (keysdown[38]) { police1.moveUp() }; // up
		// if (keysdown[37]) { police1.moveLeft() }; // left
		// if (keysdown[40]) { police1.moveDown() }; // down
		// if (keysdown[39]) { police1.moveRight() }; // right
		// if (keysdown[37] || keysdown[38] || keysdown[39] || keysdown[40]) { police1.update() }
		// police1.render();

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

		circle(200, 300, 300, '255,255,255');
		circle(600, 200, 100, '255,255,255');

		context.fillRect(0, 0, 875, 525);

	}, 1000 / fps);

}

loadMap();

draw();






