const createVector = (x, y) => ({
  x,y,
  add: function(a) {
    return createVector(this.x+a.x, this.y+a.y);
  },
  mul: function(a) {
    return createVector(this.x*a, this.y*a);
  }
})

function setup() {
createCanvas(400, 400);
background(220);
  
console.log(createVector(10, 10));

const points = [createVector(200, 10), createVector(10, 390), createVector(390, 390)];

strokeWeight(4);
points.forEach(p => point(p.x, p.y))

let weights = Array(points.length).fill(0).map(_ => random(100));
const total = weights.reduce((a,b) => a+b, 0);
weights = weights.map(x => x/total);

let randomPoint = points.reduce((a, b, i) => a.add(b.mul(weights[i]), createVector(0 ,0)));
  
for(let i = 0;i < 1000000;i++){
  randomCorner = points[Math.floor(random(points.length))];
  randomPoint = randomPoint.add(randomCorner).mul(0.5);
  point(randomPoint.x, randomPoint.y);
}
}