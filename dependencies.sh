#!/bin/bash

#node package manager
sudo apt-get install -y npm
#ui tools
sudo npm install -g grunt-cli less bower
#fix for node symlink
sudo ln -s /usr/bin/nodejs /usr/bin/node
#postgres dev to build the py driver
sudo apt-get install -y postgresql-server-dev-9.3