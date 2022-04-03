let x,y;

let stepSize = 5;
let currentNumber = 1;
let maxStep = 1;
let currentStep = 0;
let changeMaxStep = false;
let direction = 0;

let primes = [];

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  x = (width/2)/stepSize;
  y = (height/2)/stepSize;
  background(0);
  frameRate(-1);
}

function draw() {
  fill(255);
  
  let sqrRoot = sqrt(currentNumber);
  while(true){
    nextNumber();
    
    let divisor;
    for(let i = 0;i < primes.length && primes[i] <= sqrRoot;i++){
      if(currentNumber % primes[i] == 0){
        divisor = primes[i];
        break;
      }
    }

    
    if(x*stepSize > window.innerWidth){
      frameRate(0);
      break;
    }
    
    if(!divisor){
      primes.push(currentNumber);
      rect(x*stepSize,y*stepSize,stepSize-1,stepSize-1);
      break;
    }
  }
}

function nextNumber(){
  currentNumber++;
  switch(direction) {
    case 0:
      x++;
      break;
    case 1:
      y--;
      break;
    case 2:
      x--;
      break;
    case 3:
      y++;
      break;
  }
  currentStep++;
  if(currentStep >= maxStep){
    direction = (direction+1)%4;
    currentStep = 0;
    
    if(changeMaxStep){
      changeMaxStep = false;
      maxStep++;
    } else {
      changeMaxStep = true;
    }
  }  
}