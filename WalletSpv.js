const {
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
const topology = require('fully-connected-topology')
const sockets = {}
let numtimes=0
balance = 1000
const myIp = toLocalIp(me)
const peerIps = getPeerIps(peers)

//connect to peers
topology(myIp, peerIps).on('connection', (socket, peerIp) => {
    const peerPort = extractPortFromIp(peerIp)
    let i=0
    sockets[peerPort] = socket
    log("if you want to validate transaction please write: fromPeer toPeer amount")
    stdin.on('data', data => { //on user 
        numtimes++
        if (Object.keys(sockets).length===2 && data.toString().trim()!=='balance') { //message to specific peer
            sockets['4000'].write(data.toString().trim())
        }else if (data.toString().trim()==='balance'){
            sockets['4000'].write('balance ' + me)
        }
    })
    socket.on('data', data => {
        if (RegExp('[0-9]+').test(data.toString().trim())){
            log('my balance is '+data.toString().trim())
        }else{
            log(data.toString())
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