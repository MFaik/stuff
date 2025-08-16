/// <reference path="lib/global.d.ts" />
/// <reference path="lib/index.d.ts" />
/// <reference path="lib/extra.d.ts" />

/** @typedef {import('./types.js').bx} bx */

import { create_game } from "./game.js"

const default_tile_size = 40;
/** @type {ReturnType<typeof create_game>} */
let game;

/** @ts-ignore */
window.setup = function() {
    game = create_game();
    createCanvas(windowWidth, windowHeight);
    noStroke();
}

/** @ts-ignore */
window.draw = function() {
    background(30+game.get_camera_depth()*10, 10, 10);

    for(let i = 0;i < game.get_camera_depth()-1;i++) {
        draw_box_at_place(5+i*30, 5, 30, 2, game.get_box_at_depth(i));
    }

    let c = game.get_current_camera();

    if(keyIsDown(RIGHT_ARROW)) c.x -= c.scale*deltaTime;
    if(keyIsDown(LEFT_ARROW)) c.x += c.scale*deltaTime;
    if(keyIsDown(DOWN_ARROW)) c.y -= c.scale*deltaTime;
    if(keyIsDown(UP_ARROW)) c.y += c.scale*deltaTime;

    translate(c.x, c.y)
    scale(c.scale)

    for(let box of c.selected_box.children) {
        draw_box(box)
    }
}

/** 
 * @param {number} x
 * @param {number} y
 * @param {number} default_size
 * @param {number} default_offset
 * @param {bx} box
 */
let draw_box_at_place = (x, y, default_size, default_offset, box) => {
    rect(x+default_offset, 
         y+default_offset, default_size-default_offset*2);
    if(box.children.length == 0)return;
    let l = box.children[0].x, u = box.children[0].y;
    let r = l, d = u;
    for(let c of box.children) {
        if(c.x < l)l = c.x;
        if(c.x > r)r = c.x;
        if(c.y < u)u = c.y;
        if(c.y > d)d = c.y;
    }
    let box_default_size = (default_size-default_offset*4)/(d-u+1);
    if(d-u>r-l) {
        l -= ((d-u)-(r-l))/2;
    }
    if(d-u<r-l) {
        u -= ((r-l)-(d-u))/2;
        box_default_size = (default_size-default_offset*4)/(r-l+1);
    }
    fill(30, 90, 200);
    for(let c of box.children) {
        rect((c.x-l)*box_default_size+x+default_offset*2, 
             (c.y-u)*box_default_size+y+default_offset*2, 
             max(2, ceil(box_default_size)));
    }
    fill(255);
}

/** @param {bx} box */
let draw_box = (box) => {
    draw_box_at_place(box.x*default_tile_size, box.y*default_tile_size, 
                      default_tile_size, 2, box);
}

window.mousePressed = function() {
    let current_camera = game.get_current_camera();
    let x = mouseX - current_camera.x;
    x /= current_camera.scale*default_tile_size;
    x = floor(x);
    let y = mouseY - current_camera.y;
    y /= current_camera.scale*default_tile_size;
    y = floor(y);

    if(mouseButton.left){
        game.left_click(x, y);
    } else if(mouseButton.right) {
        game.right_click(x, y);
    }
}

window.mouseWheel = function(event) {
    /** @ts-ignore */
    let d = event.delta;
    let c = game.get_current_camera();
    c.scale += d * -0.001;
    c.scale = constrain(c.scale, 0.5, 2);
    return false;
}

window.addEventListener('keydown', (e) => {
    if(e.key == 'Escape' || e.key == 'e') {
        game.pop_camera();
    } else if(e.key == 's') {
        game.step_game();
    } else if(e.key == 'z') {
        game.undo();
    }
});

window.windowResized = function() {
    resizeCanvas(windowWidth, windowHeight);
}
