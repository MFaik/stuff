/// <reference path="lib/global.d.ts" />
/// <reference path="lib/index.d.ts" />
/// <reference path="lib/extra.d.ts" />

/** @typedef {import('./types.js').bx} bx */
/** @typedef {import('./types.js').camera} camera*/

import { create_game } from "./game.js"
import { create_recorder, is_game_recorder } from "./recorder.js"
import { create_replayer } from "./replayer.js";

let show_help = true;

const tile_size = 40;
const help_text_size = 20;
const box_text_size = 16;
/** @type {ReturnType<typeof create_game>|ReturnType<typeof create_recorder>} */
let game;
/** @type {ReturnType<typeof create_replayer>} */
let replayer;
/** @type {ReturnType<typeof createInput>} */
let input;

let is_replaying = false;

const params = new URLSearchParams(window.location.search);
let can_record = params.has('record');
/** @ts-ignore */
window.setup = function() {
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.drop(handleFile);
    noStroke();

    game = create_game();
    if(can_record) {
        console.log("recording is enabled");
        game = create_recorder(game);
    }

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
            input.hide();
        } else if("box" in json) {
            game.import_game_state({box: json.box, undo_stack: []});
        }
    }
}

let stop_replaying = () => {
    is_replaying = false;
    game = replayer.game;
    if(can_record) {
        game = create_recorder(game);
    }
}

/** @ts-ignore */
window.draw = function() {
    if(!is_replaying) {
        draw_game(game);
        //TODO replace with can_record
        if(is_game_recorder(game) && game.is_recording) {
            fill(255, 0, 0);
            rect(10, 40, 30);
        }
    
        if(show_help) draw_game_help();
    } else {
        draw_game(replayer.game);

        fill(0, 0, 255);
        triangle(40, 60, 10, 40, 10, 80);

        if(show_help) draw_replay_help();
    }
}

/** @param {game} game */
let draw_game = (game) => {
    background(30+game.get_camera_depth()*10, 10, 10);

    for(let i = 0;i < game.get_camera_depth()-1;i++) {
        draw_box_at_place(5+i*30, 5, 30, 2, game.get_box_at_depth(i));
    }

    let c = game.get_current_camera();

    if(keyIsDown(RIGHT_ARROW)) c.x += c.scale*deltaTime;
    if(keyIsDown(LEFT_ARROW)) c.x -= c.scale*deltaTime;
    if(keyIsDown(DOWN_ARROW)) c.y += c.scale*deltaTime;
    if(keyIsDown(UP_ARROW)) c.y -= c.scale*deltaTime;

    push();
    translate(-c.x, -c.y)
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
    pop();
}

/** 
 * @param {camera} camera
 * @param {bx} box
 * @returns {boolean}
 */
let is_inside_camera_boundry = (camera, box) => {
    let current_tile_size = tile_size*camera.scale;
    let x = box.x*current_tile_size-camera.x;
    let y = box.y*current_tile_size-camera.y;
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
    let x = box.x*current_tile_size-camera.x;
    let y = box.y*current_tile_size-camera.y;
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
    fill(255);
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
}

/** @param {bx} box */
let draw_box = (box) => {
    draw_box_at_place(box.x*tile_size, box.y*tile_size, 
                      tile_size, 2, box);
}

/** @param {bx} box */
let draw_box_text = (box) => {
    if(!box.name)return;
    textSize(box_text_size);
    let x = box.x*tile_size+tile_size/2-textWidth(box.name)/2;
    let y = box.y*tile_size-box_text_size;
    fill(255, 200);
    rect(x-5, y-3-box_text_size, textWidth(box.name)+10, box_text_size+10);
    fill(0);
    text(box.name, x, y);
}

/** @typedef {[string, string][]} help_texts */
/** @type help_texts */
const game_help_texts = [
    ['h', 'close this help box'],
    ['arrow keys', 'move camera around'],
    ['scroll wheel', 'scale the camera'],
    ['left click on empty cell', 'create a box'], 
    ['left click on a box', 'go into the box'],
    ['right click on a box', 'remove the box'],
    ['escape', 'go up one layer'],
    ['s', 'step the simulation'],
    ['z', 'undo'],
    ['enter a name at the top', 'for the box you are in'],
    ['c', 'save game to a file'],
];
if(can_record)
    game_help_texts.push(['r', 'record the game']);
let draw_game_help = () => {
    draw_help(game_help_texts);
}

/** @type help_texts */
const replay_help_texts = [
    ['h', 'close this help box'],
    ['arrow keys', 'move camera around'],
    ['scroll wheel', 'scale the camera'],
    ['s', 'step the replay'],
    ['escape', 'exit replay'],
];
let draw_replay_help = () => {
    draw_help(replay_help_texts);
}

/** @param {help_texts} help_texts */
let draw_help = (help_texts) => {
    textSize(help_text_size);
    let total_text_height = help_text_size*help_texts.length;
    let max_help_width = 0;
    let max_button_width = 0;
    let splitter = ' - ';
    for(let h of help_texts) {
        max_button_width = max(max_button_width, textWidth(h[0]));
        max_help_width = max(max_help_width, textWidth(h[1]));
    }

    let x_offset = 0;
    let y_offset = height-total_text_height-30;
    fill(255, 50);
    rect(x_offset, y_offset, max_button_width+max_help_width+textWidth(splitter)+30, total_text_height+20);
    fill(200, 200, 200);
    for(let i = 0;i < help_texts.length;i++) {
        let curr_help = help_texts[i];
        text(curr_help[0], x_offset+10, y_offset+(i+1)*help_text_size+10);
        text(splitter + curr_help[1], 
             x_offset+10+max_button_width, y_offset+(i+1)*help_text_size+10);

    }
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
    let x = mouseX + current_camera.x;
    x /= current_camera.scale*tile_size;
    x = floor(x);
    let y = mouseY + current_camera.y;
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
    /** @ts-ignore */
    let d = event.delta;
    let c = game.get_current_camera();
    let old_scale = c.scale;
    c.scale += d * -0.001;
    c.scale = constrain(c.scale, 0.5, 2);
    c.x = (c.x+mouseX)*c.scale/old_scale-mouseX;
    c.y = (c.y+mouseY)*c.scale/old_scale-mouseY;
    return false;
}

window.addEventListener('keydown', (e) => {
    if(input.elt == document.activeElement) {
        if(e.key == 'Escape' || e.key == 'Enter')
            input.elt.blur();
        return;
    }
    if(e.key == 'h') {
        show_help = !show_help;
    }
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
    if(e.key == 'Escape' || e.key == 'e') {
        game.pop_camera();
    } else if(e.key == 's') {
        game.step_game();
    } else if(e.key == 'z') {
        game.undo();
    } else if (e.key == 'c') {
        save_object({box: game.export_game_state().box}, "box.json");
    } else if(e.key == 'r') {
        //TODO replace with can_record
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
