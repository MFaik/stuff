/** @typedef {import('./types.js').bx} bx */

let tick = 0;
let get_current_tick = () => tick;
let increase_tick = () => tick++;

/** 
 * @param {bx} parent
 * @param {number} x
 * @param {number} y
 * @param {undefined|string} name
 * @returns {bx}
 */
let create_box = (x, y, parent, name = undefined) => {
    let b = {x, y, name, children: [], last_movement_tick: get_current_tick()};
    parent.children.push(b);
    return b;
}
/**
 * @param {number} x
 * @param {number} y
 * @param {bx} parent
 */
let get_child = (x, y, parent) => {
    for(let b of parent.children) {
        if(b.x == x && b.y == y)
            return b;
    }
}

/** @param {bx} box */
let wipe_box = (box) => {
    box.x = Infinity;
    for(let c of box.children) {
        wipe_box(c)
    }
    box.children.length = 0;
}
/** 
 * @param {bx} box
 * @param {bx} parent
 * @param {boolean} [undoable]
 */
let remove_box = (box, parent, undoable = false) => {
    let i = parent.children.indexOf(box);
    if(i != -1) {
        parent.children[i] = parent.children[parent.children.length-1];
        parent.children.pop();
    } else {
        throw new Error("Trying to remove a box that does not exists!");
    }
    if(!undoable)
        wipe_box(box);
}
/** 
 * @param {bx} box 
 * @param {bx} old_parent
 * @param {bx} new_parent
 */
let change_parent = (box, old_parent, new_parent) => {
    let i = old_parent.children.indexOf(box);
    if(i == -1) throw new Error("Internal error, orphan box");
    old_parent.children[i] = old_parent.children[old_parent.children.length-1];
    old_parent.children.pop();

    new_parent.children.push(box);
}
/** 
 * @param {bx} box 
 * @param {bx} parent 
 */
let decrease_degree = (box, parent) => {
    if(box.children.length == 0) {
        remove_box(box, parent);
        return;
    }
    let destroy = box.children[0];
    for(let c of box.children) {
        if(c.x > destroy.x || (c.x == destroy.x && c.y > destroy.y)) {
            destroy = c;
            continue;
        }
    }
    remove_box(destroy, box);   
}
/** 
 * @param {number} width
 * @param {number} height
 * @param {number} x
 * @param {number} y
 * @param {number} x_offset
 * @param {number} y_offset
 */
let calculate_area_offset = (x, y, x_offset, y_offset, width, height) => {
    x += x_offset;
    y += y_offset;
    x -= ceil(width/2)*abs(y_offset);
    y -= ceil(height/2)*abs(x_offset);
    if(x_offset < 0) x -= width;
    if(y_offset < 0) y -= height;
    return {x, y};
}
/** @param {bx} box */
let normalize_box = (box) => {
    let l = Infinity, u = Infinity;
    for(let c of box.children) {
        if(l > c.x)l = c.x;
        if(u > c.y)u = c.y;
    }
    for(let c of box.children) {
        c.x -= l;
        c.y -= u;
    }
}
/**
 * @param {bx} base_box
 * @param {bx} applied_box
 * @param {bx} parent
 */
let expand_box = (base_box, applied_box, parent) => {
    //shape detection TODO make this better
    if(base_box.children.length != 4) return false;
    let l = base_box.children[0];
    let u = base_box.children[0];
    for(let c of base_box.children) {
        if(l.x > c.x) l = c;
        if(u.y > c.y) u = c;
    }
    if(l.x+1 != u.x || u.y+1 != l.y)return false;
    let correct = 0;
    for(let c of base_box.children) {
        if(l.y == c.y && c.x == l.x+2) correct++;
        if(u.x == c.x && c.y == u.y+2) correct++;
    }
    if(correct != 2) return false;
    //expansion
    normalize_box(applied_box);
    let width = 0, height = 0;
    for(let c of applied_box.children) {
        if(width < c.x) width = c.x;
        if(height < c.y) height = c.y;
    }
    let offset = calculate_area_offset(base_box.x, base_box.y, 
        (base_box.x-applied_box.x)/2, 
        (base_box.y-applied_box.y)/2,
        width, height);
    for(let c of applied_box.children) {
        c.x += offset.x;
        c.y += offset.y;
        c.last_movement_tick = get_current_tick();
        let b = get_child(c.x, c.y, parent);
        parent.children.push(c);
        if(b) {
            c.x -= base_box.x-applied_box.x;
            c.y -= base_box.y-applied_box.y;
            apply_box(b, c, parent);
        }
    }
    applied_box.children.length = 0;
    remove_box(applied_box, parent);
    remove_box(base_box, parent);

    return true;
}
/**
 * @param {bx} base_box
 * @param {bx} applied_box
 * @param {bx} parent
 */
let compact_box = (base_box, applied_box, parent) => {
    //shape detection TODO: make this better
    if(base_box.children.length != 5) return false;
    let l = base_box.children[0];
    let u = base_box.children[0];
    for(let c of base_box.children) {
        if(l.x > c.x) l = c;
        if(u.y > c.y) u = c;
    }
    if(l.x+1 != u.x || u.y+1 != l.y)return false;
    let correct = 0;
    for(let c of base_box.children) {
        if(l.y == c.y && c.x == l.x+2) correct++;
        if(l.y == c.y && c.x == l.x+1) correct++;
        if(u.x == c.x && c.y == u.y+2) correct++;
    }
    if(correct != 3) return false;
    //compacting TODO: remove as much copy code between this and the expander
    normalize_box(applied_box);
    let width = 0, height = 0;
    for(let c of applied_box.children) {
        if(width < c.x) width = c.x;
        if(height < c.y) height = c.y;
    }
    let offset_x = (base_box.x-applied_box.x)/2;
    let offset_y = (base_box.y-applied_box.y)/2;
    let area_offset = calculate_area_offset(base_box.x, base_box.y, 
                                            offset_x, offset_y, width, height);
    let new_box = create_box(Infinity, Infinity, parent);
    for(let c of applied_box.children) {
        let b = get_child(c.x + area_offset.x, c.y + area_offset.y, parent);
        if(b) {
            b.x -= area_offset.x;
            b.y -= area_offset.y;
            b.last_movement_tick = get_current_tick();
            change_parent(b, parent, new_box);
        }
    }

    let new_pos_x = base_box.x+offset_x;
    let new_pos_y = base_box.y+offset_y;
    let block = get_child(new_pos_x, new_pos_y, parent);
    if(block) {
        new_box.x = base_box.x-offset_x;
        new_box.y = base_box.y-offset_y;
        apply_box(block, new_box, parent);
    } else {
        new_box.x = new_pos_x;
        new_box.y = new_pos_y;
    }

    applied_box.children.length = 0;
    remove_box(applied_box, parent);
    remove_box(base_box, parent);

    return true;
}

/**
 * @param {bx} base_box
 * @param {bx} applied_box
 * @param {bx} parent
 */
let apply_box = (base_box, applied_box, parent) => {
    if(expand_box(base_box, applied_box, parent)) return;
    if(compact_box(base_box, applied_box, parent)) return;
    for(let c of base_box.children) {
        if(c.children.length == 0) {
            c.children = structuredClone(applied_box.children);
        } else {
            decrease_degree(c, base_box);
        }
    }
    remove_box(applied_box, parent);
}

/** 
 * @param {number} dx 
 * @param {number} dy 
 * @param {bx} box 
 * @param {bx} parent 
 */
let try_move = (dx, dy, box, parent) => {
    let moved = move_box(dx, 0, box, parent);//l
    moved = move_box(0, dy, box, parent) || moved;//u
    if(moved)remove_box(box, parent);
    return moved;
}
/** 
 * @param {bx} box 
 * @param {bx} parent
 */
let box_check = (box, parent) => {
    if(box.children.length != 3) return;
    for(let anchor = 0;anchor < 3;anchor++) {
        //shape detection
        let ai = anchor, bi = anchor+1, ci = anchor+2;
        if(bi >= 3)bi-=3;if(ci >= 3)ci-=3;
        let a = box.children[ai];
        let b = box.children[bi];
        let c = box.children[ci];
        let l = (a.x == b.x+1 && a.y == b.y) || (a.x == c.x+1 && a.y == c.y);
        let u = (a.x == b.x && a.y == b.y-1) || (a.x == c.x && a.y == c.y-1);
        let r = (a.x == b.x-1 && a.y == b.y) || (a.x == c.x-1 && a.y == c.y);
        let d = (a.x == b.x && a.y == b.y+1) || (a.x == c.x && a.y == c.y+1);
        //movement
        if(l && u)
            if(try_move(1, -1, box, parent)) return;
        if(r && u)
            if(try_move(-1, -1, box, parent)) return;
        if(l && d)
            if(try_move(1, 1, box, parent)) return;
        if(r && d)
            if(try_move(-1, 1, box, parent)) return;
    }
}
/**
 * @param {number} x_offset
 * @param {number} y_offset
 * @param {bx} box
 * @param {bx} parent
 * @return boolean
 */
let move_box = (x_offset, y_offset, box, parent) => {
    let from_box = get_child(box.x+x_offset, box.y+y_offset, parent);
    if(!from_box || from_box.last_movement_tick == get_current_tick())
        return false;

    let to_box = get_child(box.x-x_offset, box.y-y_offset, parent); 
    if(to_box) {
        apply_box(to_box, from_box, parent);
    } else {
        from_box.x -= x_offset*2;
        from_box.y -= y_offset*2;
        from_box.last_movement_tick = get_current_tick();
    }

    return true;
}

/** @param {bx} box */
let tick_box = (box) => {
    increase_tick();

    /** @type {[bx, bx][]} */
    let box_stack = []
    for(let c of box.children)
        box_stack.push([c, box]); //[0] -> box, [1] -> box's parent
    while(box_stack.length) {
        //TODO: fix type bugs
        let b = box_stack.pop();
        if(b[0].last_movement_tick != get_current_tick())
            box_check(b[0], b[1]);
        for(let c of b[0].children)
            box_stack.push([c, b[0]]);
    }

}

/**
 * @param {bx} box1
 * @param {bx} box2
 */
let box_equals = (box1, box2) => {
    if(box1.x !== box2.x || box1.y !== box2.y) return false;
    if(box1.children.length != box2.children.length) return false;
    let cnt = 0;
    for(let c1 of box1.children) {
        let found = false;
        for(let c2 of box2.children) {
            if(box_equals(c1, c2)) {
                cnt++;
                found = true;
                break;
            }
        }
        if(!found) return false;
    }
    return cnt == box1.children.length;
}

export { wipe_box, remove_box, create_box, get_child, tick_box, box_equals };
