module.exports = async function (context, req) {
    context.log('Bot message handler called');
    context.log('Request method:', req.method);
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
            body: { message: 'Bot endpoint is running', timestamp: new Date().toISOString() }
        };
        return;
    }

    try {
        const activity = req.body;
        context.log('Received activity:', activity);

        let responseText = '';
        
        // Handle conversationUpdate activities (welcome messages)
        if (activity.type === 'conversationUpdate') {
            // Send welcome message when bot is added
            if (activity.membersAdded && activity.membersAdded.length > 0) {
                // Check if bot was added (compare with bot ID from activity)
                const botWasAdded = activity.membersAdded.some(member => 
                    member.id && (member.id === activity.recipient?.id || member.id.includes('5108ef50-63c5-4a69-8d1c-f596d806b294'))
                );
                
                if (botWasAdded) {
                    responseText = 'Welcome to 2Go Service Desk! 🎉\n\nI can help you create support cases directly from your Teams conversations. Here\'s how to get started:\n\n1. Right-click on any message\n2. Select "Apps" → "Create case"\n3. Fill out the case details\n4. Submit to create your support ticket\n\nYou can also chat with me using commands like "Hi", "Hello", or "Help" for more information.';
                } else {
                    // No response needed for other member additions
                    context.res = {
                        status: 200,
                        body: {}
                    };
                    return;
                }
            } else {
                // No response needed for other conversationUpdate events
                context.res = {
                    status: 200,
                    body: {}
                };
                return;
            }
        }
        // Handle message activities
        else if (activity.type === 'message') {
            const text = activity.text?.toLowerCase().trim() || '';

            // Respond to basic bot commands
            if (text.includes('hi') || text.includes('hello')) {
                responseText = 'Hello! I\'m the 2Go Service Desk bot. I can help you create support cases from your Teams conversations. Use the "Create case" command from the message menu to get started.';
            } else if (text.includes('help')) {
                responseText = 'I can help you create service desk cases directly from Teams! Here\'s how:\n\n1. Right-click on any message\n2. Select "Apps" → "Create case"\n3. Fill out the case details\n4. Submit to create your support ticket\n\nYou can also use commands like "Hi" or "Hello" to chat with me.';
            } else {
                responseText = 'I\'m the 2Go Service Desk bot! I help you create support cases from Teams messages. Try saying "Help" to learn more, or use the "Create case" command from any message menu.';
            }
        }
        // Handle other activity types
        else {
            context.res = {
                status: 200,
                body: {}
            };
            return;
        }

        // Bot Framework response format
        const response = {
            type: 'message',
            text: responseText,
            channelData: {
                tenant: {
                    id: activity.channelData?.tenant?.id
                }
            }
        };

        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: response
        };

    } catch (error) {
        context.log.error('Error handling bot message:', error.message);
        
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