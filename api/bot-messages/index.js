
const { BotFrameworkAdapter } = require("botbuilder");

const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword,
});

module.exports = async function (context, req) {
  if (req.method === "POST") {
    try {
      await adapter.processActivity(req, context, async (turnContext) => {
        const text = turnContext.activity.text?.toLowerCase() || "";

        if (text.includes("hi") || text.includes("hello")) {
          await turnContext.sendActivity("Hello there! 👋");
        } else if (text.includes("help")) {
          await turnContext.sendActivity("Here's how I can help you...");
        } else {
          await turnContext.sendActivity("Sorry, I didn't understand that.");
        }
      });
    } catch (error) {
      context.log.error('Bot error:', error.message);
      context.res = {
        status: 500,
        body: { error: error.message }
      };
    }
  } else {
    context.res = {
      status: 200,
      body: "Bot endpoint is running",
    };
  }
};
