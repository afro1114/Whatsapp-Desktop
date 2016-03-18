var whatsApp = require('remote').getGlobal("whatsApp");
var settings = require('remote').getGlobal('settings');
var config = require('remote').getGlobal('config');
var SettingsView = {
  bindEvents: function () {
    $this = this;
    $("#save-button").on("click", function (e) {
      e.preventDefault();
      if($(".invalid").length > 0 ) {
        return;
      }
      $this.saveSettings();
      settings.window.close();
    });

    $("#close-button").on("click", function () {
      document.querySelector(".settings-container").style.display = "none";
    });

    $("#useProxy").on("change", function () {
      $("#httpProxy").prop("disabled", !($("#useProxy").is(":checked")));
      $("#httpsProxy").prop("disabled", !($("#useProxy").is(":checked")));
    });
  },

  init: function () {
    $("#avatars").attr("checked", config.get("hideAvatars"));
    $("#previews").attr("checked", config.get("hidePreviews"));
    $("#ninja").attr("checked", config.get("ninjaMode"));
    if (config.get("thumbSize")) {
      $("#thumb-size").val(config.get("thumbSize"));
    }
    $("#useProxy").attr("checked", config.get("useProxy"));
    $("#httpProxy").val(config.get("httpProxy"));
    $("#httpsProxy").val(config.get("httpsProxy"));
    $("#httpProxy").prop("disabled", !($("#useProxy").is(":checked")));
    $("#httpsProxy").prop("disabled", !($("#useProxy").is(":checked")));

    this.bindEvents();
  },

  saveSettings: function () {
    config.set("hideAvatars", $("#avatars").is(":checked"));
    config.set("hidePreviews", $("#previews").is(":checked"));
    config.set("ninjaMode", $("#ninja").is(":checked"));
    config.set("thumbSize", parseInt($("#thumb-size").val(), 10));
    if($("#useProxy").is(":checked")) {
      config.set("useProxy", $("#useProxy").is(":checked"));
      config.set("httpProxy", $("#httpProxy").val());
      config.set("httpsProxy", $("#httpsProxy").val());
    } else {
      config.unSet("useProxy");
      config.unSet("httpProxy");
      config.unSet("httpsProxy");
    }
    config.saveConfiguration();
    config.applyConfiguration();
    whatsApp.window.reload();
  }
};

$(document).ready(function () {
  SettingsView.init();
});
