const cardano = require("./cardano")
const assets = require("./assets.json")
const getPolicyId = require('./get-policy-id')

const sender = cardano.wallet("Elowallet2")

const { convert_string_to_hex } = require('./helper.js')

console.log(
    "Balance of Sender address" +
    cardano.toAda(sender.balance().value.lovelace) + " ADA"
)

const { policyId: POLICY_ID } = getPolicyId()

function sendAssets({ receiver, assets }) {

    const txOut_value_sender = assets.reduce((result, asset) => {
        const ASSET_ID = POLICY_ID + "." + asset
        delete result[ASSET_ID]
        return result
    }, {
        ...sender.balance().value
    })

    const txOut_value_receiver = assets.reduce((result, asset) => {
        const ASSET_ID = POLICY_ID + "." + asset
        result[ASSET_ID] = 1
        return result
    }, {})

    // This is depedent at the network, try to increase this value of ADA
    // if you get an error saying: OutputTooSmallUTxO
    const MIN_ADA = 3
    
    let txOut = [
        {
            address: sender.paymentAddr,
            value: {
                ...txOut_value_sender,
                lovelace: txOut_value_sender.lovelace - cardano.toLovelace(MIN_ADA)
            }
        },
        {
            address: receiver,
            value: {
                lovelace: cardano.toLovelace(MIN_ADA),
                ...txOut_value_receiver
            }
        }
    ]

    // Remove the undefined from the transaction if it extists
    if(Object.keys(txOut[0].value).includes("undefined")){
        delete txOut[0].value.undefined
    }

    console.log('SECONDTXOUT')
    console.log(txOut)

    const txInfo = {
        txIn: cardano.queryUtxo(sender.paymentAddr),
        txOut: txOut
    }

    const raw = cardano.transactionBuildRaw(txInfo)

    const fee = cardano.transactionCalculateMinFee({
        ...txInfo,
        txBody: raw,
        witnessCount: 1
    })

    txInfo.txOut[0].value.lovelace -= fee

    const tx = cardano.transactionBuildRaw({ ...txInfo, fee })

    const txSigned = cardano.transactionSign({
        txBody: tx,
        signingKeys: [sender.payment.skey]
    })

    const txHash = cardano.transactionSubmit(txSigned)

    console.log(txHash)
}

console.log('ASSETS')
console.log(assets)

let hexAssets = [ assets[0] ].map(asset => convert_string_to_hex(asset.id))
console.log(hexAssets)

sendAssets({
    receiver: "addr_test1qp5fz36vmp37z5q3f8jt2mmt46q49h7rkszgzagam2t5gazr68zlh5xw48hgsrs9qmzm6njukjxt28znhr85ssg9rzhshcaeae",
    assets: hexAssets
})