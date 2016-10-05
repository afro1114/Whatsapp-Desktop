(function(scope) {
    "use strict";

    var app = require('electron').app;
    var AppMenu = require('menu');
    var MenuItem = require('menu-item');
    var AppTray = require('tray');
    var fileSystem = require('fs');
    var NativeImage = require('native-image');
    var BrowserWindow = require('browser-window');
    var ipcMain = require('electron').ipcMain;

    global.onlyOSX = function(callback) {
        if (process.platform === 'darwin') {
            return Function.bind.apply(callback, this, [].slice.call(arguments, 0));
        }
        return function() {};
    };

    global.onlyWin = function(callback) {
        if (process.platform === 'win32' || process.platform === 'win64') {
            return Function.bind.apply(callback, this, [].slice.call(arguments, 0));
        }
        return function() {};
    };

    global.config = {
      defaultSettings: {
        width: 1000,
        height: 720,
        thumbSize: 0
      },
      currentSettings: {},
      init: function () {
        config.loadConfiguration();
      },
      loadConfiguration: function () {
        var settingsFile = app.getPath('userData') +"/settings.json";
        try {
          var data = fileSystem.readFileSync(settingsFile);
          config.currentSettings = JSON.parse(data);
        } catch (e) {
          config.currentSettings = config.defaultSettings;
        }
      },
      applyConfiguration: function () {
        whatsApp.window.webContents.on('dom-ready', function (event, two) {
        });

        if(config.get("useProxy")) {
          var session = whatsApp.window.webContents.session;
          var httpProxy = config.get("httpProxy");
          var httpsProxy = config.get("httpsProxy") || httpProxy;
          if(httpProxy) {
            session.setProxy("http="+ httpProxy +";https=" + httpsProxy, function(){});
          }
        }
      },
      saveConfiguration: function () {
        fileSystem.writeFileSync(app.getPath('userData') + "/settings.json", JSON.stringify(config.currentSettings) , 'utf-8');
      },
      get: function (key) {
        return config.currentSettings[key];
      },
      set: function (key, value) {
        config.currentSettings[key] = value;
      },
      unSet: function (key) {
        if(config.currentSettings.hasOwnProperty(key)) {
          delete config.currentSettings[key];
        }
      }
    };

    global.whatsApp = {
        init: function() {
            whatsApp.createMenu();

            onlyOSX(function () {
              whatsApp.createTray();
            });

            whatsApp.clearCache();
            config.init();
            whatsApp.openWindow();
            config.applyConfiguration();
        },
        createMenu: function() {
            whatsApp.menu =
                AppMenu.buildFromTemplate(require('./menu'));
                AppMenu.setApplicationMenu(whatsApp.menu);
        },
        createTray: function() {
            whatsApp.tray = new AppTray(__dirname + '/assets/img/trayTemplate.png');

            whatsApp.tray.on('clicked', function() {
                whatsApp.window.show();
            });

            whatsApp.tray.setToolTip('WhatsApp Desktop');
        },
        clearCache: function() {
            try{
                fileSystem.unlinkSync(app.getPath('appData') + '/Application Cache/Index');
            }catch(e){}
        },
        openWindow: function (){
          whatsApp.window = new BrowserWindow({
            "y": config.get("posY"),
            "x": config.get("posX"),
            "width": config.get("width"),
            "height": config.get("height"),
            "min-width": 670,
            "min-height": 650,
            "type": "toolbar",
            "node-integration": true,
            "title": "WhatsApp",
            "plugins": true,
            "webaudio": true
          });

          whatsApp.window.loadURL("file://" + __dirname + "/html/main.html");

          if(config.get("useProxy")) {
            var session = whatsApp.window.webContents.session;
            var httpProxy = config.get("httpProxy");
            var httpsProxy = config.get("httpsProxy") || httpProxy;
            if(httpProxy) {
              session.setProxy("http="+ httpProxy +";https=" + httpsProxy, function(){});
            }
          }

          whatsApp.window.show();

          // bounce for osx
          ipcMain.on('newmsg', function(event, value) {
            onlyOSX(function() {
              app.dock.bounce('informational');
            });
          });

          // update badge
          ipcMain.on('uptbadge', function(event, value) {
            var count = value.title.match(/\((\d+)\)/);
            count = count ? count[1] : '';

            onlyOSX(function() {
              app.dock.setBadge(count);
            })();

            onlyWin(function() {
                if (parseInt(count) > 0) {
                    if (!whatsApp.window.isFocused()) {
                        whatsApp.window.flashFrame(true);
                    }

                    var badge = NativeImage.createFromPath(app.getAppPath() + "/assets/badges/badge-" + (count > 9 ? 0 : count) + ".png");
                    whatsApp.window.setOverlayIcon(badge, "new messages");
                } else {
                    whatsApp.window.setOverlayIcon(null, "no new messages");
                }
            })();
          });

					ipcMain.on("settings.show", function (event, value) {
						var jsString;
						if(value) {
							jsString = 'document.getElementById("settings-container").style.display = "block";';
						} else {
							jsString = 'document.getElementById("settings-container").style.display = "none";';
						}
							whatsApp.window.webContents.executeJavaScript(jsString);
					});

            whatsApp.window.on('close', onlyOSX(function(e) {
                if (whatsApp.window.forceClose !== true) {
                    e.preventDefault();
                    whatsApp.window.hide();
                }
            }));

            whatsApp.window.on("close", function () {
              //save the window position
              config.set("posX", this.getBounds().x);
              config.set("posY", this.getBounds().y);
              config.set("width", this.getBounds().width);
              config.set("height", this.getBounds().height);
              config.saveConfiguration();
            });

            app.on('before-quit', onlyOSX(function() {
                whatsApp.window.forceClose = true;
            }));

            app.on('activate-with-no-open-windows', onlyOSX(function() {
                whatsApp.window.show();
            }));

            app.on('window-all-closed', onlyWin(function() {
                app.quit();
            }));
        },
				showSettings: function () {
					var jsString = 'document.getElementById("settings-container").style.display = "block";';
					whatsApp.window.webContents.executeJavaScript(jsString);
				}
    };
    app.on('ready', function() {
        whatsApp.init();
    });
})(this);
