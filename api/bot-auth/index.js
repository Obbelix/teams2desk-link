const { BotFrameworkAdapter, MemoryStorage, UserState, ConversationState } = require('botbuilder');

// Bot configuration
const botConfig = {
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    appType: process.env.MicrosoftAppType,
    appTenantId: process.env.MicrosoftAppTenantId
};

// Create adapter
const adapter = new BotFrameworkAdapter(botConfig);

// Add error handler
adapter.onTurnError = async (context, error) => {
    console.error(`\n [onTurnError] unhandled error: ${error}`);
    await context.sendActivity('Sorry, it looks like something went wrong!');
};

// Create bot
const bot = {
    onTurn: async (context) => {
        if (context.activity.type === 'message') {
            const reply = { type: 'message', text: `Echo: ${context.activity.text}` };
            await context.sendActivity(reply);
        }
    }
};

module.exports = async function (context, req) {
    try {
        // Log request details for debugging
        console.log('Request headers:', req.headers);
        console.log('Request body:', req.body);
        
        // Check if this is a valid bot request
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('No authorization header found');
            context.res = {
                status: 401,
                body: { error: 'No authorization header' }
            };
            return;
        }

        // Process the activity
        const activity = req.body;
        console.log('Processing activity:', activity.type);
        
        // Create turn context
        const turnContext = await adapter.createContext(req, context.res);
        
        // Process the activity
        await bot.onTurn(turnContext);
        
        // Send response
        context.res = {
            status: 200,
            body: { message: 'Activity processed successfully' }
        };
        
    } catch (error) {
        console.error('Error processing request:', error);
        context.res = {
            status: 500,
            body: { error: 'Internal server error', details: error.message }
        };
    }
};
