/**
 * Netlify Serverless Function: MTN MoMo Callback Webhook
 * Endpoint: /api/momo-callback
 * Receives asynchronous transaction status callbacks from MTN MoMo.
 */

export async function handler(event, context) {
  // Allow preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Reference-Id',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }

  console.log('[MoMo Callback Received]:', event.body);

  try {
    const payload = event.body ? JSON.parse(event.body) : {};
    
    // Log transaction details
    console.log('[MoMo Callback Status]:', {
      financialTransactionId: payload.financialTransactionId,
      externalId: payload.externalId,
      amount: payload.amount,
      status: payload.status,
      reason: payload.reason
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        received: true,
        status: payload.status || 'PROCESSED',
        timestamp: new Date().toISOString()
      })
    };
  } catch (err) {
    console.error('[MoMo Callback Error]:', err);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ received: true, note: 'Error parsing body, acknowledged' })
    };
  }
}
