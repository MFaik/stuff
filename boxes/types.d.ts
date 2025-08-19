//one may ask, > why is this type named "bx" and not "box"
//> are you saving the world with the time you saved not typing "o"?
//but unfortunately, this change was made to avoid naming conflict with p5.box()
//the parent is not stored in the box to reduce the memory footprint
export type bx = {
  x: number;
  y: number;
  children: bx[];
  last_movement_tick: number;
  name: string;
}

export type camera = {
  x: number;
  y: number;
  scale: number;
  selected_box: bx;
}
