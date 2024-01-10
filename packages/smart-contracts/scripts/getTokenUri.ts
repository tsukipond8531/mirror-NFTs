import {ethers} from 'ethers';
import {MockERC721__factory} from '../dist';

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_ENDPOINT_L1 as string);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
    const factory = new MockERC721__factory();

    const contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS as string,
        factory.interface,
        wallet
    );

    const tokenURI = await contract.tokenURI(process.env.TOKEN_ID as string);

    console.log("Token URI:", tokenURI);
    
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});