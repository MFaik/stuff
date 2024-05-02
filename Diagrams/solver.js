// const NOTSET = -1;
// const EMPTY = 0;
// const WALL = 1;
// const MONSTER = 2;
// const CHEST = 3;

function solve(grid, vertical, horizontal, trySolve = true) {
    grid = grid.slice();
    function get(x, y) {
        return grid[x+y*8];
    }
    function set(x, y, t) {
        grid[x+y*8] = t;
    }
    function neighbourCnt(x, y, t) {
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
    function neighbourCntReversed(x, y, t) {
        let cnt = 0;
        if(x > 0 && get(x-1, y) != t)
            cnt++;
        if(x < 7 && get(x+1, y) != t)
            cnt++;
        if(y > 0 && get(x, y-1) != t)
            cnt++;
        if(y < 7 && get(x, y+1) != t)
            cnt++;
        return cnt;
    }
    function setNotsetNeighbours(x, y, t) {
        if(x > 0 && get(x-1, y) == NOTSET)
            set(x-1, y, t);
        if(x < 7 && get(x+1, y) == NOTSET)
            set(x+1, y, t);
        if(y > 0 && get(x, y-1) == NOTSET)
            set(x, y-1, t);
        if(y < 7 && get(x, y+1) == NOTSET)
            set(x, y+1, t);
    }
    let done = [];
    for(let i = 0;i < 16;i++)done.push(false);
    function makeForced() {
        let changed = true;
        while(changed) {
            changed = false;
            //vert check
            for(let x = 0;x < 8;x++) {
                if(done[x])continue;
                let notset = 0;
                let wall = 0;
                for(let y = 0;y < 8;y++) {
                    notset += get(x, y) == NOTSET;
                    wall += get(x, y) == WALL;
                }
                if(!notset) {
                    done[x] = 1;
                    continue;
                }

                if(vertical[x] == wall) {
                    for(let y = 0;y < 8;y++) {
                        if(get(x, y) == NOTSET)
                            set(x, y, EMPTY);
                    }
                    changed = true;
                    done[x] = true;
                } else if(vertical[x]-wall == notset) {
                    for(let y = 0;y < 8;y++) {
                        if(get(x, y) == NOTSET)
                            set(x, y, WALL);
                    }
                    changed = true;
                    done[x] = true;
                }
            }
            //horz check
            for(let y = 0;y < 8;y++) {
                if(done[y+8])continue;
                let notset = 0;
                let wall = 0;
                for(let x = 0;x < 8;x++) {
                    notset += get(x, y) == NOTSET;
                    wall += get(x, y) == WALL;
                }
                if(!notset) {
                    done[y+8] = true;
                    continue;
                }

                if(horizontal[y] == wall) {
                    for(let x = 0;x < 8;x++) {
                        if(get(x, y) == NOTSET)
                            set(x, y, EMPTY);
                    }
                    changed = true;
                    done[y+8] = true;
                } else if(horizontal[y]-wall == notset) {
                    for(let x = 0;x < 8;x++) {
                        if(get(x, y) == NOTSET)
                            set(x, y, WALL);
                    }
                    changed = true;
                    done[y+8] = true;
                }
            }
            //enemy and deadend
            for(let y = 0;y < 8;y++) {
                for(let x = 0;x < 8;x++) {
                    if(get(x, y) == NOTSET && neighbourCntReversed(x, y, WALL) <= 1) {
                        set(x, y, WALL);
                        changed = true;
                    } else if(neighbourCnt(x, y, NOTSET) == 0)
                        continue;

                    if(get(x, y) == MONSTER) {
                        if(neighbourCnt(x, y, EMPTY) == 1) {
                            setNotsetNeighbours(x, y, WALL);
                            changed = true;
                        } else if(neighbourCnt(x, y, NOTSET) == 1) {
                            setNotsetNeighbours(x, y, EMPTY);
                            changed = true;
                        }
                    } else if(get(x, y) == EMPTY) {
                        if(neighbourCntReversed(x, y, WALL) == 2) {
                            setNotsetNeighbours(x, y, EMPTY);
                            changed = true;
                        }
                    }
                }
            }
        }
    }

    function sanityCheck() {
        //vert check
        for(let x = 0;x < 8;x++) {
            let wall = 0;
            let notset = 0;
            for(let y = 0;y < 8;y++) {
                notset += get(x, y) == NOTSET;
                wall += get(x, y) == WALL;
            }
            if(wall > vertical[x] || wall + notset < vertical[x]){
                return false;
            }
        }
        //horz check
        for(let y = 0;y < 8;y++) {
            let wall = 0;
            let notset = 0;
            for(let x = 0;x < 8;x++) {
                notset += get(x, y) == NOTSET;
                wall += get(x, y) == WALL;
            }
            if(wall > horizontal[y] || wall + notset < horizontal[y])
                return false;
        }
        //enemy and deadend
        for(let y = 0;y < 8;y++) {
            for(let x = 0;x < 8;x++) {
                if(get(x, y) == MONSTER) {
                    let empty = neighbourCnt(x, y, EMPTY);
                    if(empty > 1)
                        return false;
                    if(empty == 0 && neighbourCnt(x, y, NOTSET) == 0)
                        return false;
                } else if(get(x, y) == EMPTY) {
                    if(neighbourCntReversed(x, y, WALL) < 2)
                        return false;
                }
            }
        }
        //TODO: maybe add something about chestrooms?
        return true;
    }

    function fillWall(x, y) {
        set(x, y, WALL);
        if(x > 0 && get(x-1, y) == EMPTY) {
            fillWall(x-1, y);
        }
        if(x < 7 && get(x+1, y) == EMPTY) {
            fillWall(x+1, y);
        }
        if(y > 0 && get(x, y-1) == EMPTY) {
            fillWall(x, y-1);
        }
        if(y < 7 && get(x, y+1) == EMPTY) {
            fillWall(x, y+1);
        }
    }

    function isFinished() {
        for(let i = 0;i < 64;i++) {
            if(grid[i] == NOTSET)
                return false;
        }
        let start = 0;
        for(let i = 0;i < 64;i++) {
            if(grid[i] == EMPTY) {
                start = i;
                break;
            }
        }
        //are all rooms connected?
        let backup = grid.slice();
        fillWall(start%8, Math.floor(start/8));
        for(let i = 0;i < 64;i++) {
            if(grid[i] == EMPTY) {
                return false;
            }
        }
        grid = backup;
        //chestroom check
        let placeholder = 999;
        let chests = [];
        for(let i = 0;i < 64;i++) {
            if(grid[i] == CHEST)
                chests.push(i);
        }
        for(let chest of chests) {
            let chestX = chest%8;
            let chestY = Math.floor(chest/8);
            let roomX = -1,roomY = -1;
            for(let yOff = Math.max(-chestY, -2);yOff <= Math.max(chestY-5, 0);yOff++) {
                for(let xOff = Math.max(-chestX, -2);xOff <= Math.max(chestX-5, 0);xOff++) {
                    let x = chestX+xOff;
                    let y = chestY+yOff;
                    let room = true;
                    for(let i = 0;i < 3;i++) {
                        for(let j = 0;j < 3;j++) {
                            let t = get(chestX+xOff+i, chestY+yOff+j);                           
                            room &&= t == EMPTY || t == CHEST;
                        }
                    }
                    if(room){
                        roomX = x;
                        roomY = y;
                        break;
                    }
                }
                if(roomX != -1)break;
            }
            if(roomX == -1) {
                return false;
            }
            let emptyCnt = 0;
            if(roomX > 0) {
                emptyCnt += get(roomX-1, roomY  ) != WALL;
                emptyCnt += get(roomX-1, roomY+1) != WALL;
                emptyCnt += get(roomX-1, roomY+2) != WALL;
            }
            if(roomX < 5) {
                emptyCnt += get(roomX+3, roomY  ) != WALL;
                emptyCnt += get(roomX+3, roomY+1) != WALL;
                emptyCnt += get(roomX+3, roomY+2) != WALL;
            }
            if(roomY > 0) {
                emptyCnt += get(roomX  , roomY-1) != WALL;
                emptyCnt += get(roomX+1, roomY-1) != WALL;
                emptyCnt += get(roomX+2, roomY-1) != WALL;
            }
            if(roomY < 5) {
                emptyCnt += get(roomX  , roomY+3) != WALL;
                emptyCnt += get(roomX+1, roomY+3) != WALL;
                emptyCnt += get(roomX+2, roomY+3) != WALL;
            }
            if(emptyCnt != 1) {
                return false;
            }
            for(let y = 0; y < 3; y++) {
                for(let x = 0; x < 3; x++) {
                    if(get(roomX+x, roomY+y) == EMPTY) {
                        set(roomX+x, roomY+y, placeholder);
                    }
                }
            }
        }
        //no rooms other than chests
        for(let y = 0;y < 7;y++) {
            for(let x = 0;x < 7;x++) {
                if(get(x + 1, y + 1) == EMPTY && get(x    , y + 1) == EMPTY &&
                    get(x    , y    ) == EMPTY && get(x + 1, y    ) == EMPTY) {
                    return false;
                }
            }
        }
        //change placeholders back
        for(let i = 0;i < 64;i++) {
            if(grid[i] == placeholder) {
                grid[i] = EMPTY;
            }
        }
        return true;
    }
    //solve
    if(trySolve)
        makeForced();
    if(!sanityCheck())
        return false;
    if(isFinished()) {
        return grid;
    }
    if(!trySolve)
        return false;

    for(let i = 0;i < 64;i++) {
        if(grid[i] == NOTSET) {
            grid[i] = EMPTY;
            let answer = solve(grid, vertical, horizontal);
            if(answer)
                return answer;
            grid[i] = WALL;
            answer = solve(grid, vertical, horizontal);
            if(answer)
                return answer;
            break;
        }
    }

    return false;
}

function check(grid, vertical, horizontal, currentVertical, currentHorizontal) {
    for(let i = 0;i < 8;i++) {
        if(vertical[i] != currentVertical[i]){
            return false;
        }
        if(horizontal[i] != currentHorizontal[i]) {
            return false;
        }
    }
    grid = grid.slice();
    for(let i = 0;i < grid.length;i++) {
        if(grid[i] == -1)grid[i] = 0;
    }

    if(solve(grid, vertical, horizontal, false))
        return true;
    else
        return false;
}
