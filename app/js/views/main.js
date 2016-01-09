var ipcRenderer = require('ipc');

onload = function() {
	var webview = document.getElementById("wv");
	webview.addEventListener("dom-ready", function() {
		// this.openDevTools();

		// Code below sets up a MutationObserver to check for notifications on chats.
		//
		// If the chat is not muted, then it prints on the console the message "new chat".
		// This message is read by a listener and then sent back to the main process where
		// it's handled as desired.
		//
		// TODO: find a way to avoid setTimeout function.
		var code = `setTimeout(function() {
			var o = new MutationObserver(function(events) {
				events.forEach(function(event) {
					var t = event.target

					// avoid non-related events
					if(t == null || t.classList.contains("chat-meta")) {
						return
					}

					// didnt update the unread badge
					if(!t.classList.contains("unread-count") && t.getElementsByClassName("unread-count").length == 0) {
						return
					}

					// muted?
					if(t.parentElement != null && t.parentElement.getElementsByClassName("icon-muted").length > 0) {
						return
					}

					// didnt update the unread badge with a number (avoid notifying on marking a chat as unread)
					if(parseInt(t.innerText) <= 0) {
						return
					}

					// bounce icon
					console.log("newmsg", event)
				})
			});

			var config = {
				childList: true,
				subtree: true,
			};

			// bind the observer
            var side = document.getElementById('pane-side')
            o.observe(side, config);
            console.log('side', side)
		}, 20000)`;
		this.executeJavaScript(code);
	});

	webview.addEventListener('console-message', function(msg) {
		if(msg.message == 'newmsg') {
			ipcRenderer.send('newmsg', true);
		}
	})

	webview.addEventListener('page-title-set', function(msg) {
		ipcRenderer.send('uptbadge', msg);
	})
}
