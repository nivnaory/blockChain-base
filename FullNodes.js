const {
    Blockchain,
    Block,
    Transaction
} = require('./Blockchain3.js')
const {
    stdin,
    exit,
    argv
} = process
const {
    log
} = console
const {
    me,
    peers
} = extractPeersAndMyPort()
var fs = require('fs-extra');
const sockets = {}
var AsafNivCoin=new Blockchain()
MemPool=[]
fs.readFile('transactionMem.txt', 'utf8', (err, data) => {
  if (err) throw err;
  lines=data.split('\n')
  for (i=0;i<lines.length;i++){
    transactionDetails=lines[i].split(' ')
    MemPool.push(new Transaction(transactionDetails[0],transactionDetails[1],Number(transactionDetails[2])))
  }
});



const topology = require('fully-connected-topology')

const myIp = toLocalIp(me)
const peerIps = getPeerIps(peers)

//connect to peers
topology(myIp, peerIps).on('connection', (socket, peerIp) => {
    const peerPort = extractPortFromIp(peerIp)
    let i=0
    let balance = 1000
    sockets[peerPort] = socket
    if (Object.keys(sockets).length===2){
        while (i<MemPool.length){
            AsafNivCoin.pendingTransaction.push(MemPool[i])
            if (AsafNivCoin.pendingTransaction.length == 4){
                AsafNivCoin.miningPendingTransaction(me)
            }
            i++
        }
    }
    stdin.on('data', data => { //on user 
        if (data.toString().trim()==='balance'){
            log(AsafNivCoin.getBalanceOfAddress(me)+balance)
        }
    }) 
    socket.on('data', data => { 
        if(data.toString().trim().split(' ')[0]==='balance'){
            address=data.toString().trim().split(' ')[1]
            balance=AsafNivCoin.getBalanceOfAddress(address)
            socket.write(balance.toString())
        }else{
            fromAddress=data.toString().trim().split(' ')[0]
            toAddress=data.toString().trim().split(' ')[1]
            amount=data.toString().trim().split(' ')[2]
            res = AsafNivCoin.transactionValidation(new Transaction(fromAddress,toAddress,amount))
            socket.write(res.toString().trim())
        }
    })

})


function extractPeersAndMyPort() {
    return {
        me: argv[2],
        peers: argv.slice(3, argv.length)
    }
}
//'4000' -> '127.0.0.1:4000'
function toLocalIp(port) {
    return `127.0.0.1:${port}`
}


//['4000', '4001'] -> ['127.0.0.1:4000', '127.0.0.1:4001']
function getPeerIps(peers) {
    return peers.map(peer => toLocalIp(peer))
}

//'127.0.0.1:4000' -> '4000'
function extractPortFromIp(peer) {
    return peer.toString().split(':')[1];
}
// read from a file transactions with a while loop
// while there are lines left in the file read transactions 
// mine block only when you read 4 transactions