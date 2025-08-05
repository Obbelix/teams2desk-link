module.exports = async function (context, req) {
    context.log('Teams2Go Service Desk API called');

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        context.res = {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            }
        };
        return;
    }

    try {
        const { title, description, manager, contact, messages } = req.body;

        context.log('Received payload:', {
            title: title?.substring(0, 50) + '...',
            manager,
            contact,
            messageCount: messages?.length
        });

        // Get environment variables for service desk API
        const serviceApiUrl = process.env.SERVICE_DESK_ENDPOINT;
        const serviceUsername = process.env.SERVICE_DESK_USERNAME;
        const servicePassword = process.env.SERVICE_DESK_PASSWORD;
        const serviceIdentifier = process.env.SERVICE_DESK_IDENTIFIER;

        if (!serviceApiUrl || !serviceUsername || !servicePassword) {
            throw new Error('Service desk API configuration missing');
        }

        // Format the payload for your service desk system (easitGO)
        const servicePayload = {
            title: title,
            description: description,
            manager: manager,
            contact: contact,
            source: 'Microsoft Teams',
            priority: 'Normal',
            category: 'IT Support'
        };

        // Make API call to service desk
        const fetch = require('node-fetch');
        const response = await fetch(serviceApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${serviceUsername}:${servicePassword}`).toString('base64')}`,
                'X-Identifier': serviceIdentifier
            },
            body: JSON.stringify(servicePayload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Service desk API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        context.log('Service desk response:', result);

        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: result
        };

    } catch (error) {
        context.log.error('Error creating case:', error.message);
        
        context.res = {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: {
                error: 'Failed to create service desk case',
                message: error.message
            }
        };
    }
};