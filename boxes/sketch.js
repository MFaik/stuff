/// <reference path="lib/global.d.ts" />
/// <reference path="lib/index.d.ts" />
/// <reference path="lib/extra.d.ts" />

const default_tile_size = 40; // in pixels
const logic_interval = 100; // in milliseconds

let tick = 0;
let get_current_tick = () => tick;
let increase_tick = () => tick++;

//one may ask, > why is this type named "bx" and not "box"
//> are you saving the world with the time you saved not typing "o"?
//but unfortunately, this change was made to avoid naming conflict with p5.box()
/** @typedef {{ x: number, y: number, parent: bx, children: bx[], last_movement_tick: number}} bx */
/** 
 * @param {bx} parent
 * @param {number} x
 * @param {number} y
 * @returns {bx}
 */
let create_box = (x, y, parent) => {
    let b = {x, y, parent, children: [], last_movement_tick: get_current_tick()};
    parent.children.push(b);
    return b;
}
/**
 * @param {number} x
 * @param {number} y
 * @param {bx} parent
 */
let get_box = (x, y, parent) => {
    for(let b of parent.children) {
        if(b.x == x && b.y == y)
            return b;
    }
}

/** @typedef {{ x: number, y: number, scale: number, selected_box: bx}} camera */
/** @type {camera[]} */
let camera_stack = [];
/** @param {bx} selected_box */
let push_camera = (selected_box) => {
    let c = {x: width/2-default_tile_size, y: height/2-default_tile_size, scale: 1, selected_box};
    camera_stack.push(c);
    return c;
};

let get_current_camera = () => 
    camera_stack[camera_stack.length-1];
let get_main_box = () => 
    camera_stack[0].selected_box;
let get_current_box = () => 
    camera_stack[camera_stack.length-1].selected_box;
/** 
 * @param {number} x
 * @param {number} y
 */
let push_box_current = (x, y) => 
    create_box(x, y, get_current_camera().selected_box);
/**
 * @param {number} x
 * @param {number} y
 */
let get_box_current = (x, y) => 
    get_box(x, y, get_current_camera().selected_box)

/** @param {bx} box */
let wipe_box = (box) => {
    //using delete is fine, as this is done to satisfy gc
    /** @ts-ignore */
    delete box.parent;
    for(let c of box.children) {
        wipe_box(c)
    }
    box.children.length = 0;
}
/** 
 * @param {bx} box
 * @param {boolean} [undoable]
 */
let remove_box = (box, undoable = false) => {
    let p = box.parent;
    let i = p.children.indexOf(box);
    if(i != -1) {
        p.children[i] = p.children[p.children.length-1];
        p.children.pop();
    } else {
        throw new Error("Trying to remove a box that does not exists!");
    }
    if(!undoable)
        wipe_box(box);
}
/** 
 * @param {bx} box 
 * @param {bx} new_parent
 */
let change_parent = (box, new_parent) => {
    let p = box.parent;

    let i = p.children.indexOf(box);
    if(i == -1) throw new Error("Internal error, orphan box");
    p.children[i] = p.children[p.children.length-1];
    p.children.pop();

    box.parent = new_parent; 
    new_parent.children.push(box);
}
/** @param {bx} box */
let decrease_degree = (box) => {
    if(box.children.length == 0) {
        remove_box(box);
        return;
    }
    let destroy = box.children[0];
    for(let c of box.children) {
        if(c.x > destroy.x || (c.x == destroy.x && c.y > destroy.y)) {
            destroy = c;
            continue;
        }
    }
    remove_box(destroy);   
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
 */
let expand_box = (base_box, applied_box) => {
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
        c.parent = base_box.parent;
        base_box.parent.children.push(c);
        c.x += offset.x;
        c.y += offset.y;
    }
    applied_box.children.length = 0;
    remove_box(applied_box);
    remove_box(base_box);

    return true;
}
/**
 * @param {bx} base_box
 * @param {bx} applied_box
 */
let compact_box = (base_box, applied_box) => {
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
    let new_box = create_box(Infinity, Infinity, base_box.parent);
    for(let c of applied_box.children) {
        let b = get_box(c.x + area_offset.x, c.y + area_offset.y, base_box.parent);
        if(b) {
            b.x -= area_offset.x;
            b.y -= area_offset.y;
            change_parent(b, new_box);
        }
    }

    applied_box.children.length = 0;
    remove_box(applied_box);
    remove_box(base_box);

    let new_pos_x = base_box.x+offset_x;
    let new_pos_y = base_box.y+offset_y;
    let block = get_box(new_pos_x, new_pos_y, new_box.parent);
    if(block) {
        new_box.x = base_box.x-offset_x;
        new_box.y = base_box.y-offset_y;
        apply_box(block, new_box);
    } else {
        new_box.x = new_pos_x;
        new_box.y = new_pos_y;
    }
    return true;
}

/**
 * @param {bx} base_box
 * @param {bx} applied_box
 */
let apply_box = (base_box, applied_box) => {
    if(expand_box(base_box, applied_box)) return;
    if(compact_box(base_box, applied_box)) return;
    for(let c of applied_box.children) {
        //we need to set the parent to undefined to make sure that, 
        //the parent(applied_box) is not endlessly copied
        //this line won't invalidate types because later we will be setting the parent
        /** @ts-ignore */
        c.parent = undefined;
    }
    for(let c of base_box.children) {
        if(c.children.length == 0) {
            c.children = structuredClone(applied_box.children);
            for(let cc of c.children) {
                cc.parent = c;
            }
        } else {
            decrease_degree(c);
        }
    }
    remove_box(applied_box);
}

const UndoTypes = {
    CAMERA_PUSH: 1,
    CAMERA_POP: 2,
    BOX_ADD: 3,
    BOX_REMOVE: 4,
}

//undo type is any because otherwise it adds way too much boilerplate
/**
 * @type {any[]}
 */
let undo_stack = [];

let push_undo_camera_pop = () => {
    undo_stack.push({type: UndoTypes.CAMERA_POP});
}
/** @param {bx} box */
let push_undo_camera_push = (box) => {
    undo_stack.push({type: UndoTypes.CAMERA_PUSH, box});
}
/** 
 * @param {bx} box
 */
let push_undo_box_remove = (box) => {
    undo_stack.push({type: UndoTypes.BOX_REMOVE, box});
}
/** 
 * @param {bx} box
 * @param {bx} parent
 */
let push_undo_box_add = (box, parent) => {
    undo_stack.push({type: UndoTypes.BOX_ADD, box, parent});
}
let undo = () => {
    let undo_obj = undo_stack.pop();
    if(!undo_obj) {
        load_game()
        return;
    }
    if(undo_obj.type == UndoTypes.CAMERA_PUSH) {
        push_camera(undo_obj.box);
    } else if(undo_obj.type == UndoTypes.CAMERA_POP) {
        camera_stack.pop();
    } else if(undo_obj.type == UndoTypes.BOX_REMOVE) {
        remove_box(undo_obj.box);
    } else if(undo_obj.type == UndoTypes.BOX_ADD) {
        undo_obj.parent.children.push(undo_obj.box);
    }
}

/** 
 * @type {{camera: camera[], undo_stack: any[]}[]}
 */
let game_states = [];
let save_game = () => {
    game_states.push(structuredClone({camera: camera_stack, undo_stack}));
    undo_stack = [];
}
let load_game = () => {
    let save = game_states.pop();
    if(save) {
        wipe_box(get_main_box());
        camera_stack = save.camera;
        undo_stack = save.undo_stack;
    }
}

//this first box will be the context that will be used for the entire game
//also this will be the only box to allow having undefined as parent
/** @type {bx} */

/** @ts-ignore */
window.setup = function() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
    /** @type bx */
    let main_box = {
        x: 0, y: 0, 
        /** @ts-ignore*/
        parent: undefined, 
        children: []
    };
    push_camera(main_box);
}

/** @type {Record<string | number, boolean>} */
let pressed_keys = {};
let logic_timer = 0;
/** @ts-ignore */
window.draw = function() {
    background(30+camera_stack.length*10, 10, 10);

    for(let i = 0;i < camera_stack.length-1;i++) {
        rect(5+i*20, 5, 15);
    }
    logic_timer += deltaTime;
    while(logic_timer > logic_interval) {
        logic_timer -= logic_interval
        //save_game();
        //game_logic();
    }

    let c = get_current_camera();

    if(pressed_keys[RIGHT_ARROW]) c.x -= c.scale*deltaTime;
    if(pressed_keys[LEFT_ARROW]) c.x += c.scale*deltaTime;
    if(pressed_keys[DOWN_ARROW]) c.y -= c.scale*deltaTime;
    if(pressed_keys[UP_ARROW]) c.y += c.scale*deltaTime;

    translate(c.x, c.y)
    scale(c.scale)

    for(let box of get_current_box().children) {
        draw_box(box)
    }
}

let game_logic = () => {
    increase_tick();
    /** @type {bx[]} */
    let box_queue = []
    for(let c of get_main_box().children)
        box_queue.push(c)
    let head = 0;
    while(box_queue.length-head) {
        let b = box_queue[head++];
        box_check(b)
        for(let c of b.children)
            box_queue.push(c)
    }

    while(!get_current_box() || (get_current_box() != get_main_box() && !get_current_box().parent))
        camera_stack.pop();
}


/** 
 * @param {number} dx 
 * @param {number} dy 
 * @param {bx} box 
 */
let try_move = (dx, dy, box) => {
    let moved = move_box(dx, 0, box);//l
    moved = move_box(0, dy, box) || moved;//u
    if(moved)remove_box(box);
    return moved;
}
/** @param {bx} box */
let box_check = (box) => {
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
            if(try_move(1, -1, box)) return;
        if(r && u)
            if(try_move(-1, -1, box)) return;
        if(l && d)
            if(try_move(1, 1, box)) return;
        if(r && d)
            if(try_move(-1, 1, box)) return;
    }
}
/**
 * @param {number} x_offset
 * @param {number} y_offset
 * @param {bx} box
 * @return boolean
 */
let move_box = (x_offset, y_offset, box) => {
    let from_box = get_box(box.x+x_offset, box.y+y_offset, box.parent);
    if(!from_box || from_box.last_movement_tick == get_current_tick())
        return false;

    let to_box = get_box(box.x-x_offset, box.y-y_offset, box.parent); 
    if(to_box) {
        apply_box(to_box, from_box);
    } else {
        from_box.x -= x_offset*2;
        from_box.y -= y_offset*2;
        from_box.last_movement_tick = get_current_tick();
    }

    return true;
}

/** @param {bx} box */
function draw_box(box) {
    rect((box.x)*default_tile_size+2, 
        (box.y)*default_tile_size+2, default_tile_size-4);
}


window.mousePressed = function() {
    let current_camera = get_current_camera();
    let x = mouseX - current_camera.x;
    x /= current_camera.scale*default_tile_size;
    x = floor(x);
    let y = mouseY - current_camera.y;
    y /= current_camera.scale*default_tile_size;
    y = floor(y);

    if(mouseButton.left){
        let b = get_box_current(x, y);
        if(b) {
            push_camera(b)
            push_undo_camera_pop();
        } else {
            let b = push_box_current(x, y)
            push_undo_box_remove(b);
        }
    } else if(mouseButton.right) {
        let b = get_box_current(x, y);
        if(b) {
            push_undo_box_add(b, b.parent);
            remove_box(b, true)
        }
    }
}

window.mouseWheel = function(event) {
    /** @ts-ignore */
    let d = event.delta;
    let c = get_current_camera();
    c.scale += d * -0.001;
    c.scale = constrain(c.scale, 0.5, 2);
    return false;
}

window.addEventListener('keydown', (e) => {
    pressed_keys[e.key] = true;

    if(e.key == 'Escape' || e.key == 'e') {
        if(camera_stack.length > 1) {
            push_undo_camera_push(get_current_box());
            camera_stack.pop();
        }
    } else if(e.key == 's') {
        save_game();
        game_logic();
    } else if(e.key == 'n') {
        normalize_box(get_current_box());
    } else if(e.key == 'z') {
        undo();
    }
});

window.addEventListener('keyup', (e) => {
  pressed_keys[e.key] = false;
});

window.addEventListener('blur', () => {
  pressed_keys = {};
});

window.windowResized = function() {
    resizeCanvas(windowWidth, windowHeight);
}
