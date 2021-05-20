# Chia-Node-Append
[![Software License](https://img.shields.io/badge/license-GPL--3.0-brightgreen.svg?style=flat-square)](LICENSE)

Tool to automatically add peer nodes up to 100 connections

## chia-node-append installer
* download **chia-node-append** from [last release](https://github.com/ForestCrazy/chia-node-append/releases/tag/v1.2.0)
* [optional] create `node_list.txt` and add node list [(example `node_list.txt` file)](https://github.com/ForestCrazy/chia-node-append/blob/master/node_list.txt) if you do not create the file `node_list.txt` script will find node list from firestore database
* [optional] create `chia-node-append-setting.json` and copy setting from [chia-node-append-setting.json](https://github.com/ForestCrazy/chia-node-append/blob/master/chia-node-append-setting.json) if you do not create the file `chia-node-append-setting.json` script will use default setting  [(see setting file description)](https://github.com/ForestCrazy/chia-node-append/blob/master/CONFIG.md)
* run **chia-node-append**

## How to build project

* install [NodeJS](https://nodejs.org/en/) (ver >= 15) and clone git repository

```bash
git clone https://github.com/ForestCrazy/chia-node-append.git
cd .chia-node-append
npm install pkg
pkg index.js
```

## License
GNU GPLv3 (see [LICENSE](https://github.com/ForestCrazy/chia-node-append/blob/master/LICENSE))

## Donate for development 🥺🥺
* BNB(BEP20 BSC): 0x2309a4502b52f8537b845599f52cf5ba98be5360
* DASH: Xga4npoxAU9hfyysWhL1GZhQFnE4EHg83A
* XRP(XRP): rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh Tag: 101853643
* DOGE(DOGE): DGG5FJHzd5hyT8iCD7uQn4ubs2izk4UDSt
