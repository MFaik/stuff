// const NOTSET = -1;
// const EMPTY = 0;
// const WALL = 1;
// const MONSTER = 2;
// const CHEST = 3;

function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}
//TODO: add chest room generation
function generate() {
    let start = {x: Math.floor(Math.random()*8), y: Math.floor(Math.random()*8)};

    let grid = [];
    for(let i = 0;i < 64;i++) {
        grid.push(NOTSET);
    }

    let get = (x, y) => grid[x + y*8];
    let set = (x, y, t) => grid[x + y*8] = t;
    let neighbourCnt = (x, y, t) => {
        let cnt = 0;
        if(x > 0 && get(x-1, y) == t)
            cnt++;
        if(x < 7 && get(x+1, y) == t)
            cnt++;
        if(y > 0 && get(x, y-1) == t)
            cnt++;
        if(y < 7 && get(x, y+1) == t)
            cnt++;
        return cnt;
    }
    function rec(x, y, life) {
        if(get(x, y) != NOTSET)
            return;

        set(x, y, EMPTY);

        if((life)/5 > Math.random())
            return;
        
        let done = false;
        for(let dis of shuffle([{x:-1,y: 0},{x: 1,y: 0},{x: 0,y:-1},{x: 0,y: 1}])) {
            if(x+dis.x < 0 || x+dis.x > 7 || y+dis.y < 0 || y+dis.y > 7)
                continue;
            if(get(x+dis.x, y+dis.y) != NOTSET)
                continue;
            let emptyNeighbour = neighbourCnt(x+dis.x, y+dis.y, EMPTY);
            if(emptyNeighbour >= 2) {
                set(x+dis.x, y+dis.y, WALL);
                continue;
            }
            if(!done)
                rec(x+dis.x, y+dis.y, life+1);
            if(Math.random() > 0.5)
                done = true;
        }
    }
    rec(start.x, start.y);

    for(let y = 0;y < 8;y++) {
        for(let x = 0;x < 8;x++) {
            if(get(x, y) == NOTSET) {
                set(x, y, WALL);
            } else if(get(x, y) == EMPTY && 
                    neighbourCnt(x, y, EMPTY)+neighbourCnt(x, y, MONSTER) == 1) {
                set(x, y, MONSTER);
            }
        }
    }
    return grid;
}
