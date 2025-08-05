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
        // Based on Postman: https://helpdesk-rest.sunne.se/integration-api/items
        const serviceApiUrl = process.env.SERVICE_DESK_ENDPOINT; // Should be: https://helpdesk-rest.sunne.se/integration-api/items
        const serviceUsername = process.env.SERVICE_DESK_USERNAME; // Should be the long token like: f64b81331702338d5d55165ef0122d2c607...
        const servicePassword = process.env.SERVICE_DESK_PASSWORD; // Your actual password
        const serviceIdentifier = process.env.SERVICE_DESK_IDENTIFIER;

        context.log('Environment check:', {
            hasUrl: !!serviceApiUrl,
            hasUsername: !!serviceUsername,
            hasPassword: !!servicePassword,
            hasIdentifier: !!serviceIdentifier
        });

        if (!serviceApiUrl || !serviceUsername || !servicePassword) {
            context.log.error('Missing environment variables:', {
                SERVICE_DESK_ENDPOINT: !!serviceApiUrl,
                SERVICE_DESK_USERNAME: !!serviceUsername,
                SERVICE_DESK_PASSWORD: !!servicePassword
            });
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
        // Password is username + identifier concatenated
        const authPassword = serviceUsername + serviceIdentifier;
        const fetch = require('node-fetch');
        const response = await fetch(serviceApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${serviceUsername}:${authPassword}`).toString('base64')}`
            },
            body: JSON.stringify(servicePayload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            context.log.error('Service desk API error details:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                body: errorText.substring(0, 500) + '...'
            });
            throw new Error(`Service desk API error: ${response.status} - ${errorText.substring(0, 200)}`);
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