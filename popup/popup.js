var bgPage = chrome.extension.getBackgroundPage();

function init(details){
    var savedata = JSON.parse(localStorage.getItem("savedata"));
    var blockList = savedata["blockList"];
    var table = document.createElement("table");
    //option {{{
    var option = {};
    option["row"] = table.insertRow(-1);
    option["icon"] = option["row"].insertCell(-1);
    option["img"] = document.createElement("img");
    option["img"].src="option.png";
    option["icon"].appendChild(option["img"]);

    // void
    option["row"].insertCell(-1);

    option["description"] = option["row"].insertCell(-1);
    option["text"] = document.createElement("p");
    option["text"].innerHTML = "設定";
    option["text"].setAttribute("class", "description");
    option["description"].appendChild(option["text"]);
    option["row"].addEventListener("click", function (){
        chrome.runtime.openOptionsPage();
    });
    //option }}}
    // toggle All {{{
    toggleAll = {};
    toggleAll["toggle"] = {};
    toggleAll["row"] = table.insertRow(-1);
    toggleAll["toggle"]["cell"] = toggleAll["row"].insertCell(-1);
    toggleAll["toggle"]["input"] = document.createElement("input");
    toggleAll["toggle"]["input"].setAttribute("type", "checkbox");
    toggleAll["toggle"]["input"].setAttribute("id", "toggleAll");
    toggleAll["toggle"]["input"].setAttribute("class", "toggle");
    toggleAll["toggle"]["input"].setAttribute("name", "toggleAll");
    toggleAll["toggle"]["input"].setAttribute("value", "1");

    toggleAll["toggle"]["label"] = document.createElement("label");
    toggleAll["toggle"]["label"].htmlFor = "toggleAll";

    toggleAll["toggle"]["cell"].appendChild(toggleAll["toggle"]["input"]);
    toggleAll["toggle"]["cell"].appendChild(toggleAll["toggle"]["label"]);

    toggleAll["toggle"]["input"].checked = ((savedata["options"]["flag"] & bgPage.FLAG_ALL.VALID) !=0);
    toggleAll["toggle"]["input"].addEventListener("click", function (){
        var savedata = JSON.parse(localStorage.getItem("savedata"));
        //XXX:prototype shift
        savedata["options"]["flag"] = (savedata["options"]["flag"] & ~bgPage.FLAG_ALL.VALID) | toggleAll["toggle"]["input"].checked;
        localStorage.setItem("savedata", JSON.stringify(savedata));
        bgPage.currentTabActiveIcon();
    });

    toggleAll["click"] = function (){
        toggleAll["toggle"]["input"].click();
    }
    // void
    toggleAll["row"].insertCell(-1).addEventListener("click", toggleAll["click"]);

    toggleAll["description"] = toggleAll["row"].insertCell(-1);
    toggleAll["text"] = document.createElement("p");
    toggleAll["text"].innerHTML = "WebRequestBlockを" + (toggleAll["toggle"]["input"].checked?"無効":"有効") + "にする";
    //toggleAll["text"].innerHTML = "WebRequestBlockを" + toggleAll["toggle"]["input"].checked?"無効":"有効" + "にする";
    toggleAll["text"].setAttribute("class", "description");
    toggleAll["description"].appendChild(toggleAll["text"]);
    toggleAll["description"].addEventListener("click", toggleAll["click"]);
    // toggle All }}}
    // current block toggle{{{
    chrome.tabs.query({active:true, currentWindow:true}, function(e){
        /*
        var savedata = JSON.parse(localStorage.getItem("savedata"));
        var blockList = savedata["blockList"];
        */
        if(blockList != null){
            var blockCurrent = {};
            for(var i=0;i<blockList.length;i++){
                var srcUrl = new RegExp(blockList[i]["src"]);
                if(srcUrl.test(e[0].url) && ((blockList[i]["flag"] & bgPage.FLAG_EACH.TRASH) == 0)){
                    blockCurrent["row"+i] = table.insertRow(-1);
                    blockCurrent["toggle"+i] = blockCurrent["row"+i].insertCell(-1);

                    blockCurrent["input"+i] = document.createElement("input");
                    blockCurrent["input"+i].setAttribute("type", "checkbox");
                    blockCurrent["input"+i].setAttribute("id", "toggle" + i);
                    blockCurrent["input"+i].setAttribute("class", "toggle");
                    blockCurrent["input"+i].setAttribute("name", "toggle" + i);
                    blockCurrent["input"+i].setAttribute("value", "1");

                    blockCurrent["label"+i] = document.createElement("label");
                    blockCurrent["label"+i].htmlFor = "toggle" + i;

                    blockCurrent["toggle"+i].appendChild(blockCurrent["input"+i]);
                    blockCurrent["toggle"+i].appendChild(blockCurrent["label"+i]);

                    blockCurrent["input"+i].checked = (blockList[i]["flag"] & bgPage.FLAG_EACH.VALID) !=0;

                    blockCurrent["num"+i] = blockCurrent["row"+i].insertCell(-1);
                    blockCurrent["numText"+i] = document.createElement("p");
                    blockCurrent["numText"+i].innerHTML = i;
                    blockCurrent["num"+i].appendChild(blockCurrent["numText"+i]);

                    blockCurrent["description"+i] = blockCurrent["row"+i].insertCell(-1);
                    blockCurrent["text"+i] = document.createElement("p");
                    blockCurrent["text"+i].innerHTML = (function (){
                        if(blockList[i]["dest"].length<48){
                            return blockList[i]["dest"];
                        }else{
                            return blockList[i]["dest"].slice(0,48) + "...";
                        }
                    })();
                    blockCurrent["text"+i].setAttribute("class", "description");
                    blockCurrent["description"+i].appendChild(blockCurrent["text"+i]);

                    (function (i){
                        blockCurrent["click"+i] = function (){
                            blockCurrent["input"+i].click();
                        }
                        blockCurrent["num"+i].addEventListener("click", blockCurrent["click"+i]);
                        blockCurrent["description"+i].addEventListener("click", blockCurrent["click"+i]);

                        blockCurrent["input"+i].addEventListener("change", function (){
                            var savedata = JSON.parse(localStorage.getItem("savedata"));
                            var blockList = savedata["blockList"];
                            blockList[i]["flag"] |= blockCurrent["input"+i].checked;
                            savedata["blockList"] = blockList;
                            localStorage.setItem("savedata", JSON.stringify(savedata));
                            bgPage.toggleBlockEvent(i);
                        });
                    })(i);
                }
            }
        }
    });
    // current block toggle}}}
    document.body.appendChild(table);
}

document.addEventListener("DOMContentLoaded", init, false);

/* vim: set foldmethod=marker: */
