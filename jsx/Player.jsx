import React from 'react';
import ReactDOM from 'react-dom';
import RefreshIndicator from 'material-ui/lib/refresh-indicator';
import RaisedButton from 'material-ui/lib/raised-button';
import Slider from 'material-ui/lib/slider';
import TextField from 'material-ui/lib/text-field';

// const URL = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4';

const TIMER = 500;

class Player extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            contentType: '',
            currentTime: 0,
            duration: 1,
            isLoading: false,
            isPaused: false,
            isPlaying: false,
            hasFile: false,
            timer: null,
            url: ''
        };

        // document.addEventListener('drop', this.handleFile);
        // document.addEventListener('dragover', this.handleFile);

        App.ipc.on('status', this.handleRemoteStatus);
        App.ipc.on('url', this.handleFile);
    }

    checkURL = () => {
        return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
            .test(this.state.url);
    }

    getDurationString = (time) => {
        const duration = time * 1000;
        if (duration <= 1000) {
            return '00:00:00';
        }

        let seconds = parseInt((duration/1000)%60)
            , minutes = parseInt((duration/(1000*60))%60)
            , hours = parseInt((duration/(1000*60*60))%24);

        hours = (hours < 10) ? '0' + hours : hours;
        minutes = (minutes < 10) ? '0' + minutes : minutes;
        seconds = (seconds < 10) ? '0' + seconds : seconds;

        return hours + ':' + minutes + ':' + seconds;
    }

    handleChangeURL = (e) => {
        this.handleFocus();
        this.setState({
            url: e.target.value,
        });
    }

    handleFile = (e, url) => {
        console.log('handleFile()', url);

        this.setState({
            url: url
        });
    };

    handleFocus = () => {
        ReactDOM.findDOMNode(this.refs.urlField).focus();
    };

    handleLoad = (e) => {
        if (e) {
            e.preventDefault();
        }

        this.setState({
            isLoading: true
        });

        App.ipc.send('do', 'load', this.state.url);
    }

    handleQueue = (e) => {
        if (e) {
            e.preventDefault();
        }

        if (!this.state.hasFile) {
            this.handleLoad();
        }
    }

    handleRemoteStatus = (event, status) => {
        console.log('handleRemoteState()', status);
        let playerState = status ? status.playerState : 'IDLE',
            isPlaying = playerState === 'PLAYING' || playerState === 'BUFFERING',
            isPaused = playerState === 'PAUSED',
            isIDLE = playerState === 'IDLE',
            contentType = '',
            currentTime = status ? status.currentTime : 0,
            duration = this.state.duration
            ;

        if (status) {
            if (status.activeTrackIds && status.activeTrackIds.length) {
                console.log(' - activeTrackIds', status.activeTrackIds);
            }

            if (status.media) {
                console.log(' - media', status.media);
                duration = status.media.duration;
            }

            if (status.playerState === 'IDLE' && status.idleReason === 'FINISHED') {
                // TODO Play next or disconnect
            }
        }

        this.setState({
            contentType: contentType,
            currentTime: currentTime,
            duration: duration,
            isLoading: !isPlaying && !isPaused && !isIDLE,
            isPaused: isPaused,
            isPlaying: isPlaying,
            hasFile: !isIDLE,
            status: status,
            timer: this.handlePlay()
        });
    }

    handlePlay = () => {
        if (this.state.isIDLE) {
            return;
        }

        return setTimeout(() => {
            App.ipc.send('do', 'noop');
        }, TIMER);
    }

    seek = (event, value) => {
        console.log('seek()', value);
        App.ipc.send('do', 'seek', value);
        this.setState({
            currentTime: value
        });
    }

    pause = () => {
        App.ipc.send('do', 'pause');
    }

    play = () => {
        App.ipc.send('do', 'play');
    }

    stop = () => {
        this.setState({
            isLoading: true,
            hasFile: false
        });
        App.ipc.send('do', 'stop');
    }

    render() {
        let isURL = this.checkURL(),
            duration = this.state.duration,
            currentTime = this.state.currentTime;

        if (currentTime >= duration) {
            currentTime = 0;
        }

        return (
            <div onClick={this.handleFocus}>
                <TextField
                    ref="urlField"
                    autoComplete="off"
                    autoFocus={true}
                    floatingLabelText="Video file URL"
                    fullWidth={true}
                    hintText="https://"
                    multiLine={true}
                    value={this.state.url}
                    onChange={this.handleChangeURL}
                    onEnterKeyDown={this.handleQueue}
                    />
                <br/>
                <br/>

                <RaisedButton label="Play Next" primary={true} disabled={!isURL}
                    onClick={this.handleQueue}></RaisedButton>

                <RaisedButton label="Play Now" disabled={!isURL}
                    onClick={this.handleLoad}></RaisedButton>

                { this.state.hasFile
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

                    <br/>

                    <div>
                        <Slider defaultValue={ 0 } min={ 0 } max={ duration } value={ currentTime }
                            description={ this.getDurationString(currentTime) + ' / ' + this.getDurationString(duration) }
                            onChange={ this.seek }
                            />
                    </div>
                </span>)
                    : (this.state.isLoading ? <RefreshIndicator size={36} left={10} top={0} status="loading" style={{
                        display: 'inline-block',
                        position: 'relative',
                    }} /> : '')
                }
            </div>
        );
    }
}
