const Cardano = require("cardanocli-js")

const cardano = new Cardano({
    socketPath: '/home/elomin/cardano/db/node.socket',
    network: `testnet-magic 1097911063`,
    dir: __dirname + "/../",
    shelleyGenesisPath: __dirname + "/../testnet-shelley-genesis.json"
})

module.exports = cardano