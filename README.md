# Google Chromecast app

This is a very basic app that allows sending direct URL (not local file yet) from desktop to Google Chromecast.

Was implemented using:

- [Node.js](https://nodejs.org/en/), Atom [Electron](http://electron.atom.io/), [node-castv2-client](https://github.com/thibauts/node-castv2-client)
- Facebook [React](http://facebook.github.io/react/)
- The very basic components from [Material-UI](http://www.material-ui.com/#/) &amp; [Flexbox Grid](http://flexboxgrid.com/)
- [Gulp](http://gulpjs.com/) task runner, [Babel](https://babeljs.io/)

Mainly, the project may showcase how this may work together.

## Environment

### Node

```
# global modules
npm install -g electron-prebuilt
npm install -g bower

# local dependencies, may take some time
npm install

# launch via electron
npm start

# build binaries for Desktop
gulp build

# build front-end only
gulp build:ui
```

### VS Code

```
npm install
npm install -g tsd
tsd install react-global
```

## TODO

This stuff seems useful, feel free to contribute with a PR (not sure when will have time to implement):

- [*] Do not connect immediately, choose from menu
- [*] Seek bar
- [ ] Volume control
- [ ] Playlists
- [ ] Tray icon: most of menu items just mocked, implement
- [ ] Drag'n'Drop URLs to app Dock/Taskbar icon
- [ ] Translations
