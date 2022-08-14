import { DepthMessage, Market } from '../data';
import { baseQuote } from '../utils';
import { Exchange } from './exchange';
(global as any).WebSocket = require('ws');


interface RawMarket {
    statusCode: string, symbol: string
}

function parseStrings(outer: Array<Array<string>>): Array<Array<number>> {
    return outer.map(inner => inner.map(Number));
}


export class Ascendex extends Exchange {
    extractMarkets(json: any): any[] {
        return json.data;
    }
    filterRawMarket(rm: any): boolean {
        return rm.statusCode == "Normal";
    }

    parseRawMarket(rm: any): Market {
        const symbol = rm.symbol;
        const bq = baseQuote(symbol);
        return {symbol: symbol, base: bq.base, quote: bq.quote};
    }
    get webSocketURL(): string {
        return 'wss://ascendex.com/0/api/pro/v1/stream';
    }

    get marketURL(): string {
        return "https://ascendex.com/api/pro/v1/cash/products";
    }

    depthSubscriptionMessage(m: Market): Object {
        return {op: "sub", id: m.symbol, ch:"depth:" + m.symbol};
    }

    isDepthMessage(mess: any): boolean {
        if (mess.hasOwnProperty("m")) {
            return mess.m == "depth";
        }
        return false;
    }

    parseDepthMessage(mess: any): DepthMessage {
        const asks = parseStrings(mess.data.asks);
        const bids = parseStrings(mess.data.bids);
        return {
            symbol: mess.symbol, asks: asks, bids: bids
        };
    }
}