let jumpButton,nextButton,keke,ground,groundGap,jumped,won,count = -1,countFinished;
let gameOverTexts = [
    "Really nice","That was awesome","You are pretty good at this","You are getting better","Incredible",
    "We knew you could do it","Congratulations","How are you this good?"
]
function setup() {
    colorMode(HSB);
    createCanvas(window.innerWidth-20, window.innerHeight-20);

    ground    = new Rectangle(0      ,2*height/3    ,width  ,height/2,80);
    groundGap = new Rectangle(width/3,2*height/3    ,width/12,height/2,0 );
    keke      = new Rectangle(width/6,2*height/3-100,50     ,100     ,color(100,100,100));
    
    jumpButton = new Clickable();
    jumpButton.resize(200,100);
    jumpButton.textSize = 30;
    jumpButton.strokeWeight = 0;
    jumpButton.cornerRadius = 0;
    jumpButton.locate(width/6-75,height/6); 
    jumpButton.text = "Jump";
    jumpButton.onPress = ()=>{
        jumpButton.color = "#DDDDDD";
    }
    jumpButton.onRelease = ()=>{
        jumpButton.color = "#FFFFFF";

        if(!jumped){
            jumped = true;

            let jumpTime = (1+sqrt(9-2*height/1500))/2;
            keke.velocityX = width/2/jumpTime; 
            console.log(jumpTime,width/3/jumpTime);
            keke.velocityY = -500;
            keke.gravity = 500;   
        }
    }

    nextButton = new Clickable();
    nextButton.resize(200,100);
    nextButton.textSize = 30;
    nextButton.strokeWeight = 0;
    nextButton.cornerRadius = 0;
    nextButton.locate(width/2-100,2*height/3+50); 
    nextButton.text = "Next Level";
    nextButton.onPress = ()=>{
        nextButton.color = "#DDDDDD";
    }
    nextButton.onRelease = ()=>{
        nextButton.color = "#FFFFFF";

        keke = new Rectangle(width/6,2*height/3-100,50,100,color(100,100,100));
        won = false;
        jumped = false;
    }
}

function draw() {
    background(0);
    
    if(!won){
        jumpButton.draw();
    }

    ground.draw();
    groundGap.draw();

    keke.tick();
    if(jumped && keke.y > 2*height/3-100){
        keke.y = 2*height/3-100;
        keke.gravity = 0;
        keke.velocityY = 0;
        won = true;
        if(count < gameOverTexts.length-1 && !countFinished)
            count++;
        else {
            countFinished = true;
            count = floor(random(gameOverTexts.length));
        }
    }
    keke.draw();
    
    if(won){
        fill(100);
        textSize(100);
        textAlign(CENTER, CENTER);

        text("You Won",width/2, height/3);
        textSize(40);
        text(gameOverTexts[count],width/2,height/3+150);

        nextButton.draw();
    }
}