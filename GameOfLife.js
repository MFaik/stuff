let createGrid = (gridWidth, gridHeight) => ({
  width: gridWidth,
  height: gridHeight,
  cells: Array.from(Array(gridWidth),x => Array(gridHeight)),
  oldCells: Array.from(Array(gridWidth),x => Array(gridHeight)),
  update() {
    for(let y = 0;y < this.height;y++){
      for(let x = 0;x < this.width;x++)
        this.oldCells[x][y] = this.cells[x][y];
    }
  },
  get(x,y) { 
    return this.oldCells[(x+this.width)%this.width][(y+this.height)%this.height];
  },
  set(x,y) { 
    if(!this.cells[(x+this.width)%this.width][(y+this.height)%this.height]){
      let currentTime = millis();
      this.cells[(x+this.width)%this.width][(y+this.height)%this.height] = currentTime;
      fill(currentTime/100%360,100,100);
      rect(((x+this.width)%this.width) * cellWidth, ((y+this.height)%this.height) * cellHeight, cellWidth, cellHeight);
    }
  },
  unset(x,y) { 
    if(this.cells[(x+this.width)%this.width][(y+this.height)%this.height]){
      this.cells[(x+this.width)%this.width][(y+this.height)%this.height] = false; 
      fill(0);
      rect(((x+this.width)%this.width) * cellWidth, ((y+this.height)%this.height) * cellHeight, cellWidth, cellHeight);
    }
  },
  redraw() {
    for(let y = 0;y < grid.height;y++){
      for(let x = 0;x < grid.width;x++){  
        if(grid.get(x,y))
          fill(grid.get(x,y)/100%360,100,100);
        else
          fill(0);
        rect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
    }
  }
})

let grid;
let cellWidth = 10,cellHeight = 10;

let lastDraw;
let stopped = false;
let started = false;

function setup() {
  colorMode(HSB);
  
  createCanvas(window.innerWidth, window.innerHeight);
  background(0);

  frameRate(30);

  grid = createGrid(ceil(window.innerWidth/cellWidth), ceil(window.innerHeight/cellHeight));
  
  grid.cells = Array.from(Array(grid.width),x => Array(grid.height));
  
  grid.update();

  fill(255);
  textSize(20);
  let msg = 'Press any button to pause and draw';
  text(msg,grid.width*cellWidth/2 - textWidth(msg)/2,grid.height*cellHeight/2);
}

function draw() {
  if(mouseIsPressed && stopped){
    let gridPosX = int(mouseX*grid.width/width)
    let gridPosY = int(mouseY*grid.height/height);
    grid.set(gridPosX,gridPosY);
    if(!started){
      started = true;
      grid.redraw();
    }
  }

  if(millis()-80 < lastDraw){
    return;
  } else 
    lastDraw = millis();
  
  for(let y = 0;y < grid.height;y++){
    for(let x = 0;x < grid.width;x++){        
      if(!stopped){
        let neighbour = 0;
        for(let yOffset of [-1,0,1])
          for(let xOffset of [-1,0,1])
            if(xOffset != 0 || yOffset != 0)
              if(grid.get(x+xOffset,y+yOffset))
                neighbour++;

        if(neighbour == 3 || (neighbour == 2 && grid.get(x,y))){
          grid.set(x,y);
        } else {
          grid.unset(x,y);
        }
      }
    }
  }

  grid.update();
}

function keyPressed() {
  if(true || keyCode == 'p'.charCodeAt(0)){
    if(stopped){
      stroke(0);
      grid.redraw();
      stopped = false;
    } else {
      stroke(30);
      grid.redraw();
      stopped = true;
    }
  }
}