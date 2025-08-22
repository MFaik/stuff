/**
 * @typedef {import('./camera.js').camera} camera
 * @typedef {import('./types.js').bx} bx
 */

import { create_camera_manager } from "./camera.js"
/** @typedef {ReturnType<create_camera_manager>} camera_manager */
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
    let camera_manager = create_camera_manager(-width/2, -height/2, main_box);

    /** @param {bx} box */
    let push_camera = (box) => {
        camera_manager.push_camera(-width/2, -height/2, box);
    }

    //undo type is any because otherwise it adds way too much boilerplate
    /**
     * @type {any[]}
     */
    let undo_stack = [];
    let push_undo_camera_pop = () => {
        undo_stack.push({type: UndoTypes.CAMERA_POP});
    }
    /** 
     * @param {number} x 
     * @param {number} y 
     * @param {number} cam_x
     * @param {number} cam_y
     * @param {number} cam_scale
     */
    let push_undo_camera_push = (x, y, cam_x, cam_y, cam_scale) => {
        undo_stack.push({type: UndoTypes.CAMERA_PUSH, x, y, cam_x, cam_y, cam_scale});
    }
    /** 
     * @param {number} x
     * @param {number} y
     */
    let push_undo_box_remove = (x, y) => {
        undo_stack.push({type: UndoTypes.BOX_REMOVE, x, y});
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
            pop_game_snapshot()
            return;
        }
        if(undo_obj.type == UndoTypes.CAMERA_PUSH) {
            let b = camera_manager.get_child_current(undo_obj.x, undo_obj.y);
            if(!b) throw new Error("trying to go into a box that doesn't exists");
            push_camera(b);
            let c = camera_manager.get_current_camera();
            c.x = undo_obj.cam_x;
            c.y = undo_obj.cam_y;
            c.scale = undo_obj.cam_scale;
        } else if(undo_obj.type == UndoTypes.CAMERA_POP) {
            camera_manager.pop_camera();
        } else if(undo_obj.type == UndoTypes.BOX_REMOVE) {
            let child = camera_manager.get_child_current(undo_obj.x, undo_obj.y);
            if(!child) throw new Error("trying to undo remove a box that doesn't exists");
            remove_box(child, camera_manager.get_current_box());
        } else if(undo_obj.type == UndoTypes.BOX_ADD) {
            undo_obj.parent.children.push(undo_obj.box);
        }
    }

    /** @type {{camera_snapshot: camera[], undo_stack: any[]}[]} */
    let game_snapshots = [];
    let push_game_snapshot = () => {
        game_snapshots.push({camera_snapshot: camera_manager.get_snapshot(), undo_stack});
        undo_stack = [];
    }
    let pop_game_snapshot = () => {
        let save = game_snapshots.pop();
        if(save) {
            wipe_box(camera_manager.get_main_box());
            camera_manager.restore_snapshot(save.camera_snapshot);
            undo_stack = save.undo_stack;
        }
    }

    /** 
     * @param {number} x
     * @param {number} y
     */
    let left_click = (x, y) => {
        let b = camera_manager.get_child_current(x, y);
        if(b) {
            push_camera(b)
            push_undo_camera_pop();
        } else {
            camera_manager.push_box_current(x, y);
            push_undo_box_remove(x, y);
        }
    }
    /** 
     * @param {number} x
     * @param {number} y
     */
    let right_click = (x, y) => {
        let b = camera_manager.get_child_current(x, y);
        if(b) {
            push_undo_box_add(b, camera_manager.get_current_box());
            remove_box(b, camera_manager.get_current_box(), true);
        }
    }

    /** @param {bx} box */
    let step_box = (box) => {
        push_game_snapshot();

        tick_box(box);
        let current_box = camera_manager.get_current_box();
        while((!current_box || current_box.x === Infinity) && camera_manager.get_stack_depth() > 1) {
            camera_manager.pop_camera();
            current_box = camera_manager.get_current_box();
        }
    }
    let step_game = () => {
        step_box(camera_manager.get_main_box());
    }

    let pop_camera = () => {
        if(camera_manager.get_stack_depth() > 1) {
            let b = camera_manager.get_current_box();
            let c = camera_manager.get_current_camera();
            push_undo_camera_push(b.x, b.y, c.x, c.y, c.scale);
            camera_manager.pop_camera();
        }
    }
    /** @type {camera_manager["get_current_camera"]} */
    let get_current_camera = (...args) => camera_manager.get_current_camera(...args);
    /** @type {camera_manager["get_stack_depth"]} */
    let get_camera_depth = (...args) => camera_manager.get_stack_depth(...args);
    /** @type {camera_manager["get_box_at_depth"]} */
    let get_box_at_depth = (...args) => camera_manager.get_box_at_depth(...args);
    let get_current_box_name = () => camera_manager.get_current_box().name;
    /** @param {string} name */
    let set_current_box_name = (name) => camera_manager.get_current_box().name = name;

    /** @type {camera_manager["get_child_current"]} */
    let get_current_child = (...args) => camera_manager.get_child_current(...args);
    /** @typedef {{box: bx, undo_stack: any[]}} game_state */
    /** @return {game_state} */
    let export_game_state = () => {
        return structuredClone({box: camera_manager.get_box_at_depth(0), undo_stack});
    }
    /** @param {game_state} game_state */
    let import_game_state = (game_state) => {
        camera_manager.get_box_at_depth(0).children = game_state.box.children;
        let c = camera_manager.get_current_camera();
        c.x = -width/2;
        c.y = -height/2;
        c.scale = 1;
        undo_stack = game_state.undo_stack;
    }

    return { push_camera,
             undo, left_click, right_click, 
             get_current_camera, get_camera_depth, pop_camera, 
             get_current_box_name, set_current_box_name, get_box_at_depth, get_current_child,
             step_game, export_game_state, import_game_state };
}

export { create_game };
