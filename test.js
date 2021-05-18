const { readFileSync, existsSync } = require("fs");
const { Connection, constants, ApiClient } = require("chia-api");
const { homedir } = require("os");
const { join } = require("path");
const lodash = require("lodash");
const firebase = require("firebase");

(async() => {
    process.on("uncaughtException", function(err) {
        console.log(err);
    });
    const conn = new Connection("localhost:55400", {
        cert: readFileSync(
            join(
                homedir(),
                ".chia",
                "mainnet",
                "config/ssl/daemon/private_daemon.crt"
            )
        ),
        key: readFileSync(
            join(
                homedir(),
                ".chia",
                "mainnet",
                "config/ssl/daemon/private_daemon.key"
            )
        ),
    });
    conn.onMessage((message) => {
        console.log(message);
    });
    const fullNode = new ApiClient.FullNode({
        connection: conn,
        origin: "chia-node-append",
    });
    await fullNode.init();

    /*
      const currConnections = await fullNode.getConnections();


      const obj = JSON.parse(JSON.stringify(currConnections));
      */

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
      const node_obj = snapshot.docs.map(doc => doc.data());
      */

    const node_list_file = "node_list.txt";
    const node_arr = readFileSync(node_list_file, function(err, data) {
            if (err) throw err;
        })
        .toString()
        .split("\n");
    for (const property in node_arr) {
        node_arr[property] = {
            node_ip: node_arr[property].split(":")[0],
            node_port: parseInt(node_arr[property].split(":")[1]),
        };
    }
    /*
      for (const property in node_obj) {
          node_obj[property] = {
              node_ip: node_obj[property].split(':')[0],
              node_port: node_obj[property].split(':')[1].replace('\r', '')
          }
          const newChiaNode = await app.firestore().collection('node_list').doc().set({
              node_ip: node_obj[property].split(':')[0],
              node_port: parseInt(node_obj[property].split(':')[1])
          });
      }
      */

    /*
      const currConnections = await fullNode.getConnections();
      const currConn_obj = JSON.parse(JSON.stringify(currConnections))['connections'];

      const node_chia = node_arr.filter(({ node_ip: node_ip }) => !currConn_obj.some(({ node_peer: node_peer }) => node_peer === node_ip));

      // console.log(node_chia);

      const node_chia = node_arr.filter(({ node_ip: node_1 }) => !currConn_obj.some(({ peer_host: node_2 }) => node_2 === node_1));

      console.log(node_chia);
      */

    a = [
        { value: "4a55eff3-1e0d-4a81-9105-3ddd7521d642", display: "Jamsheer" },
        { value: "644838b3-604d-4899-8b78-09e4799f586f", display: "Muhammed" },
        { value: "b6ee537a-375c-45bd-b9d4-4dd84a75041d", display: "Ravi" },
        { value: "a63a6f77-c637-454e-abf2-dfb9b543af6c", display: "Ryan" }
    ];
    b = [{
            value: "4a55eff3-1e0d-4a81-9105-3ddd7521d642",
            display: "Jamsheer"
        },
        {
            value: "644838b3-604d-4899-8b78-09e4799f586f",
            display: "Muhammed"
        },
        {
            value: "b6ee537a-375c-45bd-b9d4-4dd84a75041d",
            display: "Ravi"
        },
        {
            value: "e97339e1-939d-47ab-974c-1b68c9cfb536",
            display: "Ajmal"
        },
    ];

    function comparer(otherArray) {
        return function(current) {
            return (
                otherArray.filter(function(other) {
                    return (
                        other.value == current.value && other.display == current.display
                    );
                }).length == 0
            );
        };
    }

    var onlyInA = a.filter(comparer(b));
    var onlyInB = b.filter(comparer(a));

    result = onlyInA.concat(onlyInB);

    console.log(result);
})();