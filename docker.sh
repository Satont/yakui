#!/bin/bash
cd /app

if [ -z "$INSPECT" ]
then
  yarn start
else
  echo 'Starting bot with INSPECT flag, inspect exposed at 0.0.0.0:9229'
  yarn inspector
fi
