'use strict';

import React from 'react';

class App extends React.Component {
    static ipc = require('electron').ipcRenderer;
    static do(method, param) {
        App.ipc.send('do', method, param);
    };

    constructor(props) {
        super(props);

        this.state = {
            deviceName: '',
            hasNoDevice: true,
            service: '',
            services: []
        };

        App.ipc.on('connected', this.handleServiceChange);
        App.ipc.on('services', this.handleRemoteServices);
    }

    handleRemoteServices = (event, list) => {
        console.log('handleRemoteServices()', list);
        this.setState({
            deviceName: list && list.length
                ? (list[0].name || '').replace('.local', '')
                : '',
            hasNoDevice: false,
            services: list
        });
    }

    handleServiceChange = (event, service) => {
        console.log('handleServiceChange()', service);
        this.setState({
            service: service
        });
    }

    render() {
        let hasNoDevice = this.state.hasNoDevice;
        let title = hasNoDevice ? 'Looking for Chromecast…' : 'Choose & Send URL';

        return (
        <div className="row">
            <div className="col-xs">
                <div className="box">
                    <h2>{ title }</h2>
                    <DevicesList
                        services={ this.state.services }
                        service={ this.state.service }
                        onChange={ this.handleServiceChange }
                        />
                    { this.state.service ? <Player /> : false }
                </div>
            </div>
            <div className="col-xs-3 col-md-3" style={{ display: 'none' }}>
                <div className="box">
                    <h2>Playlist</h2>
                    <p>// TODO</p>
                </div>
            </div>
        </div>
        );
    }
}
