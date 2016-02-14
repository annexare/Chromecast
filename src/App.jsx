'use strict';

import React from 'react';
import RefreshIndicator from 'material-ui/lib/refresh-indicator';
import RaisedButton from 'material-ui/lib/raised-button';
import TextField from 'material-ui/lib/text-field';

const ipc = require('electron').ipcRenderer;
const URL = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            deviceName: '',
            isDisabled: true,
            isLoading: false,
            isPaused: false,
            isPlaying: false,
            hasFile: false,
            url: ''
        };

        ipc.on('services', this.handleRemoteServices.bind(this));
        ipc.on('status', this.handleRemoteStatus.bind(this));
    }

    checkURL() {
        return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
            .test(this.state.url);
    }

    handleChangeURL(event) {
        this.setState({
            url: event.target.value,
        });
    }

    handleLoad() {
        this.setState({
            isLoading: true
        });
        ipc.send('do', 'load', this.state.url);
    }

    handleRemoteServices(event, list) {
        console.log('handleRemoteServices()', list);
        this.setState({
            deviceName: list && list.length
                ? list[0].name
                : '',
            isDisabled: false,
        });
    }

    handleRemoteStatus(event, status) {
        console.log('handleRemoteState()', status);
        let playerState = status ? status.playerState : 'IDLE',
            isPlaying = playerState === 'PLAYING' || playerState === 'BUFFERING',
            isPaused = playerState === 'PAUSED',
            isIDLE = playerState === 'IDLE'
            ;
        this.setState({
            isLoading: !isPlaying && !isPaused && !isIDLE,
            isPaused: isPaused,
            isPlaying: isPlaying,
            hasFile: !isIDLE,
            status: status,
        });
    }

    pause() {
        ipc.send('do', 'pause');
    }

    play() {
        ipc.send('do', 'play');
    }

    stop() {
        this.setState({
            isLoading: true,
            hasFile: false
        });
        ipc.send('do', 'stop');
    }

    render() {
        let isDisabled = this.state.isDisabled;
        let isLoading = this.state.isLoading;
        let isURL = this.checkURL();

        return (
        <div className="row">
            <div className="col-xs-9 col-md-9">
                <div className="box">
                    <h2>{isDisabled ? 'No Chromecast discovered' : 'Send URL to "' + this.state.deviceName + '"'}</h2>
                    <TextField
                        autoComplete="off"
                        disabled={isDisabled}
                        floatingLabelText={isDisabled && !isLoading ? 'Please make sure Chromecast is ON and in the same network' : 'Video file URL'}
                        fullWidth={true}
                        hintText="https://"
                        multiLine={true}
                        value={this.state.url}
                        onChange={this.handleChangeURL.bind(this)}
                        onEnterKeyDown={this.handleLoad.bind(this)}
                        />
                    <br/>
                    <RaisedButton label="Send" primary={true} disabled={isLoading || isDisabled || !isURL}
                        onClick={this.handleLoad.bind(this)}></RaisedButton>
                    { this.state.hasFile && !isDisabled
                        ? (
                    <span>
                        { this.state.isPlaying
                            ? ''
                            : <RaisedButton label="Play" onClick={this.play}></RaisedButton>
                            }
                        { this.state.isPaused
                            ? ''
                            : <RaisedButton label="Pause" onClick={this.pause}></RaisedButton>
                            }
                        <RaisedButton label="Stop"
                            onClick={this.stop.bind(this)}></RaisedButton>
                    </span>)
                        : (isLoading ? <RefreshIndicator size={36} left={10} top={0} status="loading" style={{
                            display: 'inline-block',
                            position: 'relative',
                        }} /> : '')
                        }
                </div>
            </div>
            <div className="col-xs-3 col-md-3" style={{display: 'none'}}>
                <div className="box">
                    <h2>Playlist</h2>
                    <p>// TODO</p>
                </div>
            </div>
        </div>
        );
    }
}
