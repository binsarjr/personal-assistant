// cbodoah3t4s17h9xda9fgp6jj3qkxnn9fp8dthjszf14

const BASE_URL = 'https://api.dexscreener.com';

/**
 * Makes a request to the Dexscreener API using fetch.
 *
 * @param endpoint - The API endpoint to call (e.g., "/pairs").
 * @param params - The query parameters to include in the request.
 * @returns The JSON response from the API.
 */
export async function dexscreenerRequest(
  endpoint: string,
  params?: Record<string, any>,
): Promise<any> {
  const url = new URL(`${BASE_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });
  }

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unknown error occurred.',
    };
  }
}

type Link = {
  type: string;
  label: string;
  url: string;
};

type TokenProfileResponse = {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon: string;
  header: string;
  description: string;
  links: Link[];
};

export async function getLatestTokenProfiles(): Promise<TokenProfileResponse> {
  const endpoint = '/token-profiles/latest/v1';
  return await dexscreenerRequest(endpoint);
}

type TokenBoostLink = {
  type: string;
  label: string;
  url: string;
};

type TokenBoostResponse = {
  url: string;
  chainId: string;
  tokenAddress: string;
  amount: number;
  totalAmount: number;
  icon: string;
  header: string;
  description: string;
  links: TokenBoostLink[];
};

export async function getLatestTokenBoosts(): Promise<TokenBoostResponse> {
  const endpoint = '/token-boosts/latest/v1';
  return await dexscreenerRequest(endpoint);
}

type TopTokenBoostResponse = {
  url: string;
  chainId: string;
  tokenAddress: string;
  amount: number;
  totalAmount: number;
  icon: string;
  header: string;
  description: string;
  links: TokenBoostLink[];
};

export async function getTopTokenBoosts(): Promise<TopTokenBoostResponse> {
  const endpoint = '/token-boosts/top/v1';
  return await dexscreenerRequest(endpoint);
}

type TokenOrder = {
  type: 'tokenProfile';
  status: 'processing';
  paymentTimestamp: number;
};

export async function getOrdersByToken(
  chainId: string,
  tokenAddress: string,
): Promise<TokenOrder[]> {
  const endpoint = `/orders/v1/${chainId}/${tokenAddress}`;
  return await dexscreenerRequest(endpoint);
}

type DexPairDataResponse = {
  schemaVersion: string;
  pairs: {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    labels: string[];
    baseToken: {
      address: string;
      name: string;
      symbol: string;
    };
    quoteToken: {
      address: string;
      name: string;
      symbol: string;
    };
    priceNative: string;
    priceUsd: string;
    liquidity: {
      usd: number;
      base: number;
      quote: number;
    };
    fdv: number;
    marketCap: number;
    pairCreatedAt: number;
    info: {
      imageUrl: string;
      websites: {
        url: string;
      }[];
      socials: {
        platform: string;
        handle: string;
      }[];
    };
    boosts: {
      active: number;
    };
  }[];
};

export async function getDexPairData(
  chainId: string,
  pairId: string,
): Promise<DexPairDataResponse> {
  const endpoint = `/latest/dex/pairs/${chainId}/${pairId}`;
  return await dexscreenerRequest(endpoint);
}

type DexTokenData = {
  schemaVersion: string;
  pairs: {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    labels: string[];
    baseToken: {
      address: string;
      name: string;
      symbol: string;
    };
    quoteToken: {
      address: string;
      name: string;
      symbol: string;
    };
    priceNative: string;
    priceUsd: string;
    liquidity: {
      usd: number;
      base: number;
      quote: number;
    };
    fdv: number;
    marketCap: number;
    pairCreatedAt: number;
    info: {
      imageUrl: string;
      websites: {
        url: string;
      }[];
      socials: {
        platform: string;
        handle: string;
      }[];
    };
    boosts: {
      active: number;
    };
  }[];
};

export async function getDexTokensData(
  tokenAddresses: string | string[],
): Promise<DexTokenData> {
  const formattedAddresses = Array.isArray(tokenAddresses)
    ? tokenAddresses.join(',')
    : tokenAddresses;
  const endpoint = `/latest/dex/tokens/${formattedAddresses}`;
  return await dexscreenerRequest(endpoint);
}

type DexPair = {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels: string[];
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info: {
    imageUrl: string;
    websites: {
      url: string;
    }[];
    socials: {
      platform: string;
      handle: string;
    }[];
  };
  boosts: {
    active: number;
  };
};

type SearchDexPairsResponse = {
  schemaVersion: string;
  pairs: DexPair[];
};

export async function searchDexPairs(
  query: string,
): Promise<SearchDexPairsResponse> {
  const endpoint = `/latest/dex/search?q=${encodeURIComponent(query)}`;
  return await dexscreenerRequest(endpoint);
}
