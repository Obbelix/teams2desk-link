// Health check endpoint to verify environment variables
module.exports = async function (context, req) {
  const present = k => !!(process.env[k] && process.env[k].length);
  
  context.res = { 
    status: 200, 
    headers: { 'Content-Type': 'application/json' },
    body: {
      MicrosoftAppId: present("MicrosoftAppId"),
      MicrosoftAppPassword: present("MicrosoftAppPassword"),
      MicrosoftAppType: process.env.MicrosoftAppType || null,
      MicrosoftAppTenantId: process.env.MicrosoftAppTenantId || null,
      timestamp: new Date().toISOString()
    }
  };
};