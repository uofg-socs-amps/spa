#!/bin/bash

spa_image_id=$(docker image list | awk '$1 == "spa" && $2 == "latest" {print $3}')

if [ -n "$spa_image_id" ]; then
    echo "Found spa image with ID: $spa_image_id"
    docker stop spa-app-1
    docker rmi -f $spa_image_id
    docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.override.yml up -d
else
    echo "No spa image found"
fi
