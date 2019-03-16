var bgPage = chrome.extension.getBackgroundPage();

function init(){
    var blockList = JSON.parse(localStorage.getItem("blockList"));
    if(blockList == null){
        blockList = [];
    }

    initList(blockList);
    // save button {{{
    var saveElement= document.createElement("div");
    saveElement.setAttribute("id", "saveButton");
    saveElement.innerHTML = "保存";
    saveElement.addEventListener("click", function (){
        var blob = new Blob([localStorage.getItem("blockList")],{type: "application\/json"});
        var saveFile= document.createElement("a");
        saveFile.setAttribute("id", "saveFile");
        saveFile.innerHTML = "保存";
        saveFile.download = "webRequestBlock.json";
        saveFile.href = URL.createObjectURL(blob);
        saveFile.click();
    });
    document.getElementById("savedata").appendChild(saveElement)
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
            for(var i=0;i<blockList.length;i++){
                bgPage.removeBlockEvent(i);
            }
            blockList = JSON.parse(reader.result);
            localStorage.setItem("blockList", JSON.stringify(blockList));
            bgPage.init();
            refreshList(blockList);
        }
    });
    var loadElement= document.createElement("div");
    loadElement.setAttribute("id", "loadButton");
    loadElement.innerHTML = "読込";
    loadElement.addEventListener("click", function (){
        loadFile.click();
    });
    document.getElementById("savedata").appendChild(loadElement)
    // load button }}}
}

function initList(blockList){
    list_title = ["切替", "番号", "対象のURL", "拒否するURL", "操作"];
    list_title_question = ["", "", "https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Regular_Expressions", "https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/Match_patterns", ""];
    var listTable = document.createElement("table");
    listTable.setAttribute("id", "listTable");
    var main = document.getElementById("main");
    main.appendChild(listTable);

    // table head {{{
    var list_head = listTable.createTHead();
    var row = list_head.insertRow(-1);
    // cbxAll{{{
    var cell = row.insertCell(-1);
    var input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.setAttribute("id", "cbxAll");
    input.setAttribute("name", "cbxAll");
    input.setAttribute("value", "1");

    cell.appendChild(input);
    input.addEventListener("click", function (){
        var cbxList = document.getElementsByClassName("cbxList");
        for(var i=0;i<cbxList.length;i++){
            cbxList[i].checked = document.getElementById("cbxAll").checked;
        }
    });
    // cbxAll}}}
    for(var i=0;i<list_title.length;i++){
        var cell = row.insertCell(-1);
        cell.appendChild(document.createTextNode(list_title[i]));
        if(list_title_question[i] != ""){
            questionLink = document.createElement("a");
            questionLink.href = list_title_question[i];
            questionLink.target = "_blank";
            questionLinkImage = document.createElement("img");
            questionLinkImage.src = "question.png";
            questionLink.appendChild(questionLinkImage);
            cell.appendChild(questionLink);

        }
    }
    // table head }}}
    // table body {{{
    var list_body = listTable.createTBody();
    // add area {{{
    var row = list_body.insertRow(-1);
    row.setAttribute("class", "listAdd");
    for(var i=0;i<list_title.length+1;i++){
        row.insertCell(-1);
    }
    const CARDINAL_SKIP = 3;
    var cell = row.cells[CARDINAL_SKIP + 0];
    var input = document.createElement("input");
    input.setAttribute("type", "textarea");
    input.setAttribute("id", "srcUrl");
    input.setAttribute("placeholder", "対象のURLを入力する");
    cell.appendChild(input);

    var cell = row.cells[CARDINAL_SKIP + 1];
    var input = document.createElement("input");
    input.setAttribute("type", "textarea");
    input.setAttribute("id", "destUrl");
    input.setAttribute("placeholder", "拒否するURLを入力する");
    cell.appendChild(input);

    var cell = row.cells[CARDINAL_SKIP + 2];
    var input = document.createElement("input");
    input.setAttribute("type", "image");
    input.setAttribute("src", "add.png");
    input.setAttribute("id", "addList");
    cell.appendChild(input);
    input.addEventListener("click", function (){
        var src = document.getElementById("srcUrl").value;
        var dest = document.getElementById("destUrl").value;
        document.getElementById("srcUrl").value = "";
        document.getElementById("destUrl").value = "";
        blockList.unshift({toggle:true, src:src, dest:dest})
        localStorage.setItem("blockList", JSON.stringify(blockList));
        bgPage.addBlockEvent(blockList.length-1);
        refreshList(blockList);
    });
    // add area }}}
    // table body }}}
    refreshList(blockList);
}

function refreshList(blockList){
    var listTable = document.getElementById("listTable");
    while(listTable.rows[2]){
        listTable.deleteRow(2);
    }
    // added list {{{
    for(var i=0;i<blockList.length;i++){
        var row = listTable.insertRow(-1);
        if(i%2){
            row.setAttribute("class", "odd");
        }else{
            row.setAttribute("class", "even");
        }
        // checkbox {{{
        var cell = row.insertCell(-1);
        var input = document.createElement("input");
        input.setAttribute("type", "checkbox");
        input.setAttribute("id", "cbx" + i);
        input.setAttribute("class", "cbxList");
        input.setAttribute("name", "cbx" + i);
        input.setAttribute("value", "1");

        cell.appendChild(input);

        // checkbox }}}
        // toggle switch {{{
        var cell = row.insertCell(-1);
        var input = document.createElement("input");
        input.setAttribute("type", "checkbox");
        input.setAttribute("id", "toggle" + i);
        input.setAttribute("class", "toggle");
        input.setAttribute("name", "toggle" + i);
        input.setAttribute("value", "1");

        var label = document.createElement("label");
        label.htmlFor = "toggle" + i;

        cell.appendChild(input);
        cell.appendChild(label);

        input.checked = blockList[i]["toggle"];
        (function (i,input){
            input.addEventListener("click", function (){
                blockList[i]["toggle"] = input.checked;
                localStorage.setItem("blockList", JSON.stringify(blockList));
                bgPage.toggleBlockEvent(i);
            });
        })(i,input);
        // toggle switch }}}
        row.insertCell(-1).appendChild(document.createTextNode(i));
        row.insertCell(-1).appendChild(document.createTextNode(blockList[i]["src"]));
        row.insertCell(-1).appendChild(document.createTextNode(blockList[i]["dest"]));
        // operations {{{
        var cell = row.insertCell(-1);
        // trash {{{
        var input = document.createElement("input");
        input.setAttribute("type", "image");
        input.setAttribute("src", "trash.png");
        input.setAttribute("id", "delList");
        cell.appendChild(input);
        (function (i){
            input.addEventListener("click", function (){
                bgPage.removeBlockEvent(i);
                blockList.splice(i,1);
                localStorage.setItem("blockList", JSON.stringify(blockList));
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
