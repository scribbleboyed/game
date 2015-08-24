var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var bgtile = new Image();
bgtile.src = "images/tileset.png";

var police1Image = new Image();
police1Image.src = "images/police_black.png";

var police2Image = new Image();
police2Image.src = "images/police_blue.png";

var spriteIndex = 0;
var sprites = [];

var Sprite = function(name, image, x, y, width, height, numOfFrames) {
	this.index = 0;
	this.name = name;
	this.image =image;
	this.width = width;
	this.height = height;

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
		this.speed = 1;
	};

	this.run = function() {
		this.speed = 2;
	};

	this.moveUp = function() {
		this.direction = 3;
		this.clear(this.xPos, this.yPos);
		var allowed = true;
		for (var i=0; i<sprites.length; i++) {
			if (sprites[i].index != this.index) {
				if (willCollide(this, 0, -this.speed, sprites[i])) {
					allowed = false;
				}
			}
		}
		if (allowed) {
			this.yPos -= this.speed;
		}
	};

	this.moveDown = function() {
		this.direction = 0;
		this.clear(this.xPos, this.yPos);
		var allowed = true;
		for (var i=0; i<sprites.length; i++) {
			if (sprites[i].index != this.index) {
				if (willCollide(this, 0, this.speed, sprites[i])) {
					allowed = false;
				}
			}
		}
		if (allowed) {
			this.yPos += this.speed;
		}
	};

	this.moveLeft = function() {
		this.direction = 1;
		this.clear(this.xPos, this.yPos);
		var allowed = true;
		for (var i=0; i<sprites.length; i++) {
			if (sprites[i].index != this.index) {
				if (willCollide(this, -this.speed, 0, sprites[i])) {
					allowed = false;
				}
			}
		}
		if (allowed) {
			this.xPos -= this.speed;
		}
	};

	this.moveRight = function() {
		this.direction = 2;
		this.clear(this.xPos, this.yPos);
		var allowed = true;
		for (var i=0; i<sprites.length; i++) {
			if (sprites[i].index != this.index) {
				if (willCollide(this, this.speed, 0, sprites[i])) {
					allowed = false;
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

function willCollide(sprite1, dx, dy, sprite2) {
	return ((sprite1.xPos + dx + sprite1.width >= sprite2.xPos) &&
	(sprite1.yPos + dy + sprite1.height >= sprite2.yPos) &&
	(sprite1.xPos + dx <= sprite2.xPos + sprite2.width) &&
	(sprite1.yPos + dy <= sprite2.yPos + sprite2.height));
}

var mapObject = function(image, width, height, x, y) {
	this.image = image;
	this.width = width;
	this.height = height;
	this.xPos = x;
	this.yPos = y;

	this.render = function() {
		context.drawImage(this.image, 1, 1, 16, 16, this.xPos, this.yPos, this.width, this.height);
	}
}

// var g1 = [0,3];
// var g2 = [6,0]; // grass
// var g3 = [7,0];
// var f1 = [7,2];

// var mapArray = [[g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2],
// 				[g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2],
// 				[g2,g2,g2,f1,g2,g2,g2,g2,g2,g2,g2,g2,g2,g3,g2,g2,g2,g2,g2,g2],
// 				[g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,f1,g2,g2,g2,g2,g2],
// 				[g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2],
// 				[g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2],
// 				[g2,g2,g2,g2,g2,g2,g2,f1,g2,g2,f1,g2,g2,g2,g2,g2,g2,g2,g2,g2],
// 				[g2,g2,g3,g2,g2,g2,g2,f1,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2],
// 				[g2,g2,g2,g3,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2],
// 				[g2,f1,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g3,g2,g2],
// 				[g2,g2,g2,g2,g2,g3,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2],
// 				[g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2,g2],
// 				];

var police1 = new Sprite("police1", police1Image, 0, 0, 32, 48, 4);
sprites.push(police1);

var police2 = new Sprite("police2", police2Image, 50, 50, 32, 50, 4);
sprites.push(police2);

var wall = new mapObject(bgtile, 10, 100, 100, 100);
sprites.push(wall);

var wall2 = new mapObject(bgtile, 100, 10, 100, 100);
sprites.push(wall2);

function draw() {
	var fps = 10;

	setTimeout(function() {
		requestAnimationFrame(draw);

		// for (var i=0; i< mapArray.length; i++) {
		// 	for (var j=0; j < mapArray[i].length; j++) {
		// 		context.drawImage(bgtile, 1+(16+1)*mapArray[i][j][0], 1+(16+1)*mapArray[i][j][1], 16, 16, 35*j, 35*i, 36, 36);
		// 	}
		// }

		wall.render();	
		wall2.render();

		if (keysdown[77]) { police1.run(); fps=20; } else { police1.walk(); fps=10; };
		if (keysdown[38]) { police1.moveUp() }; // up
		if (keysdown[37]) { police1.moveLeft() }; // left
		if (keysdown[40]) { police1.moveDown() }; // down
		if (keysdown[39]) { police1.moveRight() }; // right
		if (keysdown[37] || keysdown[38] || keysdown[39] || keysdown[40]) { police1.update() }
		police1.render();

		if (keysdown[16]) { police2.run(); fps=20; } else { police2.walk(); fps=10; };
		if (keysdown[87]) { police2.moveUp() }; // w
		if (keysdown[65]) { police2.moveLeft() }; // a
		if (keysdown[83]) { police2.moveDown() }; // s
		if (keysdown[68]) { police2.moveRight() }; // d
		if (keysdown[87] || keysdown[65] || keysdown[83] || keysdown[68]) { police2.update() }
		police2.render();

	}, 1000 / fps);

}

draw();




