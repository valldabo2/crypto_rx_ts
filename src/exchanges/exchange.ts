import { filter, map, merge, Observable, share, Subject } from "rxjs";
import { DepthMessage, Market } from "../data";
import { BBO, OrderBook } from "../orderbook";
import { fetch_json } from "../utils";

import { webSocket } from "rxjs/webSocket";
(global as any).WebSocket = require('ws');

export abstract class Exchange {
    protected ws: Subject<Object>;
    constructor(){
        this.ws = this.createWS();
    }
    abstract get webSocketURL(): string;
    abstract get marketURL(): string;
    abstract isDepthMessage(m: Object): boolean;
    abstract parseDepthMessage(m: Object): DepthMessage;
    abstract depthSubscriptionMessage(m: Market): Object;
    abstract extractMarkets(json: any): Array<any>;
    abstract filterRawMarket(rm: any): boolean;
    abstract parseRawMarket(rm: any): Market;

    async fetch_markets(): Promise<Array<Market>> {
        const json_response = await fetch_json(this.marketURL);
        const markets = (
            this.extractMarkets(json_response)
            .filter(this.filterRawMarket)
            .map(this.parseRawMarket)
        );
        return markets;
    }

    get messages(): Observable<Object> {return this.ws;}

    createWS(): Subject<Object> {return webSocket(this.webSocketURL);}

    get depthMessages(): Observable<DepthMessage> {
        return (
            this.messages
            .pipe(
                filter(this.isDepthMessage),
                map(this.parseDepthMessage),
                share()
            )
        );
    }

    subscribe_depth(markets: Array<Market>): void {
        markets.forEach((m, i) => this.ws.next(this.depthSubscriptionMessage(m)));
    }

    l1_depth(market: Market): Observable<BBO> {
        const ob = new OrderBook();
        return (
            this.depthMessages
            .pipe(
                filter(dm => dm.symbol == market.symbol),
                map(m => ob.update(m))
            )
        );
    }

    l1_depths(markets: Array<Market>): Observable<BBO> {
        const obs = markets.map(m => this.l1_depth(m));
        return merge(...obs);
    }
}