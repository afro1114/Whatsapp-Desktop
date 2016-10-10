(function () {
	const {ipcRenderer} = require('electron');
	
	document.addEventListener('DOMContentLoaded', function () {
		
		var spinerObserver = new MutationObserver(function (events) {
			events.some(function() {
				if(document.getElementById("startup") === null ) {
					var sideBarObserver = new MutationObserver(function(events) {
						events.every(function(event) {
							var target = event.target;
							
							// avoid non-related events
							if(target === null || target.classList.contains("chat-meta")) {
								return false;
							}
							
							// didnt update the unread badge
							if(!target.classList.contains("unread-count") && target.getElementsByClassName("unread-count").length === 0) {
								return false;
							}
							
							// muted?
							if(target.parentElement !== null && target.parentElement.getElementsByClassName("icon-muted").length > 0) {
								return false;
							}
							
							// didnt update the unread badge with a number (avoid notifying on marking a chat as unread)
							if(parseInt(target.innerText) <= 0) {
								return false;
							}
							
							// bounce icon
							ipcRenderer.send("newmsg", true);
						});
					});
					
					// bind the observer
					sideBarObserver.observe(
						document.getElementById('pane-side'),
						{childList: true, subtree: true}
					);
					
					//Add Hotkeys for the app
					var inputSearch = document.querySelector("input.input-search");
					if (inputSearch) {
						
						document.addEventListener("keydown", function (event) {
							// cmd+k and cmd+f focuses on search input.
							if ((event.keyCode === 75 || event.keyCode === 70) && (event.metaKey === true || event.ctrlKey === true)) {
								inputSearch.focus();
							}
						});
					}
					
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
		
		
		/**
		 * This observes the text that appear before a contact is selected
		 */
		var introText = new MutationObserver((events) => {
			events.some(() => {
				if(document.getElementById('app') !== null ) {
					document.getElementById('app').addEventListener('keyup', (event) => {
						if(event.getModifierState("Control") && event.code === "Space") {
							var placeCaretAtEnd = function(el) {
								el.focus();
								if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
									var range = document.createRange();
									range.selectNodeContents(el);
									range.collapse(false);
									var sel = window.getSelection();
									sel.removeAllRanges();
									sel.addRange(range);
								} else if (typeof document.body.createTextRange !== "undefined") {
									var textRange = document.body.createTextRange();
									textRange.moveToElementText(el);
									textRange.collapse(false);
									textRange.select();
								}
							};
							var target = event.target;

							if(target.classList.contains("input")) {
								// :)
								target.innerHTML = target.innerHTML.replace(/:\)/g, "<img alt='&#x1F642' draggable='false' class='emoji emojiordered1522' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// :o
								target.innerHTML = target.innerHTML.replace(/:[oO]/gi, "<img alt='&#x1F62E' draggable='false' class='emoji emojiordered1502' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// :(
								target.innerHTML = target.innerHTML.replace(/:\(/gi, "<img alt='&#x2639' draggable='false' class='emoji emojiordered0077' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// :|
								target.innerHTML = target.innerHTML.replace(/:\|/gi, "<img alt='&#x1F610' draggable='false' class='emoji emojiordered1472' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>" );

								// (Y)
								target.innerHTML = target.innerHTML.replace(/\([Yy]\)/gi, "<img alt='&#x1F44D' draggable='false' class='emoji emojiordered0912' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// :*
								target.innerHTML = target.innerHTML.replace(/:\*/gi, "<img alt='&#x1F618' draggable='false' class='emoji emojiordered1480' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// :/
								target.innerHTML = target.innerHTML.replace(/:\//gi, "<img alt='&#x1F615' draggable='false' class='emoji emojiordered1477' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// XD
								target.innerHTML = target.innerHTML.replace(/xd|XD/gi, "<img alt='&#x1F606' draggable='false' class='emoji emojiordered1462' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// (:
								target.innerHTML = target.innerHTML.replace(/\(:/g, "<img alt='&#x1F643' draggable='false' class='emoji emojiordered1523' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								//	u.u
								target.innerHTML = target.innerHTML.replace(/[Uu]\.[Uu]/gi, "<img alt='&#x1F614' draggable='false' class='emoji emojiordered1476' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								//:'(
								target.innerHTML = target.innerHTML.replace(/:'\(/gi, "<img alt='&#x1F622' draggable='false' class='emoji emojiordered1490' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								//T.T
								target.innerHTML = target.innerHTML.replace(/[Tt]\.[Tt]/gi, "<img alt='&#x1F62D' draggable='false' class='emoji emojiordered1501' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// :$
								target.innerHTML = target.innerHTML.replace(/:\$/gi, "<img alt='&#x1F633' draggable='false' class='emoji emojiordered1507' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// :smirk:
								target.innerHTML = target.innerHTML.replace(/:smirk:/gi, "<img alt='&#x1F60F' draggable='false' class='emoji emojiordered1471' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								//:P
								target.innerHTML = target.innerHTML.replace(/:[Pp]/gi, "<img alt='&#x1F61C' draggable='false' class='emoji emojiordered1484' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								// .i.
								target.innerHTML = target.innerHTML.replace(/\.[iI]\./gi, "<img alt='&#x1F595' draggable='false' class='emoji emojiordered1419' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'>");

								placeCaretAtEnd(target);
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
		
		
	}, false);
	
	setInterval(function() {
		Array.from(document.querySelectorAll('audio')).map(function(audio) {
			audio.playbackRate = (window.audioRate || 1);
			console.log(window.audioRate);
		});
		if (window.audioRate) {
			Array.from(document.querySelectorAll('.meta-audio *:first-child')).map(function(span) {
				span.innerHTML = window.audioRate.toFixed(1) + "x&nbsp;";
			});
		}
	}, 200);
})();
