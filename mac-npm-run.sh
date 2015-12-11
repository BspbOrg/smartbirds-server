#!/bin/bash

VIRTUAL_MACHINE_IP=$(echo "$DOCKER_HOST" | grep -Eo '([0-9]*\.){3}[0-9]*')

echo

echo "* This script is intended for Mac."
echo

echo "The server have to connect the db container via the IP of the virtual machine."
echo "The virtual machine IP is: $VIRTUAL_MACHINE_IP"
echo

DATABASE_URL=postgres://smartbirds:secret@$VIRTUAL_MACHINE_IP:5432/smartbirds npm start