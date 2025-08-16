import { NextRequest, NextResponse } from 'next/server';
import { crossmintAPI } from '@/lib/crossmint-api';
import { TransferRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { walletLocator, tokenLocator, recipient, amount, memo } = await request.json();

    if (!walletLocator || !tokenLocator || !recipient || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const transferRequest: TransferRequest = {
      walletLocator,
      tokenLocator,
      recipient,
      amount,
      ...(memo && { memo })
    };

    const result = await crossmintAPI.transfer(transferRequest);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Transfer API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}