import { DepthMessage, Market } from '../data';
import { Exchange } from './exchange';

export class Kraken extends Exchange {
    filterRawMarket(rm: any): boolean {
        return true;
    }
    parseRawMarket(rm: any): Market {
        return {
            symbol: rm.wsname, base: rm.base, quote: rm.quote
        };
    }
    get webSocketURL(): string {
        return 'wss://ws.kraken.com';
    }
    get marketURL(): string {
        return "https://api.kraken.com/0/public/AssetPairs";
    }
    extractMarkets(json: any): Array<any> {
        return Object.entries(json.result).map(x => x[1]);
    }
    
    isDepthMessage(mess: any): boolean {
        if (mess.length == 4){
            const sub_type = mess[2];
            if (sub_type == "book-10") {
                return true;
            }
        }
        return false;
    }

    parseDepthMessage(mess: Array<any>): DepthMessage {
        const levels = mess[1];
        let a: Array<Array<string>>;
        if (levels.hasOwnProperty("as")) {
            a = levels.as;
        } else if (levels.hasOwnProperty("a")) {
            a = levels.a;
        } else {
            a = new Array();
        }
        const asks = a.map(a => a.slice(0, 2).map(Number));

        let b: Array<Array<string>>;
        if (levels.hasOwnProperty("bs")) {
            b = levels.bs;
        } else if (levels.hasOwnProperty("b")) {
            b = levels.b;
        } else {
            b = new Array();
        }
        const bids = b.map(a => a.slice(0, 2).map(Number));

        const symbol = mess[3];
        return {
            symbol: symbol, asks: asks, bids: bids
        }
    }

    depthSubscriptionMessage(m: Market): Object {
        throw new Error('Method not implemented.');
    }
    
    override subscribe_depth(markets: Array<Market>) {
        // https://docs.kraken.com/websockets/#message-subscribe
        this.ws.next(
            {
                "event": "subscribe",
                "pair": markets.map(m => m.symbol).map(String),
                "subscription": {
                    "name": "book",
                    "depth": 10
                }
            }
        )
    }

}