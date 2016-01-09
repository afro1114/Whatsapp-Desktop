(function(scope) {
    "use strict";

    var app = require('app');
    var AppMenu = require('menu');
    var MenuItem = require('menu-item');
    var AppTray = require('tray');
    var fileSystem = require('fs');
    var NativeImage = require('native-image');
    var BrowserWindow = require('browser-window');
    var ipcMain = require('ipc');

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
        var settingsFile = app.getDataPath() +"/settings.json";
        try {
          var data = fileSystem.readFileSync(settingsFile);
          config.currentSettings = JSON.parse(data);
        } catch (e) {
          config.currentSettings = config.defaultSettings;
        }
      },
      applyConfiguration: function () {
        whatsApp.window.webContents.on('dom-ready', function (event, two) {

          if(config.currentSettings.hideAvatars) {
            this.insertCSS('.chat-avatar{display: none}');
          }
          
          if(config.currentSettings.hidePreviews){
            this.insertCSS('.chat-secondary .chat-status{z-index: -999;}');
          }

          if(config.currentSettings.ninjaMode) {
            this.insertCSS('.message-out .message-text{color: #dcf8c6}');
            this.insertCSS('.message-in .message-text{color: #ffffff}');
            this.insertCSS('.message-text:hover{color: #262626}');
          }

          if(config.currentSettings.thumbSize) {
            var thumbSize = '.image-thumb { width: '+ config.currentSettings.thumbSize + 'px  !important;' +
            'height: '+ config.currentSettings.thumbSize + 'px !important;}' +
            '.image-thumb img.image-thumb-body { width: auto !important;' +
            'height: '+ config.currentSettings.thumbSize + 'px !important;}';
            this.insertCSS(thumbSize);
          }
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
        fileSystem.writeFileSync(app.getDataPath() + "/settings.json", JSON.stringify(config.currentSettings) , 'utf-8');
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
            whatsApp.createTray();

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
            "min-width": 600,
            "min-height": 600,
            "type": "toolbar",
            "node-integration": true,
            "title": "WhatsApp"
          });

          whatsApp.window.loadUrl("file://" + __dirname + "/html/main.html");

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
            app.dock.bounce('informational');
          })

          // update badge
          ipcMain.on('uptbadge', function(event, value) {
            var count = value.title.match(/\((\d+)\)/);
            count = count ? count[1] : '';

            onlyOSX(function() {
              app.dock.setBadge(count);
            })()

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
            })()
          })

            whatsApp.window.webContents.on("new-window", function(e, url){
                require('shell').openExternal(url);
                e.preventDefault();
            });


            whatsApp.window.on('close', onlyOSX(function(e) {
                if (whatsApp.window.forceClose !== true) {
                    e.preventDefault();
                    whatsApp.window.hide();
                }
            }));

            whatsApp.window.on("close", function () {
              if(settings.window) {
                settings.window.close();
                settings.window = null;
              }
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
        }
    };

    global.settings = {
      init: function() {
        // if there is already one instance of the window created show that one
        if(settings.window){
          settings.window.show();
        } else {
          settings.openWindow();
          settings.createMenu();
        }
      },
      createMenu: function () {
        settings.menu = new AppMenu();
        settings.menu.append(new MenuItem(
          {
            label: "close",
            visible: false,
            accelerator: "esc",
            click: function () {settings.window.close();}
          })
        );
        settings.menu.append(new MenuItem(
          {
            label: 'Toggle DevTools',
            accelerator: 'Alt+CmdOrCtrl+O',
            visible: false,
            click: function() {  settings.window.toggleDevTools(); }
          })
        );
        settings.menu.append(new MenuItem(
          {
            label: 'Reload settings view',
            accelerator: 'CmdOrCtrl+r',
            visible: false,
            click: function() { settings.window.reload();}
          })
        );
        settings.window.setMenu(settings.menu);
        settings.window.setMenuBarVisibility(false);
      },
      openWindow: function() {
        settings.window = new BrowserWindow(
          {
            "width": 500,
            "height": 500,
            "resizable": false,
            "center": true,
            "frame": false
          }
        );

        settings.window.loadUrl("file://" + __dirname + "/html/settings.html");
        settings.window.show();

        settings.window.on("close", function () {
          settings.window = null;
        });
      }
};

    app.on('ready', function() {
        whatsApp.init();
    });
})(this);
