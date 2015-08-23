var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var bgtile = new Image();
bgtile.src = "images/tileset.png";
var police1Image = new Image();
police1Image.src = "images/police_black.png";
var police2Image = new Image();
police2Image.src = "images/police_blue.png"

var Sprite = function(image, x, y, width, height, numOfFrames) {
	return {
		image: image,
		width: width,
		height: height,

		frameIndex: 0,
		numOfFrames: numOfFrames,
		xPosLast: 0,
		yPosLast: 0,
		xPos: x,
		yPos: y,
		speed: 4,

		direction: 0,

		walk: function() {
			this.speed = 4;
		},

		run: function() {
			this.speed = 8;
		},

		moveUp: function() {
			this.direction = 3;
			//this.clear(this.xPos, this.yPos);
			this.yPos -= this.speed;
		},

		moveDown: function() {
			this.direction = 0;
			//this.clear(this.xPos, this.yPos);
			this.yPos += this.speed;
		},

		moveLeft: function() {
			this.direction = 1;
			//this.clear(this.xPos, this.yPos);
			this.xPos -= this.speed;
		},

		moveRight: function() {
			this.direction = 2;
			//this.clear(this.xPos, this.yPos);
			this.xPos += this.speed;
		},

		update: function() {
			if (this.frameIndex < this.numOfFrames - 1) {
				this.frameIndex++;
			} else {
				this.frameIndex = 0;
			}
		},

		clear: function(xPos, yPos) {
			context.clearRect(xPos, yPos, this.width, this.height);
		},

		render: function() {
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
	}
}

var keysdown = {};

// Check key down
$(document).keydown(function(e) {
	if (keysdown[e.keyCode]) { return; }
	keysdown[e.keyCode] = true;
    e.preventDefault();
    console.log(e.keyCode);
	
	console.log("1-x: " + police1.xPos);
	console.log("1-y: " + police1.yPos);
	console.log("2-x: " + police2.xPos);
	console.log("2-x: " + police2.yPos);
	
	if ((police1.xPos + police1.width <= police2.xPos) &&
		(police1.yPos + police1.height <= police2.yPos) &&
		(police2.xPos + police2.width <= police1.xPos) {
			console.log('collide');
	}
});

// Check key up
$(document).keyup(function(e){
  delete keysdown[e.keyCode];
});

var mapArray = [[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
				[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
				[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
				[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
				[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
				[1,0,0,0,0,0,0,6,6,6,6,6,0,0,0,0,0,0,0,0,2],
				[1,0,0,0,0,0,0,6,6,7,7,6,0,0,0,0,0,0,0,0,2],
				[1,0,0,0,0,0,0,6,6,7,7,6,0,0,0,0,0,0,0,0,2],
				[1,0,0,0,0,0,0,6,6,6,6,6,0,0,0,0,0,0,0,0,2],
				[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
				[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
				[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
				[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2]];

var police1 = new Sprite(police1Image, 0, 0, 32, 48, 4);
var police2 = new Sprite(police2Image, 50, 50, 32, 50, 4);


function draw() {
	var fps = 10;

	setTimeout(function() {
		requestAnimationFrame(draw);

		for (var i=0; i< mapArray.length; i++) {
			for (var j=0; j < mapArray[i].length; j++) {
				context.drawImage(bgtile, 1+(16+1)*mapArray[i][j], 1, 16, 16, 35*j, 35*i, 36, 36);
			}
		}

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




