const { BotFrameworkAdapter } = require('botbuilder');

// Bot credentials from environment variables
const MicrosoftAppId = process.env.MicrosoftAppId;
const MicrosoftAppPassword = process.env.MicrosoftAppPassword;

// Create adapter
const adapter = new BotFrameworkAdapter({
  appId: MicrosoftAppId,
  appPassword: MicrosoftAppPassword
});

// Bot logic
const botLogic = async (turnContext) => {
  const activity = turnContext.activity;

  // Handle welcome messages
  if (activity.type === 'conversationUpdate' && activity.membersAdded) {
    for (const member of activity.membersAdded) {
      if (member.id !== activity.recipient.id) {
        if (activity.conversation?.conversationType === 'personal') {
          await turnContext.sendActivity("👋 Hello and welcome to **2Go Service Desk**! I can help you create support cases.");
        } else if (activity.conversation?.conversationType === 'channel') {
          await turnContext.sendActivity("👋 Hi everyone! I'm **2Go Service Desk bot**. Mention me or type 'help' to get started.");
        }
      }
    }
  }

  // Handle message events (hi, help, etc.)
  else if (activity.type === 'message') {
    const text = activity.text?.toLowerCase();
    if (text.includes('hi') || text.includes('hello')) {
      await turnContext.sendActivity("👋 Hi there! I'm the 2Go Service Desk bot. Need help?");
    } else if (text.includes('help')) {
      await turnContext.sendActivity("ℹ️ You can create a support case by clicking the button or describing your issue here.");
    } else {
      await turnContext.sendActivity("🤖 I'm here to help. Try saying `hi` or `help`.");
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