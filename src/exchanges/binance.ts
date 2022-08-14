import { filter, map, Observable, Subject } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { DepthMessage, Market } from '../data';
import { BBO } from '../orderbook';
import { Exchange } from './exchange';


function isL1Message(m: any): boolean {
    return ( (m.hasOwnProperty("B")) && (m.hasOwnProperty("A")) );
}

function parseBBO(m: any): BBO {
    const binsym = m.s;
    // TODO fix edge cases
    const base = binsym.slice(0, 3);
    const quote = binsym.slice(3, 6);
    const symbol = base + "/" + quote;
    const bid = m.b;
    const bidSize = m.B;
    const ask = m.a;
    const askSize = m.A;
    return {
        symbol: symbol,
        ask: {price: ask, size: askSize},
        bid: {price: bid, size: bidSize}
    }
}


export class Binance extends Exchange {
    l1_ws: Subject<any>;
    
    constructor(){
        super()
        this.l1_ws = new Subject()
    }
    extractMarkets(json: any): any[] {
        return json.symbols;;
    }
    filterRawMarket(rm: any): boolean {
        return ( (rm.status == "TRADING") && (rm.isSpotTradingAllowed) );
    }
    parseRawMarket(rm: any): Market {
        const symbol = rm.baseAsset + "/" + rm.quoteAsset;
        return {
            symbol: symbol, base: rm.baseAsset, quote: rm.quoteAsset
        }
    }
    get webSocketURL(): string {
        // https://github.com/binance/binance-spot-api-docs/blob/master/web-socket-streams.md
        return "wss://stream.binance.com/";
    }
    get marketURL(): string {
        // https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md
        return "https://api.binance.com/api/v3/exchangeInfo";
    }

    isDepthMessage(m: Object): boolean {
        throw new Error('Method not implemented.');
    }
    parseDepthMessage(m: Object): DepthMessage {
        throw new Error('Method not implemented.');
    }
    depthSubscriptionMessage(m: Market): Object {
        throw new Error('Method not implemented.');
    }

    override subscribe_depth(markets: Array<Market>): void {
        // {
        //     "method": "SUBSCRIBE",
        //     "params": [
        //       "btcusdt@aggTrade",
        //       "btcusdt@depth"
        //     ],
        //     "id": 1
        // }
        // Stream Name: <symbol>@bookTicker
        
        const streams = markets.map(m => {
            let binsym = m.symbol.replace("/", "");
            binsym = binsym.toLowerCase();
            binsym += "@bookTicker";
            return binsym;
        });
        const stream_s = streams.join("/");
        const path = "stream?streams=" + stream_s;
        const ws: Subject<any> = webSocket(this.webSocketURL + path);
        this.l1_ws = ws;

        // this.ws.next({
        //     method: "SUBSCRIBE", params: params, id:"1"
        // });
    }

    l1_depth(market: Market): Observable<BBO> {
        throw Error("Not implemented");
    }

    l1_depths(markets: Array<Market>): Observable<BBO> {
        return (
            this.l1_ws
            .pipe(
                filter(isL1Message),
                map(parseBBO)
            )
        )
    }
}