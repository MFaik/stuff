var objects = [];
const fps = 180;
var width, height;
var fpsColor;
const ITERCNT = 1000;
const MINSIZE = 10;
const MENU = 0, GETREADY = 1, PLAYING = 2, END = 3, WIN = 4, LOSE = 5;
let gameState = GETREADY;

let settings = {
    playDuration: 15, 
    maxSpeed: 180,
    maxSize: 20,
    sameColor: false,
    passThrough: false,
    followCnt: 1,
}

function setup() {
    width = innerWidth;
    height = innerHeight;
    createCanvas(width, height);

    textAlign(CENTER);
    textFont("serif");

    for(let i = 0;i < ITERCNT;i++){
        let pos = {x: random(60,width-60), y: random(60, height-60)};
        let maxRadius = min(settings.maxSize, pos.x-30, width-30-pos.x, pos.y-30, height-30-pos.y);
        for(let obj of objects){
            maxRadius = min(maxRadius, dis(obj.position, pos)-obj.radius);
        }
        if(maxRadius >= MINSIZE){
            let col = [random(100,255), random(255), random(155)];
            col.sort(()=>random(10)>5);
            objects.push({position: pos, 
                velocity: {x: random(-settings.maxSpeed/fps, settings.maxSpeed/fps), 
                           y: random(-settings.maxSpeed/fps, settings.maxSpeed/fps)},
                           radius: random(MINSIZE, maxRadius), mass: pow(maxRadius/10, 2),
                           col: settings.sameColor ? color(200) 
                                 : color(...col)});

        }
    }

    frameRate(60);
}

let startTime = 0;
function draw() {
    background(0);
    fill(50);
    rect(30, 30, width-60, height-60);
    
    for(let q = 0;q < fps/60;q++)
        physicsUpdate();

    if(gameState == PLAYING){
        if(Date.now() - startTime > settings.playDuration * 1000){
            gameState = END;
        }
    }
    
    //draw circles
    for(let i = 0;i < objects.length;i++){
        if(i == 31 || gameState == PLAYING || gameState == END)
            fill(objects[i].col);
        else 
            fill(50);
        circle(objects[i].position.x, objects[i].position.y, objects[i].radius*2);
    }
    
    drawUI();
}
function mouseClicked() {
    if(gameState == GETREADY){
        gameState = PLAYING;
        startTime = Date.now();
    } else if(gameState == END) {
        if(isCircleColliding(objects[31], 
            {position: {x: mouseX, y: mouseY}, radius: 0})){
            gameState = WIN;
        } else {
            gameState = LOSE;
        }
    } else if(gameState == WIN || gameState == LOSE){
        location.reload();
    }
}

function drawUI(){
    if(gameState == MENU){
        //add menu
    } else if(gameState == GETREADY){
        let obj = objects[31];
        drawBubble(obj.position.x, obj.position.y, 
            obj.radius, obj.col, "Follow This");
    } else if(gameState == WIN || gameState == LOSE){
        let str = "YOU WIN";
        if(gameState == LOSE){
            str = "YOU LOSE";
        }
        let strColor = color(0, 255, 0);
        if(gameState == LOSE){
            strColor = color(255, 0, 0);
        }

        fill(0);
        textSize(90);
        text(str, width/2, height/2 - 100);
        fill(strColor);
        textSize(80);
        text(str, width/2, height/2 - 100);

        textSize(50);
        fill(255);
        text("Click to Restart", width/2, height/2+textSize()-10);
    }
}
function drawBubble(x, y, dis, col, str){
    let strWidth = textWidth(str) + 20;
    let boxLeft = max(x-strWidth/2, 0);
    let boxRight= boxLeft + strWidth;
    let boxFlip = y < strWidth ? 1 : -1;
    fill(col);
    beginShape();
    vertex(x,        y+(2 +dis)*boxFlip);
    vertex(x-30,     y+(32+dis)*boxFlip);
    vertex(boxLeft,  y+(32+dis)*boxFlip);
    vertex(boxLeft,  y+(92+dis)*boxFlip);
    vertex(boxRight, y+(92+dis)*boxFlip);
    vertex(boxRight, y+(32+dis)*boxFlip);
    vertex(x+30,     y+(32+dis)*boxFlip);
    vertex(x,        y+(2 +dis)*boxFlip);
    endShape();
    fill(0);
    textSize(30);
    if(boxFlip == -1)
        text(str, boxLeft + strWidth/2, y - (55+dis));
    else 
        text(str, boxLeft + strWidth/2, y + 75+dis);
}



function isCircleColliding(a, b) {
    return dis(a.position, b.position) < (a.radius+b.radius);
}

const gridSize = 64;//can somebody explain why this is 64?
    function physicsUpdate() {
        if(gameState != PLAYING)
            return;
        if(!settings.passThrough)
            gridCheck();

        //apply velocity
        for(let obj of objects){
            wallCheck(obj);
            add(obj.position, obj.velocity);
        }
    }

function gridCheck(){
    let grid = Array(gridSize*gridSize);
    for(let i = 0;i < gridSize*gridSize;i++){
        grid[i] = [];
    }

    let gridLength = max(width,height)/gridSize;
    for(let i = 0;i < objects.length;i++){
        let pos = objects[i].position;
        let rad = objects[i].radius;
        for(let x = floor((pos.x-rad)/gridLength);x <= floor((pos.x+rad)/gridLength);x++){
            for(let y = floor((pos.y-rad)/gridLength);y <= floor((pos.y+rad)/gridLength);y++){
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
}

function wallCheck(obj) {
    //constraints check
    if(obj.position.x < 30+obj.radius){
        if(obj.velocity.x < 0)obj.velocity.x *= -1;
        obj.position.x = 30+obj.radius;
    } else if(obj.position.x > width-30-obj.radius){
        if(obj.velocity.x > 0)obj.velocity.x *= -1;
        obj.position.x = width-30-obj.radius; 
    }
    if(obj.position.y < 30+obj.radius){
        if(obj.velocity.y < 0)obj.velocity.y *= -1;
        obj.position.y = 30+obj.radius;
    } else if(obj.position.y > height-30-obj.radius){
        if(obj.velocity.y > 0)obj.velocity.y *= -1;
        obj.position.y = height-30-obj.radius;
    }
}

let perp = {x: 10, y: 10}, bPerp = {x: 10, y: 10};
function circleResolveCollisionDiscrete(a, b) {
    //check for collision
    if(dis(a.position, b.position) < a.radius+b.radius){
        perp.x = b.position.x;perp.y = b.position.y;
        sub(perp, a.position);
        normalize(perp);       

        let v1 = dot(a.velocity, perp);
        let v2 = dot(b.velocity, perp);
        let m1 = a.mass;
        let m2 = b.mass;
        let aNew = (v1*(m1-m2)+2*m2*v2)/(m1+m2);
        let bNew = (v2*(m2-m1)+2*m1*v1)/(m1+m2);
        if(aNew > 0)aNew *= -1;
        if(bNew < 0)bNew *= -1;

        bPerp.x = perp.x;bPerp.y = perp.y;
        mul(bPerp, bNew-v2);
        mul(perp, aNew-v1);
        add(a.velocity, perp);
        add(b.velocity, bPerp);
    }
}
