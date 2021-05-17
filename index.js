const { readFileSync, existsSync } = require('fs');
const { Connection, constants, ApiClient } = require('chia-api');
const { homedir } = require('os');
const { join } = require('path');
const lodash = require('lodash');
const firebase = require('firebase');

(async() => {
    process.on('uncaughtException', function(err) {
        console.log(err);
    });
    const conn = new Connection('localhost:55400', {
        cert: readFileSync(join(homedir(), '.chia', 'mainnet', 'config/ssl/daemon/private_daemon.crt')),
        key: readFileSync(join(homedir(), '.chia', 'mainnet', 'config/ssl/daemon/private_daemon.key')),
    });
    const fullNode = new ApiClient.FullNode({ connection: conn, origin: 'chia-node-append' });
    await fullNode.init();

    const app = firebase.initializeApp({
        apiKey: "AIzaSyC-QfMwDfqD8C-Jsu0K-RsBFB1gZMfhphY", // Auth / General Use
        appId: "1:279516045079:web:1cf491eeefd5d709356152", // General Use
        projectId: "chia-controller-75c1e", // General Use
        authDomain: "chia-node-append.firebaseapp.com", // Auth with popup/redirect
        databaseURL: "https://chia-controller-75c1e.firebaseio.com", // Realtime Database
    });
    var while_loop_round = 0;
    while (true) {
        while_loop_round += 1;
        var resource_node_list = null;
        const node_list_file = 'node_list.txt';
        if (existsSync(node_list_file)) {
            resource_node_list = 'node_list_file';
            const node_arr = readFileSync(node_list_file, function(err, data) {
                if (err) throw err;
            }).toString().split('\n');
            var node_obj = Object.assign({}, node_arr);
            for (const property in node_obj) {
                node_obj[property] = {
                    node_ip: node_obj[property].split(':')[0],
                    node_port: node_obj[property].split(':')[1].replace('\r', '')
                }
            }
        } else {
            resource_node_list = 'node_list_firebase';
            if (while_loop_round % 10 == 0) {
                const firestore_node_list = await app.firestore().collection('node_list').get()
                var node_obj = firestore_node_list.docs.map(doc => doc.data());
            }
        }

        const currConnections = await fullNode.getConnections();
        const currConn_obj = JSON.parse(JSON.stringify(currConnections));

        for (const property in node_obj) {
            const node_chia = lodash.filter(currConn_obj['connections'], obj_item => obj_item.peer_host === node_obj[property].node_ip);
            if (Object.keys(node_chia).length == 0) {
                console.log(node_obj[property])
                try {
                    const addNodeConnection = await fullNode.addNodeConnection({
                        host: node_obj[property].node_ip,
                        port: node_obj[property].node_port
                    });
                } catch (exception) {
                    console.log(exception);
                }
            }
        }

        const filter_node_conn = lodash.filter(JSON.parse(JSON.stringify(await fullNode.getConnections())), obj_item => obj_item.type !== 1);

        for (const property in filter_node_conn) {
            try {
                const closeNodeConnection = await fullNode.closeNodeConnection({
                    node_id: filter_node_conn[property].node_id
                });
            } catch (exception) {
                console.log(exception);
            }
        }

        if (while_loop_round % 100 == 0) {
            if (resource_node_list == 'node_list_firebase') {
                const currConnections = lodash.filter(JSON.parse(JSON.stringify(await fullNode.getConnections())), obj_item => obj_item.type === 1);
                for (const property in currConnections) {
                    const newChiaNode = await app.firestore().collection('node_list').doc().set({
                        node_ip: currConnections[property].peer_host,
                        node_port: currConnections[property].peer_server_port
                    });
                }
            }
        }
    }
})();