/* 
やりたいこと：
1つ前に表示していたタブをすぐに表示すること

やれたらいいこと：
1つ前だけではなくて、2つ前、3つ前とさかのぼれること
ショートカットキーを割り当てられること
ウィンドウをまたぐこともできるといい

気にすること：
ローカルストレージのexpireについて
一番最初の起動時にどうやってイベントを発火させるのか、そもそもずっとjsを動かすということをどうするのか（manifest.jsonに書けばいいかもしれない）

実装方針：
タブが切り替わったタイミングで、そのタブ番号を順番に記録
そして、このアドオンが呼ばれたらローカルストレージを参照して、タブ番号を読み取り、そのタブを表示させる
*/

localStorage.clear();

// タブが切り替わった際のイベント
chrome.tabs.onSelectionChanged.addListener(function(tabId, info) {
	var total = localStorage.length;
	console.log("tab changed:" + total);
	console.log("total:" + total);
	var cur_num = total + 1;
	localStorage[getKeyname(cur_num)] = buildValue(info.windowId, tabId);
})
/*
chrome.tabs.onActivated.addListener(function(info) {
	var total = localStorage.length;
	console.log("tab changed:" + total);
	console.log("total:" + total);
	var cur_num = total + 1;
	localStorage[getKeyname(cur_num)] = buildValue(info.windowId, info.tabId);
})
*/

function getTabsByQuery(queryInfo,callback) {
	console.log("1.2 start getTabsByQuery");
	chrome.tabs.query(queryInfo, function(tabs) {
		// tabsは1つしかないはず
		console.log("2" + tabs);
		console.log("3" + tabs[0]);
		console.log("4 tabid:" + tabs[0].id);
		callback(tabs[0].id);
	})
}

// ウィンドウが切り替わった際のイベント
chrome.windows.onFocusChanged.addListener(function(_windowId) {
	// windowIdが-1の場合は他のアプリケーションなので無視
	if (_windowId == -1) {
	//if (1) {
		return;
	}

	var total = localStorage.length;
	// ローカルストレージ何もなければ無視
	if (total == 0) {
		return;
	}
	console.log("1 window changed:" + total);
	var cur_num = total + 1;
   
	var queryInfo = {
		active: true,
		windowId: _windowId
	};
	console.log("1.1 call getTabsByQuery");
	// 順番を保障したいので、チェーンさせる（あってるのか、、、）
	getTabsByQuery(queryInfo, function(tabId){
		console.log("5 tabId:" + tabId);
		console.log("6 origin:" + localStorage[getKeyname(total)]);
		console.log("7 current:" + buildValue(_windowId, tabId));
		if (localStorage[getKeyname(total)] == buildValue(_windowId, tabId)) {
				console.log("8 the same!");
		} else {
				console.log("9 Actually window changed!");
				localStorage[getKeyname(cur_num)] = buildValue(_windowId, tabId);
		}
	});

})

function buildValue(windowId, tabId){
	return windowId + ":" + tabId;
}

function getKeyname(num) {
	return "tabinfo" + num;
}









// サンプルコード
/*
var req = new XMLHttpRequest();
req.open(
	"GET",
	"http://api.flickr.com/services/rest/?" +
		"method=flickr.photos.search&" +
		"api_key=90485e931f687a9b9c2a66bf58a3861a&" +
		"text=hello%20world&" +
		"safe_search=1&" +  // 1 is "safe"
		"content_type=1&" +  // 1 is "photos only"
		"sort=relevance&" +  // another good one is "interestingness-desc"
		"per_page=20",
	true);
req.onload = showPhotos;
req.send(null);

function showPhotos() {
  var photos = req.responseXML.getElementsByTagName("photo");

  for (var i = 0, photo; photo = photos[i]; i++) {
	var img = document.createElement("image");
	img.src = constructImageURL(photo);
	document.body.appendChild(img);
  }
}

// See: http://www.flickr.com/services/api/misc.urls.html
function constructImageURL(photo) {
  return "http://farm" + photo.getAttribute("farm") +
	  ".static.flickr.com/" + photo.getAttribute("server") +
	  "/" + photo.getAttribute("id") +
	  "_" + photo.getAttribute("secret") +
	  "_s.jpg";
}
*/
