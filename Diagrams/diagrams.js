const NOTSET = -1;
const EMPTY = 0;
const WALL = 1;
const MONSTER = 2;
const CHEST = 3;

//get parameters from site
let gridParent = document.getElementById("grid");
let activeNumber = 100;

let GET = new URL(window.location.href).searchParams;
let edit = GET.get("edit");
let vertical = JSON.parse(GET.get("vertical"));
let horizontal = JSON.parse(GET.get("horizontal"));
let monsters = JSON.parse(GET.get("monsters"));
let chests = JSON.parse(GET.get("chests"));
//set edit button to play if already in edit mode
if(edit) {
    let editButton = document.getElementById("edit");
    editButton.innerHTML = "play";
    editButton.onclick = playButton;
}
//setup grid elements
let gridElement = [];
let verticalElement = [];
let horizontalElement = [];
for(let y = 0;y < 9;y++) {
    for(let x = 0;x < 9;x++) {
        let element = document.createElement("div");
        element.classList.add("tile");
        gridParent.append(element);
        if(y == 0 && x == 0) {
            ;
        } else if (y != 0 && x != 0) {
            gridElement.push(element);
        } else {
            let number = document.createElement("div");
            number.classList.add("char");
            element.append(number);
            
            if (y == 0) {
                verticalElement.push(element);
                verticalElement.push(number);
                number.innerHTML = vertical ? vertical[x-1] : 0;
            } else if (x == 0) {
                horizontalElement.push(element);
                horizontalElement.push(number);
                number.innerHTML = horizontal ? horizontal[y-1] : 0;
            }  
        }

        element.oncontextmenu = () => {
            return false;
        };
    }
}

//setup tile events
for(let y = 0;y < 8;y++) {
    for(let x = 0;x < 8;x++) {
        let t = gridElement[x + y*8];
        t.addEventListener("mousedown", (event) => {
            if(event.buttons == 1)
                setTile(x, y, currentType);
            if(event.buttons == 2)
                setTile(x, y, NOTSET);
        });
        t.addEventListener("mouseover", (event) => {
            if(event.buttons == 1)
                setTile(x, y, currentType);
            if(event.buttons == 2)
                setTile(x, y, NOTSET);
        });
    }
}


//setup palette and events
let tileTypes = ["empty", "wall", "monster", "chest"];
let editableTileCnt = 2;
if(edit) {
    editableTileCnt = 4;
}

let currentType = 0;
let paletteElement = [];

let enablePalette = (i) => {
    paletteElement[currentType].classList.remove("selected");
    currentType = i;
    paletteElement[currentType].classList.add("selected");
}

for(let i = 0;i < editableTileCnt;i++) {
    let element = document.createElement("div");
    element.classList.add("tile");
    element.classList.add(tileTypes[i]);
    paletteElement.push(element);
    gridParent.append(element);

    if(currentType == i) {
        element.classList.add("selected");
    }

    element.addEventListener("click", (event) => {
        enablePalette(i);
    });

    element.oncontextmenu = () => {
        return false;
    };
}

//setup number events
if(edit) {
    document.addEventListener("keydown", (key) => {
        let number = key.keyCode - 49 + 1;
        if(number > 8) number -= 48;
        if(number < 0 || number > 8) return;
        if(activeNumber < 8) {
            vertical[activeNumber] = number;
            verticalElement[activeNumber*2+1].innerHTML = number;
            if(number < currentVertical[activeNumber]) {
                verticalElement[activeNumber*2].classList.add("wrong");
            } else {
                verticalElement[activeNumber*2].classList.remove("wrong");
            }
        } else if (activeNumber < 16) {
            horizontal[activeNumber-8] = number;
            horizontalElement[activeNumber*2+1-16].innerHTML = number;
            if(number < currentHorizontal[activeNumber-8]) {
                horizontalElement[activeNumber*2-16].classList.add("wrong");
            } else {
                horizontalElement[activeNumber*2-16].classList.remove("wrong");
            }
        } else if(number <= editableTileCnt) {
            enablePalette(number-1);
        }
    });
}
//setup internal grid
let grid = [];
for(let i = 0;i < 8*8;i++) {
    grid.push(NOTSET);
}
let currentVertical = [0,0,0,0,0,0,0,0];
let currentHorizontal = [0,0,0,0,0,0,0,0];
if(!vertical) {
    vertical = [0,0,0,0,0,0,0,0];
}
if(!horizontal) {
    horizontal = [0,0,0,0,0,0,0,0];
}

let finished = false;
let endGame = () => {
    if(!edit)
        finished = true;
}
let canEdit = (i) => {
    if(edit) {
        return true;
    } else {
        let t = grid[i];
        return t != MONSTER && t != CHEST && !finished;
    }
}
let checkNumbers = (x, y, t) => {
    if(grid[x + y*8] == WALL && t != WALL) {
        currentVertical[x]--;
        currentHorizontal[y]--;
    } else if(grid[x + y*8] != WALL && t == WALL) {
        currentVertical[x]++;
        currentHorizontal[y]++;
    }

    if(currentVertical[x] > vertical[x]) {
        verticalElement[x*2].classList.add("wrong");
    } else {
        verticalElement[x*2].classList.remove("wrong");
    }
    if(currentHorizontal[y] > horizontal[y]) {
        horizontalElement[y*2].classList.add("wrong")
    } else {
        horizontalElement[y*2].classList.remove("wrong");
    }
};
let setTile = (x, y, t) => {
    let i = x + y*8;
    if(canEdit(i)) {
        checkNumbers(x, y, t);
        grid[i] = t;
        if(check(grid, vertical, horizontal, currentVertical, currentHorizontal)) {
            finished = true;
        } else {
            finished = false;
        }
        if(t != NOTSET)
            gridElement[i].className = "tile " + tileTypes[t];
        else
            gridElement[i].className = "tile";
    }
}

if(monsters) {
    for(let monster of monsters) {
        setTile(monster%8, Math.floor(monster/8), MONSTER);
    }
}
if(chests) {
    for(let chest of chests) {
        setTile(chest%8, Math.floor(chest/8), CHEST);
    }
}
//setup activeTile events
if(edit) {
    let cnt = 0;
    for(let i of gridParent.children) {
        let a = cnt;
        i.addEventListener("mousedown", function(){
            if(activeNumber < 8) {
                verticalElement[activeNumber*2].classList.remove("selected");
            } else if(activeNumber < 16) {
                horizontalElement[activeNumber*2-16].classList.remove("selected");
            }

            if(a >= 1 && a <= 8) {
                activeNumber = a-1; 
                verticalElement[activeNumber*2].classList.add("selected");
            } else if (a % 9 == 0 && a/9 >= 1 && a/9 < 9) {
                activeNumber = (a/9)-1+8;
                horizontalElement[activeNumber*2-16].classList.add("selected");
            } else {
                activeNumber = 100;
            }
        });
        cnt += 1;
    }
}
//button events
function getUrl() {
    let url = window.location.href;
    url = url.substring(0, url.indexOf("?"));
    url += "?vertical=" + JSON.stringify(vertical);
    url += "&horizontal=" + JSON.stringify(horizontal);
    let monsters = [];
    let chests = [];
    for(let i = 0;i < 64;i++) {
        if(grid[i] == MONSTER) {
            monsters.push(i);
        } else if(grid[i] == CHEST) {
            chests.push(i);
        }
    }
    if(monsters.length)
        url += "&monsters=" + JSON.stringify(monsters);
    if(chests.length)
        url += "&chests=" + JSON.stringify(chests);
    return url;
}
async function shareButton() {
    let url = getUrl();
    await navigator.clipboard.writeText(url);
    document.getElementById("share").innerHTML = "copied";
}
function editButton() {
    location.href = getUrl()+"&edit=true";
}
function playButton() {
    location.href = getUrl();
}
function solveButton() {
    let answer = solve(grid, vertical, horizontal);
    for(let i = 0;i < 64;i++) {
        if(answer[i] == WALL || answer[i] == EMPTY)
            setTile(i%8, Math.floor(i/8), answer[i]);
    }
}
