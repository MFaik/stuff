let cellSize = 10;

let width = window.innerWidth;
let height = window.innerHeight;
let grid = [];
let oldGrid = [];
let gridWidth,gridHeight;
let idx;

let currentTile = 1;
const EMPTY = undefined, GROUND = 1, SAND = 2, WATER = 3, GAS = 4, UPWATER = 998,RIGHTWATER = 999;

let tileColors = []

function setup() {
    gridWidth = floor(width/cellSize);
    gridHeight = floor(height/cellSize);
    idx = (x, y) => x+y*gridWidth;
    tileColors = [
        color(60),//bg
        color(255,255,255),//ground
        color(140,140,60),//sand
        color(100, 100, 255),//water
        color(10, 40, 11),//gas
    ]
    tileColors[undefined] = tileColors[0];
    noStroke();
    createCanvas(width, height);
    background(60);
    frameRate(-1);
}

function keyPressed() {
    if(keyCode == 48)
        currentTile = undefined;
    else if(keyCode > 48 && keyCode < 52) {//Excludes GAS
        currentTile = keyCode&15;
    }
}

function mouse() {
    let x = floor(mouseX/cellSize), y = floor(mouseY/cellSize);
    if(x >= width || y >= height)
        return;
    grid[idx(x,y)] = currentTile;
}

let totalTime = 0;
function draw() {
    if(mouseIsPressed)
        mouse();

    //totalTime += deltaTime;
    //if(totalTime < 0.2)
    //    return;
    //totalTime = 0;

    for(let x = 0;x < gridWidth;x++) {
        if(grid[idx(x, gridHeight-1)] != EMPTY 
            && grid[idx(x, gridHeight-1)] != GROUND) {
            grid[idx(x,gridHeight-1)] = EMPTY;
        }
    }
    for(let y = gridHeight-2;y >= 0;y--) {
        for(let x = 0;x < gridWidth;x++) {
            //SAND--------------------------------------------------------------
            if(grid[idx(x,y)] == EMPTY)
                continue;
            if(grid[idx(x, y)] == SAND) {
                if(grid[idx(x, y+1)] == GROUND)
                    continue;
                for(let add of [0, -1, 1]) {
                    if(x+add < 0 || x+add >= gridWidth)
                        continue;
                    if(add == 1 && grid[idx(x+1,y)] == SAND)
                        continue;
                    if(grid[idx(x+add,y+1)] == EMPTY) {
                        grid[idx(x,y)] = EMPTY;
                        grid[idx(x+add,y+1)] = SAND;
                        break;
                    } else if(grid[idx(x+add,y+1)] == WATER) {
                        grid[idx(x,y)] = UPWATER;
                        grid[idx(x+add,y+1)] = SAND;
                        break;
                    }
                }
            }
            //WATER-------------------------------------------------------------
            if(grid[idx(x, y)] == WATER) {
                if(grid[idx(x, y+1)] != EMPTY) {
                    for(let add of random() < 0.5 ? [-1,1] : [1,-1]) {
                        if(x+add < 0 || x+add >= gridWidth)
                            continue;
                        if(grid[idx(x+add,y)] == EMPTY) {
                            grid[idx(x,y)] = EMPTY;
                            grid[idx(x+add,y)] = add == -1 ? WATER : RIGHTWATER;
                            break;
                        }
                    }
                } else {
                    grid[idx(x,y)] = EMPTY;
                    grid[idx(x, y+1)] = WATER;
                }            
            }
            if(grid[idx(x, y)] == RIGHTWATER) {
                grid[idx(x,y)] = WATER;
            }
            //GAS---------------------------------------------------------------
            //if(grid[idx(x, y)] == GAS) {
                
            //}
        }
    }
    for(let i = 0;i < gridWidth*gridHeight;i++) {
        if(grid[i] == UPWATER)
            grid[i] = WATER;
    }
    let lastTile = -1; 
    for(let x = 0;x < gridWidth;x++) {
        for(let y = 0;y < gridHeight;y++) {
            if(grid[idx(x,y)] === oldGrid[idx(x,y)])
                continue;
            if(lastTile !== grid[idx(x,y)])
                fill(tileColors[grid[idx(x,y)]]);
            rect(x*cellSize, y*cellSize, cellSize, cellSize);
            lastTile = grid[idx(x,y)];
        }
    }
    oldGrid = grid.slice();
}
