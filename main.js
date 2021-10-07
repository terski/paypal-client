require('dotenv').config();
const axios = require('axios').default;
const qs = require('qs');

const authenticate = async () => {
    // Find the sandbox clientId and clientSecret here:
    // https://developer.paypal.com/developer/applications
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    const response = await axios.post(
        'https://api.sandbox.paypal.com/v1/oauth2/token',
        qs.stringify({
            grant_type: 'client_credentials',
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization:
                    'Basic ' +
                    Buffer.from(`${clientId}:${clientSecret}`).toString(
                        'base64'
                    ),
            },
        }
    );

    return response.data.access_token;
};

const incrementFailAttempts = async (accessToken) => {
    const patchResponse = await axios.patch(
        // 'https://api-m.sandbox.paypal.com/v1/payments/billing-agreements/I-CWAHCKU1RVEF',
        'https://api-m.sandbox.paypal.com/v1/billing/subscriptions/I-CWAHCKU1RVEF',
        [
            {
                op: 'replace',
                path: '/plan/payment_preferences/payment_failure_threshold',
                value: 5,
            },
            // {
            //     op: 'replace',
            //     path: '/plan/merchant_preferences/max_fail_attempts',
            //     value: '5',
            // },
        ],
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    console.log(patchResponse.data);
};

const main = async () => {
    const accessToken = await authenticate();

    try {
        await incrementFailAttempts(accessToken);

        const response = await axios.get(
            'https://api-m.sandbox.paypal.com/v1/payments/billing-agreements/I-CWAHCKU1RVEF',
            // 'https://api-m.sandbox.paypal.com/v1/billing/subscriptions/I-CWAHCKU1RVEF',
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        console.log(response.data);
    } catch (e) {
        console.error(e); //e.response?.data?.details[0] ?? e);
    }
};

main().catch((e) => console.error(e));
