'use strict';

const CastClient = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
const EventEmitter = require('events').EventEmitter;
const scanner = require('chromecast-scanner');
const request = require('request');

// const PREVIEW_ICON_URL = 'https://www.google.com/chromecast/static/images/tv/what-is-chromecast.jpg';
const PREVIEW_ICON_URL = 'https://www.google.com/chromecast/static/images/tv/chromecast.jpg';
const PREVIEW_TITLE = 'Chromecast Stream';

const STATE_PLAYING = 'PLAYING';
//     BUFFERING = 'BUFFERING',
//     PAUSED = 'PAUSED',
//     REPEAT_OFF = 'REPEAT_OFF',
//     REPEAT_ON = 'REPEAT_ON'
//     ;

class Services extends EventEmitter {
    constructor() {
        super();

        this.client = null;
        // Latest IPC event
        this.event = null;
        this.host = null;
        this.list = new Map();
        this.isReconnect = false;
        this.status = false;
        this.url = '';

        this.isPlaying = this.isPlaying.bind(this);
    }

    handleDevice(host) {
        this.close();

        this.host = host;
        this.client = new CastClient();
        this.client.on('error', (error) => {
            console.log('Client Error: %s', error.message);
            console.log(error);
            console.trace();
            this.close();
        });
        this.client.connect(host, this.handleConnect.bind(this));
    }

    handleConnect() {
        console.log('Connected, launching...');
        this.client.launch(DefaultMediaReceiver, this.handleLaunch.bind(this));
    }

    handleHeaders(err, res) {
        if (err || !res) {
            console.log(' - ERROR HEAD ', err, res);
            return;
        }

        console.log(' - HEAD ', res.headers);

        if (!this.player || !this.player.session) {
            console.log('Player session was closed');
            if (this.host) {
                this.isReconnect = true;
                this.handleDevice(this.host);
            }

            return;
        }

        let contentType = res.headers['content-type'] || '',
            media = {
            // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
            contentId: this.url,
            contentType: contentType,
            streamType: 'BUFFERED', // or LIVE
            // Title and cover displayed while buffering
            metadata: {
                type: 0,
                metadataType: 0,
                title: `${PREVIEW_TITLE}: ${contentType}.`,
                images: [{ url: PREVIEW_ICON_URL }]
            }
        };

        console.log(`App "${this.player.session.displayName}" is launched, loading media: "${this.url}"`);
        this.player.load(media, { autoplay: true }, this.handleLoadFile.bind(this));
    }

    handleLaunch(err, player) {
        player.on('status', this.handleStatus.bind(this));
        this.emit('connected', this.host);
        this.player = player;

        if (this.isReconnect && this.url) {
            console.log('Loading media after reconnect: ', this.url);
            this.isReconnect = false;
            this.load();
        }
    }

    handleLoadFile(err, status) {
        console.log('Media loaded playerState=%s', status ? status.playerState : 'UNDEFINED');

        if (!status) {
            this.emit('unsupported');
        }

        // if (this.event) {
        //     this.event.sender.send('playing', this.url);
        // }

        // Seek to 2 minutes after 15 seconds playing.
        // setTimeout(function() {
        //   player.seek(2*60, function(err, status) {
        //     //
        //   });
        // }, 15000);
    }

    handleService(err, service) {
        if (err || !service || !service.data) {
            if (err) {
                console.log('handleService() Error: ', err);
            }

            console.log('handleService() No services found.');

            return;
        }

        let host = service.data,
            name = (service.name || 'Chromecast').replace('.local', '');

        service.host = host;

        console.log('Found device "%s" at %s', name, host);
        console.log(service);

        this.list.set(service.host, service);
        // this.handleDevice.call(this, host);
        this.emit('service', service);
    }

    handleStatus(status) {
        this.status = status;
        this.emit('status', status);
    }

    handleStatusCallback() {
        console.log('handleStatusCallback()', arguments);
    }

    browse() {
        try {
            scanner(this.handleService.bind(this));
        } catch (e) {
            // On contents reload, mdns is already running
            console.error('Scanner Error', e);
        }
    }

    isPlaying() {
        return this.status
            ? this.status.playerState === STATE_PLAYING
            : false;
    }

    load(url, event) {
        this.url = url || this.url;
        this.event = event || this.event;
        // this.player.getStatus(this.handleStatusCallback);

        if (!this.url) {
            console.log('Empty URL to load()');
            return;
        }

        request(this.url, { method: 'HEAD' }, this.handleHeaders.bind(this));
    }

    noop() {
        if (this.player) {
            this.player.getStatus((nothing, status) => {
                this.handleStatus(status);
            });
        }
    }

    pause() {
        if (this.player) {
            this.player.pause(this.handleStatusCallback);
        }
    }

    play() {
        if (this.player) {
            this.player.play(this.handleStatusCallback);
        }
    }

    seek(seconds) {
        if (this.player) {
            this.player.seek(seconds, this.handleStatusCallback);
        }
    }

    stop() {
        if (this.player) {
            this.player.stop(this.handleStatusCallback);
        }
        this.handleStatus(false);
    }

    close() {
        this.host = null;
        this.status = false;

        if (this.client) {
            this.client.emit('close');
            console.log('Client: Closed.');

            this.client = null;
            this.emit('close');
        }
    }
}

module.exports = new Services();