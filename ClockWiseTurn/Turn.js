const cellSize = 10;

const width = window.innerWidth;
const height = window.innerHeight;
let grid = [];
let oldGrid = [];
let gridWidth,gridHeight;
let idx;

const slowFrameDuration = 100, normalFrameDuration = 20, fastFrameDuration = 0;
let frameDurationMS = normalFrameDuration;
let playing = true;
let playPNG, pausePNG, slowPNG, normalPNG, fastPNG, stepPNG;

const tileCount = 4;
let currentTile = 1;
const EMPTY = 0, LEFT = 1, UP = 2, RIGHT = 3, DOWN = 4;

let tileColors = [];

function preload() {
    playPNG = loadImage("data/play.png");
    pausePNG = loadImage("data/pause.png");
    slowPNG = loadImage("data/slow.png");
    normalPNG = loadImage("data/normal.png");
    fastPNG = loadImage("data/fast.png");
    stepPNG = loadImage("data/step.png");
}

function setup() {
    imageMode(CENTER);
    playPNG.resize(30,0);
    pausePNG.resize(30,0);
    slowPNG.resize(40,0);
    normalPNG.resize(40,0)
    fastPNG.resize(40,0);
    stepPNG.resize(30,0);

    gridWidth = floor(width/cellSize);
    gridHeight = floor(height/cellSize);
    idx = (x, y) => x+y*gridWidth;
            createCanvas(width, height);
    for(let i = 0;i < gridWidth*gridHeight;i++){
        grid[i] = EMPTY;
    }

    noStroke();
    background(60);
    tileColors = [
        color(60),//bg
        color(255, 0, 0),//ground
        color(255,255,255),//sand
        color(0, 255, 0),//water
        color(0, 0, 255),//gas
    ];
    
    frameRate(-1);
}

function keyPressed() {
    if(keyCode >= 48 && keyCode < 48+tileCount) {
        currentTile = keyCode&15;
    } else if(keyCode == 32) {//Space
        playing = !playing;
    } else if(keyCode == 83) {//s
        if(!playing)
            simulate();
    }
}

let lastMouseX = -1, lastMouseY = -1;
function mouse(click) {
    let x = floor(mouseX/cellSize), y = floor(mouseY/cellSize);
    if(x >= gridWidth || y >= gridHeight-100/cellSize) {
        //Select Tile
        if(mouseX % 70 > 20 && mouseY > height-65 && mouseY < height-15){
            let button = floor(mouseX/70)
            if(button < tileCount)
                currentTile = button; 
            else if(click) {
                switch(button-tileCount) {
                    case 0://Step
                        if(!playing)
                            simulate();
                        break;
                    case 1://Slow
                        frameDurationMS = slowFrameDuration;
                        break;
                    case 2://Normal
                        frameDurationMS = normalFrameDuration;
                        break;
                    case 3://Fast
                        frameDurationMS = fastFrameDuration;
                        break;
                    case 4://Play
                        playing = !playing;
                        break;
                }
            }
        }
        
        lastMouseX = -1;
        lastMouseY = -1;
    } else {
        let tile = currentTile ? currentTile : EMPTY;
        if(click || lastMouseX == -1 || (x-lastMouseX == 0 && y-lastMouseY == 0)){
            grid[idx(x,y)] = tile;
        } else {
            let xInc, yInc;
            if(abs(x-lastMouseX) > abs(y-lastMouseY)) {
                xInc = x > lastMouseX ? 1 : -1;
                yInc = (y-lastMouseY)/abs(x-lastMouseX); 
            } else {
                yInc = y > lastMouseY ? 1 : -1;
                xInc = (x-lastMouseX)/abs(y-lastMouseY); 
            }
            for(;abs(x-lastMouseX) > 0.001 || abs(y-lastMouseY) > 0.001;lastMouseX += xInc,lastMouseY += yInc){
               grid[idx(floor(lastMouseX),floor(lastMouseY))] = tile;
            }
        }
        lastMouseX = x;
        lastMouseY = y;
    }
}

let totalTime = 0;
let click = true;
function draw() {
    if(mouseIsPressed) {
        mouse(click);
        click = false;
    } else {
        click = true;
    }

    if(playing){
        if(totalTime >= frameDurationMS){
            simulate();
            totalTime = 0;
        } else {
            totalTime += deltaTime;
        }
    }
    drawGrid();
    UI();
}

function UI() {
    fill(0, 0, 0, 190);
    rect(0,height-100,width,100);
    let bid;
    for(bid = 0;bid < tileCount;bid++) {
        fill(255);
        text(bid, 40+bid*70, height-80);
        if(currentTile == bid){
            fill(180,200,200);
            rect(15+bid*70, height-70, 60, 60)
        }
        fill(tileColors[bid]);        
        rect(20+bid*70, height-65, 50, 50);
    }

    fill(120);
    for(i = tileCount;i < tileCount+5;i++){
        rect(20+i*70, height-65, 50, 50);
    }
    fill(255); 
    text("Step", 32+bid*70, height-80);
    fill(120);
    rect(20+bid*70, height-65, 50, 50);
    image(stepPNG, 45+bid*70, height-40);
    bid++;

    fill(255);
    text("Slow", 32+bid*70, height-80)
    if(frameDurationMS == slowFrameDuration){
        fill(180, 200, 200);
        rect(15+bid*70, height-70, 60, 60)
    } else {
        fill(120);
        rect(20+bid*70, height-65, 50, 50);
    }
    image(slowPNG, 45+bid*70, height-40);
    bid++;

    fill(255);
    text("Normal", 23+bid*70, height-80)
    if(frameDurationMS == normalFrameDuration){
        fill(180, 200, 200);
        rect(15+bid*70, height-70, 60, 60)
    } else {
        fill(120);
        rect(20+bid*70, height-65, 50, 50);
    }
    image(normalPNG, 45+bid*70, height-40);
    bid++;

    fill(255);
    text("Fast", 33+bid*70, height-80)
    if(frameDurationMS == fastFrameDuration){
        fill(180, 200, 200);
        rect(15+bid*70, height-70, 60, 60)
    } else {
        fill(120);
        rect(20+bid*70, height-65, 50, 50);
    }
    image(fastPNG, 45+bid*70, height-40);
    bid++;

    fill(255);
    text(playing ? "Pause" : " Start", 28+bid*70, height-80);
    if(!playing){
        fill(180, 200, 200);
        rect(15+bid*70, height-70, 60, 60)
    } else {
        fill(120);
        rect(20+bid*70, height-65, 50, 50);
    }
    image(playing ? pausePNG : playPNG , 45+bid*70, height-40);
}

function simulate() {
    for(let )
}

function drawGrid() {
    let lastTile = -1; 
    for(let x = 0;x < gridWidth;x++) {
        for(let y = 0;y < gridHeight;y++) {
            if(lastTile !== grid[idx(x,y)])
                fill(tileColors[grid[idx(x,y)]]);
            rect(x*cellSize, y*cellSize, cellSize, cellSize);
            lastTile = grid[idx(x,y)];
        }
    }
}
