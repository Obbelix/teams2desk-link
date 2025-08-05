
const { BotFrameworkAdapter } = require('botbuilder');

// Bot credentials from environment variables
const MicrosoftAppId = process.env.MicrosoftAppId;
const MicrosoftAppPassword = process.env.MicrosoftAppPassword;

// Create adapter (with error handling)
let adapter;
try {
    adapter = new BotFrameworkAdapter({
        appId: MicrosoftAppId || '',
        appPassword: MicrosoftAppPassword || ''
    });
    console.log('BotFrameworkAdapter created');
} catch (error) {
    console.error('Failed to create adapter:', error);
}

// Bot logic
const botLogic = async (turnContext) => {
    try {
        const activity = turnContext.activity;
        console.log('Received activity type:', activity.type);

        // Handle welcome messages
        if (activity.type === 'conversationUpdate' && activity.membersAdded) {
            for (const member of activity.membersAdded) {
                if (member.id !== activity.recipient.id) {
                    await turnContext.sendActivity("👋 Welcome to **2Go Service Desk**! Type 'hi' or 'help' to get started.");
                }
            }
        }
        // Handle message events
        else if (activity.type === 'message' && activity.text) {
            const text = activity.text.toLowerCase().trim();
            console.log('Received message:', text);
            
            if (text === 'hi' || text === 'hello') {
                await turnContext.sendActivity("👋 Hi there! I'm the 2Go Service Desk bot. Need help? Try saying 'help'.");
            } else if (text === 'help') {
                await turnContext.sendActivity("ℹ️ I can help you create support cases. Try saying 'hi' or ask me about creating a case.");
            } else {
                await turnContext.sendActivity("🤖 I'm here to help! Try saying 'hi' or 'help' to get started.");
            }
        }
    } catch (error) {
        console.error('Bot logic error:', error);
        await turnContext.sendActivity("Sorry, I encountered an error. Please try again.");
    }
};

module.exports = async function (context, req) {
    context.log('Bot function called - method:', req.method);
    
    try {
        // Handle CORS preflight
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

        // Health check
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
                    appId: MicrosoftAppId ? 'configured' : 'missing',
                    hasAdapter: !!adapter
                }
            };
            return;
        }

        // Handle bot messages
        if (req.method === 'POST') {
            if (!adapter) {
                context.res = {
                    status: 503,
                    body: { error: 'Bot adapter not available' }
                };
                return;
            }

            await adapter.processActivity(req, context.res, botLogic);
        }

    } catch (error) {
        context.log.error('Function error:', error);
        context.res = {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                error: 'Internal server error',
                message: error.message
            }
        };
    }
};
