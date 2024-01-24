import {ethers} from 'ethers';
import { MirrorERC721__factory } from '../dist';

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_ENDPOINT_L2 as string);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
    const factory = new MirrorERC721__factory();
    const contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS as string, 
        factory.interface, 
        wallet
    );

    const tx = await contract.endSession(
        parseInt(process.env.TOKEN_ID as string),
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});