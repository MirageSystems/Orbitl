import { NextRequest, NextResponse } from 'next/server';
import { crossmintAPI } from '@/lib/crossmint-api';

export async function GET(request: NextRequest) {
  console.log('🔥 BALANCE API CALLED');
  try {
    const { searchParams } = new URL(request.url);
    const walletLocator = searchParams.get('walletLocator');
    const chains = searchParams.get('chains');
    const tokens = searchParams.get('tokens') || 'sei,eth,usdc,usdt';

    console.log('📝 Params:', { walletLocator, chains, tokens });

    if (!walletLocator) {
      console.error('❌ Missing walletLocator');
      return NextResponse.json(
        { error: 'Wallet locator is required' },
        { status: 400 }
      );
    }

    console.log('📞 Calling Crossmint API...');
    const data = await crossmintAPI.getBalances(walletLocator, tokens, chains || undefined);
    
    console.log('🎯 Balance API Success:', { 
      tokenCount: data.length,
      tokens: data.map(t => ({ symbol: t.symbol, amount: t.amount }))
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('💥 BALANCE API ERROR:', errorMessage);
    
    return NextResponse.json(
      { 
        error: errorMessage || 'Internal server error',
        status: 500 
      },
      { status: 500 }
    );
  }
}