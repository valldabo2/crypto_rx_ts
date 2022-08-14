import { map, timestamp, skip, zip } from "rxjs";
import { fromString } from "../src"
import { Series } from "data-forge";
import yargs from 'yargs/yargs';

const parser = yargs(process.argv.slice(3)).options({
    exchange: { type: 'string', default: "kraken" },
    seconds: { type: 'number', default: 30 },
    symbol : { type: "string", default: "ETH/USD"}
});

async function main() {
    const argv = await parser.argv;
    console.log(argv);
    const exchange = fromString(argv.exchange);
    let markets = await exchange.fetch_markets();
    markets = markets.filter((m, i) => m.symbol == argv.symbol);
    exchange.subscribe_depth(markets);
    const l1 = exchange.l1_depths(markets);

    const ts = l1.pipe(timestamp(), map(t => t.timestamp));
    const next = ts.pipe(skip(1))

    let differences = new Array<number>;
    (
        zip(ts, next)
        .pipe(
            map(([prev, next]) => next - prev)
        )
        .subscribe({
            next: x => differences.push(x), 
            error: err => console.log(err), 
            complete: () => console.log('complete')
        })
    );

    setTimeout(() => {
        console.log("N differences:" + differences.length);
        console.log("Frequencies of differences");
        console.log((
            new Series(differences)
            .frequency({lower: 0, upper: 900, interval: 30})
            .round(2)
            .toString()
        ));
        process.exit(1)
    }, argv.seconds * 1000)

}

main();
