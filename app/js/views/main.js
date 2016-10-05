//jshint esversion: 6

var ipcRenderer = require('electron').ipcRenderer;
var config = require('remote').getGlobal('config');

onload = function() {
	var webview = document.getElementById("whatsapp-view");
	webview.addEventListener("dom-ready", function() {

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
				if(document.getElementById('app') != null ) {
					document.getElementById('app').addEventListener('keyup', function(event) {
						if(event.getModifierState("Control") && event.code === "Space") {
							function placeCaretAtEnd(el) {
								el.focus();
								if (typeof window.getSelection != "undefined"
								&& typeof document.createRange != "undefined") {
									var range = document.createRange();
									range.selectNodeContents(el);
									range.collapse(false);
									var sel = window.getSelection();
									sel.removeAllRanges();
									sel.addRange(range);
								} else if (typeof document.body.createTextRange != "undefined") {
									var textRange = document.body.createTextRange();
									textRange.moveToElementText(el);
									textRange.collapse(false);
									textRange.select();
								}
							}
							var target = event.target;

							if(target.classList.contains("input")) {
								// :)
								target.innerHTML = target.innerHTML.replace(/:\\\)/g, "<img alt='&#x1F642' draggable='false' class='emoji emojiordered1425' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// :o
								target.innerHTML = target.innerHTML.replace(/:o/gi, "<img alt='&#x1F62E' draggable='false' class='emoji emojiordered1405' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// :(
								target.innerHTML = target.innerHTML.replace(/:\\\(/gi, "<img alt='&#x2639' draggable='false' class='emoji emojiordered0077' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// :|
								target.innerHTML = target.innerHTML.replace(/:\\|/gi, "<img alt='&#x1F610' draggable='false' class='emoji emojiordered1375' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>" );

								// (Y)
								target.innerHTML = target.innerHTML.replace(/\\\(Y\\\)/gi, "<img alt='&#x1F44D' draggable='false' class='emoji emojiordered0885' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// :*
								target.innerHTML = target.innerHTML.replace(/:\\*/gi, "<img alt='&#x1F618' draggable='false' class='emoji emojiordered1383' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// :/
								target.innerHTML = target.innerHTML.replace(/:\\//g, "<img alt='&#x1F615' draggable='false' class='emoji emojiordered1380' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// XD
								target.innerHTML = target.innerHTML.replace(/xd/gi, "<img alt='&#x1F606' draggable='false' class='emoji emojiordered1365' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// (:
								target.innerHTML = target.innerHTML.replace(/\\\(:/g, "<img alt='&#x1F643' draggable='false' class='emoji emojiordered1426' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								//	u.u
								target.innerHTML = target.innerHTML.replace(/u\\.u/gi, "<img alt='&#x1F614' draggable='false' class='emoji emojiordered1379' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								//:'(
								target.innerHTML = target.innerHTML.replace(/:'\\\(/gi, "<img alt='&#x1F622' draggable='false' class='emoji emojiordered1393' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								//T.T
								target.innerHTML = target.innerHTML.replace(/t\\.t/gi, "<img alt='&#x1F62D' draggable='false' class='emoji emojiordered1404' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// :$
								target.innerHTML = target.innerHTML.replace(/:$/gi, "<img alt='&#x1F633' draggable='false' class='emoji emojiordered1410' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// :smirk:
								target.innerHTML = target.innerHTML.replace(/:smirk:/gi, "<img alt='&#x1F60F' draggable='false' class='emoji emojiordered1374' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								//:P
								target.innerHTML = target.innerHTML.replace(/:p/gi, "<img alt='&#x1F61C' draggable='false' class='emoji emojiordered1387' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// .i.
								target.innerHTML = target.innerHTML.replace(/\\.i\\./gi, "<img alt='&#x1F595' draggable='false' class='emoji emojiordered1323' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								placeCaretAtEnd(target);
								console.log(target.innerHTML);
							}
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
