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
    let isPlaying = false;

    // Locale
    ui.send('locale', app.getLocale());
    // Window
    ui.service = services;
    ui.window.on('closed', () => services.close());

    // Chromecast
    services.on('service', () => {
        let uiList = [];
        services.list.forEach((device) => {
            uiList.push({
                host: device.host,
                name: device.name
            });
        });

        ui.send('services', uiList);
        ui.setMenu();
    });
    services.on('close', () => {
        ui.send('close');
        ui.setMenu();
    });
    services.on('connected', (host) => {
        ui.send('connected', host);
        ui.setMenu();
    });
    services.on('status', (status) => {
        ui.send('status', status);

        let statusPlaying = services.isPlaying();
        console.log(' --- STATUS', status, statusPlaying);
        if (!status || isPlaying !== statusPlaying) {
            isPlaying = statusPlaying;
            ui.setMenu();
        }
    });
    services.on('unsupported', () => {
        ui.send('unsupported');
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

module.exports = {
    app,
    ui
};