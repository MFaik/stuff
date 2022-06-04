var currentPage = 1;
var maxPage = calculatePage();
function setup() {
	colorMode(HSB);

	createCanvas(window.innerWidth, window.innerHeight);
	
	frameRate(30);
	translate(0,-windowHeight/20);
	noStroke();
}

function draw() {
	
	let fontSize = 35;
	if(windowWidth < 1400)
	fontSize = 21;	
	background(200,50,75);

	push();
		fill(0,0.2);
		textSize(fontSize);
		rotate(radians(-45));
		for(let i = 0;i < 25;i++)
			text("Use arrow keys      ".repeat(20),-windowWidth/2,i*200);
		rotate(radians(90));
		for(let i = 0;i < 25;i++)
			text("Use arrow keys      ".repeat(20),-windowWidth/2,i*200-1500);
	pop();

	fill(30,50,26);
	rect(2*windowWidth/10-20,windowHeight/10-20,6*windowWidth/10+40,8*windowHeight/10+40);
	push();
		fill(100);
		rect(2*windowWidth/10,windowHeight/10,3*windowWidth/10,8*windowHeight/10);
		textSize(fontSize);
		fill(0)
		text(currentPage,2*windowWidth/10+textWidth(currentPage+1)/2,9*windowHeight/10-10);
	pop();
	if(currentPage != maxPage){
		push();
			fill(100);
			rect(5*windowWidth/10,windowHeight/10,3*windowWidth/10,8*windowHeight/10);
			textSize(fontSize);
			fill(0)
			text(currentPage+1,8*windowWidth/10-20-textWidth(currentPage+1),9*windowHeight/10-10);
		pop();
	}
	fill(30,50,26);
	rect(windowWidth/2-5,windowHeight/10-20,10,8*windowHeight/10+40);
	if(currentPage >= 7){
		push();
			fill(0);
			textSize(fontSize);
			translate(3.5*windowWidth/10-0.7*textWidth("Bu Sayfa Bilerek Boş Bırakılmıştır")/2,windowHeight/2+0.7*textWidth("Bu Sayfa Bilerek Boş Bırakılmıştır")/2);
			rotate(radians(-45));
			text("Bu Sayfa Bilerek Boş Bırakılmıştır",0,0);
		pop();
		if(currentPage != maxPage){
			push();
				fill(0);
				textSize(fontSize);
				translate(6.5*windowWidth/10-0.7*textWidth("Bu Sayfa Bilerek Boş Bırakılmıştır")/2,windowHeight/2+0.7*textWidth("Bu Sayfa Bilerek Boş Bırakılmıştır")/2);
				rotate(radians(-45));
				text("Bu Sayfa Bilerek Boş Bırakılmıştır",0,0);
			pop();
		}
	}
	if(currentPage >= 9){
		push();
			fill(0,0,0,.05);
			textSize(fontSize);
			translate(3.5*windowWidth/10+0.7*textWidth("Bu Sayfa Bilerek Boş Bırakılmıştır")/2,windowHeight/2+0.7*textWidth("Bu Sayfa Bilerek Boş Bırakılmıştır")/2);
			rotate(radians(45));
			scale(-1);
			text("Bu Sayfa Bilerek Boş Bırakılmıştır",0,0);
		pop();
	}
	if(currentPage >= 5 && currentPage+1 < maxPage){
		push();
			fill(0,0,0,.05);
			textSize(fontSize);
			translate(6.5*windowWidth/10+0.7*textWidth("Bu Sayfa Bilerek Boş Bırakılmıştır")/2,windowHeight/2+0.7*textWidth("Bu Sayfa Bilerek Boş Bırakılmıştır")/2);
			rotate(radians(45));
			scale(-1);
			text("Bu Sayfa Bilerek Boş Bırakılmıştır",0,0);
			scale(sin(millis()));
		pop();
	}
	push();
		fill(0);
		textSize(fontSize-7);
		if(currentPage == maxPage){
			text("Hayat bitmiştir.",3.5*windowWidth/10-textWidth("Hayat bitmiştir.")/2,9*windowHeight/10-90);
			text("Lütfen cevaplarınızı kontrol ediniz",3.5*windowWidth/10-textWidth("Lütfen cevaplarınızı kontrol ediniz")/2,9*windowHeight/10-50);
		}else if(currentPage+1 == maxPage){
			text("Hayat bitmiştir.",6.5*windowWidth/10-textWidth("Hayat bitmiştir.")/2,9*windowHeight/10-90);
			text("Lütfen cevaplarınızı kontrol ediniz",6.5*windowWidth/10-textWidth("Lütfen cevaplarınızı kontrol ediniz")/2,9*windowHeight/10-50);
		}
	pop();
}

function keyPressed() {
	if (keyCode === LEFT_ARROW) {
		currentPage -= 2*(currentPage > 1);
	} else if (keyCode === RIGHT_ARROW) {
		currentPage += 2*(currentPage+1 < maxPage);
	}
	console.log(currentPage);
}

function calculatePage() { // birthday is a date
	return Math.abs(new Date(Date.now() - new Date(2004, 1, 17)).getUTCFullYear() - 1970);
}