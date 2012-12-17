/*
contentスクリプト
全てのページ（マッチ条件はmanifest.json）でイベントを待ち受ける役割
特定のイベント、ここでは
・設定したショートカットキーの入力
があった場合は、それぞれ特定の処理を呼び出す。
*/

// ショートカットキーの入力
window.addEventListener('keydown',  function(e) {
	console.log(e.keyCode);
	// TODO:先に進む処理=増やす処理
	// TODO:ショートカットキーの設定を取得する処理
	// TODO:ショートカットキーの設定を変更する処理
	if (!e.altKey && e.shiftKey && e.ctrlKey && e.keyCode == 76) { // Ctrl + Shift + L
		alert ("Shortcut Key Pressed");
		var port = chrome.extension.connect({name: "keypressed"});
		port.postMessage({msg: "key pressed"});
		port.onMessage.addListener(function(msg) {
		if (msg.question == "Who's there?") {
    		port.postMessage({answer: "Madame"});
  		} else if (msg.question == "Madame who?") {
    		port.postMessage({answer: "Madame... Bovary"});
		}});
	}
  }, false);

