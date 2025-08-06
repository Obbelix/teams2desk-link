
const { BotFrameworkAdapter, ActivityHandler } = require("botbuilder");

const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword,
});

// Simple bot logic
class TeamsBot extends ActivityHandler {
  constructor() {
    super();

    // Welcome message
    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          await context.sendActivity("👋 Välkommen! Skriv 'hi' eller 'help' för att börja.");
        }
      }
      await next();
    });

    // Handle messages
    this.onMessage(async (context, next) => {
      const text = context.activity.text?.toLowerCase();
      if (text.includes("hi")) {
        await context.sendActivity("Hej där! 👋");
      } else if (text.includes("help")) {
        await context.sendActivity("Här är vad jag kan hjälpa dig med...");
      } else {
        await context.sendActivity("Jag förstod inte riktigt. Skriv 'help' för hjälp.");
      }
      await next();
    });
  }
}

const bot = new TeamsBot();

module.exports = async function (context, req) {
  try {
    if (req.method === "POST") {
      // Set up the response object properly for Azure Functions
      context.res = {
        status: 200,
        body: undefined,
        headers: {}
      };

      await adapter.processActivity(req, context.res, async (turnContext) => {
        await bot.run(turnContext);
      });
    } else {
      context.res = {
        status: 200,
        body: "Bot endpoint is running",
      };
    }
  } catch (error) {
    context.log.error('Bot error:', error.message);
    context.log.error('Error details:', error);
    context.res = {
      status: 500,
      body: { error: error.message }
    };
  }
};
