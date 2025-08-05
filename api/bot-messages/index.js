const { BotFrameworkAdapter } = require('botbuilder');

// Bot credentials from Azure environment variables
const MicrosoftAppId = process.env.MicrosoftAppId;
const MicrosoftAppPassword = process.env.MicrosoftAppPassword;

// Create Bot Framework adapter
const adapter = new BotFrameworkAdapter({
    appId: MicrosoftAppId,
    appPassword: MicrosoftAppPassword
});

// Bot logic handler
const botLogic = async (turnContext) => {
    const activity = turnContext.activity;
    
    // Handle conversationUpdate activities (welcome messages)
    if (activity.type === 'conversationUpdate') {
        if (activity.membersAdded && activity.membersAdded.length > 0) {
            // Check if bot was added to the conversation
            const botWasAdded = activity.membersAdded.some(member => 
                member.id === activity.recipient?.id
            );
            
            if (botWasAdded) {
                // Different welcome messages for different scopes
                if (activity.conversation?.conversationType === 'personal') {
                    await turnContext.sendActivity('Hello! Welcome to 2Go Service Desk! 🎉\n\nI can help you create support cases directly from your Teams conversations. Here\'s how to get started:\n\n1. Right-click on any message\n2. Select "Apps" → "Create case"\n3. Fill out the case details\n4. Submit to create your support ticket\n\nYou can also chat with me using commands like "Hi", "Hello", or "Help" for more information.');
                } else {
                    await turnContext.sendActivity('Hello team! 👋 Welcome to 2Go Service Desk!\n\nI can help you create support cases directly from your Teams conversations. Here\'s how to get started:\n\n1. Right-click on any message\n2. Select "Apps" → "Create case"\n3. Fill out the case details\n4. Submit to create your support ticket\n\nYou can also chat with me using commands like "Hi", "Hello", or "Help" for more information.');
                }
            }
        }
    }
    // Handle message activities
    else if (activity.type === 'message' && activity.text) {
        const text = activity.text.toLowerCase().trim();

        // Respond to basic bot commands
        if (text.includes('hi') || text.includes('hello') || text.includes('hej')) {
            await turnContext.sendActivity('Hello! I\'m the 2Go Service Desk bot. I can help you create support cases from your Teams conversations. Use the "Create case" command from the message menu to get started.');
        } else if (text.includes('help') || text.includes('hjälp')) {
            await turnContext.sendActivity('I can help you create service desk cases directly from Teams! Here\'s how:\n\n1. Right-click on any message\n2. Select "Apps" → "Create case"\n3. Fill out the case details\n4. Submit to create your support ticket\n\nYou can also use commands like "Hi" or "Hello" to chat with me.');
        } else if (text.trim().length > 0) {
            await turnContext.sendActivity('I\'m the 2Go Service Desk bot! I help you create support cases from Teams messages. Try saying "Help" to learn more, or use the "Create case" command from any message menu.');
        }
    }
};

module.exports = async function (context, req) {
    context.log('Bot message handler called');
    context.log('Request method:', req.method);
    context.log('App ID configured:', MicrosoftAppId ? 'YES' : 'NO');
    context.log('App Password configured:', MicrosoftAppPassword ? 'YES' : 'NO');

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

    // Respond to GET requests (health check)
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
                appId: MicrosoftAppId || 'Not configured',
                authenticated: !!(MicrosoftAppId && MicrosoftAppPassword)
            }
        };
        return;
    }

    // For POST requests, process with Bot Framework adapter
    if (req.method === 'POST') {
        try {
            await adapter.processActivity(req, context.res, botLogic);
        } catch (error) {
            context.log.error('Error processing bot activity:', error.message);
            context.log.error('Error stack:', error.stack);
            
            context.res = {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: {
                    error: 'Failed to process bot message',
                    message: error.message
                }
            };
        }
    }
};