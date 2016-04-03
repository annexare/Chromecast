import React from 'react';
import RadioButton from 'material-ui/lib/radio-button';
import RadioButtonGroup from 'material-ui/lib/radio-button-group';
import {FormattedMessage} from 'react-intl';
// import MenuItem from 'material-ui/lib/menus/menu-item';
// import SelectField from 'material-ui/lib/text-field';

class DevicesList extends React.Component {
    constructor(props) {
        super(props);
    }

    getServiesList = () => {
        return this.props.services.map((service, index) => {
            return <RadioButton
                key={ index }
                checked={ service.data === this.props.service }
                label={ service.name || service.data || 'Unknown' }
                value={ service.data }
                />;
            // return <MenuItem value={ index } primaryText={ service.name || service.data || 'Unknown' } />;
        });
    }

    handleChange = (event, host) => {
        console.log('DevicesList.handleChange()', host);
        App.do('handleDevice', host);
    }

    render() {
        return (
            <div>
                <FormattedMessage id="deviceList" />:{' '}
                {
                    this.props.services && this.props.services.length
                    ? <RadioButtonGroup name="service" onChange={ this.handleChange }>
                        { this.getServiesList() }
                        </RadioButtonGroup>
                    : <FormattedMessage id="lookingForChromecast" />
                }
            </div>
        );
    }
}
