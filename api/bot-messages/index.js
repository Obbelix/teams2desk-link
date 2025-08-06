
const { BotFrameworkAdapter } = require("botbuilder");

const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword,
});

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
        const text = turnContext.activity.text?.toLowerCase() || "";

        if (text.includes("hi") || text.includes("hello")) {
          await turnContext.sendActivity("Hello there! 👋");
        } else if (text.includes("help")) {
          await turnContext.sendActivity("Here's how I can help you...");
        } else {
          await turnContext.sendActivity("Sorry, I didn't understand that.");
        }
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
