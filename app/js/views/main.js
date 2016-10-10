const {ipcRenderer} = require('electron');
var config = require('electron').remote.getGlobal('config');

onload = function() {
	var webview = document.getElementById("whatsapp-view");
	webview.addEventListener("dom-ready", function() {
		webview.openDevTools();
		
		if(config.get('hideAvatars')) {
			this.insertCSS('#side .chat-title {margin-left: 10px}');
			this.insertCSS('.chat-avatar{display: none}');
		}

		if(config.get('hidePreviews')){
			this.insertCSS('.chat-secondary .chat-status{z-index: -999;}');
		}

		if(config.get('ninjaMode')) {
			this.insertCSS('.message-out .message-text{color: #dcf8c6}');
			this.insertCSS('.message-in .message-text{color: #ffffff}');
			this.insertCSS('.message-text:hover{color: #262626}');
		}

		if(config.get('thumbSize')) {
			var thumbSize = '.image-thumb { width: '+ config.get('thumbSize') + 'px  !important;' +
			'height: '+ config.get('thumbSize') + 'px !important;}' +
			'.image-thumb img.image-thumb-body { width: auto !important;' +
			'height: '+ config.get('thumbSize') + 'px !important;}';
			this.insertCSS(thumbSize);
		}
	});

	webview.addEventListener('console-message', function(msg) {
		if(msg.message === 'newmsg') {
			ipcRenderer.send('newmsg', true);
		}
	});

	webview.addEventListener('page-title-set', function(msg) {
		ipcRenderer.send('uptbadge', msg);
	});

	webview.addEventListener('new-window', function(e) {
	  require('electron').shell.openExternal(e.url);
	});
};
