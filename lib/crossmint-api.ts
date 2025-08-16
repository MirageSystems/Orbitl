import { env, CROSSMINT_API_URL } from '@/lib/env';
import { TokenBalance, TransferRequest, TransferResponse } from '@/lib/types';

class CrossmintAPI {
  private baseUrl = CROSSMINT_API_URL;
  private apiKey = env.CROSSMINT_SERVER_API_KEY || env.NEXT_PUBLIC_CROSSMINT_API_KEY;

  async getBalances(walletLocator: string, tokens?: string, chains?: string): Promise<TokenBalance[]> {
    console.log('🔍 API: Getting balances for', walletLocator);
    
    let url = `${this.baseUrl}/wallets/${walletLocator}/balances`;
    
    const queryParams = new URLSearchParams();
    if (tokens) queryParams.append('tokens', tokens);
    if (chains) queryParams.append('chains', chains);
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    console.log('📞 URL:', url);
    
    const response = await fetch(url, {
      method: 'GET', 
      headers: {
        'X-API-KEY': this.apiKey
      }
    });

    console.log('📊 Status:', response.status);
    
    const text = await response.text();
    console.log('📄 Response preview:', text.slice(0, 200));
    
    let data;
    try {
      data = JSON.parse(text);
      console.log('✅ Parsed data:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('❌ JSON Parse Error:', e);
      throw new Error(`Invalid JSON response from Crossmint API`);
    }

    if (!response.ok) {
      console.error('❌ API Error:', data);
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  }

  async transfer(request: TransferRequest): Promise<TransferResponse> {
    const { walletLocator, tokenLocator, recipient, amount } = request;
    
    console.log('🚀 API: Transfer request:', { tokenLocator, recipient, amount });
    
    const url = `${this.baseUrl}/wallets/${walletLocator}/tokens/${tokenLocator}/transfers`;
    console.log('📞 Transfer URL:', url);
    
    const body = { recipient, amount };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': this.apiKey,
      },
      body: JSON.stringify(body),
    });

    console.log('📊 Transfer status:', response.status);
    const text = await response.text();
    console.log('📄 Transfer response:', text.slice(0, 200));
    
    let data;
    try {
      data = JSON.parse(text);
      console.log('✅ Transfer parsed:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('❌ Transfer JSON error:', e);
      throw new Error(`Invalid JSON response from transfer API`);
    }

    if (!response.ok) {
      console.error('❌ Transfer failed:', data);
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    console.log('🎉 Transfer successful!');
    return data;
  }
}

export const crossmintAPI = new CrossmintAPI();