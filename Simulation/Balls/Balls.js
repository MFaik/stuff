var objects = [];
const fps = 240;
var width, height;
var fpsColor;

function setup() {
    width = innerWidth;
    height = innerHeight;
    createCanvas(width, height);

    for(let i = 0;i < GET["iterCnt"];i++){
        let pos = createVector(random(60,width-60), random(60, height-60));
        let maxRadius = min(GET["maxSize"], pos.x-30, width-30-pos.x, pos.y-30, height-30-pos.y);
        for(let obj of objects){
            maxRadius = min(maxRadius, p5.Vector.sub(obj.position, pos).mag()-obj.radius);
        }
        if(maxRadius >= GET["minSize"]){
            objects.push({position: pos, velocity: createVector(random(100), random(100)),
                radius: random(GET["minSize"], maxRadius), mass: pow(maxRadius/10, 2),
                col: color(random(10, 255), random(10, 255), random(10, 255))});
        }
    }

    fpsColor = color(random(100,255), random(100,255), random(100,255));
    frameRate(60);
}

let simulationStartTime, simulationEndTime;
function draw() {
    background(0);
    fill(50);
    rect(30, 30, width-60, height-60);

    simulationStartTime = Date.now();
    for(let i = 0;i < fps/60;i++){
        switch(GET["alg"]){
            case 1: naiveCollisionCheck();
                break;
            case 2: sweepLineCollisionCheck();
                break;
            case 3: gridCollisionCheck();
        }
    }
    frameCnt++
    simulationEndTime = Date.now();

    //draw
    for(let obj of objects){
        fill(obj.col);
        circle(obj.position.x, obj.position.y, obj.radius*2);
    }

    showFPS();
}

let frames = 0, frameCnt = 0, low = 0;
let framesStr = "", lowStr = "";
function showFPS() {
    if(frameCnt >= 10){    
        framesStr = (frames/frameCnt).toPrecision(5) + " ms average";
        lowStr = low.toPrecision(5) + " ms low";
        frameCnt = 0;
        frames = 0;
        low = 0;
    } else {
        frameCnt++;
        frames += simulationEndTime-simulationStartTime;
        low = max(simulationEndTime-simulationStartTime, low);
    }
    
    fill(fpsColor);
    stroke(fpsColor);
    text(framesStr, 30, 10);
    text(lowStr, 30, 20);
    text(objects.length + " balls :flushed:", 30, 30);
    for(let i = 0;i <= 100;i += 10){
        line(0, i, 30, i);
    }
    text("OwO", 0, frameRate());
    stroke(0);
}
//====================
    //Broad optimisisation
//====================
function isCircleColliding(a, b) {
    return (a.position.x - b.position.x)*(a.position.x - b.position.x) + 
        (a.position.y - b.position.y)*(a.position.y - b.position.y) <
        (a.radius+b.radius)*(a.radius+b.radius);
}

function naiveCollisionCheck() {
    for(let obj of objects) {
        //constraints check
        wallCheck(obj);
        //check collisions
        for(let obj2 of objects) {
            if(obj != obj2){
                if(isCircleColliding(obj, obj2))
                    circleResolveCollisionDiscrete(obj, obj2);     
            }
        }
        //apply velocity
        obj.position.add(p5.Vector.div(obj.velocity,fps));
    }
}

function sweepLineCollisionCheck() {
    let points = [];
    let balls = [];
    for(let i = 0;i < objects.length;i++){
        points.push({pos: objects[i].position.x-objects[i].radius, i: i});
        points.push({pos: objects[i].position.x+objects[i].radius, i:-i});
    }
    sort(points);
    for(let p of points){
        if(p.i > 0){
            for(let i of balls){
                if(i != -1)
                    if(isCircleColliding(objects[i], objects[p.i]))
                        circleResolveCollisionDiscrete(objects[i], objects[p.i]);
            }
            balls.push(p.i);
        } else {
            balls.splice(-p.i, 1);
        }
    }

    //apply velocity
    for(let obj of objects){
        wallCheck(obj);
        obj.position.add(p5.Vector.div(obj.velocity,fps));
    }
}

const gridSize = 128;//can somebody explain why this is 128?
function gridCollisionCheck() {
    let grid = Array(gridSize*gridSize);
    for(let i = 0;i < gridSize*gridSize;i++){
        grid[i] = [];
    }

    let gridLength = max(width,height)/gridSize;
    for(let i = 0;i < objects.length;i++){
        let posx = objects[i].position.x, posy = objects[i].position.y;
        let rad = objects[i].radius;
        for(let x = floor((posx-rad)/gridLength);x <= floor((posx+rad)/gridLength);x++){
            for(let y = floor((posy-rad)/gridLength);y <= floor((posy+rad)/gridLength);y++){
                grid[x+gridSize*y].push(i);
            }
        }
    }

    for(let i = 0;i < grid.length;i++){
        for(let j = 0;j < grid[i].length;j++)
            for(let k = j+1;k < grid[i].length;k++){
                if(isCircleColliding(objects[grid[i][j]], objects[grid[i][k]]))
                    circleResolveCollisionDiscrete(objects[grid[i][j]], objects[grid[i][k]]);
            }
    }

    //apply velocity
    for(let obj of objects){
        wallCheck(obj);
        obj.position.add(p5.Vector.div(obj.velocity,fps));
    }
}
//====================
    //Collision resolving
//====================
function wallCheck(obj) {
    //constraints check
    if(obj.position.x < 30+obj.radius){
        if(obj.velocity.x < 0)obj.velocity.mult(createVector(-1,1));
        obj.position.x = 30+obj.radius;
    } else if(obj.position.x > width-30-obj.radius){
        if(obj.velocity.x > 0)obj.velocity.mult(createVector(-1,1));
        obj.position.x = width-30-obj.radius; 
    }
    if(obj.position.y < 30+obj.radius){
        if(obj.velocity.y < 0)obj.velocity.mult(createVector(1,-1));
        obj.position.y = 30+obj.radius;
    } else if(obj.position.y > height-30-obj.radius){
        if(obj.velocity.y > 0)obj.velocity.mult(createVector(1,-1));
        obj.position.y = height-30-obj.radius;
    }
}

function circleResolveCollisionDiscrete(a, b) {
    //check for collision
    let dis = p5.Vector.sub(b.position,a.position);
    if(dis.mag() < a.radius+b.radius){
        dis.normalize();
        let v1 = a.velocity.dot(dis);
        let v2 = b.velocity.dot(dis);
        let m1 = a.mass;
        let m2 = b.mass;
        let aNew = (v1*(m1-m2)+2*m2*v2)/(m1+m2);
        let bNew = (v2*(m2-m1)+2*m1*v1)/(m1+m2);
        if(aNew > 0)aNew *= -1;
        if(bNew < 0)bNew *= -1;

        let aPerp = p5.Vector.mult(dis, aNew-v1);
        let bPerp = p5.Vector.mult(dis, bNew-v2);
        a.velocity.add(aPerp);
        b.velocity.add(bPerp);
    }
}
