import { map, bufferTime, filter } from "rxjs";
import yargs from "yargs";
import { fromString } from "../src"

const parser = yargs(process.argv.slice(2)).options({
    exchange: { type: 'string', default: "kraken" },
    seconds: { type: 'number', default: 30 }
});

async function main() {
    const argv = await parser.argv;
    console.log(argv);

    const exchange = fromString(argv.exchange);
    const markets = await exchange.fetch_markets();
    console.log("Subscribes to: " + markets.length + " markets");
    exchange.subscribe_depth(markets);
    const l1 = exchange.l1_depths(markets);
    
    (
        l1
        .pipe(
            map(m => m.symbol),
            bufferTime(5000.0),
            filter(b => b.length > 0),
            map((b: Array<string>) => new Set(b)),
            map(s => s.size)
        )
        .subscribe({
            next: x => console.log("n unique symbols:" + x.toString()), 
            error: err => console.log(err), 
            complete: () => console.log('complete')
        })
    );
    
    (
        l1
        .pipe(
            bufferTime(5000.0),
            map(b  => b.length)
        )
        .subscribe({
            next: x => console.log("n messages:" + x.toString()), 
            error: err => console.log(err), 
            complete: () => console.log('complete')
        })
    );

    setTimeout(() => {
        console.log("Exists");
        process.exit(1);
    }, 60000)
}

main();
