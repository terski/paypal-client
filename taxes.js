const axios = require('axios').default;
const qs = require('qs');

const authenticate = async () => {
    // Find the sandbox clientId and clientSecret here:
    // https://developer.paypal.com/developer/applications
    const clientId = 'clientId';
    const clientSecret = 'clientSecret';

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

const updateTaxRates = async (accessToken) => {
    const patchResponse = await axios.patch(
        'https://api-m.sandbox.paypal.com/v1/billing/subscriptions/I-CWAHCKU1RVEF',
        [
            {
                op: 'replace',
                path: '/plan/taxes/percentage',
                value: '12',
            },
        ],
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
    console.log(patchResponse.data);
};

const main = async () => {
    const accessToken = await authenticate();

    try {
        await updateTaxRates(accessToken);

        const response = await axios.get(
            'https://api-m.sandbox.paypal.com/v1/billing/subscriptions/I-CWAHCKU1RVEF',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        console.log(response.data);
    } catch (e) {
        console.error(e);
    }
};

main().catch((e) => console.error(e));
