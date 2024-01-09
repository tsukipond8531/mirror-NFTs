import {ethers} from 'hardhat';

async function setBaseUri(contractAddress: string, baseUri: string) {
    const lock = await ethers.getContractAt('Mock721', contractAddress);
    await lock.setBaseURI(baseUri);
    console.log(`Base URI set to ${baseUri}`);
}

async function updateTokenUri(contractAddress: string, tokenId: number, tokenUri: string) {
    const lock = await ethers.getContractAt('Mock721', contractAddress);
    await lock.setTokenURI(tokenId, tokenUri);
    console.log(`Token URI for token ${tokenId} set to ${tokenUri}`);
}

async function main() {
    const flag = process.argv[2];
    const contractAddress = process.argv[3];

    switch (flag) {
        case '--set-base-uri':
            const baseUri = process.argv[4];
            await setBaseUri(contractAddress, baseUri);
            break;
        case '--update-token-uri':
            const tokenId = Number(process.argv[4]);
            const tokenUri = process.argv[5];

            await updateTokenUri(contractAddress, tokenId, tokenUri);
            break;
        default:
            console.log('Invalid flag');
            break;
    }
}