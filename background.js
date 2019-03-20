var listEvent = [];
var FLAG_EACH = {
    "VALID": 1<<0,
    "TRASH": 1<<1
};
var FLAG_ALL = {
    "VALID": 1<<0,
    "TRASH": 1<<1
};
init();

function init(){
    chrome.browserAction.setBadgeBackgroundColor({color:[217,102,102,1]});
    var savedata = JSON.parse(localStorage.getItem("savedata"));
    if(savedata == null){
        savedata = {options:{}, blockList:[]};
    }
    if(typeof(savedata["options"]["flag"]) == "undefined"){
        savedata["options"]["flag"] = 1;
    }
    localStorage.setItem("savedata", JSON.stringify(savedata));
    var blockList = savedata["blockList"];
    if(0 < Object.keys(blockList).length){
        for(var i=0;i<blockList.length;i++){
            addBlockEvent(i);
        }
    }
}
// block listをイベントに追加する処理 {{{
function addBlockEvent(i){
    var savedata= JSON.parse(localStorage.getItem("savedata"));
    var blockList = savedata["blockList"];
    if(blockList != null){
        (function (i){
            listEvent[i] = function (details){
                var savedata= JSON.parse(localStorage.getItem("savedata"));
                var blockList = savedata["blockList"];
                if(((savedata["options"]["flag"] & FLAG_ALL.VALID) != 0) && ((blockList[i]["flag"] & FLAG_EACH.TRASH) == 0)){
                    var srcUrl = new RegExp(blockList[i]["src"]);
                    if(srcUrl.test(tabs[details.tabId].url)){
                        if((blockList[i]["flag"] & FLAG_EACH.VALID) != 0){
                            chrome.browserAction.getBadgeText({tabId:details.tabId}, function(badge){
                                if(isNaN(badge)){
                                    badge=0;
                                }else{
                                    badge++;
                                }
                                chrome.browserAction.setBadgeText({text:badge.toString(), tabId:details.tabId});
                            });
                        }
                        return { cancel: (blockList[i]["flag"] & FLAG_EACH.VALID) !=0}
                    }
                }else{
                    return {};
                }
            };
            chrome.webRequest.onBeforeRequest.addListener(
                listEvent[i]
                ,
                {urls: [blockList[i]["dest"]]},
                ["blocking"]
            );
        })(i);
        currentTabActiveIcon();
    }
}
// block listをイベントに追加する処理 }}}
// block listから消したとき {{{
function removeBlockEvent(i){
    chrome.webRequest.onBeforeRequest.removeListener(listEvent[i]);
    listEvent.splice(i,1);
    currentTabActiveIcon();
}
// block listから消したとき }}}
// toggleで有効/無効を変えたとき {{{
function toggleBlockEvent(i){
    removeBlockEvent(i);
    addBlockEvent(i);
}
// toggleで有効/無効を変えたとき }}}
// get info tabs[tabId] {{{
var tabs = {};
chrome.tabs.query({}, function(results) {
    results.forEach(function(tab) {
        tabs[tab.id] = tab;
    });
});

chrome.tabs.onUpdated.addListener(
    function onUpdatedListener(tabId, changeInfo, tab) {
        tabs[tab.id] = tab;
        // onActivatedのみじゃ動かない場合があるため
        currentTabActiveIcon();
    }
);
chrome.tabs.onRemoved.addListener(
    function onRemovedListener(tabId) {
        delete tabs[tabId];
    }
);
// get info tabs[tabId] }}}
// アクティブなタブのbrowserActionのiconを書き換える {{{
chrome.tabs.onActivated.addListener(function (details){
    currentTabActiveIcon();
});
function currentTabActiveIcon(){
    chrome.tabs.query({active:true}, function(tabsActive){
        for(var j=0;j<tabsActive.length;j++){
            var fBlock = false;
            var savedata = JSON.parse(localStorage.getItem("savedata"));
            if(savedata["options"]["toggleAll"] == true){
                var blockList = savedata["blockList"];
                if(blockList != null){
                    for(var i=0;i<blockList.length;i++){
                        var srcUrl = new RegExp(blockList[i]["src"]);
                        if(srcUrl.test(tabsActive[j].url) && (blockList[i]["flag"] & FLAG_EACH.VALID) !=0){
                            fBlock = true;
                        }
                    }
                }
            }
            chrome.browserAction.setIcon({tabId:tabsActive[j].id, path:fBlock?"true.png":"false.png"});
        }
    });
}
// 現在のタブのurlがリストにある場合browserActionのiconを書き換える }}}

function blockListUpdate(blockList){
    var savedata = JSON.parse(localStorage.getItem("savedata"));
    if(savedata == null){
        savedata = {options:{}, blockList:[]};
    }
    savedata["blockList"] = blockList;
    localStorage.setItem("savedata", JSON.stringify(savedata));
}
/* vim: set foldmethod=marker: */
