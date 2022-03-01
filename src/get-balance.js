const cardano = require("./cardano")

const sender = cardano.wallet("Elowallet2")
const receivedBalance = sender.balance()

console.log(receivedBalance)
console.log('---')
console.log(receivedBalance.utxo)