'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactIntl = require('react-intl');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class App extends _react2.default.Component {
    static do(method, param) {
        App.ipc.send('do', method, param);
    }

    constructor(props) {
        super(props);

        this.handleClose = () => {
            console.log('App.handleClose()');
            this.setState({
                deviceName: '',
                service: ''
            });
        };

        this.handleFile = e => {
            console.log('App.handleFile()', arguments);
            e.preventDefault();

            if (!this.props.service) {
                e.stopPropagation();
            }
        };

        this.handleRemoteServices = (event, list) => {
            console.log('App.handleRemoteServices()', list);
            this.setState({
                deviceName: list && list.length ? (list[0].name || '').replace('.local', '') : '',
                hasNoDevice: false,
                services: list
            });
        };

        this.handleServiceChange = (event, service) => {
            console.log('App.handleServiceChange()', service);
            this.setState({
                service: service
            });
        };

        this.state = {
            deviceName: '',
            hasNoDevice: true,
            service: '',
            services: []
        };

        // document.addEventListener('drop', this.handleFile);
        // document.addEventListener('dragover', this.handleFile);

        App.ipc.on('close', this.handleClose);
        App.ipc.on('connected', this.handleServiceChange);
        App.ipc.on('services', this.handleRemoteServices);
    }

    render() {
        let hasNoDevice = this.state.hasNoDevice,
            title = _react2.default.createElement(_reactIntl.FormattedMessage, { id: hasNoDevice ? 'lookingForChromecast' : 'chooseUrl' });

        return _react2.default.createElement(
            'div',
            { className: 'row' },
            _react2.default.createElement(
                'div',
                { className: 'col-xs' },
                _react2.default.createElement(
                    'div',
                    { className: 'box' },
                    _react2.default.createElement(
                        'h2',
                        null,
                        title
                    ),
                    _react2.default.createElement(DevicesList, {
                        services: this.state.services,
                        service: this.state.service,
                        onChange: this.handleServiceChange
                    }),
                    this.state.service ? _react2.default.createElement(Player, { service: this.state.service }) : false
                ),
                _react2.default.createElement(
                    'div',
                    { style: {
                            position: 'absolute',
                            bottom: '2em',
                            color: '#f8f8f8',
                            fontSize: '12px'
                        } },
                    'Built with Electron v',
                    process.versions.electron,
                    ', React v15.0.'
                )
            ),
            _react2.default.createElement(
                'div',
                { className: 'col-xs-3 col-md-3', style: { display: 'none' } },
                _react2.default.createElement(
                    'div',
                    { className: 'box' },
                    _react2.default.createElement(
                        'h2',
                        null,
                        'Playlist'
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        '// TODO'
                    )
                )
            )
        );
    }
}
App.ipc = require('electron').ipcRenderer;
'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _radioButton = require('material-ui/lib/radio-button');

var _radioButton2 = _interopRequireDefault(_radioButton);

var _radioButtonGroup = require('material-ui/lib/radio-button-group');

var _radioButtonGroup2 = _interopRequireDefault(_radioButtonGroup);

var _reactIntl = require('react-intl');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import MenuItem from 'material-ui/lib/menus/menu-item';
// import SelectField from 'material-ui/lib/text-field';

class DevicesList extends _react2.default.Component {
    constructor(props) {
        super(props);

        this.handleChange = (event, host) => {
            console.log('DevicesList.handleChange()', host);
            App.do('handleDevice', host);
        };

        this.renderServciesList = () => {
            return this.props.services.map((service, index) => {
                let isChecked = this.props.service ? service.data === this.props.service : false;

                return _react2.default.createElement(_radioButton2.default, {
                    key: index,
                    checked: isChecked,
                    label: service.name || service.data || 'Unknown',
                    value: service.data
                });
                // return <MenuItem value={ index } primaryText={ service.name || service.data || 'Unknown' } />;
            });
        };
    }

    render() {
        return _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'deviceList' }),
            ':',
            ' ',
            this.props.services && this.props.services.length ? _react2.default.createElement(
                _radioButtonGroup2.default,
                { name: 'service', onChange: this.handleChange },
                this.renderServciesList()
            ) : _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'lookingForChromecast' })
        );
    }
}
'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _refreshIndicator = require('material-ui/lib/refresh-indicator');

var _refreshIndicator2 = _interopRequireDefault(_refreshIndicator);

var _raisedButton = require('material-ui/lib/raised-button');

var _raisedButton2 = _interopRequireDefault(_raisedButton);

var _slider = require('material-ui/lib/slider');

var _slider2 = _interopRequireDefault(_slider);

var _snackbar = require('material-ui/lib/snackbar');

var _snackbar2 = _interopRequireDefault(_snackbar);

var _textField = require('material-ui/lib/text-field');

var _textField2 = _interopRequireDefault(_textField);

var _reactIntl = require('react-intl');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// const URL = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4';

const TIMER = 500;

class Player extends _react2.default.Component {
    constructor(props) {
        super(props);

        this.checkURL = () => {
            return (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(this.state.url)
            );
        };

        this.getDurationString = time => {
            const duration = time * 1000;
            if (duration <= 1000) {
                return '00:00:00';
            }

            let seconds = parseInt(duration / 1000 % 60),
                minutes = parseInt(duration / (1000 * 60) % 60),
                hours = parseInt(duration / (1000 * 60 * 60) % 24);

            hours = hours < 10 ? '0' + hours : hours;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;

            return hours + ':' + minutes + ':' + seconds;
        };

        this.handleChangeURL = e => {
            this.handleFocus();
            this.setState({
                url: e.target.value
            });
        };

        this.handleFile = (e, url) => {
            console.log('handleFile()', url);

            this.setState({
                url: url
            });

            this.handleQueue();
        };

        this.handleFocus = () => {
            // This part doesn't work :/
            _reactDom2.default.findDOMNode(this.refs.urlField).focus();
        };

        this.handleKeyDown = e => {
            if (e && e.keyCode === 13) {
                this.handleQueue(e);
            }
        };

        this.handleLoad = e => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            this.setState({
                isLoading: true
            });

            App.ipc.send('do', 'load', this.state.url);
        };

        this.handleQueue = e => {
            if (!this.state.hasFile) {
                this.handleLoad(e);
            }
        };

        this.handleRemoteStatus = (event, status) => {
            console.log('handleRemoteState()', status);
            let playerState = status ? status.playerState : 'IDLE',
                isPlaying = playerState === 'PLAYING' || playerState === 'BUFFERING',
                isPaused = playerState === 'PAUSED',
                isIDLE = playerState === 'IDLE',
                contentType = '',
                currentTime = status ? status.currentTime : 0,
                duration = this.state.duration;

            if (status) {
                if (status.activeTrackIds && status.activeTrackIds.length) {
                    console.log(' - activeTrackIds', status.activeTrackIds);
                }

                if (status.media) {
                    console.log(' - media', status.media);
                    duration = status.media.duration;
                }

                if (status.playerState === 'IDLE') {
                    if (status.idleReason === 'ERROR') {
                        status = false;
                    }
                    if (status.idleReason === 'FINISHED') {
                        // TODO Play next
                        App.ipc.send('do', 'close');
                    }
                }
            }

            this.setState({
                contentType: contentType,
                currentTime: currentTime,
                duration: duration,
                isFileSupported: status !== false,
                isLoading: !isPlaying && !isPaused && !isIDLE,
                isPaused: isPaused,
                isPlaying: isPlaying,
                hasFile: !isIDLE,
                status: status,
                timer: this.handlePlay()
            });
        };

        this.handlePlay = () => {
            if (this.state.timer) {
                clearTimeout(this.state.timer);
            }

            if (!this.state.hasFile) {
                return;
            }

            return setTimeout(() => {
                App.ipc.send('do', 'noop');
            }, TIMER);
        };

        this.handleUnsupported = () => {
            this.handleRemoteStatus(false, false);
        };

        this.seek = (event, value) => {
            console.log('seek()', value);
            App.ipc.send('do', 'seek', value);
            this.setState({
                currentTime: value
            });
        };

        this.pause = () => {
            App.ipc.send('do', 'pause');
        };

        this.play = () => {
            App.ipc.send('do', 'play');
        };

        this.stop = () => {
            this.setState({
                isLoading: true,
                hasFile: false
            });
            App.ipc.send('do', 'stop');
        };

        this.state = {
            contentType: '',
            currentTime: 0,
            duration: 1,
            isFileSupported: true,
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
        App.ipc.on('unsupported', this.handleUnsupported);
        App.ipc.on('url', this.handleFile);
    }

    render() {
        let isURL = this.checkURL(),
            duration = this.state.duration,
            currentTime = this.state.currentTime;

        if (currentTime >= duration) {
            currentTime = 0;
        }

        return _react2.default.createElement(
            'div',
            { onClick: this.handleFocus },
            _react2.default.createElement(_snackbar2.default, {
                open: !this.state.isFileSupported,
                message: _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'file.notSupported' })
            }),
            _react2.default.createElement(_textField2.default, {
                ref: 'urlField',
                autoComplete: 'off',
                autoFocus: true,
                floatingLabelText: _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'file.url' }),
                fullWidth: true,
                hintText: 'https://',
                multiLine: true,
                value: this.state.url,
                onChange: this.handleChangeURL,
                onKeyDown: this.handleKeyDown
            }),
            _react2.default.createElement('br', null),
            _react2.default.createElement('br', null),
            _react2.default.createElement(_raisedButton2.default, { label: 'Play Now', primary: true, disabled: !isURL,
                onClick: this.handleLoad }),
            _react2.default.createElement(_raisedButton2.default, { label: 'Play Next', disabled: !isURL,
                onClick: this.handleQueue }),
            this.state.hasFile ? _react2.default.createElement(
                'span',
                null,
                this.state.isPlaying ? '' : _react2.default.createElement(_raisedButton2.default, { label: 'Play', onClick: this.play }),
                this.state.isPaused ? '' : _react2.default.createElement(_raisedButton2.default, { label: 'Pause', onClick: this.pause }),
                _react2.default.createElement(_raisedButton2.default, { label: 'Stop',
                    onClick: this.stop.bind(this) }),
                _react2.default.createElement('br', null),
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(_slider2.default, { defaultValue: 0, min: 0, max: duration, value: currentTime,
                        description: this.getDurationString(currentTime) + ' / ' + this.getDurationString(duration),
                        onChange: this.seek
                    })
                )
            ) : this.state.isLoading ? _react2.default.createElement(_refreshIndicator2.default, { size: 36, left: 10, top: 0, status: 'loading', style: {
                    display: 'inline-block',
                    position: 'relative'
                } }) : ''
        );
    }
}
'use strict';

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactIntl = require('react-intl');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_LOCALE = 'en';

let appElement = document.getElementById('app'),
    renderApp = (event, userLocale) => {
    let locale = userLocale || DEFAULT_LOCALE,
        localeMessages;

    if (locale.length > 2) {
        locale = locale.substring(0, 2);
    }

    console.log('Render app', locale);

    try {
        localeMessages = require('./locale/' + locale + '.json');
    } catch (e) {
        console.log(`Locale "${ locale }" can\'t be loaded, using default (${ DEFAULT_LOCALE }).`);
        localeMessages = require('./locale/' + DEFAULT_LOCALE + '.json');
    }

    _reactDom2.default.render(React.createElement(
        _reactIntl.IntlProvider,
        { locale: locale, messages: localeMessages },
        React.createElement(App, null)
    ), appElement);
};

// Initial render of the App
renderApp();
// Locale event from main.js
App.ipc.on('locale', renderApp);