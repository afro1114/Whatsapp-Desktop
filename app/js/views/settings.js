const {ipcRenderer} = require('electron');
var whatsApp = require('electron').remote.getGlobal("whatsApp");
var config = require('electron').remote.getGlobal('config');

var SettingsView = {
	bindEvents() {
		var $this = this;
		$("#save-button").on("click", (e) => {
			e.preventDefault();
			if($(".invalid").length > 0 ) {
				return;
			}
			$this.saveSettings();
			ipcRenderer.send("settings.show", false);
		});
		
		$("#close-button").on("click", () => {
			ipcRenderer.send("settings.show", false);
		});
		$("#useProxy").on("change", () => {
			$("#httpProxy").prop("disabled", !($("#useProxy").is(":checked")));
			$("#httpsProxy").prop("disabled", !($("#useProxy").is(":checked")));
			$("#socksProxy").prop("disabled", !($("#useProxy").is(":checked")));
		});
	},
	
	init() {
		$("#avatars").attr("checked", config.get("hideAvatars"));
		$("#previews").attr("checked", config.get("hidePreviews"));
		$("#ninja").attr("checked", config.get("ninjaMode"));
		if (config.get("thumbSize")) {
			$("#thumb-size").val(config.get("thumbSize"));
		}
		$("#useProxy").attr("checked", config.get("useProxy"));
		$("#httpProxy").val(config.get("httpProxy"));
		$("#httpsProxy").val(config.get("httpsProxy"));
		$("#socksProxy").val(config.get("socksProxy"));
		$("#httpProxy").prop("disabled", !($("#useProxy").is(":checked")));
		$("#httpsProxy").prop("disabled", !($("#useProxy").is(":checked")));
		$("#socksProxy").prop("disabled", !($("#useProxy").is(":checked")));
		this.bindEvents();
	},
	
	saveSettings() {
		config.set("hideAvatars", $("#avatars").is(":checked"));
		config.set("hidePreviews", $("#previews").is(":checked"));
		config.set("ninjaMode", $("#ninja").is(":checked"));
		config.set("thumbSize", parseInt($("#thumb-size").val(), 10));
		if($("#useProxy").is(":checked")) {
			config.set("useProxy", $("#useProxy").is(":checked"));
			config.set("httpProxy", $("#httpProxy").val());
			config.set("httpsProxy", $("#httpsProxy").val());
			config.set("socksProxy", $("#socksProxy").val());
		} else {
			config.unSet("useProxy");
			config.unSet("httpProxy");
			config.unSet("httpsProxy");
			config.unSet("socksProxy");
		}
		config.saveConfiguration();
		config.applyConfiguration();
		whatsApp.window.reload();
	}
};

$(document).ready(() =>{
	SettingsView.init();
});
