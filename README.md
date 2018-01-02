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
