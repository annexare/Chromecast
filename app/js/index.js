'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _refreshIndicator = require('material-ui/lib/refresh-indicator');

var _refreshIndicator2 = _interopRequireDefault(_refreshIndicator);

var _raisedButton = require('material-ui/lib/raised-button');

var _raisedButton2 = _interopRequireDefault(_raisedButton);

var _textField = require('material-ui/lib/text-field');

var _textField2 = _interopRequireDefault(_textField);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ipc = require('electron').ipcRenderer;
var URL = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4';

var App = function (_React$Component) {
    _inherits(App, _React$Component);

    function App(props) {
        _classCallCheck(this, App);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(App).call(this, props));

        _this.state = {
            deviceName: '',
            isDisabled: true,
            isLoading: false,
            isPaused: false,
            isPlaying: false,
            hasFile: false,
            url: ''
        };

        ipc.on('services', _this.handleRemoteServices.bind(_this));
        ipc.on('status', _this.handleRemoteStatus.bind(_this));
        return _this;
    }

    _createClass(App, [{
        key: 'checkURL',
        value: function checkURL() {
            return (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(this.state.url)
            );
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
            ipc.send('do', 'load', this.state.url);
        }
    }, {
        key: 'handleRemoteServices',
        value: function handleRemoteServices(event, list) {
            console.log('handleRemoteServices()', list);
            this.setState({
                deviceName: list && list.length ? list[0].name : '',
                isDisabled: false
            });
        }
    }, {
        key: 'handleRemoteStatus',
        value: function handleRemoteStatus(event, status) {
            console.log('handleRemoteState()', status);
            var playerState = status ? status.playerState : 'IDLE',
                isPlaying = playerState === 'PLAYING' || playerState === 'BUFFERING',
                isPaused = playerState === 'PAUSED',
                isIDLE = playerState === 'IDLE';
            this.setState({
                isLoading: !isPlaying && !isPaused && !isIDLE,
                isPaused: isPaused,
                isPlaying: isPlaying,
                hasFile: !isIDLE,
                status: status
            });
        }
    }, {
        key: 'pause',
        value: function pause() {
            ipc.send('do', 'pause');
        }
    }, {
        key: 'play',
        value: function play() {
            ipc.send('do', 'play');
        }
    }, {
        key: 'stop',
        value: function stop() {
            this.setState({
                isLoading: true,
                hasFile: false
            });
            ipc.send('do', 'stop');
        }
    }, {
        key: 'render',
        value: function render() {
            var isDisabled = this.state.isDisabled;
            var isLoading = this.state.isLoading;
            var isURL = this.checkURL();

            return _react2.default.createElement(
                'div',
                { className: 'row' },
                _react2.default.createElement(
                    'div',
                    { className: 'col-xs-9 col-md-9' },
                    _react2.default.createElement(
                        'div',
                        { className: 'box' },
                        _react2.default.createElement(
                            'h2',
                            null,
                            isDisabled ? 'No Chromecast discovered' : 'Send URL to "' + this.state.deviceName + '"'
                        ),
                        _react2.default.createElement(_textField2.default, {
                            autoComplete: 'off',
                            disabled: isDisabled,
                            floatingLabelText: isDisabled && !isLoading ? 'Please make sure Chromecast is ON and in the same network' : 'Video file URL',
                            fullWidth: true,
                            hintText: 'https://',
                            multiLine: true,
                            value: this.state.url,
                            onChange: this.handleChangeURL.bind(this),
                            onEnterKeyDown: this.handleLoad.bind(this)
                        }),
                        _react2.default.createElement('br', null),
                        _react2.default.createElement(_raisedButton2.default, { label: 'Send', primary: true, disabled: isLoading || isDisabled || !isURL,
                            onClick: this.handleLoad.bind(this) }),
                        this.state.hasFile && !isDisabled ? _react2.default.createElement(
                            'span',
                            null,
                            this.state.isPlaying ? '' : _react2.default.createElement(_raisedButton2.default, { label: 'Play', onClick: this.play }),
                            this.state.isPaused ? '' : _react2.default.createElement(_raisedButton2.default, { label: 'Pause', onClick: this.pause }),
                            _react2.default.createElement(_raisedButton2.default, { label: 'Stop',
                                onClick: this.stop.bind(this) })
                        ) : isLoading ? _react2.default.createElement(_refreshIndicator2.default, { size: 36, left: 10, top: 0, status: 'loading', style: {
                                display: 'inline-block',
                                position: 'relative'
                            } }) : ''
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
}(_react2.default.Component);
'use strict';

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_reactDom2.default.render(React.createElement(App, null), document.getElementById('app'));