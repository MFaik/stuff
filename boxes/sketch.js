/// <reference path="lib/global.d.ts" />
/// <reference path="lib/index.d.ts" />
/// <reference path="lib/extra.d.ts" />

/** @typedef {import('./types.js').bx} bx */
/** @typedef {import('./types.js').camera} camera*/

import { create_game } from "./game.js"
import { create_recorder, is_game_recorder } from "./recorder.js"
import { create_replayer } from "./replayer.js";

const tile_size = 40;
/** @type {ReturnType<typeof create_game>|ReturnType<typeof create_recorder>} */
let game;
/** @type {ReturnType<typeof create_replayer>} */
let replayer;
/** @type {ReturnType<typeof createInput>} */
let input;

let is_replaying = false;

const params = new URLSearchParams(window.location.search);
/** @ts-ignore */
window.setup = function() {
    game = create_game();
    if(params.has('record')) {
        console.log("recording is enabled");
        game = create_recorder(game);
    }

    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.drop(handleFile);
    noStroke();

    input = createInput();
    reset_input_state();
    reset_input_size();
    input.input(() => {
        game.set_current_box_name(input.value());
    })
}

//TODO fix type bugs
let handleFile = (file) => {
    if (file.type === "application" && file.subtype === "json") {
        let json = file.data;
        if("end_state" in json) {
            replayer = create_replayer(json);
            is_replaying = true;
        }
    }
}

let stop_replaying = () => {
    is_replaying = false;
    game = replayer.game;
    if(params.has('record')) {
        game = create_recorder(game);
    }
}

/** @ts-ignore */
window.draw = function() {
    if(!is_replaying) {
        draw_game(game);
    } else {
        push();
        draw_game(replayer.game);
        pop();
        fill(0, 0, 255);
        triangle(40, 60, 10, 40, 10, 80);
        fill(255);
    }
}

/** @param {game} game */
let draw_game = (game) => {
    background(30+game.get_camera_depth()*10, 10, 10);

    if(is_game_recorder(game) && game.is_recording) {
        fill(255, 0, 0);
        rect(10, 40, 30);
        fill(255);
    }
    
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

    let mouse_over_box = undefined;
    for(let box of c.selected_box.children) {
        if(is_inside_camera_boundry(c, box)) {
            draw_box(box)
            if(box.name && is_mouse_over(c, box))
                mouse_over_box = box;
        }
    }
    if(mouse_over_box) {
        draw_box_text(mouse_over_box);
    }
}

/** 
 * @param {camera} camera
 * @param {bx} box
 * @returns {boolean}
 */
let is_inside_camera_boundry = (camera, box) => {
    let current_tile_size = tile_size*camera.scale;
    let x = box.x*current_tile_size+camera.x;
    let y = box.y*current_tile_size+camera.y;
    return x <= width && y <= height &&
           x+current_tile_size >= 0 && y+current_tile_size >= 0;
}

/** 
 * @param {camera} camera
 * @param {bx} box
 * @returns {boolean}
 */
let is_mouse_over = (camera, box) => {
    let current_tile_size = tile_size*camera.scale;
    let x = box.x*current_tile_size+camera.x;
    let y = box.y*current_tile_size+camera.y;
    return mouseX <= x+current_tile_size && mouseY <= y+current_tile_size &&
           mouseX >= x && mouseY >= y;
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
    draw_box_at_place(box.x*tile_size, box.y*tile_size, 
                      tile_size, 2, box);
}

/** @param {bx} box */
let draw_box_text = (box) => {
    fill(255);
    //we check if the box has name earlier so here it must have a name
    /** @ts-ignore *///TODO remove this ts-ignore somehow?
    text(box.name, box.x*tile_size+tile_size/2-textWidth(box.name)/2, 
         box.y*tile_size-textAscent()-textDescent());
}

let reset_input_state = () => {
    if(game.get_camera_depth() <= 1)
        input.hide();
    else 
        input.show();
    input.value(game.get_current_box_name()||"");
}

let reset_input_size = () => {
    input.position(width/3, 40);
    input.size(width/3);
}

window.mousePressed = function(event) {
    if(is_replaying) return;
    /** @ts-ignore */
    if(event.target.tagName == "INPUT")return;
    if(input.elt == document.activeElement) {
        input.elt.blur();
        return;
    }
    let current_camera = game.get_current_camera();
    let x = mouseX - current_camera.x;
    x /= current_camera.scale*tile_size;
    x = floor(x);
    let y = mouseY - current_camera.y;
    y /= current_camera.scale*tile_size;
    y = floor(y);

    //TODO fix type bugs
    if(event.button == 0){
        game.left_click(x, y);
    } else if(event.button == 2) {
        game.right_click(x, y);
    }
    reset_input_state();
}

window.mouseWheel = function(event) {
    if(is_replaying) return;
    /** @ts-ignore */
    let d = event.delta;
    let c = game.get_current_camera();
    c.scale += d * -0.001;
    c.scale = constrain(c.scale, 0.5, 2);
    return false;
}

window.addEventListener('keydown', (e) => {
    if(is_replaying) {
        if(e.key == 's') {
            if(!replayer.step()) {
                if(!replayer.is_accurate()) {
                    console.error("The simulation doesn't match!");
                } else {
                    console.log("The simulation matches!!!");
                    stop_replaying();
                }
            }
        } else if(e.key == 'Escape' || e.key == 'e') {
            stop_replaying();
        }
        return;
    }
    if(input.elt == document.activeElement) {
        if(e.key == 'Escape' || e.key == 'Enter')
            input.elt.blur();
        return;
    }
    if(e.key == 'Escape' || e.key == 'e') {
        game.pop_camera();
    } else if(e.key == 's') {
        game.step_game();
    } else if(e.key == 'z') {
        game.undo();
    } else if(e.key == 'r') {
        if(is_game_recorder(game)) {
            if(!game.is_recording)
                game.start_recording();
            else {
                let game_record = game.end_recording();
                save_object(game_record, "record.json");
            }
        }
    }
    reset_input_state();
});

window.windowResized = function() {
    resizeCanvas(windowWidth, windowHeight);
    reset_input_size();
}

window.addEventListener('beforeunload', (event) => {
    event.preventDefault(); 
});

//this code was copied line for line, don't know what it does
/** @param {Object} obj */
let save_object = (obj, filename = "data.json") => {
  const json = JSON.stringify(obj);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
