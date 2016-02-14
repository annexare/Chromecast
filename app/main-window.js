'use strict';

const Electron = require('electron');
const EventEmitter = require('events').EventEmitter;
const BrowserWindow = Electron.BrowserWindow;
const Menu = Electron.Menu;
const Tray = Electron.Tray;

const isOSX = (process.platform === 'darwin');
const iconPath = __dirname + '/img/icon';
// const iconPath = './img/icon';
const appParams = {
    width: 900,
    height: 360,
    margin: 11,
    icon: {
        main: iconPath + '256' + (isOSX ? '.icns' : '.ico'),
        tray: iconPath + (isOSX ? 'Mac' : 'Win') + 'Template.png'
    }
};

class MainWindow extends EventEmitter {
    constructor() {
        super();
        this.isWindowReady = false;
        this.service = null;
        this.tray = null;
        this.window = null;
    }

    createWindow(callback) {
        // App main Window
        this.window = new BrowserWindow({
            // "alwaysOnTop" doesn't work on Windows 7
            //alwaysOnTop: true,
            dir: __dirname,
            // frame: true,
            // fullscreenable: false,
            // maximizable: false,
            // minimizable: false,
            // movable: true,
            // resizable: false,
            // transparent: false,
            // hasShadow: false,
            icon: appParams.icon.main,
            showDockIcon: true,
            titleBarStyle: 'hidden-inset',
            width: appParams.width + appParams.margin * 2,
            height: appParams.height + appParams.margin * 2
        });

        // and load the index.html of the app.
        this.window.loadURL('file://' + __dirname + '/index.html');
        if (callback) {
            this.window.webContents.on('did-finish-load', callback.bind(this));
        }

        // Menu
        require('./main-menu');

        // Open the DevTools.
        // this.window.webContents.openDevTools();

        // Emitted when the window is closed.
        this.window.on('closed', function () {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            this.window = null;
            this.tray = null;
        }.bind(this));
        this.window.setVisibleOnAllWorkspaces(true);

        // Set window position
        this.setWindowPosition();

        // Tray icon
        try {
            this.tray = new Tray(appParams.icon.tray);
            this.setMenu();
            // this.tray.on('click', this.handleClick.bind(this));
        } catch (e) {
            console.error(e);
        } finally {

        }
    }

    close() {
        this.window.close();
    }

    execute(code) {
        this.window.webContents.executeJavaScript(code);
    }

    getScreenSize() {
        let screen = Electron.screen;

        return screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
            .workArea;
    }

    getWindowSize() {
        return this.window.getSize();
    }

    handleClick(event, bounds) {
        let e = event || {};

        if (this.toggleWindow(e.altKey || e.shiftKey || e.ctrlKey || e.metaKey)) {
            this.setWindowPosition(bounds);
        }
    }

    init(callback) {
        let self = this;

        if (this.isWindowReady) {
            this.createWindow(callback);
        } else {
            // This method will be called when Electron has finished
            // initialization and is ready to create browser windows.
            Electron.app.on('ready', () => {
                self.createWindow(callback);
            });
        }

        // Electron.app.on('activate', function () {
        //     if (!self.window) {
        //         self.createWindow();
        //     } else {
        //         self.showWindow();
        //     }
        // });
    }

    send() {
        console.log('send()', arguments);
        if (this.window && this.window.webContents) {
            this.window.webContents.send.apply(this.window.webContents, arguments);
        }
    }

    setMenu(services) {
        let menuItems = [];
        console.log('setMenu()', this.isWindowReady, services && services.size);
        if (services && services.size) {
            services.forEach((device) => {
                menuItems.push({
                    label: device.name,
                    type: 'radio'
                });
            });
            menuItems.push({
                label: 'Disconnect',
                click: this.service.close.bind(this.service)
            });

            menuItems.push({ type: 'separator' });
            menuItems.push({ label: 'Play' });
            menuItems.push({ label: 'Pause' });
            menuItems.push({ label: 'Stop' });
            menuItems.push({ type: 'separator' });
            menuItems.push({ label: 'Next' });
            menuItems.push({ label: 'Previous' });
        } else {
            menuItems.push({
                label: 'Discover Devices',
                enabled: false
            });
        }

        menuItems.push({ type: 'separator' });
        menuItems.push({
            label: 'Quit',
            accelerator: isOSX ? 'Command+Q' : 'Alt+F4',
            click: this.close.bind(this)
        });

        console.log('menuItems', menuItems);

        this.tray.setContextMenu(
            Menu.buildFromTemplate(menuItems)
            );
    }

    setWindowPosition(bounds) {
        this.showWindow();

        let x = 0, y = 0,
            screenSize = this.getScreenSize(),
            windowSize = this.getWindowSize();

        if (bounds && (bounds.x || bounds.y)) {
            let trayCenter = {
                x: isOSX
                    ? Math.floor(bounds.x - windowSize[0] / 2 + bounds.width / 2)
                    : Math.floor(screenSize.x + (screenSize.width - windowSize[0])),
                y: isOSX
                    ? screenSize.y
                    : Math.floor(screenSize.height - (windowSize[1] - screenSize.y))
            };

            // According to the Tray bounds
            x = bounds.x < 100
            // Left
                ? screenSize.x
            // Right
                : trayCenter.x;
            y = bounds.y < 100
            // Top
                ? screenSize.y
            // Bottom
                : trayCenter.y;
        } else {
            // Center of the Screen
            x = Math.floor(screenSize.x + (screenSize.width / 2 - windowSize[0] / 2));
            y = Math.floor((screenSize.height + screenSize.y) / 2 - windowSize[1] / 2);
        }

        this.window.setPosition(x, y, false);
    }

    showWindow() {
        this.window.show();
        this.window.focus();
    }

    toggleWindow(ifHide) {
        let isVisibleAndFocused = (process.platform === 'darwin')
            ? this.window.isVisible() && this.window.isFocused()
            : this.window.isVisible();

        if (isVisibleAndFocused || ifHide) {
            this.window.hide();
            return false;
        }

        this.showWindow();

        return true;
    }
}

let main = new MainWindow();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
Electron.app.on('ready', () => {
    main.isWindowReady = true;
});

// Quit when all windows are closed.
Electron.app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    //if (process.platform !== 'darwin') {
    Electron.app.quit();
    //}
});

module.exports = main;
