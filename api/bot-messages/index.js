module.exports = async function (context, req) {
    context.log('Bot message handler called');

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
        const activity = req.body;
        context.log('Received activity:', activity);

        // Only handle message activities
        if (activity.type !== 'message') {
            context.res = {
                status: 200,
                body: {}
            };
            return;
        }

        const text = activity.text?.toLowerCase().trim() || '';
        let responseText = '';

        // Respond to basic bot commands
        if (text.includes('hi') || text.includes('hello')) {
            responseText = 'Hello! I\'m the 2Go Service Desk bot. I can help you create support cases from your Teams conversations. Use the "Create case" command from the message menu to get started.';
        } else if (text.includes('help')) {
            responseText = 'I can help you create service desk cases directly from Teams! Here\'s how:\n\n1. Right-click on any message\n2. Select "Apps" → "Create case"\n3. Fill out the case details\n4. Submit to create your support ticket\n\nYou can also use commands like "Hi" or "Hello" to chat with me.';
        } else {
            responseText = 'I\'m the 2Go Service Desk bot! I help you create support cases from Teams messages. Try saying "Help" to learn more, or use the "Create case" command from any message menu.';
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