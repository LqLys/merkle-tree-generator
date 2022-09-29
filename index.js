const {MerkleTree} = require('merkletreejs')
const keccak256 = require('keccak256')
const fs = require('fs');
const csv = require('csv-parser')

const res = [];

fs.createReadStream('source_file.csv')
    .pipe(csv())
    .on('data', (data) => res.push(data))
    .on('end', () => {

        const leaves = res.map(a => ({...a, leaf: keccak256(a.wallet)}));
        const tree = new MerkleTree(leaves.map(a => a.leaf), keccak256, {sort: true})
        const root = tree.getHexRoot();

        const proofs = leaves.map(l => ({wallet: l.wallet.toLowerCase(), proof: tree.getHexProof(l.leaf)}))
        const proofsObject = {};
        for (const leaf of proofs) {
            proofsObject[leaf.wallet] = leaf.proof
        }


        saveToFile('proofs.json', proofs)
        console.log(`merle root: ${root}`)
        saveToFile('proofsObject.json', proofsObject)


    });

const saveToFile = (fileName, dataSource) => {
    fs.writeFile(fileName, JSON.stringify(dataSource), err => {
        if (err) {
            console.log(err);
        } else {
            console.log(`${fileName} saved`);
        }
    })
}

