let realTime = () => deltaTime/1000;

class Rectangle{
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.color = color;
        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = 0;
    }

    tick(){
        this.velocityY += this.gravity*realTime();

        this.x += this.velocityX*realTime();
        this.y += this.velocityY*realTime();
    }
    
    draw() {
        push();
        
        fill(this.color);
        rect(this.x, this.y, this.width, this.height);
        
        pop();
    }
}