'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = (_temp = _class = function (_React$Component) {
    _inherits(App, _React$Component);

    _createClass(App, null, [{
        key: 'do',
        value: function _do(method, param) {
            App.ipc.send('do', method, param);
        }
    }]);

    function App(props) {
        _classCallCheck(this, App);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(App).call(this, props));

        _this.handleRemoteServices = function (event, list) {
            console.log('handleRemoteServices()', list);
            _this.setState({
                deviceName: list && list.length ? (list[0].name || '').replace('.local', '') : '',
                hasNoDevice: false,
                services: list
            });
        };

        _this.handleServiceChange = function (event, service) {
            console.log('handleServiceChange()', service);
            _this.setState({
                service: service
            });
        };

        _this.state = {
            deviceName: '',
            hasNoDevice: true,
            service: '',
            services: []
        };

        App.ipc.on('connected', _this.handleServiceChange);
        App.ipc.on('services', _this.handleRemoteServices);
        return _this;
    }

    _createClass(App, [{
        key: 'render',
        value: function render() {
            var hasNoDevice = this.state.hasNoDevice;
            var title = hasNoDevice ? 'Looking for Chromecast…' : 'Choose & Send URL';

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
                        this.state.service ? _react2.default.createElement(Player, null) : false
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
    }]);

    return App;
}(_react2.default.Component), _class.ipc = require('electron').ipcRenderer, _temp);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _radioButton = require('material-ui/lib/radio-button');

var _radioButton2 = _interopRequireDefault(_radioButton);

var _radioButtonGroup = require('material-ui/lib/radio-button-group');

var _radioButtonGroup2 = _interopRequireDefault(_radioButtonGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// import MenuItem from 'material-ui/lib/menus/menu-item';
// import SelectField from 'material-ui/lib/text-field';

var DevicesList = function (_React$Component) {
    _inherits(DevicesList, _React$Component);

    function DevicesList(props) {
        _classCallCheck(this, DevicesList);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DevicesList).call(this, props));

        _this.getServiesList = function () {
            return _this.props.services.map(function (service, index) {
                return _react2.default.createElement(_radioButton2.default, {
                    key: index,
                    checked: service.data === _this.props.service,
                    label: service.name || service.data || 'Unknown',
                    value: service.data
                });
                // return <MenuItem value={ index } primaryText={ service.name || service.data || 'Unknown' } />;
            });
        };

        _this.handleChange = function (event, host) {
            console.log('DevicesList.handleChange()', host);
            App.do('handleDevice', host);
        };

        return _this;
    }

    _createClass(DevicesList, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                null,
                'Device list:',
                this.props.services && this.props.services.length ? _react2.default.createElement(
                    _radioButtonGroup2.default,
                    { name: 'service', onChange: this.handleChange },
                    this.getServiesList()
                ) : ' looking for…'
            );
        }
    }]);

    return DevicesList;
}(_react2.default.Component);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _refreshIndicator = require('material-ui/lib/refresh-indicator');

var _refreshIndicator2 = _interopRequireDefault(_refreshIndicator);

var _raisedButton = require('material-ui/lib/raised-button');

var _raisedButton2 = _interopRequireDefault(_raisedButton);

var _slider = require('material-ui/lib/slider');

var _slider2 = _interopRequireDefault(_slider);

var _textField = require('material-ui/lib/text-field');

var _textField2 = _interopRequireDefault(_textField);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// const URL = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4';

var TIMER = 500;

var Player = function (_React$Component) {
    _inherits(Player, _React$Component);

    function Player(props) {
        _classCallCheck(this, Player);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Player).call(this, props));

        _this.handlePlay = function () {
            if (_this.state.isIDLE) {
                return;
            }

            return setTimeout(function () {
                App.ipc.send('do', 'noop');
            }, TIMER);
        };

        _this.seek = function (event, value) {
            console.log('seek()', value);
            App.ipc.send('do', 'seek', value);
            _this.setState({
                currentTime: value
            });
        };

        _this.state = {
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

        App.ipc.on('status', _this.handleRemoteStatus.bind(_this));
        return _this;
    }

    _createClass(Player, [{
        key: 'checkURL',
        value: function checkURL() {
            return (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(this.state.url)
            );
        }
    }, {
        key: 'getDurationString',
        value: function getDurationString(time) {
            var duration = time * 1000;
            if (duration <= 1000) {
                return '';
            }

            var seconds = parseInt(duration / 1000 % 60),
                minutes = parseInt(duration / (1000 * 60) % 60),
                hours = parseInt(duration / (1000 * 60 * 60) % 24);

            hours = hours < 10 ? '0' + hours : hours;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;

            return hours + ':' + minutes + ':' + seconds;
        }
    }, {
        key: 'handleChangeURL',
        value: function handleChangeURL(event) {
            this.setState({
                url: event.target.value
            });
        }
    }, {
        key: 'handleLoad',
        value: function handleLoad() {
            this.setState({
                isLoading: true
            });
            App.ipc.send('do', 'load', this.state.url);
        }
    }, {
        key: 'handleRemoteStatus',
        value: function handleRemoteStatus(event, status) {
            console.log('handleRemoteState()', status);
            var playerState = status ? status.playerState : 'IDLE',
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
    }, {
        key: 'pause',
        value: function pause() {
            App.ipc.send('do', 'pause');
        }
    }, {
        key: 'play',
        value: function play() {
            App.ipc.send('do', 'play');
        }
    }, {
        key: 'stop',
        value: function stop() {
            this.setState({
                isLoading: true,
                hasFile: false
            });
            App.ipc.send('do', 'stop');
        }
    }, {
        key: 'render',
        value: function render() {
            var isURL = this.checkURL(),
                duration = this.state.duration,
                currentTime = this.state.currentTime;

            if (currentTime >= duration) {
                currentTime = 0;
            }

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(_textField2.default, {
                    autoComplete: 'off',
                    floatingLabelText: 'Video file URL',
                    fullWidth: true,
                    hintText: 'https://',
                    multiLine: true,
                    value: this.state.url,
                    onChange: this.handleChangeURL.bind(this),
                    onEnterKeyDown: this.handleLoad.bind(this)
                }),
                _react2.default.createElement('br', null),
                _react2.default.createElement('br', null),
                _react2.default.createElement(_raisedButton2.default, { label: 'Send', primary: true, disabled: !isURL,
                    onClick: this.handleLoad.bind(this) }),
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
    }]);

    return Player;
}(_react2.default.Component);
'use strict';

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_reactDom2.default.render(React.createElement(App, null), document.getElementById('app'));