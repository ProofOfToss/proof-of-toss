#!/bin/bash

docker build -t faucet .

CID=$(docker create faucet)
docker cp ${CID}:/root/work/upload.zip ./
docker rm ${CID}

aws lambda update-function-code --function-name tossMintRSK --zip-file fileb://./upload.zip
