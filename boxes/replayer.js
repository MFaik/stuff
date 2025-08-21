/** 
 * @typedef {ReturnType<import("./game.js").create_game>} game
 * @typedef {ReturnType<game["get_game_state"]>} game_state
 * @typedef {import("./recorder.js").game_record} game_record
 */

import { box_equals } from "./box.js";
import { create_game } from "./game.js";
import { record_type } from "./recorder.js";

/** @param {game_record} game_record */
let create_replayer = (game_record) => {
    let game = create_game();
    game.set_game_state(game_record.start_state);

    let current_step = 0;
    let step = () => {
        if(current_step >= game_record.records.length) return false;
        let curr = game_record.records[current_step++];
        switch(curr.type) {
            case record_type.UNDO:
                game.undo();
                break;
            case record_type.STEP:
                game.step_game();
                break;
            case record_type.POP_CAMERA:
                game.pop_camera();
                break;
            case record_type.LEFT_CLICK:
                //TODO fix type bugs
                game.left_click(curr.x, curr.y);
                break;
            case record_type.RIGHT_CLICK:
                game.right_click(curr.x, curr.y);
                break;
            case record_type.PUSH_CAMERA:
                let b = game.get_current_child(curr.x, curr.y);
                if(!b) throw new Error("box doesn't exists for undo pushbox");
                game.push_camera(b);
        }
        return true;
    }

    let is_accurate = () => {
        if(current_step < game_record.records.length)
            throw new Error("Calling is_accurate before finishing the simulation");
        let game_state = game.get_game_state();
        return box_equals(game_state.box, game_record.end_state.box) 
               && JSON.stringify(game_record.end_state.undo_stack) == JSON.stringify(game_state.undo_stack);
    }

    return { step, is_accurate, game };
}

export { create_replayer }
