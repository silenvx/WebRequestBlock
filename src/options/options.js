var bgPage = chrome.extension.getBackgroundPage();

function init(){
    var savedata = JSON.parse(localStorage.getItem("savedata"));
    if(savedata == null){
        savedata = {options:{}, blockList:[]};
    }
    savedata["options"]["flag"] &= ~bgPage.FLAG_ALL.TRASH;
    var blockList = savedata["blockList"];
    // trash remove
    for(var i=0,d=0,l=blockList.length;i<l;i++){
        if((blockList[i-d]["flag"] & bgPage.FLAG_EACH.TRASH) !=0){
            bgPage.removeBlockEvent(i-d);
            blockList.splice(i-d,1);
            d++;
        }
        bgPage.blockListUpdate(blockList);
    }
    localStorage.setItem("savedata", JSON.stringify(savedata));

    initList(blockList);
    // save button {{{
    var saveElement= document.createElement("div");
    saveElement.setAttribute("id", "saveButton");
    saveElement.innerHTML = "保存";
    saveElement.addEventListener("click", function (){
        var blob = new Blob([localStorage.getItem("savedata")],{type: "application\/json"});
        var saveFile= document.createElement("a");
        saveFile.setAttribute("id", "saveFile");
        saveFile.innerHTML = "保存";
        saveFile.download = "webRequestBlock.json";
        saveFile.href = URL.createObjectURL(blob);
        document.body.appendChild(saveFile);
        saveFile.click();
        document.body.removeChild(saveFile);
    });
    document.getElementById("configure").appendChild(saveElement)
    // save button }}}
    // load button {{{
    var loadFile = document.createElement("input");
    loadFile.setAttribute("type", "file");
    loadFile.setAttribute("id", "loadFile");
    loadFile.addEventListener("click", function(e){
        this.value = null;
    });
    loadFile.addEventListener("change", function(e){
        var file = e.target.files;
        var reader = new FileReader();
        reader.readAsText(file[0]);

        reader.onload = function(e){
            var savedata = JSON.parse(localStorage.getItem("savedata"));
            /*
            for(var i=0;i<blockList.length;i++){
                bgPage.removeBlockEvent(i);
            }
            */
            for(var l=blockList.length;0<l;l--){
                bgPage.removeBlockEvent(0);
                blockList.splice(0,1);
                bgPage.blockListUpdate(blockList);
            }
            savedata = JSON.parse(reader.result);
            if((typeof(savedata["name"]) != "undefined") && (savedata["name"] == "WebRequestBlock")){
                blockList = savedata["blockList"]
                localStorage.setItem("savedata", JSON.stringify(savedata));
                bgPage.init();
                refreshList(blockList);
            }else{
                savedata = JSON.parse(localStorage.getItem("savedata"));
                blockList = savedata["blockList"]
                bgPage.init();
                refreshList(blockList);
                console.log("load file error");
            }
            bgPage.blockListUpdate(blockList);
        }
    });
    var loadElement= document.createElement("div");
    loadElement.setAttribute("id", "loadButton");
    loadElement.innerHTML = "読込";
    loadElement.addEventListener("click", function (){
        loadFile.click();
    });
    document.getElementById("configure").appendChild(loadElement)
    // load button }}}
}

function initList(blockList){
    var savedata = JSON.parse(localStorage.getItem("savedata"));
    var list_title = ["切替", "番号", "コメント", "対象のURL", "拒否するURL", "操作"];
    var list_title_question = ["", "", "", "https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Regular_Expressions", "https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/Match_patterns", ""];
    var listTable = document.createElement("table");
    listTable.setAttribute("id", "listTable");
    var main = document.getElementById("main");
    main.appendChild(listTable);

    // table head {{{
    var list_head = listTable.createTHead();
    var tdHead = {};
    tdHead["row"] = list_head.insertRow(-1);
    // cbxAll{{{
    tdHead["cbxAll"] = {};
    tdHead["cbxAll"]["cell"] = tdHead["row"].insertCell(-1);
    tdHead["cbxAll"]["input"] = document.createElement("input");
    tdHead["cbxAll"]["input"].setAttribute("type", "checkbox");
    tdHead["cbxAll"]["input"].setAttribute("id", "cbxAll");
    tdHead["cbxAll"]["input"].setAttribute("name", "cbxAll");
    tdHead["cbxAll"]["input"].setAttribute("value", "1");

    tdHead["cbxAll"]["cell"].appendChild(tdHead["cbxAll"]["input"]);
    tdHead["cbxAll"]["input"].addEventListener("click", function (){
        var cbxList = document.getElementsByClassName("cbxList");
        for(var i=0;i<cbxList.length;i++){
            cbxList[i].checked = document.getElementById("cbxAll").checked;
        }
    });
    // cbxAll}}}

    var questionLink = [];
    for(var i=0;i<list_title.length;i++){
        questionLink[i] = {};
        questionLink[i]["cell"] = tdHead["row"].insertCell(-1);
        questionLink[i]["cell"].appendChild(document.createTextNode(list_title[i]));
        if(list_title_question[i] != ""){
            questionLink[i]["a"] = document.createElement("a");
            questionLink[i]["a"].href = list_title_question[i];
            questionLink[i]["a"].target = "_blank";
            questionLink[i]["image"] = document.createElement("img");
            questionLink[i]["image"].src = "question.png";
            questionLink[i]["a"].appendChild(questionLink[i]["image"]);
            questionLink[i]["cell"].appendChild(questionLink[i]["a"]);

        }
    }
    // table head }}}
    // table body {{{
    var list_body = listTable.createTBody();
    // add area {{{
    var tdAdd = {};
    tdAdd["row"] = list_body.insertRow(-1);
    tdAdd["row"].setAttribute("class", "listAdd");
    for(var i=0;i<list_title.length+1;i++){
        tdAdd["row"].insertCell(-1);
    }
    const CARDINAL_SKIP = 3;
    tdAdd["comment"] = {};
    tdAdd["comment"]["cell"] = tdAdd["row"].cells[CARDINAL_SKIP + 0];
    tdAdd["comment"]["input"] = document.createElement("input");
    tdAdd["comment"]["input"].setAttribute("type", "textarea");
    tdAdd["comment"]["input"].setAttribute("id", "comment");
    tdAdd["comment"]["input"].setAttribute("class", "textarea");
    tdAdd["comment"]["input"].setAttribute("placeholder", "説明文を入力する");
    tdAdd["comment"]["cell"].appendChild(tdAdd["comment"]["input"]);

    tdAdd["src"] = {};
    tdAdd["src"]["cell"] = tdAdd["row"].cells[CARDINAL_SKIP + 1];
    tdAdd["src"]["input"] = document.createElement("input");
    tdAdd["src"]["input"].setAttribute("type", "textarea");
    tdAdd["src"]["input"].setAttribute("id", "srcUrl");
    tdAdd["src"]["input"].setAttribute("class", "textarea");
    tdAdd["src"]["input"].setAttribute("placeholder", "対象のURLを入力する");
    tdAdd["src"]["cell"].appendChild(tdAdd["src"]["input"]);

    tdAdd["dest"] = {};
    tdAdd["dest"]["cell"] = tdAdd["row"].cells[CARDINAL_SKIP + 2];
    tdAdd["dest"]["input"] = document.createElement("input");
    tdAdd["dest"]["input"].setAttribute("type", "textarea");
    tdAdd["dest"]["input"].setAttribute("id", "destUrl");
    tdAdd["dest"]["input"].setAttribute("class", "textarea");
    tdAdd["dest"]["input"].setAttribute("placeholder", "拒否するURLを入力する");
    tdAdd["dest"]["cell"].appendChild(tdAdd["dest"]["input"]);

    tdAdd["add"] = {};
    tdAdd["add"]["cell"] = tdAdd["row"].cells[CARDINAL_SKIP + 3];
    tdAdd["add"]["input"] = document.createElement("input");
    tdAdd["add"]["input"].setAttribute("type", "image");
    tdAdd["add"]["input"].setAttribute("src", "add.png");
    tdAdd["add"]["input"].setAttribute("id", "addList");
    tdAdd["add"]["cell"].appendChild(tdAdd["add"]["input"]);
    tdAdd["add"]["input"].addEventListener("click", function (){
        var savedata = JSON.parse(localStorage.getItem("savedata"));
        var blockList = savedata["blockList"];
        var comment = document.getElementById("comment").value;
        var src = document.getElementById("srcUrl").value;
        var dest = document.getElementById("destUrl").value;
        document.getElementById("comment").value = "";
        document.getElementById("srcUrl").value = "";
        document.getElementById("destUrl").value = "";
        blockList.unshift({flag:bgPage.FLAG_EACH.VALID, comment:comment, src:src, dest:dest})
        bgPage.blockListUpdate(blockList);
        bgPage.addBlockEvent(blockList.length-1);
        refreshList(blockList);
    });
    tdAdd["comment"]["input"].addEventListener("keydown", function (e){
        if(e.keyCode === 13){
            tdAdd["src"]["input"].focus();
        }
    });
    tdAdd["src"]["input"].addEventListener("keydown", function (e){
        if(e.keyCode === 13){
            tdAdd["dest"]["input"].focus();
        }
    });
    tdAdd["dest"]["input"].addEventListener("keydown", function (e){
        if(e.keyCode === 13){
            tdAdd["add"]["input"].click();
            tdAdd["dest"]["input"].blur();
        }
    });
    // add area }}}
    // all area {{{
    var tdAll = {};
    tdAll["row"] = listTable.insertRow(-1);
    // cbxAll{{{
    tdAll["cbxAll"] = {};
    tdAll["cbxAll"]["cell"] = tdAll["row"].insertCell(-1);
    tdAll["cbxAll"]["input"] = document.createElement("input");
    tdAll["cbxAll"]["input"].setAttribute("type", "checkbox");
    tdAll["cbxAll"]["input"].setAttribute("id", "cbxAll");
    tdAll["cbxAll"]["input"].setAttribute("name", "cbxAll");
    tdAll["cbxAll"]["input"].setAttribute("value", "1");

    tdAll["cbxAll"]["cell"].appendChild(tdAll["cbxAll"]["input"]);
    tdAll["cbxAll"]["input"].addEventListener("click", function (){
        var cbxList = document.getElementsByClassName("cbxList");
        for(var i=0;i<cbxList.length;i++){
            cbxList[i].checked = document.getElementById("cbxAll").checked;
        }
    });
    // cbxAll}}}
    // toggle All {{{
    tdAll["toggle"] = {};
    tdAll["toggle"]["cell"] = tdAll["row"].insertCell(-1);
    tdAll["toggle"]["input"] = document.createElement("input");
    tdAll["toggle"]["input"].setAttribute("type", "checkbox");
    tdAll["toggle"]["input"].setAttribute("id", "toggleAll");
    tdAll["toggle"]["input"].setAttribute("class", "toggle");
    tdAll["toggle"]["input"].setAttribute("name", "toggleAll");
    tdAll["toggle"]["input"].setAttribute("value", "1");

    tdAll["toggle"]["label"] = document.createElement("label");
    tdAll["toggle"]["label"].htmlFor = "toggleAll";

    tdAll["toggle"]["cell"].appendChild(tdAll["toggle"]["input"]);
    tdAll["toggle"]["cell"].appendChild(tdAll["toggle"]["label"]);

    tdAll["toggle"]["input"].checked = ((savedata["options"]["flag"] & bgPage.FLAG_ALL.VALID) !=0);
    tdAll["toggle"]["input"].addEventListener("click", function (){
        var savedata = JSON.parse(localStorage.getItem("savedata"));
        //XXX:prototype shift
        //savedata["options"]["flag"] = (savedata["options"]["flag"] & ~bgPage.FLAG_ALL.VALID) | tdAll["toggle"]["input"].checked;
        if(tdAll["toggle"]["input"].checked){
            savedata["options"]["flag"] |= bgPage.FLAG_ALL.VALID;
        }else{
            savedata["options"]["flag"] &= ~bgPage.FLAG_ALL.VALID;
        }
        //savedata["options"]["flag"] &= tdAll["toggle"]["input"].checked?~0:~bgPage.FLAG_ALL.VALID;
        localStorage.setItem("savedata", JSON.stringify(savedata));
        bgPage.currentTabActiveIcon();
    });
    // toggle All }}}
    tdAll["row"].insertCell(-1);
    tdAll["row"].insertCell(-1).appendChild(document.createTextNode("All"));
    tdAll["row"].insertCell(-1);
    tdAll["row"].insertCell(-1);
    // operations {{{
    tdAll["op"] = {};
    tdAll["op"]["cell"] = tdAll["row"].insertCell(-1);
    // trash {{{
    tdAll["op"]["input"] = document.createElement("input");
    tdAll["op"]["input"].setAttribute("type", "image");
    tdAll["op"]["input"].setAttribute("src", "trash.png");
    tdAll["op"]["input"].setAttribute("id", "delList");

    tdAll["op"]["input"].setAttribute("src", "trash.png");
    tdAll["op"]["cell"].appendChild(tdAll["op"]["input"]);
    tdAll["op"]["input"].addEventListener("click", function (){
        var savedata = JSON.parse(localStorage.getItem("savedata"));
        var blockList = savedata["blockList"];
        savedata["options"]["flag"] ^= bgPage.FLAG_ALL.TRASH;
        if((savedata["options"]["flag"] & bgPage.FLAG_ALL.TRASH) == 0){
            tdAll["op"]["input"].setAttribute("src", "trash.png");
            tdAll["row"].setAttribute("style", "color:#000;");
        }else{
            tdAll["op"]["input"].setAttribute("src", "back.png");
            tdAll["row"].setAttribute("style", "color:#ccc;");
        }
        for(var i=0;i<blockList.length;i++){
            if(savedata["options"]["flag"] & bgPage.FLAG_ALL.TRASH){
                blockList[i]["flag"] |= bgPage.FLAG_EACH.TRASH;
            }else{
                blockList[i]["flag"] &= ~bgPage.FLAG_EACH.TRASH;
            }
        }
        localStorage.setItem("savedata", JSON.stringify(savedata));
        bgPage.blockListUpdate(blockList);
        refreshList(blockList);
    });
    // trash }}}
    // operations }}}
// added list }}}
// all area }}}
// table body }}}
refreshList(blockList);
}

function refreshList(blockList){
    var listTable = document.getElementById("listTable");
    while(listTable.rows[3]){
        listTable.deleteRow(3);
    }
    // added list {{{
    var tdList = [];
    for(var i=0;i<blockList.length;i++){
        tdList[i] = {};
        tdList[i]["row"] = listTable.insertRow(-1);
        // checkbox {{{
        tdList[i]["cbx"] = {};
        tdList[i]["cbx"]["cell"] = tdList[i]["row"].insertCell(-1);
        tdList[i]["cbx"]["input"] = document.createElement("input");
        tdList[i]["cbx"]["input"].setAttribute("type", "checkbox");
        tdList[i]["cbx"]["input"].setAttribute("id", "cbx" + i);
        tdList[i]["cbx"]["input"].setAttribute("class", "cbxList");
        tdList[i]["cbx"]["input"].setAttribute("name", "cbx" + i);
        tdList[i]["cbx"]["input"].setAttribute("value", "1");

        tdList[i]["cbx"]["cell"].appendChild(tdList[i]["cbx"]["input"]);

        // checkbox }}}
        // toggle switch {{{
        tdList[i]["toggle"] = {};
        tdList[i]["toggle"]["cell"] = tdList[i]["row"].insertCell(-1);
        tdList[i]["toggle"]["input"] = document.createElement("input");
        tdList[i]["toggle"]["input"].setAttribute("type", "checkbox");
        tdList[i]["toggle"]["input"].setAttribute("id", "toggle" + i);
        tdList[i]["toggle"]["input"].setAttribute("class", "toggle");
        tdList[i]["toggle"]["input"].setAttribute("name", "toggle" + i);
        tdList[i]["toggle"]["input"].setAttribute("value", "1");

        tdList[i]["toggle"]["label"] = document.createElement("label");
        tdList[i]["toggle"]["label"].htmlFor = "toggle" + i;

        tdList[i]["toggle"]["cell"].appendChild(tdList[i]["toggle"]["input"]);
        tdList[i]["toggle"]["cell"].appendChild(tdList[i]["toggle"]["label"]);

        tdList[i]["toggle"]["input"].checked = (blockList[i]["flag"] & bgPage.FLAG_EACH.VALID) != 0;
        (function (i){
            tdList[i]["toggle"]["input"].addEventListener("click", function (){
                if(tdList[i]["toggle"]["input"].checked){
                    blockList[i]["flag"] |= bgPage.FLAG_EACH.VALID;
                }else{
                    blockList[i]["flag"] &= ~bgPage.FLAG_EACH.VALID;
                }
                bgPage.blockListUpdate(blockList);
                /*
                bgPage.toggleBlockEvent(i);
                */
            });
        })(i);
        // toggle switch }}}
        tdList[i]["row"].insertCell(-1).appendChild(document.createTextNode(i));

        // comment {{{
        tdList[i]["comment"] = {};
        tdList[i]["comment"]["cell"] = tdList[i]["row"].insertCell(-1);
        tdList[i]["comment"]["p"] = document.createElement("p");
        tdList[i]["comment"]["p"].appendChild(document.createTextNode(blockList[i]["comment"]));
        tdList[i]["comment"]["cell"].appendChild(tdList[i]["comment"]["p"]);
        tdList[i]["comment"]["input"] = document.createElement("input");
        tdList[i]["comment"]["input"].setAttribute("type", "textarea");
        tdList[i]["comment"]["input"].setAttribute("class", "textarea");
        tdList[i]["comment"]["input"].setAttribute("style", "display:none;");
        tdList[i]["comment"]["cell"].appendChild(tdList[i]["comment"]["input"]);
        (function (i){
            tdList[i]["comment"]["input"].addEventListener("keydown", function (e){
                if(e.keyCode === 13){
                    tdList[i]["comment"]["input"].blur();
                }
            });
            tdList[i]["comment"]["cell"].addEventListener("dblclick", function (){
                tdList[i]["comment"]["p"].setAttribute("style", "display:none;");
                tdList[i]["comment"]["input"].setAttribute("style", "display:inline;");
                tdList[i]["comment"]["input"].value = blockList[i]["comment"];
                tdList[i]["comment"]["input"].focus();
                tdList[i]["comment"]["input"].addEventListener("blur", function(){
                    blockList[i]["comment"] = tdList[i]["comment"]["input"].value;
                    tdList[i]["comment"]["p"].innerHTML = blockList[i]["comment"];
                    bgPage.blockListUpdate(blockList);
                    tdList[i]["comment"]["p"].setAttribute("style", "display:inline;");
                    tdList[i]["comment"]["input"].setAttribute("style", "display:none;");
                },{once:true});
            });
        }(i));
        // comment }}}
        // src {{{
        tdList[i]["src"] = {};
        tdList[i]["src"]["cell"] = tdList[i]["row"].insertCell(-1);
        tdList[i]["src"]["p"] = document.createElement("p");
        tdList[i]["src"]["p"].appendChild(document.createTextNode(blockList[i]["src"]));
        tdList[i]["src"]["cell"].appendChild(tdList[i]["src"]["p"]);
        tdList[i]["src"]["input"] = document.createElement("input");
        tdList[i]["src"]["input"].setAttribute("type", "textarea");
        tdList[i]["src"]["input"].setAttribute("class", "textarea");
        tdList[i]["src"]["input"].setAttribute("style", "display:none;");
        tdList[i]["src"]["cell"].appendChild(tdList[i]["src"]["input"]);
        (function (i){
            tdList[i]["src"]["input"].addEventListener("keydown", function (e){
                if(e.keyCode === 13){
                    tdList[i]["src"]["input"].blur();
                }
            });
            tdList[i]["src"]["cell"].addEventListener("dblclick", function (){
                tdList[i]["src"]["p"].setAttribute("style", "display:none;");
                tdList[i]["src"]["input"].setAttribute("style", "display:inline;");
                tdList[i]["src"]["input"].value = blockList[i]["src"];
                tdList[i]["src"]["input"].focus();
                tdList[i]["src"]["input"].addEventListener("blur", function(){
                    blockList[i]["src"] = tdList[i]["src"]["input"].value;
                    tdList[i]["src"]["p"].innerHTML = blockList[i]["src"];
                    bgPage.blockListUpdate(blockList);
                    tdList[i]["src"]["p"].setAttribute("style", "display:inline;");
                    tdList[i]["src"]["input"].setAttribute("style", "display:none;");
                },{once:true});
            });
        }(i));
        // src }}}
        /*
        tdList[i]["src"] = document.createElement("p");
        tdList[i]["src"].appendChild(document.createTextNode(blockList[i]["src"]));
        tdList[i]["row"].insertCell(-1).appendChild(tdList[i]["src"]);
        */

        // dest {{{
        tdList[i]["dest"] = {};
        tdList[i]["dest"]["cell"] = tdList[i]["row"].insertCell(-1);
        tdList[i]["dest"]["p"] = document.createElement("p");
        tdList[i]["dest"]["p"].appendChild(document.createTextNode(blockList[i]["dest"]));
        tdList[i]["dest"]["cell"].appendChild(tdList[i]["dest"]["p"]);
        tdList[i]["dest"]["input"] = document.createElement("input");
        tdList[i]["dest"]["input"].setAttribute("type", "textarea");
        tdList[i]["dest"]["input"].setAttribute("class", "textarea");
        tdList[i]["dest"]["input"].setAttribute("style", "display:none;");
        tdList[i]["dest"]["cell"].appendChild(tdList[i]["dest"]["input"]);
        (function (i){
            tdList[i]["dest"]["input"].addEventListener("keydown", function (e){
                if(e.keyCode === 13){
                    tdList[i]["dest"]["input"].blur();
                }
            });
            tdList[i]["dest"]["cell"].addEventListener("dblclick", function (){
                tdList[i]["dest"]["p"].setAttribute("style", "display:none;");
                tdList[i]["dest"]["input"].setAttribute("style", "display:inline;");
                tdList[i]["dest"]["input"].value = blockList[i]["dest"];
                tdList[i]["dest"]["input"].focus();
                tdList[i]["dest"]["input"].addEventListener("blur", function(){
                    blockList[i]["dest"] = tdList[i]["dest"]["input"].value;
                    tdList[i]["dest"]["p"].innerHTML = blockList[i]["dest"];
                    bgPage.blockListUpdate(blockList);
                    tdList[i]["dest"]["p"].setAttribute("style", "display:inline;");
                    tdList[i]["dest"]["input"].setAttribute("style", "display:none;");
                },{once:true});
            });
        }(i));
        // dest }}}
        /*
        tdList[i]["dest"] = document.createElement("p");
        tdList[i]["dest"].appendChild(document.createTextNode(blockList[i]["dest"]));
        tdList[i]["row"].insertCell(-1).appendChild(tdList[i]["dest"]);
        */
        // operations {{{
        tdList[i]["op"] = {};
        tdList[i]["op"]["cell"] = tdList[i]["row"].insertCell(-1);
        // trash {{{
        tdList[i]["op"]["input"] = document.createElement("input");
        tdList[i]["op"]["input"].setAttribute("type", "image");
        tdList[i]["op"]["input"].setAttribute("src", "trash.png");
        tdList[i]["op"]["input"].setAttribute("id", "delList");
        if((blockList[i]["flag"] & bgPage.FLAG_EACH.TRASH) == 0){
            tdList[i]["op"]["input"].setAttribute("src", "trash.png");
            tdList[i]["row"].setAttribute("style", "color:#000;");
            console.log("bla");
        }else{
            tdList[i]["op"]["input"].setAttribute("src", "back.png");
            tdList[i]["row"].setAttribute("style", "color:#ccc;");
            console.log("grey");
        }
        tdList[i]["op"]["cell"].appendChild(tdList[i]["op"]["input"]);
        (function (i){
            tdList[i]["op"]["input"].addEventListener("click", function (){
                var savedata = JSON.parse(localStorage.getItem("savedata"));
                var blockList = savedata["blockList"];
                blockList[i]["flag"] ^= bgPage.FLAG_EACH.TRASH;
                bgPage.blockListUpdate(blockList);
                refreshList(blockList);
            });
        })(i);
        // trash }}}
        // operations }}}
    }
    // added list }}}
}

document.addEventListener("DOMContentLoaded", init, false);

/* vim: set foldmethod=marker: */
