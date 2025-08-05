
const { BotFrameworkAdapter, ActivityHandler } = require('botbuilder');

const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword
});

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
  await adapter.processActivity(req, context.res, async (turnContext) => {
    await bot.run(turnContext);
  });
};
