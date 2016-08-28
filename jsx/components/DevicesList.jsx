import {List, ListItem} from 'material-ui/List';
import DeviceIcon from 'material-ui/svg-icons/action/power-settings-new';
import DeviceIconSelected from 'material-ui/svg-icons/action/check-circle';

class DevicesList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            service: ''
        };

        App.ipc.on('close', this.handleClose);
        App.ipc.on('connected', this.handleServiceChange);
        App.ipc.on('services', this.handleRemoteServices);
    }

    handleChange = (host) => {
        console.log('DevicesList.handleChange()', host);
        App.do('handleDevice', host);
    }

    handleClose = () => {
        this.setState({
            service: ''
        });
    };

    handleRemoteServices = (event, list) => {
        this.setState({
            services: list
        });
    }

    handleServiceChange = (event, service) => {
        this.setState({
            service: service
        });
    }

    renderServciesList = () => {
        return this.state.services.map((service, index) => {
            if (!service || !service.host) {
                return false;
            }

            let isChecked = this.state.service
                ? service.host === this.state.service
                : false;

            return <ListItem
                key={ index }
                onClick={ () => this.handleChange(service.host)}
                leftIcon={ isChecked ? <DeviceIconSelected /> : <DeviceIcon /> }
                primaryText={ service.name || service.host }
                />;
        });
    };

    render() {
        return (
            <div>
                {
                    this.state.services && this.state.services.length
                    ? (
                        <List name="service">
                            { this.renderServciesList() }
                        </List>
                    )
                    : <FormattedMessage id="lookingForChromecast" />
                }
            </div>
        );
    }
}
