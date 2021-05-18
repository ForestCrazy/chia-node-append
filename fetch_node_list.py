import requests
import pandas as pd

resp = requests.get(url='https://chia.keva.app/node.log')
node_list = (resp.text).replace('Hello Chia!\nConnections:\nType      IP                                     Ports       NodeID      Last Connect      MiB Up|Dwn\n', '').split('\n')
file_object = open('node_list.txt', 'r+')
node_ip = []
for node in node_list:
    try:
        if len(node.split('                            ')[0].split(' ')) == 2 or '.' in node.split('                            ')[0].split(' ')[1]:
            node_ip.append(node.split('                            ')[0].split(' ')[1])
    except:
        continue
node_arr = file_object.read().split('\n')
for i in node_ip:
    node = i + ':8444'
    if not node in node_arr:
        print(node)
        file_object.write('\n'+i+':8444')

file_object.close()