const SHA256 = require('crypto-js/sha256')
const {MerkleTree} = require('merkletreejs')
const crypto = require('crypto')
const {PartitionedBloomFilter} = require('bloom-filters')
const {
    log
} = console

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress
        this.toAddress = toAddress
        this.amount = amount
    }
    toString(){
        return this.fromAddress+' '+this.toAddress+' '+this.amount
    }
}


function sha256(data) {
    // returns Buffer
    return crypto.createHash('sha256').update(data).digest()
  }
  
class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.previousHash = previousHash
        this.timestamp = timestamp
        this.transactions=transactions
        this.filter=new PartitionedBloomFilter(5,5,0.5)
        if (transactions!==''){
            this.filter.add(transactions[0].toString())
            this.filter.add(transactions[1].toString())
            this.filter.add(transactions[2].toString())
            this.filter.add(transactions[3].toString())
            this.createMerkleTree(transactions)
            this.hash = this.calculateHash()
            this.nonce = 0
        }
    }
    createMerkleTree(transactions){
        const leaves = transactions.map(x => sha256(x.toString()))
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
    transactionProofOfWork(transaction){
        const leaf = sha256(transaction)
        const proof = tree.getProof(leaf)
        return this.tree.verify(proof, leaf, this.tree.getRoot()) 
    }
    isTransactionInBlock(transaction){
        return this.filter.has(transaction.toString())
    }
    addTransaction(transaction){
        this.transactions.push(transaction)
        this.filter.add(transaction.toString())
        var leaves=this.tree.getLeaves().map(x => x.toString())
        leaves.push(sha256(transaction.toString()))
        this.tree=new MerkleTree(leaves,sha256)
    }

}
class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()]
        this.difficulty = 2
        this.pendingTransaction = []
        this.miningReward = 100
    }

    createGenesisBlock() {
        return new Block('01/01/2009', '', 0)
    }
    getLatestBlock() {
        return this.chain[this.chain.length - 1]
    }
    

    miningPendingTransaction(miningRewardAddress) {
        const rewardTx = new Transaction('null', miningRewardAddress, this.miningReward)
        let block = new Block(Date.now(), this.pendingTransaction, this.getLatestBlock().hash)
        block.mineBlock(this.difficulty)
        console.log('Block successfully mined')
        this.chain.push(block)
        this.pendingTransaction = []
        block.addTransaction(rewardTx)
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
        for (var i=1;i<this.chain.length;i++){
            if (this.chain[i].isTransactionInBlock(transaction)===true){
                return true
            }
        }
        return false
    }
}



module.exports.Blockchain = Blockchain
module.exports.Block = Block
module.exports.Transaction = Transaction
