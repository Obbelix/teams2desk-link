const crypto = require('crypto');

// Bot credentials from Azure environment variables
const MicrosoftAppId = process.env.MicrosoftAppId;
const MicrosoftAppPassword = process.env.MicrosoftAppPassword;

// Verify JWT token for Bot Framework authentication
async function verifyJwtToken(authHeader) {
    // In production, you should properly verify the JWT token
    // For now, we'll do basic validation
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return false;
    }
    
    // Basic token presence check - in production, verify against Microsoft's public keys
    const token = authHeader.substring(7);
    return token && token.length > 0;
}

module.exports = async function (context, req) {
    context.log('Bot message handler called');
    context.log('Request method:', req.method);
    context.log('App ID configured:', MicrosoftAppId ? 'YES' : 'NO');
    context.log('App Password configured:', MicrosoftAppPassword ? 'YES' : 'NO');
    context.log('Request headers:', JSON.stringify(req.headers, null, 2));
    context.log('Request body:', JSON.stringify(req.body, null, 2));

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

    // For POST requests, verify authentication
    if (req.method === 'POST') {
        const authHeader = req.headers.authorization;
        
        // Verify JWT token (simplified for now)
        if (!await verifyJwtToken(authHeader)) {
            context.log('Authentication failed');
            context.res = {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: { error: 'Unauthorized' }
            };
            return;
        }
        
        context.log('Authentication successful');
    }

    try {
        const activity = req.body;
        context.log('Received activity type:', activity.type);
        context.log('Activity details:', JSON.stringify(activity, null, 2));

        let responseText = '';
        let shouldRespond = false;
        
        // Handle conversationUpdate activities (welcome messages)
        if (activity.type === 'conversationUpdate') {
            context.log('Processing conversationUpdate');
            
            if (activity.membersAdded && activity.membersAdded.length > 0) {
                context.log('Members added:', activity.membersAdded);
                context.log('Bot ID (recipient):', activity.recipient?.id);
                
                // Check if bot was added to the conversation
                const botWasAdded = activity.membersAdded.some(member => {
                    const isBotAdded = member.id === activity.recipient?.id || 
                                     member.id === '5108ef50-63c5-4a69-8d1c-f596d806b294' ||
                                     member.id?.includes('5108ef50-63c5-4a69-8d1c-f596d806b294');
                    context.log(`Checking member ${member.id}: ${isBotAdded}`);
                    return isBotAdded;
                });
                
                if (botWasAdded) {
                    context.log('Bot was added - sending welcome message');
                    
                    // Different welcome messages for different scopes
                    if (activity.conversation?.conversationType === 'personal') {
                        responseText = 'Hello! Welcome to 2Go Service Desk! 🎉\n\nI can help you create support cases directly from your Teams conversations. Here\'s how to get started:\n\n1. Right-click on any message\n2. Select "Apps" → "Create case"\n3. Fill out the case details\n4. Submit to create your support ticket\n\nYou can also chat with me using commands like "Hi", "Hello", or "Help" for more information.';
                    } else {
                        responseText = 'Hello team! 👋 Welcome to 2Go Service Desk!\n\nI can help you create support cases directly from your Teams conversations. Here\'s how to get started:\n\n1. Right-click on any message\n2. Select "Apps" → "Create case"\n3. Fill out the case details\n4. Submit to create your support ticket\n\nYou can also chat with me using commands like "Hi", "Hello", or "Help" for more information.';
                    }
                    shouldRespond = true;
                } else {
                    context.log('Bot was not added - no response needed');
                }
            }
        }
        // Handle message activities
        else if (activity.type === 'message' && activity.text) {
            context.log('Processing message activity');
            const text = activity.text.toLowerCase().trim();
            context.log('Message text:', text);

            // Respond to basic bot commands
            if (text.includes('hi') || text.includes('hello') || text.includes('hej')) {
                responseText = 'Hello! I\'m the 2Go Service Desk bot. I can help you create support cases from your Teams conversations. Use the "Create case" command from the message menu to get started.';
                shouldRespond = true;
            } else if (text.includes('help') || text.includes('hjälp')) {
                responseText = 'I can help you create service desk cases directly from Teams! Here\'s how:\n\n1. Right-click on any message\n2. Select "Apps" → "Create case"\n3. Fill out the case details\n4. Submit to create your support ticket\n\nYou can also use commands like "Hi" or "Hello" to chat with me.';
                shouldRespond = true;
            } else if (text.trim().length > 0) {
                responseText = 'I\'m the 2Go Service Desk bot! I help you create support cases from Teams messages. Try saying "Help" to learn more, or use the "Create case" command from any message menu.';
                shouldRespond = true;
            }
        }
        
        // Only respond if we have something to say
        if (shouldRespond && responseText) {
            context.log('Sending response:', responseText);
            
            // Bot Framework response format
            const response = {
                type: 'message',
                text: responseText,
                from: {
                    id: activity.recipient?.id || '5108ef50-63c5-4a69-8d1c-f596d806b294',
                    name: '2Go Service Desk'
                },
                conversation: activity.conversation,
                recipient: activity.from,
                serviceUrl: activity.serviceUrl,
                channelId: activity.channelId
            };

            context.res = {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: response
            };
        } else {
            context.log('No response needed');
            context.res = {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: {}
            };
        }

    } catch (error) {
        context.log.error('Error handling bot message:', error.message);
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
};