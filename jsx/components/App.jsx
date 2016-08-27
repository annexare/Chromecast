'use strict';

import GetMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

class App extends React.Component {
    static ipc = require('electron').ipcRenderer;
    static do(method, param) {
        App.ipc.send('do', method, param);
    }

    constructor(props) {
        super(props);

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

    handleClose = () => {
        console.log('App.handleClose()');
        this.setState({
            deviceName: '',
            service: ''
        });
    };

    handleFile = (e) => {
        console.log('App.handleFile()', arguments);
        e.preventDefault();

        if (!this.props.service) {
            e.stopPropagation();
        }
    }

    handleRemoteServices = (event, list) => {
        console.log('App.handleRemoteServices()', list);
        this.setState({
            deviceName: list && list.length
                ? (list[0].name || '').replace('.local', '')
                : '',
            hasNoDevice: false,
            services: list
        });
    }

    handleServiceChange = (event, service) => {
        console.log('App.handleServiceChange()', service);
        this.setState({
            service: service
        });
    }

    render() {
        let hasNoDevice = this.state.hasNoDevice,
            title = <FormattedMessage id={hasNoDevice ? 'lookingForChromecast' : 'chooseUrl'} />;

        return (
        <MuiThemeProvider muiTheme={GetMuiTheme()}>
        <div className="row">
            <div className="col-xs">
                <div className="box">
                    <h2>{ title }</h2>
                    <DevicesList onChange={ this.handleServiceChange }/>
                    { this.state.service ? <Player service={this.state.service} /> : false }
                </div>
                <div style={{
                    position: 'absolute',
                    bottom: '2em',
                    color: '#f8f8f8',
                    fontSize: '12px'
                }}>
                    Chromecast app v{process.env.npm_package_version}.
                    Built with Electron v{process.versions.electron}, React v15.0.
                </div>
            </div>
            <div className="col-xs-3 col-md-3" style={{ display: 'none' }}>
                <div className="box">
                    <h2>Playlist</h2>
                    <p>// TODO</p>
                </div>
            </div>
        </div>
        </MuiThemeProvider>
        );
    }
}
