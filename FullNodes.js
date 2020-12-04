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
MemPool=[]
balance = 1000
fs.readFile('transactionMem.txt', 'utf8', (err, data) => {
  if (err) throw err;
  lines=data.split('\n')
  for (i=0;i<lines.length;i++){
    transactionDetails=lines[i].split(' ')
    MemPool.push(new Transaction(transactionDetails[0],transactionDetails[1],transactionDetails[2]))
  }
});

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
    return peer.toString().slice(peer.length - 4, peer.length);
}

const topology = require('fully-connected-topology')

const myIp = toLocalIp(me)
const peerIps = getPeerIps(peers)

//connect to peers
topology(myIp, peerIps).on('connection', (socket, peerIp) => {
    const peerPort = extractPortFromIp(peerIp)
    let AsafNivCoin=new Blockchain()
    let i=0
    sockets[peerPort] = socket
    while (i<MemPool.length){
        fromAddress=MemPool[i].split(' ')[0]
        toAddress=MemPool[i].split(' ')[1]
        amount=MemPool[i].split(' ')[2]
        if (fromAddress !== null){
            if (fromAddress == me){
                balance-=amount
            }else{
                sockets[fromAddress].write(amount*(-1))
            }
        }
        if (toAddress == me){
            balance+=amount
        }else{
            sockets[toAddress].write(amount)
        }
        AsafNivCoin.pendingTransaction.push(MemPool[i])
        if (AsafNivCoin.pendingTransaction.length == 4){
            MemPool.push(AsafNivCoin.miningPendingTransaction(me))
        }
        i++
    }
    socket.on('data', data => socket.write(AsafNivCoin.transactionValidation(data)))
})



// read from a file transactions with a while loop
// while there are lines left in the file read transactions 
// mine block only when you read 4 transactions