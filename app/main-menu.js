'use strict';

const Electron = require('electron');
const Menu = Electron.Menu;

const isOSX = (process.platform === 'darwin');

let separator = () => ({ type: 'separator' });
let templateWindowSubmenu = [
    {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
    },
    {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
    },
];

if (isOSX) {
    templateWindowSubmenu.push(
        separator(),
        {
            label: 'Bring All to Front',
            role: 'front'
        }
    );
}

let template = [
    {
        label: 'Edit',
        submenu: [
            {
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                role: 'undo'
            },
            {
                label: 'Redo',
                accelerator: 'Shift+CmdOrCtrl+Z',
                role: 'redo'
            },
            separator(),
            {
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                role: 'cut'
            },
            {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                role: 'copy'
            },
            {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                role: 'paste'
            },
            {
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                role: 'selectall'
            },
        ]
    },
    {
        label: 'View',
        submenu: [
            // {
            //     label: 'Reload',
            //     accelerator: 'CmdOrCtrl+R',
            //     click: function (item, focusedWindow) {
            //         if (focusedWindow) {
            //             focusedWindow.reload();
            //         }
            //     }
            // },
            // {
            //     label: 'Toggle Full Screen',
            //     accelerator: (function () {
            //         if (process.platform === 'darwin') {
            //             return 'Ctrl+Command+F';
            //         } else {
            //             return 'F11';
            //         }
            //     })(),
            //     click: function (item, focusedWindow) {
            //         if (focusedWindow) {
            //             focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
            //         }
            //     }
            // },
            {
                label: 'Toggle Developer Tools',
                accelerator: (() => {
                    if (isOSX) {
                        return 'Alt+Command+I';
                    } else {
                        return 'Ctrl+Shift+I';
                    }
                })(),
                click: (item, focusedWindow) => {
                    if (focusedWindow) {
                        focusedWindow.toggleDevTools();
                    }
                }
            },
        ]
    },
    {
        label: 'Window',
        role: 'window',
        submenu: templateWindowSubmenu
    },
    {
        label: 'Help',
        role: 'help',
        submenu: [
            {
                label: 'Learn More',
                click: function () {
                    Electron.shell.openExternal('http://electron.atom.io');
                }
            },
        ]
    },
];

if (isOSX) {
    let name = Electron.app.getName();
    let templateAbout = {
        label: name,
        submenu: [
            {
                label: 'About ' + name,
                role: 'about'
            },
            separator(),
            {
                label: 'Services',
                role: 'services',
                submenu: []
            },
            separator(),
            {
                label: 'Hide ' + name,
                accelerator: 'Command+H',
                role: 'hide'
            },
            {
                label: 'Hide Others',
                accelerator: 'Command+Shift+H',
                role: 'hideothers'
            },
            {
                label: 'Show All',
                role: 'unhide'
            },
            separator(),
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click: () => {
                    Electron.app.quit();
                }
            },
        ]
    };
    template.unshift(templateAbout);
}

let menu = Menu.buildFromTemplate(template);

module.exports = Menu.setApplicationMenu(menu);