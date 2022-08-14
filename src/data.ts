export interface Market {
    symbol: string, base: string, quote: string
}

export interface DepthMessage {
    symbol: string, asks: Array<Array<number>>, bids: Array<Array<number>>,
}