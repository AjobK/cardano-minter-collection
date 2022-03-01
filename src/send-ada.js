const cardano = require("./cardano")

const sender = cardano.wallet("ADAPI")


function sendAda({ receiver }) {
    const TOTAL_ADA = 100

    let txOut = [
        {
            address: sender.paymentAddr,
            value: {
                lovelace: sender.balance().value?.lovelace - cardano.toLovelace(TOTAL_ADA)
            }
        },
        {
            address: receiver,
            value: {
                lovelace: cardano.toLovelace(TOTAL_ADA),
            }
        }
    ]

    // Remove the undefined from the transaction if it extists
    if(Object.keys(txOut[0].value).includes("undefined")){
        delete txOut[0].value.undefined
    }

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

sendAda({
    receiver: 'addr_test1qrtzkquw0ty83xh09mhz432cay7ztwzp0n6pqnkl3du4e3uyqc72hkg65cy8g48lkcmedvmemvumnxgfhyvqd7vs82psjfhzhr'
})