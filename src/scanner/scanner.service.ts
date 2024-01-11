import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios  from "axios";

@Injectable()
export class ScannerService {
    private readonly baseUrl: string;
    private readonly apiKey: string;
    constructor(
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>('SCANNER_URL');
        this.apiKey = this.configService.get<string>('SCANNER_API_KEY');
    }

    async getAbi(address: string): Promise<any[]> {
        const url = `${this.baseUrl}/api?module=contract&action=getabi&address=${address}&apikey=${this.apiKey}`;
        const response = await axios.get(url);
        return JSON.parse(response.data.result);
    }
}

