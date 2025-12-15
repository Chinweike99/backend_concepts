export interface RestCountry {
    name: string;
    capital: string;
    region: string;
    population: number;
    currencies: { code: string; name: string; symbol: string }[];
    // flags: { png: string; svg: string };
    flag: string;
    gdp?: number;
    exchangeRate?: number;
    lastRefreshedAt?: Date;
}

export interface ExchangeRates {
    rates: Record<string, number>
}