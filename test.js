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
    conn.onMessage((message) => {
        console.log(message);
    });
    const fullNode = new ApiClient.FullNode({ connection: conn, origin: 'chia-node-append' });
    await fullNode.init();

    const currConnections = await fullNode.getConnections();


    const obj = JSON.parse(JSON.stringify(currConnections));

    /*
    var connections_arr = [];
    for(item of obj['connections']){
        connections_arr.push(item.peer_host);
    }
    console.log(connections_arr);

    for (const property in node_obj) {
        connections_arr.contains(node_obj[property].split(':')[0], function(found) {
        if (found) {
            process.exit(0);
        } else {
            console.log("Not found");
        }
});
    }
    */
    /*
     for (const property in node_obj) {
         const node_chia = lodash.filter(obj['connections'], obj_item => obj_item.peer_host === node_obj[property].split(':')[0]);
         if (Object.keys(node_chia).length == 0) {
             console.log(node_obj[property]);
             try {
                 const addNodeConnection = await fullNode.addNodeConnection({
                     host: node_obj[property].split(':')[0],
                     port: node_obj[property].split(':')[1]
                 });
             } catch (exception) {
                 console.log(exception);
             }
         }
     }
     */
    /*
    const app = firebase.initializeApp({
        apiKey: "AIzaSyC-QfMwDfqD8C-Jsu0K-RsBFB1gZMfhphY", // Auth / General Use
        appId: "1:279516045079:web:1cf491eeefd5d709356152", // General Use
        projectId: "chia-controller-75c1e", // General Use
        authDomain: "chia-node-append.firebaseapp.com", // Auth with popup/redirect
        databaseURL: "https://chia-controller-75c1e.firebaseio.com", // Realtime Database
    });

    const snapshot = await app.firestore().collection('node_list').get()
    console.log(snapshot.docs.map(doc => doc.data()));
    */

    /*
    const newChiaNode = await app.firestore().collection('node_list').doc().set({
        node_ip: 'introducer-apse.chia.net',
        node_port: 8444
    });
    */


})();