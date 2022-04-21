let realTime = () => deltaTime/1000;

let jumpButton,keke,groundLeft,groundRight;
function setup() {
    colorMode(HSB);
    createCanvas(window.innerWidth-20, window.innerHeight-20);

    groundLeft  = new Rectangle(0      ,2*height/3    ,width  ,height/2,80);
    groundRight = new Rectangle(width/3,2*height/3    ,width/3,height/2,0 );
    keke        = new Rectangle(width/6,2*height/3-100,50     ,100     ,color(100,100,100));
    
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


    }

}

function draw() {
    background(0);

    jumpButton.draw();

    groundLeft.draw();
    groundRight.draw();

    keke.tick();
    keke.draw();
}