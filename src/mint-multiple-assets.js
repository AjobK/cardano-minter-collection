const cardano = require("./cardano")
const getPolicyId = require("./get-policy-id")
const assets = require("./assets.json")

const wallet = cardano.wallet("ADAPI")

const { policyId: POLICY_ID, mintScript } = getPolicyId()

const { convert_string_to_hex } = require('./helper.js')

const metadata_assets = assets.reduce((result, asset) => {

    const ASSET_ID = asset.id // PIADA0

    // remove id property from the asset metadata
    const asset_metadata = {
        ...asset
    }

    delete asset_metadata.id

    return {
        ...result,
        [ASSET_ID]: asset_metadata
    }
}, {})

const metadata = {
    721: {
        [POLICY_ID]: {
            ...metadata_assets
        }
    }
}

const txOut_value = [ assets[0]].reduce((result, asset) => {
    const ASSET_ID = POLICY_ID + "." + convert_string_to_hex(asset.id)
    result[ASSET_ID] = 1
    return result

}, {
    ...wallet.balance().value
})

const mapped_actions = assets.map(asset => ({ type: "mint", quantity: 1, asset: POLICY_ID + "." + convert_string_to_hex(asset.id) }))

const mint_actions = {
    action: [ mapped_actions[0] ],
    script: [ mintScript ]
}

console.log('Mint actionsss')
console.log(mint_actions)

const tx = {
    txIn: wallet.balance().utxo,
    txOut: [
        {
            address: wallet.paymentAddr,
            value: txOut_value
        }
    ],
    mint: mint_actions,
    metadata,
    witnessCount: 2
}

// Remove the undefined from the transaction if it extists
if(Object.keys(tx.txOut[0].value).includes("undefined")){
  delete tx.txOut[0].value.undefined
}


const buildTransaction = (tx) => {

    const raw = cardano.transactionBuildRaw(tx)
    console.log('After build raw')
    console.log(raw)

    const fee = cardano.transactionCalculateMinFee({
        ...tx,
        txBody: raw
    })

    tx.txOut[0].value.lovelace -= fee

    return cardano.transactionBuildRaw({ ...tx, fee })
}

console.log('TXX')
console.log(tx)

const raw = buildTransaction(tx)

// 9. Sign transaction

const signTransaction = (wallet, tx) => {

    return cardano.transactionSign({
        signingKeys: [wallet.payment.skey, wallet.payment.skey],
        txBody: tx
    })
}

const signed = signTransaction(wallet, raw, mintScript)

// 10. Submit transaction

const txHash = cardano.transactionSubmit(signed)

console.log(txHash)
