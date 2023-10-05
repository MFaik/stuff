let cellSize = 10;

let width = window.innerWidth;
let height= window.innerHeight;
let grid = []
let oldGrid = []
let gridWidth, gridHeight;
var ants = [{x:0, y:0, direction:{x:1,y:0}}]

function setup() {
    createCanvas(width, height);
    gridHeight = floor(height/cellSize);
    gridWidth = floor(width/cellSize);
    ants[0].x = floor(width/2/cellSize);
    ants[0].y = floor(height/2/cellSize);
    ants[0].color = color(255);
    console.log(ants[0]);
    fill(0);
    stroke(40);
    for(let x = 0;x < width - width%cellSize;x += cellSize){
        for(let y = 0;y < height - height%cellSize;y += cellSize){
            rect(x,y,cellSize,cellSize);
        }
    }
    frameRate(-1);
}

function mouseClicked() {
    let clickX = floor(mouseX/cellSize), clickY = floor(mouseY/cellSize);
    if(clickX > gridWidth || clickY > gridHeight)
        return;
    let direction = {x:1, y:0};
    let cnt = random(4);
    for(let i = 0; i < cnt;i++){
        let x = direction.x;
        direction.x = direction.y;
        direction.y = -x;
    }
    ants.push({x:floor(mouseX/cellSize),y:floor(mouseY/cellSize),
        direction, color: color(random(200)+55, random(200)+55, random(200)+55)});
}

function draw() {
    for(ant of ants){
        ant.x = (ant.x + ant.direction.x + gridWidth) % gridWidth;
        ant.y = (ant.y + ant.direction.y + gridHeight) % gridHeight;
        let gridIndex = ant.x*gridWidth+ant.y
        let rot = (oldGrid[gridIndex] ? -1 : 1);
        let x = ant.direction.x;
        ant.direction.x = ant.direction.y*rot;
        ant.direction.y = -x*rot;
        grid[gridIndex] = !grid[gridIndex];

        if(oldGrid[gridIndex]){
            fill(ant.color);
        } else {
            fill(0);
        }
        rect(ant.x*cellSize,ant.y*cellSize,cellSize,cellSize);
    }
    oldGrid = [...grid];
}

