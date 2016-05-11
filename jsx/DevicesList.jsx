import React from 'react';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import {FormattedMessage} from 'react-intl';
// import MenuItem from 'material-ui/lib/menus/menu-item';
// import SelectField from 'material-ui/lib/text-field';

class DevicesList extends React.Component {
    constructor(props) {
        super(props);
    }

    handleChange = (event, host) => {
        console.log('DevicesList.handleChange()', host);
        App.do('handleDevice', host);
    };

    renderServciesList = () => {
        return this.props.services.map((service, index) => {
            let isChecked = this.props.service
                ? service.data === this.props.service
                : false;

            return <RadioButton
                key={ index }
                checked={ isChecked }
                label={ service.name || service.data || 'Unknown' }
                value={ service.data }
                />;
            // return <MenuItem value={ index } primaryText={ service.name || service.data || 'Unknown' } />;
        });
    };

    render() {
        return (
            <div>
                <FormattedMessage id="deviceList" />:{' '}
                {
                    this.props.services && this.props.services.length
                    ? (
                        <RadioButtonGroup name="service" onChange={ this.handleChange }>
                            { this.renderServciesList() }
                        </RadioButtonGroup>
                    )
                    : <FormattedMessage id="lookingForChromecast" />
                }
            </div>
        );
    }
}
