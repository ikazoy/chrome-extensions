# chrome extensionの開発メモ

## まずは
1. 適当なフォルダにmanifest.jsonを設置
2. そのフォルダをchrome://chrome/extensions/から読み込む（Load unpacked extension）
3. 終わり
4. http://developer.chrome.com/extensions/getstarted.html

ネット上でいろいろググるよりもここをみてやるのが確実。なぜならchromeはちょこちょこ仕様変更されてるから。


### 注意点
1. chrome19以降では、manifest.jsonに  `"manifest_version": 2,`の項目を入れなければいけない [参照](http://developer.chrome.com/extensions/manifestVersion.html)
2. 
