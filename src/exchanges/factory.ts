import { Ascendex } from "./ascendex";
import { Exchange } from "./exchange";
import { Kraken } from "./kraken";
import { FTX } from "./ftx";
import { Binance } from "./binance";

export function fromString(exchangeName: string): Exchange {
    if (exchangeName == "kraken") {
        return new Kraken()
    } else if (exchangeName == "ascendex")  {
        return new Ascendex()
    } else if (exchangeName == "ftx")  {
        return new FTX()
    } else if (exchangeName == "binance")  {
        return new Binance()
    } else {
        throw Error("Exchange: " + exchangeName + " not implemented");
    }
}