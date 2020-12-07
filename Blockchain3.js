const SHA256 = require('crypto-js/sha256')
const {MerkleTree} = require('merkletreejs')
const crypto = require('crypto')
const {PartitionedBloomFilter} = require('bloom-filters')
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants')
const {
    log
} = console


class WalletSPV{
    constructor(address,balance){
        this.address=address
        this.balance=balance
    }
}

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress
        this.toAddress = toAddress
        this.amount = amount
    }
    toString(){
        return this.fromAddress+' '+this.toAddress+' '+this.amount
    }
    /*
    checkIfTransactionValid(){
        if (this.fromWallet.balance>= this.amount){
            return true
        }else{
            return false
        }
    }
    updateWallets(){
        this.fromWallet.balance-=amount
        this.toWallet.balance+=amount
    }
    */
}


function sha256(data) {
    // returns Buffer
    return crypto.createHash('sha256').update(data).digest()
  }
  
class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.previousHash = previousHash
        this.timestamp = timestamp
        this.transactions = transactions
        this.createMerkleRoot()
        this.hash = this.calculateHash()
        this.nonce = 0
    }
    createMerkleRoot(){
        const leaves = this.transactions.map(x => sha256(x.toString()))
        this.tree = new MerkleTree(leaves, sha256)
        //this.root = tree.getRoot()
    }
    calculateHash() {
        return SHA256(this.timestamp + this.previousHash + this.tree.getRoot()+ this.nonce).toString()
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++
            this.hash = this.calculateHash()
        }
        console.log('Block mined' + this.hash);
    }
    isTransactionInBlock(transaction){
        const leaf = sha256(transaction)
        const proof = tree.getProof(leaf)
        return this.tree.verify(proof, leaf, this.tree.getRoot()) 
    }

}
class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()]
        this.difficulty = 2
        this.pendingTransaction = []
        this.miningReward = 100
        this.filter=new PartitionedBloomFilter(30,5,0.5)

    }

    createGenesisBlock() {
        return new Block('01/01/2009', ['Genesis block'], 0)
    }
    getLatestBlock() {
        return this.chain[this.chain.length - 1]
    }
    

    miningPendingTransaction(miningRewardAddress) {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward)
        //this.pendingTransaction.push(rewardTx)
        this.filter.add(this.pendingTransaction[0].toString())
        this.filter.add(this.pendingTransaction[1].toString())
        this.filter.add(this.pendingTransaction[2].toString())
        this.filter.add(this.pendingTransaction[3].toString())
        let block = new Block(Date.now(), this.pendingTransaction, this.getLatestBlock().hash)
        block.mineBlock(this.difficulty)
        console.log('Block successfully mined')

        this.chain.push(block)
        this.pendingTransaction = []
        block.transactions.push(rewardTx)
        return rewardTx
    }
    createTransaction(transaction) {
        this.pendingTransaction.push(transaction)
    }
    getBalanceOfAddress(address) {
        let balance = 0
        for (var i =1;i<this.chain.length;i++) {
            let block=this.chain[i]
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount
                    
                }

                if (trans.toAddress === address) {
                    balance += trans.amount        
                             
                }
                
            }
        }
        for (var i=0;i<this.pendingTransaction.length;i++)
        {
            if (this.pendingTransaction[i].fromAddress === address) {
                balance -= this.pendingTransaction[i].amount
                
            }

            if (this.pendingTransaction[i].toAddress === address) {
                balance += this.pendingTransaction[i].amount        
                         
            }
        }
    
        return balance
    }
    isChainValidate() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i]
            const previousBlock = this.chain[i - 1]
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false
            }

        }
        return true
    }
    transactionValidation(transaction){
       
        return this.filter.has(transaction.toString())
    }
}



module.exports.Blockchain = Blockchain
module.exports.Block = Block
module.exports.Transaction = Transaction
