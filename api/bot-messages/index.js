
module.exports = async function (context, req) {
    context.log('Function called - method:', req.method);
    
    try {
        // Simple health check first
        if (req.method === 'GET') {
            context.res = {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: { 
                    message: 'Bot endpoint is running', 
                    timestamp: new Date().toISOString(),
                    env: {
                        appId: process.env.MicrosoftAppId ? 'SET' : 'NOT SET',
                        password: process.env.MicrosoftAppPassword ? 'SET' : 'NOT SET'
                    }
                }
            };
            return;
        }

        // Handle OPTIONS
        if (req.method === 'OPTIONS') {
            context.res = {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            };
            return;
        }

        // For POST - simple echo for now
        if (req.method === 'POST') {
            context.res = {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: {
                    message: 'POST received',
                    body: req.body
                }
            };
            return;
        }

    } catch (error) {
        context.log.error('Function error:', error);
        context.res = {
            status: 500,
            body: {
                error: 'Function failed',
                message: error.message,
                stack: error.stack
            }
        };
    }
};
