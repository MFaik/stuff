let hexLen = 20;
let hexHeight =  hexLen/2*1.732;
let tiles = {}

function setup() {
  angleMode(DEGREES);
  colorMode(RGB, 255);
  createCanvas(window.innerWidth, window.innerHeight);
  background(255);
  for(let x = 0;x < (window.innerWidth+100)/(3*hexLen/2);x++){
    for(let y = 0;y < (window.innerHeight+100)/(hexHeight*2);y++){
      drawHex(x, y, color(255,255,255), color(0,0,0));
    }
  }
}

function mousePressed() {
  let magic = (-abs(-2*(mouseY/hexHeight % 2)+2)+1)*(hexLen/4)*pow(-1, floor(mouseX/(3*hexLen/2)));
  let x = floor((mouseX+magic+(3*hexLen/4)) / (3*hexLen/2));
  let y = floor((mouseY+hexHeight*((x+1)%2))/(2*hexHeight));
  // console.log("(" + x + ", " + y + ")");
  if(!tiles[[x,y]]){
    drawHex(x, y, color(0, 0, 0), color(255, 255, 255));
    tiles[[x,y]] = true;
  } else {
    drawHex(x, y, color(255, 255, 255), color(0, 0, 0));
    tiles[[x,y]] = false;
  }
}

function drawHex(x, y, fillColor, strokeColor) {
  beginShape();
  fill(fillColor);
  stroke(strokeColor);
  x = x*3*hexLen/2;
  y = y*hexHeight*2 + hexHeight*(floor(x/(3*hexLen/2))%2);
  vertex(x-hexLen/2, y-hexHeight);
  vertex(x+hexLen/2, y-hexHeight);
  vertex(x+hexLen, y);
  vertex(x+hexLen/2, y+hexHeight);
  vertex(x-hexLen/2, y+hexHeight);
  vertex(x-hexLen, y);
  endShape();
}
