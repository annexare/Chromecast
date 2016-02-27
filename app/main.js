'use strict';

const app = require('electron').app;
const ipcMain = require('electron').ipcMain;
const services = require('./src/services');
const ui = require('./src/window');

app.on('open-file', (e, path) => {
    console.log(' <- open-file', path, arguments);
});

app.on('open-url', (e, path) => {
    console.log(' <- open-url', path, arguments);
});

ui.init(() => {
    // Window
    ui.service = services;
    ui.window.on('closed', () => {
        services.close();
    });

    // Chromecast
    services.on('service', () => {
        let uiList = [];
        services.list.forEach((device) => {
            uiList.push(device);
        });

        ui.send('services', uiList);
        ui.setMenu(services.list);
    });
    services.on('connected', (host) => {
        ui.send('connected', host);
    });
    services.on('status', (status) => {
        ui.send('status', status);
    });
    services.on('close', () => {
        ui.send('status', status);
    });
    services.browse();

    // IPC
    ipcMain.on('do', (event, action, url) => {
        if (action !== 'noop') {
            console.log(' <- ', action, url);
        }

        if (action === 'load') {
            services.load(url, event);
        } else {
            services[action](url);
        }
    });
});
