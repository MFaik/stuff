/**
 * @typedef {import('./camera.js').camera} camera
 * @typedef {import('./types.js').bx} bx
 */

import { create_camera } from "./camera.js"
import { wipe_box, remove_box, tick_box } from "./box.js"

const UndoTypes = {
    CAMERA_PUSH: 1,
    CAMERA_POP: 2,
    BOX_ADD: 3,
    BOX_REMOVE: 4,
}

let create_game = () => {
    let main_box = {
        x: 0, y: 0, 
        children: [],
        last_movement_tick: -1,
        name: "",
    };
    const camera = create_camera(width/2, height/2, main_box);

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
        //TODO: this loses the current_camera state, like position and scale
        undo_stack.push({type: UndoTypes.CAMERA_PUSH, box});
    }
    /** 
     * @param {bx} box
     * @param {bx} parent
     */
    let push_undo_box_remove = (box, parent) => {
        undo_stack.push({type: UndoTypes.BOX_REMOVE, box, parent});
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
            //TODO recover camera position and scale
            camera.push(width/2, height/2, undo_obj.box);
        } else if(undo_obj.type == UndoTypes.CAMERA_POP) {
            camera.pop();
        } else if(undo_obj.type == UndoTypes.BOX_REMOVE) {
            remove_box(undo_obj.box, undo_obj.parent);
        } else if(undo_obj.type == UndoTypes.BOX_ADD) {
            undo_obj.parent.children.push(undo_obj.box);
        }
    }

    /** 
     * @type {{camera_snapshot: camera[], undo_stack: any[]}[]}
     */
    let game_states = [];
    let push_game_state = () => {
        game_states.push({camera_snapshot: camera.get_snapshot(), undo_stack});
        undo_stack = [];
    }
    let load_game = () => {
        let save = game_states.pop();
        if(save) {
            wipe_box(camera.get_main_box());
            camera.restore_snapshot(save.camera_snapshot);
            undo_stack = save.undo_stack;
        }
    }

    /** 
     * @param {number} x
     * @param {number} y
     */
    let left_click = (x, y) => {
        let b = camera.get_child_current(x, y);
        if(b) {
            camera.push(width/2, height/2, b)
            push_undo_camera_pop();
        } else {
            b = camera.push_box_current(x, y)
            push_undo_box_remove(b, camera.get_current_box());
        }
    }
    /** 
     * @param {number} x
     * @param {number} y
     */
    let right_click = (x, y) => {
        let b = camera.get_child_current(x, y);
        if(b) {
            push_undo_box_add(b, camera.get_current_box());
            remove_box(b, camera.get_current_box(), true)
        }
    }

    /** @param {bx} box */
    let step_box = (box) => {
        push_game_state();

        tick_box(box);
        let current_box = camera.get_current_box();
        while((!current_box || current_box.x === Infinity) && camera.get_depth() > 1) {
            camera.pop();
            current_box = camera.get_current_box();
        }
    }
    let step_game = () => {
        step_box(camera.get_main_box());
    }

    let pop_camera = () => {
        if(camera.get_depth() > 1) {
            push_undo_camera_push(camera.get_current_box());
            camera.pop();
        }
    }
    let get_current_camera = camera.get_current;
    let get_camera_depth = camera.get_depth;
    let get_box_at_depth = camera.get_box_at_depth;
    let get_current_box = camera.get_current_box;

    return { undo, left_click, right_click, 
             get_current_camera, get_camera_depth, pop_camera, get_current_box, get_box_at_depth,
             step_game, };
}

export { create_game };
