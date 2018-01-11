# Список используемых технологий

- node.js
- babel-cli
- truffle 3.x (на 4.x – дичь)
- solc 0.4.15
- solidity

https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md

# Требуемые пакеты и версии
# Инструкция "как установить проект"

npm install -g solc
npm install -g truffle

- npm install
- truffle compile
- truffle --network test migrate

\# run dev web server
npm run start

\# run node app
- npm run start_app

перезапуск миграций с определенного номера
- truffle migrate -f 1

https://stackoverflow.com/questions/44002643/how-to-use-the-official-docker-elasticsearch-container
docker-compose up

# Инструкция по установке проекта через Docker compose

1. Скопировать файл `truffle.js.example` в `truffle.js`
2. Скопировать файл `docker/rsk/rsk/testnet.conf.example` в файл `docker/rsk/rsk/testnet.conf`
3. Запустить `docker-compose up -d` и дождаться запуска всех контейнеров

   Контейнер `app` не запустится, т.к. не найстроена нода `rsk`
4. Выполнить `docker-compose exec rsk java -cp /usr/share/rsk/rskj-core-0.4.0-BAMBOO-all.jar co.rsk.GenNodeKeyId`. Сохранить вывод этой команды.
5. В файле `docker/rsk/rsk/testnet` изменить 4 параметра:

    `nodeId`, `privateKey`, `miner` -> `reward.address`, 
    `wallet` -> `accounts[0]` -> `privateKey`
    
    Все данные можно получить из пункта 4 
    
6. Выполнить комманду `docker-compose exec rsk java -Drsk.conf.file=/etc/rsk/testnet.conf -cp /usr/share/rsk/rskj-core-0.4.0-BAMBOO-all.jar co.rsk.Start`
7. Теперь можно запустить контейнер `app` командой `docker-compose start app`   

# Инструкция "как работать с тестами"

- testrpc --gasLimit 1111115141592

Либо, если на testrpc глюки, использовать geth на приватном блокчейне.
- geth --datadir=./chaindata --rpc --mine --unlock "comma separated accounts"

- truffle --network test migrate -f
- truffle --network test test

\# run frontend tests
- npm run test

# Инструкция "как работать с фронтендом"
# Правила по стилю кодирования
# Описание рабочего режима с git (что имеется введу под режимом c git?)
# Список автотестов?
# Инструкция "как деплоить"
# Ссылки на техническую документацию (как в том репозитории, так на других носителях (типа Google Drive))
