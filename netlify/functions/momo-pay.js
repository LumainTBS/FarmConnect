/**
 * Netlify Serverless Function: MTN MoMo Request to Pay Initiator
 * Endpoint: /api/momo-pay
 * Supports both MTN Production Gateway (https://api.mtn.com/v1) and MoMo Developer Portal.
 */

export async function handler(event, context) {
  // CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Reference-Id, Ocp-Apim-Subscription-Key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { phone, amount, orderId, note } = data;

    // Read environment variables (supports Netlify UI and .env)
    const consumerKey = process.env.VITE_MTN_MOMO_CONSUMER_KEY || process.env.MTN_MOMO_CONSUMER_KEY;
    const consumerSecret = process.env.VITE_MTN_MOMO_CONSUMER_SECRET || process.env.MTN_MOMO_CONSUMER_SECRET;
    const primaryKey = process.env.VITE_MTN_MOMO_PRIMARY_KEY || process.env.MTN_MOMO_PRIMARY_KEY || consumerKey;
    const baseUrl = (process.env.VITE_MTN_MOMO_BASE_URL || 'https://api.mtn.com/v1').replace(/\/+$/, '');
    const targetEnv = process.env.VITE_MTN_MOMO_TARGET_ENV || 'production';
    const callbackUrl = process.env.VITE_MTN_MOMO_CALLBACK_URL || 'https://farmconnect-eswatini.netlify.app/api/momo-callback';

    const isPlaceholder = (val) => !val || val.includes('your_mtn_momo');

    if (isPlaceholder(consumerKey) || isPlaceholder(consumerSecret)) {
      console.warn('[MoMo Pay Function] Missing credentials');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          success: false,
          isConfigured: false,
          message: 'MTN MoMo credentials missing. Please check VITE_MTN_MOMO_CONSUMER_KEY and CONSUMER_SECRET.',
          simulated: true,
          referenceId: `MOMO-SIM-${Date.now()}`
        })
      };
    }

    const authHeader = 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    let accessToken = null;

    // Step 1: Request OAuth Bearer Token from MTN Gateway
    const isProductionGateway = baseUrl.includes('api.mtn.com');
    const tokenEndpoints = isProductionGateway 
      ? [`${baseUrl}/oauth/access_token?grant_type=client_credentials`, `${baseUrl}/collection/token/`]
      : [`${baseUrl}/collection/token/`, `${baseUrl}/oauth/access_token?grant_type=client_credentials`];

    let tokenError = '';

    for (const endpoint of tokenEndpoints) {
      try {
        const headers = { 'Authorization': authHeader };
        if (primaryKey) headers['Ocp-Apim-Subscription-Key'] = primaryKey;

        const tokenRes = await fetch(endpoint, {
          method: 'POST',
          headers
        });

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          accessToken = tokenData.access_token || tokenData.accessToken;
          if (accessToken) break;
        } else {
          tokenError = await tokenRes.text();
        }
      } catch (e) {
        tokenError = e.message;
      }
    }

    if (!accessToken) {
      console.error('[MoMo Auth Failed]:', tokenError);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          success: false,
          error: `MTN Authentication Error: ${tokenError || 'Could not retrieve access token with provided credentials'}`,
          isConfigured: true
        })
      };
    }

    // Step 2: Dispatch Request to Pay (USSD Prompt to Customer's Phone)
    const referenceId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : `${Date.now()}-xxxx-4xxx-yxxx`.replace(/[xy]/g, c => (Math.random() * 16 | 0).toString(16));

    const cleanPhone = (phone || '').replace(/\s+/g, '').replace(/^0/, '268');

    const payEndpoints = isProductionGateway
      ? [`${baseUrl}/momo/collection/v1_0/requesttopay`, `${baseUrl}/collection/v1_0/requesttopay`]
      : [`${baseUrl}/collection/v1_0/requesttopay`, `${baseUrl}/momo/collection/v1_0/requesttopay`];

    let paySuccess = false;
    let payError = '';

    for (const payEndpoint of payEndpoints) {
      try {
        const payRes = await fetch(payEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Reference-Id': referenceId,
            'X-Target-Environment': targetEnv,
            'Ocp-Apim-Subscription-Key': primaryKey,
            'X-Callback-Url': callbackUrl,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: String(amount),
            currency: 'SZL',
            externalId: orderId || `FC-${Date.now()}`,
            payer: {
              partyIdType: 'MSISDN',
              partyId: cleanPhone
            },
            payerMessage: 'FarmConnect order payment',
            payeeNote: note || 'Produce settlement'
          })
        });

        if (payRes.status === 202 || payRes.ok) {
          paySuccess = true;
          break;
        } else {
          payError = await payRes.text();
        }
      } catch (e) {
        payError = e.message;
      }
    }

    if (paySuccess) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          success: true,
          referenceId,
          status: 'PENDING_USER_APPROVAL',
          message: `USSD push prompt sent to ${cleanPhone}. Please approve the payment on your handset.`
        })
      };
    } else {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          success: false,
          error: `MTN Gateway Dispatch Failed: ${payError}`
        })
      };
    }

  } catch (err) {
    console.error('[Server Error in momo-pay]:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
}
