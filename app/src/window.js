'use strict';

const Electron = require('electron');
const EventEmitter = require('events').EventEmitter;
const BrowserWindow = Electron.BrowserWindow;
const Menu = Electron.Menu;
const Tray = Electron.Tray;
const path = require('path');
const url = require('url');

const APP_PATH = path.normalize(__dirname + '/..');
const ICO_PATH = path.normalize(APP_PATH + '/img/icon');
const isDev = (process.env.npm_package_scripts_start && /gulp\sbuild/.test(process.env.npm_package_scripts_start))
    || process.env.NODE_ENV === 'development';
const isOSX = (process.platform === 'darwin');
const appParams = {
    width: 900,
    height: 480,
    margin: 11,
    icon: {
        main: ICO_PATH + '512' + (isOSX ? '.icns' : '.ico'),
        tray: ICO_PATH + (isOSX ? 'Mac' : 'Win') + 'Template.png'
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
            // alwaysOnTop: true,
            autoHideMenuBar: true,
            dir: APP_PATH,
            // frame: false,
            // fullscreenable: false,
            // maximizable: false,
            // minimizable: false,
            movable: true,
            resizable: false,
            transparent: false,
            // hasShadow: false,
            icon: appParams.icon.main,
            show: false,
            showDockIcon: true,
            titleBarStyle: 'hidden-inset',
            width: appParams.width + appParams.margin * 2,
            height: appParams.height + appParams.margin * 2,
            webPreferences: {
                defaultEncoding: 'utf-8',
                webgl: false,
                webaudio: false
            }
        });

        // Load the index.html of the app.
        let indexFile = url.format({
            protocol: 'file',
            slashes: true,
            pathname: path.resolve(path.join(APP_PATH, 'index.html'))
        });
        this.window.loadURL(indexFile);
        this.window.webContents.once('did-finish-load', () => {
            if (callback) {
                callback.call(this);
            }

            this.window.show();
        });

        this.window.webContents.on('will-navigate', (e, url) => {
            e.preventDefault();
            this.send('url', url);
        });

        // Menu
        require('./menu');

        // Open the DevTools.
        if (isDev) {
            this.window.webContents.openDevTools({
                detach: true
            });
        }

        // Emitted when the window is closed.
        this.window.on('closed', () => {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            this.window = null;
            this.tray = null;
        });
        this.window.setVisibleOnAllWorkspaces(true);

        // Set window position
        this.setWindowPosition();

        // Tray icon
        try {
            this.tray = new Tray(appParams.icon.tray);
            this.tray.on('drop-text', (event, text) => this.send('url', text));
            this.tray.on('right-click', () => this.showWindow());
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
        if (this.isWindowReady) {
            this.createWindow(callback);
        } else {
            // This method will be called when Electron has finished
            // initialization and is ready to create browser windows.
            Electron.app.once('ready', () => {
                this.createWindow(callback);
            });
        }
    }

    send() {
        if (this.window && this.window.webContents) {
            this.window.webContents.send.apply(this.window.webContents, arguments);
        }
    }

    setMenu() {
        if (!this.tray) {
            console.error('Tray doesn\'t exist.');
            return;
        }

        let menuItems = [],
            services = this.service.list,
            current = this.service.host;

        menuItems.push({
            label: 'Open',
            click: () => {
                this.showWindow();
            }
        }, { type: 'separator' });

        if (services && services.size) {
            services.forEach((device) => {
                menuItems.push({
                    checked: device.host === current,
                    enabled: device.host !== current,
                    label: device.name,
                    type: 'checkbox',
                    click: () => {
                        if (this.service) {
                            this.service.handleDevice.call(this.service, device.host);
                        }
                    }
                });
            });

            menuItems.push({
                enabled: !!current,
                label: 'Disconnect',
                click: () => {
                    if (this.service) {
                        this.service.close.call(this.service);
                    }
                }
            });

            menuItems.push({ type: 'separator' });
            menuItems.push({
                label: 'Play',
                enabled: !!current && !!this.service.url && !this.service.isPlaying(),
                click: () => {
                    if (this.service) {
                        if (this.service.status) {
                            this.service.play.call(this.service);
                        } else if (this.service.url) {
                            this.service.load.call(this.service, this.service.url);
                        }
                    }
                }
            });
            menuItems.push({
                label: 'Pause',
                enabled: this.service.isPlaying(),
                click: () => {
                    if (this.service) {
                        this.service.pause.call(this.service);
                    }
                }
            });
            menuItems.push({
                label: 'Stop',
                enabled: this.service.isPlaying(),
                click: () => {
                    if (this.service) {
                        this.service.stop.call(this.service);
                    }
                }
            });
            menuItems.push({ type: 'separator' });
            menuItems.push({ label: 'Next', enabled: false });
            menuItems.push({ label: 'Previous', enabled: false });
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
Electron.app.once('ready', () => {
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

Electron.app.on('activate', (/*event, hasVisibleWindows*/) => {
    if (isOSX && main.window && !main.window.isVisible()) {
        main.showWindow();
    }
});

module.exports = main;
