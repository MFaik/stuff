let gridWidth = 80,gridHeight = 80;
let grid = {
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
    if(!this.cells[(x+this.width)%this.width][(y+this.height)%this.height])
      this.cells[(x+this.width)%this.width][(y+this.height)%this.height] = millis(); 
  },
  unset(x,y) { 
    this.cells[(x+this.width)%this.width][(y+this.height)%this.height] = false; 
  },
}

let cellWidth,cellHeight;

let isStopped = false;

function setup() {
  colorMode(HSB);
  
  createCanvas(gridWidth*10, gridHeight*10);
  frameRate(30);
  stroke(30);
  
  cellWidth = width/grid.width;
  cellHeight = height/grid.height;
  
  grid.cells = Array.from(Array(grid.width),x => Array(grid.height));
  
  grid.update();
}

function draw() {
  background(0);
  
  if(isStopped)
    stroke(30);
  else
    stroke(0);
  
  for(let y = 0;y < grid.height;y++){
    for(let x = 0;x < grid.width;x++){  
      if(grid.get(x,y))
        fill(grid.get(x,y)/100%360,100,100);
      else
        fill(0);
      rect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      
      if(!isStopped){
        let neighbour = 0;
        for(let yOffset of [-1,0,1])
          for(let xOffset of [-1,0,1])
            if(xOffset != 0 || yOffset != 0)
              if(grid.get(x+xOffset,y+yOffset))
                neighbour++;

        if(neighbour == 3 || (neighbour == 2 && grid.get(x,y)))
          grid.set(x,y);
        else
          grid.unset(x,y);
      }
    }
  }
  if(mouseIsPressed && isStopped){
    let gridPosX = int(mouseX*grid.width/width)
    let gridPosY = int(mouseY*grid.height/height);
    grid.set(gridPosX,gridPosY);
  }
  
  grid.update();
}

function keyPressed() {
  if(true || keyCode == 'p'.charCodeAt(0)){
    isStopped = !isStopped;
    grid.update();
  }
}