
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
        // Check conversation type and scope
        const isPersonal = activity.conversation?.conversationType === 'personal' || 
                          activity.channelId === 'msteams' && activity.conversation?.isGroup === false;
        const isTeams = activity.conversation?.conversationType === 'channel' || 
                       activity.channelId === 'msteams' && activity.conversation?.isGroup === true;
        
        if (isPersonal) {
          await turnContext.sendActivity("👋 Hello and welcome to **2Go Service Desk**! I can help you create support cases. Try saying 'Hi' or 'Help' to get started.");
        } else if (isTeams) {
          await turnContext.sendActivity("👋 Hi everyone! I'm **2Go Service Desk bot**. Mention me or type 'help' to get started.");
        } else {
          // Fallback welcome message
          await turnContext.sendActivity("👋 Welcome to **2Go Service Desk**! I can help you create support cases. Try saying 'Hi' or 'Help'.");
        }
      }
    }
  }

  // Handle message events (hi, help, etc.)
  else if (activity.type === 'message' && activity.text) {
    const text = activity.text.toLowerCase().trim();
    
    if (text === 'hi' || text === 'hello') {
      await turnContext.sendActivity("👋 Hi there! I'm the 2Go Service Desk bot. I can help you create support cases from Teams messages. Try saying 'Help' for more information.");
    } else if (text === 'help') {
      await turnContext.sendActivity("ℹ️ **2Go Service Desk Bot Help**\n\nI can help you create support cases directly from Teams! Here's what I can do:\n\n• Use the 'Create case' action from any message\n• Chat with me using commands like 'Hi' or 'Hello'\n• Get assistance with your support requests\n\nTo create a case, right-click on any message and select the 'Create case' option.");
    } else if (text.includes('hi') || text.includes('hello')) {
      await turnContext.sendActivity("👋 Hello! I'm the 2Go Service Desk bot. Need help? Try saying 'Help' to learn more.");
    } else if (text.includes('help')) {
      await turnContext.sendActivity("ℹ️ I can help you create support cases from Teams messages. Use the 'Create case' action or say 'Help' for detailed instructions.");
    } else {
      await turnContext.sendActivity("🤖 I'm here to help with your service desk needs! Try saying 'Hi' or 'Help' to get started.");
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
