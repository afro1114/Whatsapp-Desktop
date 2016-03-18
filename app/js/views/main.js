//jshint esversion: 6

var ipcRenderer = require('electron').ipcRenderer;
var config = require('remote').getGlobal('config');

onload = function() {
	var webview = document.getElementById("whatsapp-view");
	webview.addEventListener("dom-ready", function() {
		webview.openDevTools();

		// Code below sets up a MutationObserver to check for notifications on chats.
		//
		// If the chat is not muted, then it prints on the console the message "new chat".
		// This message is read by a listener and then sent back to the main process where
		// it's handled as desired.
		var bounceObserver = `
		var waIpcRenderer = require('electron').ipcRenderer;
		var spinerObserver = new MutationObserver(function (events) {
			events.some(function(event) {
				if(document.getElementById("startup") == null ) {
					var sideBarObserver = new MutationObserver(function(events) {
						events.every(function(event) {
							var target = event.target

							// avoid non-related events
							if(target == null || target.classList.contains("chat-meta")) {
								return false;
							}

							// didnt update the unread badge
							if(!target.classList.contains("unread-count") && target.getElementsByClassName("unread-count").length == 0) {
								return false;
							}

							// muted?
							if(target.parentElement != null && target.parentElement.getElementsByClassName("icon-muted").length > 0) {
								return false;
							}

							// didnt update the unread badge with a number (avoid notifying on marking a chat as unread)
							if(parseInt(target.innerText) <= 0) {
								return false;
							}

							// bounce icon
							waIpcRenderer.send("newmsg", true);
						});
					});

					// bind the observer
					sideBarObserver.observe(
						document.getElementById('pane-side'),
						{childList: true, subtree: true}
					);

					//stop observing the whole application
					spinerObserver.disconnect();
					return true;
				}
			});
		});

		spinerObserver.observe(
			document.getElementById('app'),
			{childList: true, subtree: true}
		);
		`;
		this.executeJavaScript(bounceObserver);

		var emojiObserver = `

		var introText = new MutationObserver(function (events) {
			events.some(function(event) {
				if(document.getElementById('main') != null ) {
					document.getElementById('main').addEventListener('keyup', function(event) {
						var target = event.target;
						if(target.classList.contains("input")) {
							target.innerHTML = target.innerHTML.replace(/( )?:\\\) /g, "&#x1f604 ");
							// 🙂
							console.log(target.innerHTML);
						}
					});

					//stop observing the whole application
					introText.disconnect();
					return true;
				}
			});
		});

		introText.observe(
			document.getElementById('app'),
			{childList: true, subtree: true}
		);
		`;
		this.executeJavaScript(emojiObserver);



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
		console.log(webview.isAudioMuted());
		if(msg.message == 'newmsg') {
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
