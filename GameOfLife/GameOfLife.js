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
  getNew(x,y) {
    return this.cells[(x+this.width)%this.width][(y+this.height)%this.height];
  },
  set(x,y) { 
    if(!this.cells[(x+this.width)%this.width][(y+this.height)%this.height]){
      this.cells[(x+this.width)%this.width][(y+this.height)%this.height] = lastDraw;
    }
  },
  unset(x,y) { 
    if(this.cells[(x+this.width)%this.width][(y+this.height)%this.height]){
      this.cells[(x+this.width)%this.width][(y+this.height)%this.height] = false; 
    }
  },
  redraw(x,y) {
    for(let y = 0;y < grid.height;y++){
      for(let x = 0;x < grid.width;x++){
        if(grid.get(x,y)){
          fill(grid.getNew(x,y)/100%360,100,100);
          rect(((x+this.width)%this.width) * cellWidth, ((y+this.height)%this.height) * cellHeight, cellWidth, cellHeight);
        } else {
          fill(0);
          rect(((x+this.width)%this.width) * cellWidth, ((y+this.height)%this.height) * cellHeight, cellWidth, cellHeight);
        }
      }
    }
  }
})

let grid;
let cellWidth = 10,cellHeight = 10;

let initRand = .5;

let fps = 30;
let fpsMax = 120;
let fpsMin = 5;

let lastDraw;
let stopped = false;

function setup() {
  colorMode(HSB);
  
  createCanvas(window.innerWidth, window.innerHeight);
  background(0);

  frameRate(30);

  grid = createGrid(ceil(window.innerWidth/cellWidth), ceil(window.innerHeight/cellHeight));
  
  grid.cells = Array.from(Array(grid.width),x => Array(grid.height));
  
  grid.update();

  let msg1 = 'Press p to pause and draw';
  let msg2 = 'Press r to get random board';
  let msg3 = 'Press c to clear the board';
  let msg4 = 'Use arrow keys to change fps';
  fill(255);
  textSize(20);
  text(msg1+'\n'+msg2+'\n'+msg3+'\n'+msg4,grid.width*cellWidth/2 - textWidth(msg4)/2,grid.height*cellHeight/2 - 20);
}

function draw() {
  if(mouseIsPressed && stopped){
    let gridPosX = int(mouseX*grid.width/width)
    let gridPosY = int(mouseY*grid.height/height);
    grid.set(gridPosX,gridPosY);
  }

  lastDraw = millis();
  
  for(let y = 0;y < grid.height;y++){
    for(let x = 0;x < grid.width;x++){       
      if(!stopped){
        let neighbour = 0;
        for(let yOffset = -1;yOffset <= 1;yOffset++)
          for(let xOffset = -1;xOffset <= 1;xOffset++)
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

  for(let y = 0;y < grid.height;y++){
    for(let x = 0;x < grid.width;x++){       
      if(grid.cells[x][y] != grid.oldCells[x][y]){ 
        if(grid.getNew(x,y)){
          fill(grid.getNew(x,y)/100%360,100,100);
          rect(((x+this.width)%this.width) * cellWidth, ((y+this.height)%this.height) * cellHeight, cellWidth, cellHeight);
        } else {
          fill(0);
          rect(((x+this.width)%this.width) * cellWidth, ((y+this.height)%this.height) * cellHeight, cellWidth, cellHeight);
        }
      }
    }
  }

  grid.update();
}

function keyPressed() {
  if(key == 'p'){
    if(stopped){
      stroke(0);
      grid.redraw();
      stopped = false;
    } else {
      stroke(30);
      grid.redraw();
      stopped = true;
    }
  } else if(key == 'r'){
    for(let y = 0;y < grid.height;y++){
      for(let x = 0;x < grid.width;x++){       
        if(random(1) > initRand)
          grid.set(x,y);
        else
          grid.unset(x,y);
      }
    }
    grid.update();
    grid.redraw();
  } else if(key == 'c'){
    for(let y = 0;y < grid.height;y++){
      for(let x = 0;x < grid.width;x++){
        grid.unset(x,y);
      }
    }
    grid.update();
    grid.redraw();
  } else if(keyCode == UP_ARROW){
    if(fps < fpsMax)
      fps += 5;
    frameRate(fps);
  } else if(keyCode == DOWN_ARROW){
    if(fps > fpsMin)
      fps -= 5;
    frameRate(fps);
  }
}