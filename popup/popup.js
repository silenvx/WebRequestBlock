var bgPage = chrome.extension.getBackgroundPage();

function init(details){
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
    document.body.appendChild(table);
    option["row"].addEventListener("click", function (){
        chrome.runtime.openOptionsPage();
    });
    //option }}}
    // current block toggle{{{
    chrome.tabs.query({active:true, currentWindow:true}, function(e){
        var blockList = JSON.parse(localStorage.getItem("blockList"));
        if(blockList != null){
            var blockCurrent = {};
            for(var i=0;i<blockList.length;i++){
                var srcUrl = new RegExp(blockList[i]["src"]);
                if(srcUrl.test(e[0].url)){
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

                    blockCurrent["input"+i].checked = blockList[i]["toggle"];

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

                    document.body.appendChild(table);
                    (function (i){
                        blockCurrent["description"+i].addEventListener("click", function (){
                            blockCurrent["input"+i].click();
                        });
                        blockCurrent["input"+i].addEventListener("change", function (){
                            blockList[i]["toggle"] = blockCurrent["input"+i].checked;
                            localStorage.setItem("blockList", JSON.stringify(blockList));
                            bgPage.toggleBlockEvent(i);
                        });
                    })(i);
                }
            }
        }
    });
    // current block toggle}}}
}

document.addEventListener("DOMContentLoaded", init, false);

/* vim: set foldmethod=marker: */
