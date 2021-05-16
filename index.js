const { readFileSync, existsSync } = require('fs');
const { Connection, constants, ApiClient } = require('chia-api');
const { homedir } = require('os');
const { join } = require('path');
const request = require('request');

(async() => {
    process.on('uncaughtException', function(err) {
        console.log(err);
    });
    const conn = new Connection('localhost:55400', {
        cert: readFileSync(join(homedir(), '.chia', 'mainnet', 'config/ssl/daemon/private_daemon.crt')),
        key: readFileSync(join(homedir(), '.chia', 'mainnet', 'config/ssl/daemon/private_daemon.key')),
    });
    conn.onMessage((message) => {
        console.log(message);
    });
    const fullNode = new ApiClient.FullNode({ connection: conn, origin: 'chia-node-append' });
    await fullNode.init();

    var node_list_file = 'node_list.txt';

    while (true) {
        var node_arr = null;
        if (fs.existsSync(node_list_file)) {
            var node_arr = readFileSync(node_list_file, function(err, data) {
                if (err) throw err;
            }).toString().split('\n');
        } else {
            request('https://raw.githubusercontent.com/ForestCrazy/chia-node-append/master/node_list.txt', function(error, response, body) {
                node_arr = body;
            });
        }

        const node_obj = Object.assign({}, node_arr);

        for (const property in node_obj) {
            console.log(node_obj[property])
            try {
                const blockchainState = await fullNode.addNodeConnection({
                    host: node_obj[property].split(':')[0],
                    port: node_obj[property].split(':')[1]
                });
            } catch (exception) {
                console.log(exception);
            }
        }
    }
})();