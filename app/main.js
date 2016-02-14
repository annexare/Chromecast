'use strict';

const dialog = require('./main-window');
const ipcMain = require('electron').ipcMain;
const services = require('./main-services');

dialog.init(() => {
    // Window
    dialog.service = services;
    dialog.window.on('closed', () => {
        services.close();
    });

    // Chromecast
    services.on('service', () => {
        let uiList = [];
        services.list.forEach((device) => {
            uiList.push(device);
        });

        dialog.send('services', uiList);
        dialog.setMenu(services.list);
    });
    services.on('status', (status) => {
        dialog.send('status', status);
    });
    services.browse();

    // IPC
    ipcMain.on('do', (event, action, url) => {
        console.log(' <- ', action, url);
        if (action === 'load') {
            services.load(url, event);
        } else {
            services[action](url);
        }
    });
});
