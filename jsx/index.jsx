/* global App */
/* eslint no-unused-vars: 0 */

import React from 'react';
import ReactDOM from 'react-dom';
import {IntlProvider, FormattedMessage} from 'react-intl';
import injectTapEventPlugin from 'react-tap-event-plugin';

const DEFAULT_LOCALE = 'en';

injectTapEventPlugin();

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
            console.log(`Locale "${locale}" can\'t be loaded, using default (${DEFAULT_LOCALE}).`);
            localeMessages = require('./locale/' + DEFAULT_LOCALE + '.json');
        }

        ReactDOM.render(
            <IntlProvider locale={locale} messages={localeMessages}>
                <App />
            </IntlProvider>,
            appElement
        );
    };

// Initial render of the App
renderApp();
// Locale event from main.js
App.ipc.on('locale', renderApp);
