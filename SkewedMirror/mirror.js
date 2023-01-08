let Vector2 = (x, y) => {
	return {
		x, y,
		add: a => Vector2(x + a.x, y + a.y),
		sub: a => Vector2(x - a.x, y - a.y),
		mul: a => Vector2(x * a, y * a),
		mag: () => Math.hypot(x, y),
		dis: function (a) { return this.sub(a).mag(); },
	};
}

let Line = (p1, p2) => {
	return {
		p1, p2,
		//https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line
		intersect(a) {
			let x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y, x3 = a.p1.x, y3 = a.p1.y, x4 = a.p2.x, y4 = a.p2.y;
			let div = ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
			if (div == 0)
				return false;
			let x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / div;
			let y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / div;
			return Vector2(x, y);
		}
	}
}

let objectPos = Vector2(150, 0.01);
let objectSize = Vector2(16, 28);

const circlePos = Vector2(200, 0);
let circleRadius = 200;
const circleFocus = Vector2(circlePos.x - circleRadius / 2, circlePos.y);
let circlePeak = Vector2(circlePos.x - circleRadius, circlePos.y);


function setup() {
	createCanvas(innerWidth, innerHeight);
	noStroke();
}

function draw() {
	//position 0,0 is at the middle
	translate(width / 2, height / 2, 0);
	background(50);
	//draw the circle
	fill(255)
	circle(circlePos.x, circlePos.y, circleRadius * 2 + 40);
	fill(0);
	circle(circlePos.x, circlePos.y, circleRadius * 2 + 30);
	fill(255)
	circle(circlePos.x, circlePos.y, circleRadius * 2 + 10);
	//remove the right part of the circle
	color(50);
	fill(50);
	circle(circlePos.x, circlePos.y, circleRadius * 2);
	rect(circlePos.x - circleRadius / 2, -height / 2, width, height);

	//draw the object
	drawObject(objectPos);

	//draw the rays
	if (Math.abs(objectPos.y) < circleRadius - 25 && Math.abs(objectPos.dis(circlePos) - circleRadius) > 10) {
		let outside = false;
		if (objectPos.dis(circlePos) > circleRadius) {
			outside = true;
			circleRadius += 20;
			circlePeak.x -= 20
		}
		//x^2 = radius^2-y^2
		let straightHit =
			Vector2(-Math.sqrt(Math.pow(circleRadius, 2) - Math.pow(objectPos.y, 2)) + circlePos.x,
				objectPos.y);
		let straightColor = color(255, 100, 100);
		let reflectVector = circleFocus.sub(straightHit).mul(20);
		if (outside) reflectVector = reflectVector.mul(-1);
		let straightReflect = Line(straightHit, straightHit.add(reflectVector));
		lineVector2(straightHit, objectPos, straightColor, 1);
		lineVector2(straightHit, straightHit.add(reflectVector), straightColor);
		dashedLine(straightHit, straightHit.add(reflectVector.mul(-1)), straightColor);


		let peakColor = color(100, 255, 100);
		reflectVector = circlePeak.sub(objectPos).mul(20);
		reflectVector.x *= -1;
		let peakReflect = Line(circlePeak, circlePeak.add(reflectVector))
		lineVector2(objectPos, circlePeak, peakColor, 1);
		lineVector2(circlePeak, circlePeak.add(reflectVector), peakColor);
		reflectVector = Vector2(-reflectVector.x, -reflectVector.y);
		dashedLine(circlePeak, circlePeak.add(reflectVector), peakColor);


		//draw the reflected object
		let reflectionPos = peakReflect.intersect(straightReflect);

		drawObject(reflectionPos, -(reflectionPos.x - circlePeak.x) / (objectPos.x - circlePeak.x), true);


		if (outside) {
			circleRadius -= 20;
			circlePeak.x += 20
		}
	}
	fill(0);
	circle(circlePos.x, circlePos.y, 5);
	circle(circleFocus.x, circleFocus.y, 5);
	circle(circlePeak.x, circlePeak.y, 5);
}

function drawObject(pos, size = 1, flip = false) {
	//dont let it get too big
	if (size > 10) size = 10;
	else if (size < -10) size = -10;

	//make virtual reflection transparent
	if (flip && size > 0) {
		fill(200, 40, 40, 150);
	} else fill(200, 40, 40);
	rect(pos.x - objectSize.x * size / 2, pos.y - objectSize.y * size / 2,
		objectSize.x * size, objectSize.y * size);
	fill(0);

	push();
	translate(pos.x - objectSize.x * size / 2, pos.y + objectSize.y * size / 2, 0);
	//flip the letter
	if (flip) {
		if (size < 0) {
			rotate(radians(180));
		} else {
			translate(objectSize.x * size, 0, 0);
			scale(-1, 1);
		}
	}
	textSize(32 * Math.abs(size));
	text("a", 0, 0);
	pop();
}

function lineVector2(a, b, c, w = 4) {
	push();
	stroke(c);
	strokeWeight(w);
	line(a.x, a.y, b.x, b.y);
	pop();
}

function dashedLine(a, b, c) {
	push();
	drawingContext.setLineDash([10, 15]);
	stroke(c);
	strokeWeight(4);
	line(a.x, a.y, b.x, b.y);
	pop();
}

function mousePressed() {
	objectPos = Vector2(mouseX - width / 2, mouseY - height / 2);
	if (objectPos.y == 0)
		objectPos.y = 0.01;
}