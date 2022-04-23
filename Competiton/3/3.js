let jumpButton,retryButton,keke,ground,groundGap,count = -1;
let gameOverTexts = [
    "Don't give up!","You can do this","You are getting better","You can do it if you try again",
    "Believe in yourself","You are going to succeed","All you need is a little determination"
]
function setup() {
    colorMode(HSB);
    createCanvas(window.innerWidth-20, window.innerHeight-20);

    ground    = new Rectangle(0      ,2*height/3    ,width  ,height/2,80);
    groundGap = new Rectangle(width/3,2*height/3    ,width/3,height/2,0 );
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

        if(keke.gravity == 0){
            let jumpTime = (1+sqrt(9-2*height/1500))/2;
            keke.velocityX = width/3/jumpTime; 
            console.log(jumpTime,width/3/jumpTime);
            keke.velocityY = -500;
            keke.gravity = 500;

            count++;
            if(count >= gameOverTexts.length){
                count = floor(random(gameOverTexts.length));
            }
        }
    }

    retryButton = new Clickable();
    retryButton.resize(200,100);
    retryButton.textSize = 30;
    retryButton.strokeWeight = 0;
    retryButton.cornerRadius = 0;
    retryButton.locate(width/2-100,2*height/3); 
    retryButton.text = "Retry";
    retryButton.onPress = ()=>{
        retryButton.color = "#DDDDDD";
    }
    retryButton.onRelease = ()=>{
        retryButton.color = "#FFFFFF";

        //keke = new Rectangle(width/6,2*height/3-100,50,100,color(100,100,100));
    }
}

function draw() {
    background(0);
    if(keke.y < height){
        jumpButton.draw();

        ground.draw();
        groundGap.draw();

        keke.tick();
        keke.draw();
    } else {
        fill(100);
        textSize(100);
        textAlign(CENTER, CENTER);

        text("Game Over",width/2, height/3);
        textSize(40);
        text(gameOverTexts[count],width/2,height/3+150);

        retryButton.draw();
    }
}