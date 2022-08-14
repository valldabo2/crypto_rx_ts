import yargs from "yargs";
import { fromString } from "../src";


const parser = yargs(process.argv.slice(2)).options({
    exchange: { type: 'string', default: "binance"},
    seconds: { type: 'number', default: 30 },
    symbol : { type: "string", default: "ETH/USDT"}
});

async function main() {
    const argv = await parser.argv;
    console.log(argv);

    const exchange = fromString(argv.exchange);
    let markets = await exchange.fetch_markets();
    markets = markets.filter((m, i) => m.symbol == argv.symbol);
    exchange.subscribe_depth(markets);

    exchange.messages.subscribe(console.log);
    (
        exchange
        .l1_depths(markets)
        .subscribe({
            next: x => console.log(x), 
            error: err => console.log(err), 
            complete: () => console.log('complete')
        })
    );

    setTimeout(() => {
        console.log("Exits");
        process.exit(1);
    }, argv.seconds * 1000)
}

main();