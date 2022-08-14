import BTree  from 'sorted-btree';
import { DepthMessage } from './data';

export interface PriceLevel {
    price: number, size: number
}

export interface BBO {
    symbol: string, ask: PriceLevel, bid: PriceLevel
}

export class OrderBook {
    asks = new BTree<number, number>(undefined, (a, b) => {return b - a});
    bids = new BTree<number, number>();

    best(levels: BTree<number, number>): PriceLevel {
        const p = levels.maxKey();
        if (p != undefined) {
            const s = levels.get(p);
            if (s != undefined) {
                return {size: s, price:p };
            }
        }
        return {price: -1, size: -1};

    }
    update(dm: DepthMessage): BBO {
        this.update_levels(this.asks, dm.asks)
        this.update_levels(this.bids, dm.bids)
        return {
            symbol: dm.symbol,
            ask: this.best(this.asks),
            bid: this.best(this.bids)
        };

    }
    update_levels(levels: BTree<number, number>, updates: Array<Array<number>>): void {
        for (const update of updates) {
            const p = update[0];
            const s = update[1];
            if (s > 0){
                levels.set(p, s);
            } else {
                levels.delete(p);
            }
        }
    }
}

