/** @typedef {ReturnType<import("./game.js").create_game>} game */
/** @typedef {ReturnType<game["get_game_state"]>} game_state*/

/** @enum {string} */
const record_type = /** @type {const} */ {
    UNDO: "undo",
    STEP: "step",
    POP_CAMERA: "pop_camera",
    LEFT_CLICK: "left_click",
    RIGHT_CLICK: "right_click",
    PUSH_CAMERA: "push_camera",
};

/** @typedef {{type: typeof record_type.UNDO}} undo_record */
/** @typedef {{type: typeof record_type.STEP}} step_record */
/** @typedef {{type: typeof record_type.POP_CAMERA}} pop_camera_record */
/** @typedef {{type: typeof record_type.LEFT_CLICK | 
 *                   typeof record_type.RIGHT_CLICK|
 *                   typeof record_type.PUSH_CAMERA,
 *             x: number, y: number}} click_record */
/** @typedef {undo_record|step_record|pop_camera_record|click_record} record */

/** @typedef {{start_state: game_state,records: record[],end_state: game_state}} game_record */
/**
 * @typedef {Object} recorder_extra
 * @property {game_record} game_record
 * @property {boolean} is_recording
 * @property {() => void} start_recording
 * @property {() => game_record} end_recording
 */

/** @typedef {recorder_extra & game} game_recorder */

/** @param {game} game */
let create_recorder = (game) => {
    /** @type game_recorder */
    let ret = {
        //TODO fix type bugs
        game_record: {start_state: undefined, records: [], end_state: undefined},
        is_recording: false,
        start_recording() {
            ret.is_recording = true;
            ret.game_record.start_state = ret.get_game_state();
            ret.game_record.records = [];
            for(let i = 1;i < game.get_camera_depth();i++) {
                ret.game_record.records.push({type: record_type.PUSH_CAMERA, 
                                              x: game.get_box_at_depth(i).x,
                                              y: game.get_box_at_depth(i).y});
            }
        },
        end_recording() {
            ret.is_recording = false;
            ret.game_record.end_state = ret.get_game_state();
            return ret.game_record;
        },
        ...game,
    };

    const old_undo = ret.undo;
    ret.undo = (...args) => {
        if(ret.is_recording)
            ret.game_record.records.push({type: record_type.UNDO});
        return old_undo(...args);
    };
    const old_step = ret.step_game;
    ret.step_game = (...args) => {
        if(ret.is_recording)
            ret.game_record.records.push({type: record_type.STEP});
        return old_step(...args);
    }
    const old_pop = ret.pop_camera;
    ret.pop_camera = (...args) => {
        if(ret.is_recording)
            ret.game_record.records.push({type: record_type.POP_CAMERA});
        return old_pop(...args);
    }
    const old_left_click = ret.left_click;
    ret.left_click = (x, y, ...args) => {
        if(ret.is_recording)
            ret.game_record.records.push({type: record_type.LEFT_CLICK, x, y});
        return old_left_click(x, y, ...args);
    }
    const old_right_click = ret.right_click;
    ret.right_click = (x, y, ...args) => {
        if(ret.is_recording)
            ret.game_record.records.push({type: record_type.RIGHT_CLICK, x, y});
        return old_right_click(x, y, ...args);
    }

    return ret;
}

/** 
 * @param {game_recorder|game} game
 * @returns {game is game_recorder}
 */
let is_game_recorder = (game) => {
    return "game_record" in game;
}

export { create_recorder, is_game_recorder, record_type }
