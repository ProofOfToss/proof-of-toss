# Список используемых технологий

- node.js
- babel-cli
- truffle 3.x (на 4.x – дичь)
- solidity


# Требуемые пакеты и версии
# Инструкция "как установить проект"

npm install -g solc
npm install -g truffle

- npm install
- truffle compile
- truffle migrate
- npm run start

перезапуск миграций с определенного номера
- truffle migrate -f 1

# Инструкция "как работать с тестами"

- testrpc --gasLimit 1111115141592

Либо, если на testrpc глюки, использовать geth на приватном блокчейне.
- geth --datadir=./chaindata --rpc --mine --unlock "comma separated accounts"

- truffle --network test migrate -f
- truffle --network test test

# Инструкция "как работать с фронтендом"
# Правила по стилю кодирования
# Описание рабочего режима с git (что имеется введу под режимом c git?)
# Список автотестов?
# Инструкция "как деплоить"
# Ссылки на техническую документацию (как в том репозитории, так на других носителях (типа Google Drive))
