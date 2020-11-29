const {
    Blockchain,
    Block,
    Transaction
} = require('./Blockchain3.js')


//create new blockchain 
let micaCoin = new Blockchain()

micaCoin.createTransaction(new Transaction('address1', 'address2', 100))
micaCoin.createTransaction(new Transaction('address2', 'address1', 50))

//console.log('Blockchain valid?  ' + micaCoin.isChainValidate())
console.log('\Starting the miner');
micaCoin.miningPendingTransaction('Bob')

console.log('\nBalance of Bob: ', micaCoin.getBalanceOfAddress('Bob'));

micaCoin.createTransaction(new Transaction('Bob', 'address1', 50))
micaCoin.miningPendingTransaction('Bob')


console.log('\nBalance of Bob: ', micaCoin.getBalanceOfAddress('Bob'));
//console.log(JSON.stringify(micaCoin, null, 4));