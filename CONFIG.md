# chia-node-append-setting.json

## setting_version
setting file version

## node_source (str)
* source of the node list
* there are two configurations: `file name` or `node_list_firestore` if you assign it to a file name, for example `node_list.txt` script will use node list from node_list.txt file. But if you define it as `node_list_firestore` script will use the node list from the node list firestore database

## firestore.firestore (int)
* set how many loops every number of loops to retrieve the node list from the node list firestore database
* required when you define **node_source** as `node_list_firestore`
* it is advisable to configure a large number of numbers so as not to affect firebase firestore data usage (firebase is now free version, if you want to support firebase price you can donate at [DONATE](https://github.com/ForestCrazy/chia-node-append#donate-for-development-))

## firestore.firestore_update (int)
* set how many loops every number of loops to insert node to node list firestore database
* required when you define **node_source** as `node_list_firestore`
* it is advisable to configure a large number of numbers so as not to affect firebase firestore data usage

## disconnect_node (boolean)
disconnect if the node you are connecting is not a full node

## remove_node (boolean)
* remove a node that connot connect to
* required when you define **node_source** as `node_list_firestore`