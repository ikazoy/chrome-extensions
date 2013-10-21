/* 
やりたいこと：
1つ前に表示していたタブをすぐに表示すること

やれたらいいこと：
1つ前だけではなくて、2つ前、3つ前とさかのぼれること
ショートカットキーを割り当てられること
ウィンドウをまたぐこともできるといい

気にすること：
ローカルストレージのexpireについて
一番最初の起動時にどうやってイベントを発火させるのか

実装方針：
タブが切り替わったタイミングで、そのタブ番号を順番に記録
そして、このアドオンが呼ばれたらローカルストレージを参照して、タブ番号を読み取り、そのタブを表示させる
*/

// 最初の読み込み
chrome.windows.getLastFocused(function(window){
	console.log("onload");
	onWindowChanged(window.id);
});

localStorage.clear();

// 定数
var hist_key = "tab_hist";
var current_key = "current";

// ショートカットキー受付
chrome.extension.onConnect.addListener(function(port) {

	// 今何番目 index の履歴を参照しているか int
	var current_num;

	console.log(port.name);
	console.log("onConnect");
	port.onMessage.addListener(function(msg) {
		if (msg.msg == "key pressed") {
			// 最初の入力
			if (!localStorage[current_key]) {
				current_num = localStorage[hist_key].split(",").length - 1;
			} else {
				current_num = localStorage[current_key];
			}
			// 次のために記録
			var target_num = localStorage[current_key] = current_num - 1;

			// TODO:タブの存在チェック
			// もしタブがなければ、履歴からそのIDを全て消去、currentも減らして次のタブを呼び出す（ループにならないか？）
			
			// TODO:一番最初に戻ってきたとき=indexが0のときの処理

			// 移動
			var target_info = localStorage[hist_key].split(",")[target_num].split(":");
			var target_tabid = Number(target_info[1]);
			var target_windowid = Number(target_info[0]);

			console.log("moving to" + target_tabid + ":" + target_windowid);
			chrome.tabs.get(target_tabid, function(tab) {
				console.log("got tabinfo");
				console.debug(tab);
				chrome.tabs.highlight({tabs: tab.index, windowId: tab.windowId}, function(){});
				console.log(tab.windowId);
				console.log("1");
				chrome.windows.update(tab.windowId, {focused: true});
				console.log("2");
			});
		}
	});
});

// タブが切り替わった際のイベント
chrome.tabs.onSelectionChanged.addListener(function(tabId, info) {

	// 通常の遷移かアドオンによる遷移かを判定
	var prev_target_num = localStorage[current_key];
	// アドオンによる遷移
	if (localStorage[hist_key] && localStorage[hist_key].split(",")[prev_target_num] == buildValue(info.windowId, tabId)) {
		console.log("tab changed by extension");
		return;
	// 通常遷移
	} else {
		if(localStorage[hist_key]) {
			console.log("origin:" + localStorage[hist_key].split(",")[prev_target_num]);
			console.log("now:" + buildValue(info.windowId, tabId));
			console.log("tab changed.");
		}
		// 毎回消す
		localStorage.removeItem(current_key);

		if (localStorage[hist_key]) {
			localStorage[hist_key] = localStorage[hist_key] + "," + buildValue(info.windowId, tabId);
		} else {
			localStorage[hist_key] = buildValue(info.windowId, tabId);
		}
	}
});

function getTabsByQuery(queryInfo,callback) {
	//console.log("1.2 start getTabsByQuery");
	chrome.tabs.query(queryInfo, function(tabs) {
		// tabsは1つしかないはず
		//console.log("2" + tabs);
		//console.log("3" + tabs[0]);
		//console.log("4 tabid:" + tabs[0].id);
		callback(tabs[0].id);
	});
}

// ウィンドウが切り替わった際のイベント
chrome.windows.onFocusChanged.addListener(function onWindowChanged(_windowId) {

	// windowIdが-1の場合は他のアプリケーションなので無視
	if (_windowId == -1) {
		return;
	}

	/*
	// ローカルストレージ何もなければ無視
	if (!localStorage[hist_key]) {
		return;
	}
	*/
   
	var queryInfo = {
		active: true,
		windowId: _windowId
	};
	// 順番を保障したいので、チェーンさせる（あってるのか、、、）
	getTabsByQuery(queryInfo, function(tabId){
		//console.log("5 tabId:" + tabId);
		//console.log("6 origin:" + localStorage[getKeyname(total)]);
		//console.log("7 current:" + buildValue(_windowId, tabId));
		if(localStorage[hist_key] && (localStorage[hist_key].split(",").last() == buildValue(_windowId, tabId))) {
				console.log("the same!");
		} else {
				console.log("Actually window changed!");
				if (localStorage[hist_key]) {
					localStorage[hist_key] = localStorage[hist_key] + "," + buildValue(_windowId, tabId);
				} else {
					console.log("first time:" + _windowId + "/" + tabId); 
					localStorage[hist_key] = buildValue(_windowId, tabId);
				}
		}
	});

});

function buildValue(windowId, tabId){
	return windowId + ":" + tabId;
}

function getKeyname(num) {
	return "tabinfo" + num;
}
