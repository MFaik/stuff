function add(a, b){
    a.x += b.x;
    a.y += b.y;
}

function sub(a, b){
    a.x -= b.x;
    a.y -= b.y;
}

function mul(a, s){
    a.x *= s;
    a.y *= s;
}

function div(a, s){
    a.x /= s;
    a.y /= s;
}

function dot(a, b){
    return a.x*b.x + a.y*b.y;
}

function magnitude(a){
    return sqrt((a.x*a.x)+(a.y*a.y));
}

function dis(a, b){
    return sqrt((a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y));
}

function normalize(a){
    div(a, magnitude(a));
}

