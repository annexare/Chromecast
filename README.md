# Google Chromecast app

[![NPM](https://img.shields.io/npm/v/pack-dir.svg "NPM package version")](https://www.npmjs.com/package/pack-dir)
[![Travis CI](https://travis-ci.org/annexare/Chromecast.svg "Travis CI")](https://travis-ci.org/annexare/Chromecast)
[![AppVeyor CI](https://ci.appveyor.com/api/projects/status/vanxx5rell1yckj8?svg=true "AppVeyor CI")](https://ci.appveyor.com/project/z-ax/Chromecast)

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
# local dependencies, may take some time
npm install

# launch via electron
npm start

# build binaries for Desktop
gulp build
# build binaries, OS specific only
gulp build:osx
gulp build:win

# build front-end only
gulp build:ui
```

### VS Code

```
npm install
npm install -g tsd
tsd install node
tsd install react-global
```

## TODO

This stuff seems useful, feel free to contribute with a PR (not sure when will have time to implement):

- [x] Do not connect immediately, choose from menu
- [x] Seek bar
- [x] Translations
- [ ] Volume control
- [ ] Playlists
- [x] Tray icon: menu items
- [x] Tray icon: Drag'n'Drop URL
- [ ] YouTube links support
