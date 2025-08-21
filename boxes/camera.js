/**
 * @typedef {import('./types.js').bx} bx
 * @typedef {import('./types.js').camera} camera
 */

import { create_box, get_child } from "./box.js"

/**
 * @param {number} x
 * @param {number} y
 * @param {bx} main_box
 */

//TODO there are two different types named camera
const create_camera = (x, y, main_box) => {
    /** @type {camera[]} */
    let camera_stack = [{ x, y, scale: 1, selected_box: main_box }];
    return {
        /** 
         * @param {bx} selected_box 
         * @param {number} x
         * @param {number} y
         */
        push(x, y, selected_box) {
            const c = {x , y, scale: 1, selected_box};
            camera_stack.push(c);
            return c;
        },
        pop() {
            camera_stack.pop();
        },
        get_depth() {
            return camera_stack.length;
        },
        get_current() {
            return camera_stack[camera_stack.length-1];
        },
        get_main_box() { 
            return camera_stack[0].selected_box;
        },
        get_current_box() { 
            return camera_stack[camera_stack.length-1].selected_box;
        },
        /** @param {number} i */
        get_box_at_depth(i){ 
            return camera_stack[i].selected_box;
        },
        get_snapshot(){
            return structuredClone(camera_stack);
        },
        /** @param {camera[]} snapshot */
        restore_snapshot(snapshot){
            camera_stack = snapshot;
        },
        /** 
         * @param {number} x
         * @param {number} y
         */
        push_box_current(x, y) { 
            return create_box(x, y, this.get_current_box());
        },
        /**
         * @param {number} x
         * @param {number} y
         */
        get_child_current(x, y) {
            return get_child(x, y, this.get_current_box())
        },
    }
};

export { create_camera };
