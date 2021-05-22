# chia-node-append-setting.json

## setting_version
setting file version

## node_source (str)
* source of the node list
* there are two configurations: `file name` or `node_list_api` if you assign it to a file name, for example `node_list.txt` script will use node list from node_list.txt file. But if you define it as `node_list_api` script will use the node list from the node list firestore database

## disconnect_node (boolean)
disconnect if the node you are connecting is not a full node

## remove_node (boolean)
* remove a node that cannot connect to
* required when you define **node_source** as `file name`