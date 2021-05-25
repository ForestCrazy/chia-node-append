const { readFileSync, existsSync, writeFileSync } = require('fs');
const { Connection, constants, ApiClient } = require('chia-api');
const { homedir } = require('os');
const { join } = require('path');
const lodash = require('lodash');
const winston = require('winston');
const { format } = require('logform');
const { combine, timestamp, label, printf } = format;
const request = require('request');

(async() => {
    async function Curl(url, method = 'GET', form = {}) {
        return new Promise((resolve) => {
            request({
                method: method,
                url: url,
                formData: form
            }, function(err, resp, body) {
                if (err) resolve('Error');
                if (body) resolve(body);
            });
        });
    }

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

    var setting = {
        node_source: existsSync('node_list.txt') ? 'node_list.txt' : 'node_list_api',
        disconnect_node: true,
        remove_node: true
    }
    while (true) {
        if (existsSync('chia-node-append-setting.json')) {
            logger.info('use setting from chia-node-append-setting.json');
            const setting_obj = JSON.parse(readFileSync('chia-node-append-setting.json', { encoding: 'utf8', flag: 'r' }));
            if (setting_obj.setting_version == '2.0') {
                setting = {
                    node_source: setting_obj.node_source,
                    node_source_type: null,
                    disconnect_node: setting_obj.disconnect_node,
                    remove_node: setting_obj.remove_node
                }
            } else {
                logger.error(`chia-node-append-setting version don't match`)
                logger.info('use default setting');
            }
        } else {
            logger.info('use default setting');
        }
        logger.info('import node list from chia-node-list-api');
        var node_obj = JSON.parse(await Curl('https://chia-node-list-api.vercel.app/node'));
        if (setting.node_source.includes('.')) {
            logger.info('import node list from ' + setting.node_source);
            let node_source = '';
            if (existsSync(setting.node_source)) {
                node_source = setting.node_source;
                var node_list_file = readFileSync(setting.node_source, function(err, data) {
                    if (err) throw err;
                }).toString().split('\n');
                const node_filter = node_list_file.filter(({ node_ip: node_2 }) => !node_obj.some(({ node_ip: node_1 }) => node_1 === node_2));
                for (const property in node_filter) {
                    node_obj.push({
                        node_ip: node_filter[property].split(':')[0],
                        node_port: node_filter[property].split(':')[1] ? parseInt(node_list_file[property].split(':')[1]) : 8444
                    });
                }
            } else {
                logger.error('failed to import node list from ' + setting.node_source + ' node list file not found');
            }
        }

        var currConnections = await fullNode.getConnections();
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
                logger.error('failed to add node connection : ' + node_chia[property].node_ip + ':' + node_chia[property].node_port);
                if (setting.remove_node == true) {
                    var node_arr_file = readFileSync(setting.node_source, { encoding: 'utf8', flag: 'r' }).split('\n');
                    for (const property in node_arr_file) {
                        node_arr_file[property] = node_arr_file[property].replace('\r', '');
                    }
                    const node_index = node_arr_file.indexOf(node_chia[property].node_ip + ':' + node_chia[property].node_port);
                    node_arr_file.splice(node_index, 1);
                    var node_list_str = null;
                    for (const property in node_arr_file) {
                        node_list_str = node_list_str == null ? node_arr_file[property] : node_list_str + '\n' + node_arr_file[property];
                    }
                    writeFileSync(setting.node_source, node_list_str);
                    logger.info('remove node : ' + node_chia[property].node_ip + ':' + node_chia[property].node_port + ' from file ' + setting.node_source);
                }
            }
            logger.info('current connections : ' + (Object.keys(JSON.parse(JSON.stringify(await fullNode.getConnections()))['connections']).length).toString());
        }

        if (setting.disconnect_node == true) {
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
        }

        currConnections = lodash.filter(JSON.parse(JSON.stringify(await fullNode.getConnections()))['connections'], obj_item => obj_item.peer_host != '127.0.0.1');
        for (const property in currConnections) {
            logger.info('active node ip: ' + currConnections[property].peer_host + ' port: ' + currConnections[property].peer_server_port + ' to node list api');
            await Curl('https://chia-node-list-api.vercel.app/node', 'PUT', {
                node_ip: currConnections[property].peer_host,
                node_port: currConnections[property].peer_server_port,
                node_height: currConnections[property].peak_height ? currConnections[property].peak_height : 0,
                node_type: currConnections[property].type
            });
        }
    }
})();