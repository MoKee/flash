[Flash MoKee](https://flash.rom.mk/)
==========

ADB Sideload via browser.

## Develop

```
npm install
npm run serve
```

## Build

```
npm run build
```

## Contribute

As part of the MoKee Open Source Project, this repository accepts commits
from our [Gerrit Code Review](https://mokeedev.review/) platform.

```sh
# setup
scp -p -P 29418 YOURNAME@mokeedev.review:hooks/commit-msg $(git rev-parse --git-dir)/hooks/
git remote add review ssh://YOURNAME@mokeedev.review:29418/MoKee/flash

# submit
git push review HEAD:refs/for/master
```

## Localization

https://translate.mokeedev.com/

## Libraries used

* [webadb.js](https://github.com/webadb/webadb.js)
* [Vue.js](https://vuejs.org/)
* [Vuetify](https://vuetifyjs.com/)

## License

Apache License 2.0
