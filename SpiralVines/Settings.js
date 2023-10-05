function toggleSettings() {
    let settings = document.querySelector("#settings");
    settings.setAttribute("open", settings.getAttribute("open") == "open" ? "closed" : "open");
}

function connectRangeNumber(range, number, min, max, scale) {
    range.addEventListener('input', function (e) { number.value = e.target.value / scale; console.log(e.target.value); });
    number.addEventListener('input', function (e) {
        let target = e.target.value;
        if (target == "") {
            target = "0";
        } else if (target.slice(-2, -1) != "." && target.slice(-1) == "." && scale != 1) {
            return;
        } else if (isNaN(parseInt(target.slice(-1)))) {
            target = target.slice(0, -1);
        }
        if ((scale == 1 && isNaN(parseInt(target)) || (scale != 1 && isNaN(parseFloat(target))))) {
            number.value = range.value / scale;
            console.log(target);
        } else {
            target = Math.min(number.max, target);
            target = Math.max(number.min, target);
            range.value = target * scale;
            number.value = target;
        }
    });
    range.setAttribute("min", min * scale);
    range.setAttribute("max", max * scale);
    number.setAttribute("min", min);
    number.setAttribute("max", max);
}

let items = location.search.slice(1).split("&");
var GET = [];
for (let i = 0; i < items.length; i++) {
    let item = items[i].split("=");
    GET[item[0]] = item[1];
    if (item[0] === "tsc") TARGET_SPIRAL_CNT = decodeURIComponent(item[1]);
    if (item[0] === "msr") MINIMUM_SPIRAL_RADIUS = decodeURIComponent(item[1]);
    if (item[0] === "sd") SPIRAL_DISTANCE = decodeURIComponent(item[1]);
    if (item[0] === "si") SPIRAL_INTERVAL = decodeURIComponent(item[1]);
    if (item[0] === "siibr") SPIRAL_INTERVAL_INCREASE_BY_RADIUS = decodeURIComponent(item[1]);
}

let settings = [{
    name: "Target Spiral Count", id: "tsc",
    value: GET["tsc"] ? GET["tsc"] : 100,
    min: 0, max: 1000, scale: 1
},
{
    name: "Minimum Spiral Radius", id: "msr",
    value: GET["msr"] ? GET["msr"] : 10,
    mmin: 10, max: 100, scale: 1
},
{
    name: "Spiral to Spiral Distance", id: "sd",
    value: GET["sd"] ? GET["sd"] : 5,
    min: 0, max: 20, scale: 1
},
{
    name: "Spiral Loop Interval", id: "si",
    value: GET["si"] ? GET["si"] : 10,
    min: 2, max: 20, scale: 1
},
{
    name: "Spiral Loop Interval Increase by Radius", id: "siibr",
    value: GET["siibr"] ? GET["siibr"] : 0,
    min: 0, max: 1, scale: 100
},
];

let form = document.getElementById("settings");
for (let setting of settings.reverse()) {
    let inputParentParent = document.createElement("div");

    let label = document.createElement("div");
    label.textContent = setting.name;
    label.setAttribute("class", "label");

    let inputParent = document.createElement("div");
    inputParent.setAttribute("class", "inputParent");
    let number = document.createElement("input");
    number.setAttribute("type", "text");
    number.setAttribute("name", setting.id);
    number.setAttribute("class", "number");
    let range = document.createElement("input");
    range.setAttribute("type", "range");
    range.setAttribute("class", "range");

    connectRangeNumber(range, number, setting.min, setting.max, setting.scale);

    range.setAttribute("value", setting.value * setting.scale);
    number.setAttribute("value", setting.value);

    inputParent.appendChild(range);
    inputParent.appendChild(number);

    inputParentParent.appendChild(label);
    inputParentParent.appendChild(inputParent);
    form.prepend(inputParentParent);
}  