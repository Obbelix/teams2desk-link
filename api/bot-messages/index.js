
const { CloudAdapter, ConfigurationServiceClientCredentialFactory, ActivityHandler } = require('botbuilder');

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: process.env.MicrosoftAppId,
  MicrosoftAppPassword: process.env.MicrosoftAppPassword,
  MicrosoftAppType: "MultiTenant",
  MicrosoftAppTenantId: process.env.MicrosoftAppTenantId
});

const adapter = new CloudAdapter(credentialsFactory);

const bot = new ActivityHandler();

bot.onMessage(async (context, next) => {
  const text = context.activity.text.trim().toLowerCase();
  if (text.includes("hi") || text.includes("hello")) {
    await context.sendActivity("👋 Hello! How can I assist you today?");
  } else if (text.includes("help")) {
    await context.sendActivity("💡 You can type 'hi', 'hello', or 'help' to interact with me.");
  } else {
    await context.sendActivity(`🤖 You said: "${text}"`);
  }
  await next();
});

bot.onMembersAdded(async (context, next) => {
  const membersAdded = context.activity.membersAdded;
  for (let member of membersAdded) {
    if (member.id !== context.activity.recipient.id) {
      await context.sendActivity("👋 Welcome! Type 'help' to see what I can do.");
    }
  }
  await next();
});

module.exports = async function (context, req) {
  try {
    // Log the incoming request for debugging
    context.log('Incoming request:', JSON.stringify(req.body, null, 2));
    
    // Check if this is a proper Bot Framework request
    if (!req.body || !req.body.type) {
      context.res = {
        status: 400,
        body: { error: 'Invalid Bot Framework request. This endpoint should only be called by Microsoft Teams.' }
      };
      return;
    }

    await adapter.processActivity(req, context.res, async (turnContext) => {
      await bot.run(turnContext);
    });
  } catch (error) {
    context.log.error('Bot error:', error.message);
    context.log.error('Error stack:', error.stack);
    context.res = {
      status: 500,
      body: { error: error.message }
    };
  }
};
