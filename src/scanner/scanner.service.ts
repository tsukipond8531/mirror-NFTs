import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios  from "axios";

@Injectable()
export class ScannerService {
    private readonly baseUrl: string;
    private readonly apiKey: string;
    
    /**
     * Constructs a new instance of the ScannerService class.
     * @param configService The configuration service used to retrieve the base URL and API key.
     */
    constructor(
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>('SCANNER_URL');
        this.apiKey = this.configService.get<string>('SCANNER_API_KEY');
    }

    /**
     * Retrieves the ABI (Application Binary Interface) for a given address.
     * @param address The address for which to retrieve the ABI.
     * @returns A promise that resolves to an array containing the ABI.
     */
    async getAbi(address: string): Promise<any[]> {
        const url = `${this.baseUrl}/api?module=contract&action=getabi&address=${address}&apikey=${this.apiKey}`;
        const response = await axios.get(url);
        return JSON.parse(response.data.result);
    }
}

