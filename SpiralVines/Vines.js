let TARGET_SPIRAL_CNT = 100;
let MINIMUM_SPIRAL_RADIUS = 10;
let SPIRAL_DISTANCE = 5;
const ITERATION_LIMIT = 40000;

let SPIRAL_INTERVAL = 10;
let SPIRAL_INTERVAL_INCREASE_BY_RADIUS = 0;
const DRAW_SPEED = 1;

const DRAW_CIRCLES = false;

//spiral{x, y, radius, children[spiral_id]}
let spirals = [];
let spiral_start = [];
//draw_object{angle, progress, spiral_id}
let draw_queue = [{ angle: 270, progress: -10, spiral_id: 0 }];

function spiralPointDistance(spiral, point) {
    return sqrt((spiral.x - point.x) * (spiral.x - point.x) + (spiral.y - point.y) * (spiral.y - point.y)) - spiral.radius;
}

function setup() {
    let items = location.search.slice(1).split("&");
    if (GET["tsc"] != undefined) TARGET_SPIRAL_CNT = +GET["tsc"];
    if (GET["msr"] != undefined) MINIMUM_SPIRAL_RADIUS = +GET["msr"];
    if (GET["sd"] != undefined) SPIRAL_DISTANCE = +GET["sd"];
    if (GET["si"] != undefined) SPIRAL_INTERVAL = +GET["si"];
    if (GET["siibr"] != undefined) SPIRAL_INTERVAL_INCREASE_BY_RADIUS = +GET["siibr"];
    if (GET["debug"]) DRAW_CIRCLES = true;

    createCanvas(innerWidth, innerHeight);
    background(0);
    frameRate(-1);
    noStroke();
    angleMode(DEGREES);

    //point{x, y}
    let points = [];
    for (let i = 0; i < TARGET_SPIRAL_CNT; i++) {
        points.push({ x: random(width), y: random(height) });
    }
    let first_spiral_radius = Math.max(20,MINIMUM_SPIRAL_RADIUS);
    spirals.push({ x: width / 2, y: height - first_spiral_radius - 10, radius: first_spiral_radius, children: [] });
    let iter_cnt = 0;
    while (points.length && iter_cnt++ < ITERATION_LIMIT) {
        let close_point_dis = width * height;
        let close_point = -1;
        for (let i = 0; i < points.length; i++) {
            let dis = spiralPointDistance(spirals[spirals.length - 1], points[i]);
            if (close_point_dis > dis) {
                close_point_dis = dis;
                close_point = i;
            }
        }
        let close_spiral_dis = close_point_dis;
        let close_spiral = spirals.length - 1;
        for (let i = 0; i < spirals.length; i++) {
            let dis = spiralPointDistance(spirals[i], points[close_point]);
            if (close_spiral_dis > dis) {
                close_spiral_dis = dis;
                close_spiral = i;
            }
        }
        if (close_spiral_dis > MINIMUM_SPIRAL_RADIUS + SPIRAL_DISTANCE) {
            spirals[close_spiral].children.push(spirals.length);
            spirals.push({
                x: points[close_point].x, y: points[close_point].y,
                radius: close_spiral_dis - SPIRAL_DISTANCE,
                children: []
            });
        } else {
            points.push({ x: random(width), y: random(height) });
        }
        points.splice(close_point, 1);
    }

    if (DRAW_CIRCLES) {
        fill(100);
        for (let spiral of spirals) {
            circle(spiral.x, spiral.y, spiral.radius * 2);
        }
    }
    fill(255);
}

function draw() {
    if (draw_queue.length == 0)
        return;
    for (let i = 0; i < draw_queue.length; i++) {
        let spiral = spirals[draw_queue[i].spiral_id];
        let prog = draw_queue[i].progress;
        let angle = draw_queue[i].angle;
        let interval = (SPIRAL_INTERVAL_INCREASE_BY_RADIUS * spiral.radius / 10) + SPIRAL_INTERVAL;
        console.log(interval);
        if (draw_queue[i].progress < 0) {
            //draw a line to the start of the spiral
            let prog_diff = min(-prog, DRAW_SPEED * 2);
            circle(spiral.x + cos(angle) * (spiral.radius - prog),
                spiral.y - sin(angle) * (spiral.radius - prog),
                5);
            draw_queue[i].progress += prog_diff;
        } else if (prog < spiral.radius / interval) {
            let spiral_angle = angle + prog * 360;
            let dis = spiral.radius - prog * interval;
            //check for child spirals
            if (prog < 1.5) {
                for (let i = 0; i < spiral.children.length; i++) {
                    let child = spiral.children[i];
                    if (child) {
                        let child_angle = (-atan2(spiral.y - spirals[child].y,
                            spiral.x - spirals[child].x) + 360) % 360;
                        let target_angle = (-atan2(spirals[child].y - spiral.y,
                            spirals[child].x - spiral.x) + 360) % 360
                        if (spiral_angle - (angle > target_angle ? 360 : 0) > target_angle) {
                            draw_queue.push({
                                angle: child_angle, progress: dis - spiral.radius - SPIRAL_DISTANCE,
                                spiral_id: child
                            });
                            spiral.children[i] = false;
                        }
                    }
                }
            }
            //draw the spiral
            circle(spiral.x + cos(spiral_angle) * dis, spiral.y - sin(spiral_angle) * dis, 5);
            draw_queue[i].progress += (DRAW_SPEED / (6.28 * dis));
        } else {
            //if the spiral ended prematurely, start all child spirals from the center
            for (let i = 0; i < spiral.children.length; i++) {
                let child = spiral.children[i];
                if (child) {
                    let child_angle = (-atan2(spiral.y - spirals[child].y,
                        spiral.x - spirals[child].x) + 360) % 360;
                    draw_queue.push({
                        angle: child_angle, progress: -spiral.radius - SPIRAL_DISTANCE,
                        spiral_id: child
                    });
                    spiral.children[i] = false;
                }
            }
            spirals[draw_queue[i].spiral_id].children = [];
        }
    }
}