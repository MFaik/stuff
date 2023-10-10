function toggleSettings() {
    let settings = document.querySelector("#settings");
    settings.setAttribute("open", settings.getAttribute("open") == "open" ? "closed" : "open");
}

var GET = {
    iterCnt: 1000,
    minSize: 10,
    maxSize: 20,
    alg: 3
};
{
    let items = location.search.slice(1).split("&");
    for (let i = 0; i < items.length; i++) {
        let item = items[i].split("=");
        GET[item[0]] = parseInt(item[1]);
        let e = document.getElementsByName(item[0]);
        if(e.length == 1)
            e[0].setAttribute("value", item[1]);
        else {
            for(let i of e){
                if(i.value == item[1])
                    i.setAttribute("checked", "");
                else
                    i.removeAttribute("checked");
            }
        }
    }
}
