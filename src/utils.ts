import fetch from 'cross-fetch';

export async function fetch_json(url:string) {
    const response = await fetch(url)
    const json = await response.json();
    return json
}

interface BaseQuote {
    base: string, quote: string
}

export function baseQuote(symbol: string): BaseQuote {
    const bq = symbol.split("/");
    const b = bq[0];
    const q = bq[1];
    return {base: b, quote: q};
}
