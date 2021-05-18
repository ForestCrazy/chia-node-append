const { readFileSync, existsSync } = require('fs');
const { Connection, constants, ApiClient } = require('chia-api');
const { homedir } = require('os');
const { join } = require('path');
const lodash = require('lodash');
const firebase = require('firebase');
const winston = require('winston');
const { format } = require('logform');
const { combine, timestamp, label, printf } = format;

(async() => {
    const logFormat = printf(({ level, message, timestamp }) => {
        return `${timestamp} ${level}: ${message}`;
    });
    var logger = winston.createLogger({
        level: 'info',
        format: combine(
            timestamp(),
            logFormat
        ),
        transports: [
            new winston.transports.Console()
        ]
    });
    process.on('uncaughtException', function(err) {
        logger.error('Error: ' + err);
    });
    logger.info('connection to chia service');
    const conn = new Connection('localhost:55400', {
        cert: readFileSync(join(homedir(), '.chia', 'mainnet', 'config/ssl/daemon/private_daemon.crt')),
        key: readFileSync(join(homedir(), '.chia', 'mainnet', 'config/ssl/daemon/private_daemon.key')),
    });
    logger.info('Initialize FullNode ApiClient');
    const fullNode = new ApiClient.FullNode({ connection: conn, origin: 'chia-node-append' });
    await fullNode.init();

    logger.info('Initialize Firebase App');
    const app = firebase.initializeApp({
        apiKey: "AIzaSyC-QfMwDfqD8C-Jsu0K-RsBFB1gZMfhphY", // Auth / General Use
        appId: "1:279516045079:web:1cf491eeefd5d709356152", // General Use
        projectId: "chia-controller-75c1e", // General Use
        authDomain: "chia-node-append.firebaseapp.com", // Auth with popup/redirect
        databaseURL: "https://chia-controller-75c1e.firebaseio.com", // Realtime Database
    });
    var while_loop_round = 0;
    while (true) {
        var resource_node_list = null;
        const node_list_file = 'node_list.txt';
        if (existsSync(node_list_file)) {
            logger.info('import node list from node_list.txt');
            resource_node_list = 'node_list_file';
            var node_obj = readFileSync(node_list_file, function(err, data) {
                if (err) throw err;
            }).toString().split('\n');
            for (const property in node_obj) {
                node_obj[property] = {
                    node_ip: node_obj[property].split(':')[0],
                    node_port: parseInt(node_obj[property].split(':')[1])
                }
            }
        } else {
            logger.info('import node list from firestore database');
            resource_node_list = 'node_list_firebase';
            if (while_loop_round % 10 == 0) {
                const firestore_node_list = await app.firestore().collection('node_list').get();
                var node_obj = firestore_node_list.docs.map(doc => doc.data());
            }
        }

        const currConnections = await fullNode.getConnections();
        const currConn_obj = JSON.parse(JSON.stringify(currConnections))['connections'];

        const node_chia = node_obj.filter(({ node_ip: node_1 }) => !currConn_obj.some(({ peer_host: node_2 }) => node_2 === node_1));
        for (const property in node_chia) {
            logger.info('add node connection ip: ' + node_chia[property].node_ip + ' port: ' + node_chia[property].node_port);
            try {
                const addNodeConnection = await fullNode.addNodeConnection({
                    host: node_chia[property].node_ip,
                    port: node_chia[property].node_port
                });
            } catch (exception) {
                logger.error('failed to add node connection : ' + exception);
            }
        }

        const filter_node_conn = lodash.filter(JSON.parse(JSON.stringify(await fullNode.getConnections()))['connections'], function(node_type) { return node_type.type != 1 });

        if (Object.keys(filter_node_conn).length > 0) {
            for (const property in filter_node_conn) {
                if (filter_node_conn[property].peer_host !== '127.0.0.1') {
                    try {
                        logger.info('close connection node with node_id : ' + filter_node_conn[property].node_id)
                        const closeNodeConnection = await fullNode.closeNodeConnection({
                            node_id: filter_node_conn[property].node_id
                        });
                    } catch (exception) {
                        logger.error('failed to close connection node : ' + exception);
                    }
                }
            }
        }

        if (while_loop_round % 100 == 0 && while_loop_round !== 0) {
            if (resource_node_list !== 'node_list_firebase') {
                var node_obj = await app.firestore().collection('node_list').get();
                node_obj = node_obj.docs.map(doc => doc.data());
            }
            const currConnections = lodash.filter(JSON.parse(JSON.stringify(await fullNode.getConnections()))['connections'], obj_item => obj_item.type === 1);
            const filter_node_list = currConnections.filter(({ peer_host: node_1 }) => !node_obj.some(({ node_ip: node_2 }) => node_2 === node_1));
            for (const property in filter_node_list) {
                logger.info('insert node ip: ' + currConnections[property].peer_host + ' port: ' + currConnections[property].peer_server_port);
                const newChiaNode = await app.firestore().collection('node_list').doc().set({
                    node_ip: currConnections[property].peer_host,
                    node_port: currConnections[property].peer_server_port
                });
            }
        }
        while_loop_round += 1;
    }
})();