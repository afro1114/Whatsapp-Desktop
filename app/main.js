(function() {
   "use strict";
   
	const {Menu, BrowserWindow, Tray} = require('electron');
   var app = require('electron').app;
   var fileSystem = require('fs');
   var NativeImage = require('electron').nativeImage;
   var ipcMain = require('electron').ipcMain;
   
   global.onlyOSX = function(callback) {
      if (process.platform === 'darwin') {
         return Function.bind.apply(callback, this, [].slice.call(arguments, 0));
      }
      return function() {};
   };
   
   global.onlyLinux = function(callback) {
      if (process.platform === 'linux') {
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
      init () {
         config.loadConfiguration();
      },
      loadConfiguration () {
         var settingsFile = app.getPath('userData') +"/settings.json";
         try {
            var data = fileSystem.readFileSync(settingsFile);
            config.currentSettings = JSON.parse(data);
         } catch (e) {
            config.currentSettings = config.defaultSettings;
         }
      },
      applyConfiguration () {
         
         if(config.get("useProxy")) {
            var session = whatsApp.window.webContents.session;
            var httpProxy = config.get("httpProxy");
            var httpsProxy = config.get("httpsProxy") || httpProxy;
            if(httpProxy) {
               session.setProxy("http="+ httpProxy +";https=" + httpsProxy, () => {});
            }
         }
      },
      saveConfiguration () {
         fileSystem.writeFileSync(app.getPath('userData') + "/settings.json", JSON.stringify(config.currentSettings) , 'utf-8');
      },
      get (key) {
         return config.currentSettings[key];
      },
      set(key, value) {
         config.currentSettings[key] = value;
      },
      unSet (key) {
         if(config.currentSettings.hasOwnProperty(key)) {
            delete config.currentSettings[key];
         }
      }
   };
   
   global.whatsApp = {
      init() {
         whatsApp.createMenu();
         
         onlyOSX(() => {
            whatsApp.createTray();
         });
         
         whatsApp.clearCache();
         config.init();
         whatsApp.openWindow();
         config.applyConfiguration();
      },
      createMenu() {
         whatsApp.menu = Menu.buildFromTemplate(require('./menu'));
         Menu.setApplicationMenu(whatsApp.menu);
      },
      createTray() {
         whatsApp.tray = new Tray(__dirname + '/assets/img/trayTemplate.png');
         
         whatsApp.tray.on('clicked', () => {
            whatsApp.window.show();
         });
         
         whatsApp.tray.setToolTip('WhatsApp Desktop');
      },
      clearCache() {
         try{
            fileSystem.unlinkSync(app.getPath('appData') + '/Application Cache/Index');
         }catch(e){}
      },
      openWindow (){
         whatsApp.window = new BrowserWindow({
            "y": config.get("posY"),
            "x": config.get("posX"),
            "width": config.get("width"),
            "height": config.get("height"),
            "minWidth": 670,
            "minHeight": 650,
            "node-integration": true,
            "title": "WhatsApp",
            "plugins": true,
            "webaudio": true,
				"icon": __dirname + 'assets/icon/icon.png'
         });
         
         whatsApp.window.loadURL("file://" + __dirname + "/html/main.html");
         
         if(config.get("useProxy")) {
            var session = whatsApp.window.webContents.session;
            var httpProxy = config.get("httpProxy");
            var httpsProxy = config.get("httpsProxy") || httpProxy;
            if(httpProxy) {
               session.setProxy("http="+ httpProxy +";https=" + httpsProxy, () => {});
            }
         }
         
         whatsApp.window.show();
         
         // bounce for osx
         ipcMain.on('newmsg', () => {
            onlyOSX(() => {
               app.dock.bounce('informational');
            });
         });
         
         // update badge
         ipcMain.on('uptbadge', (event, value) => {
            var count = value.title.match(/\((\d+)\)/);
            count = count ? count[1] : '';
            
            onlyOSX(() => {
               app.dock.setBadge(count);
            })();
            
            onlyLinux((() => {
                //Update on linux
            }));
            
            onlyWin(() => {
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
         
         ipcMain.on("settings.show", (event, value) => {
            var jsString;
            if(value) {
               jsString = 'document.getElementById("settings-container").style.display = "block";';
            } else {
               jsString = 'document.getElementById("settings-container").style.display = "none";';
            }
            whatsApp.window.webContents.executeJavaScript(jsString);
         });
         
         whatsApp.window.on('close', onlyOSX((e) => {
            if (whatsApp.window.forceClose !== true) {
               e.preventDefault();
               whatsApp.window.hide();
            }
         }));
         
         whatsApp.window.on("close", () => {
            //save the window position
            config.set("posX", whatsApp.window.getBounds().x);
            config.set("posY", whatsApp.window.getBounds().y);
            config.set("width", whatsApp.window.getBounds().width);
            config.set("height", whatsApp.window.getBounds().height);
            config.saveConfiguration();
         });
         
         app.on('before-quit', onlyOSX(() =>{
            whatsApp.window.forceClose = true;
         }));
         
         app.on('activate-with-no-open-windows', onlyOSX(() =>{
            whatsApp.window.show();
         }));
         
         app.on('window-all-closed', onlyWin(() => {
            app.quit();
         }));
      },
      showSettings () {
         var jsString = 'document.getElementById("settings-container").style.display = "block";';
         whatsApp.window.webContents.executeJavaScript(jsString);
      }
   };
   app.on('ready', () =>{
      whatsApp.init();
   });
})(this);
