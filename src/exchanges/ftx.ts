import { Market, DepthMessage } from '../data';
import { Exchange } from './exchange';


export class FTX extends Exchange {
    get webSocketURL(): string {return "wss://ftx.com/ws/";}
    get marketURL(): string {return "https://ftx.com/api/markets";}

    filterRawMarket(rm: any): boolean {
        return rm.type == "spot";
    }
    parseRawMarket(rm: any): Market {
        return {
            symbol: rm.name, base: rm.baseCurrency, quote: rm.quoteCurrency
        };
    }
    
    extractMarkets(json: any): Array<any> {
        return json.result;
    }

    depthSubscriptionMessage(m: Market) {
        // https://docs.ftx.com/#request-process
        return {'op': 'subscribe', 'channel': 'orderbook', 'market': m.symbol};
    }

    isDepthMessage(m: any): boolean {
        if ((m.hasOwnProperty("channel")) && (m.hasOwnProperty("type"))) {
            return ((m.channel == "orderbook") && (m.type != "subscribed"));
        }
        return false;
    }

    parseDepthMessage(m: any): DepthMessage {
        return {
            symbol: m.market, asks: m.data.asks, bids: m.data.bids
        }
    }
}