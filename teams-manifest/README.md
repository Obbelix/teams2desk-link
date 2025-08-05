# Teams2Go Service Desk - Teams App Manifest

This folder contains the Microsoft Teams app manifest and assets needed to deploy Teams2Go as a Teams app.

## Files Included

- `manifest.json` - Teams app manifest configuration
- `color.png` - Color app icon (192x192px)
- `outline.png` - Outline app icon (32x32px)

## Setup Instructions

### 1. Update the Manifest
Before deploying, update these placeholders in `manifest.json`:

- Replace `YOUR_DOMAIN.azurestaticapps.net` with your actual Azure Static Web App domain
- Replace `YOUR_APP_ID` with your Azure AD App Registration ID (if using SSO)
- Update the developer information (name, websiteUrl, privacyUrl, termsOfUseUrl)

### 2. Create App Package
1. Select all three files (manifest.json, color.png, outline.png)
2. Create a ZIP file named `Teams2Go-ServiceDesk.zip`
3. Ensure the files are in the root of the ZIP (not in a subfolder)

### 3. Upload to Teams

#### For Testing (Developer Portal):
1. Go to [Teams Developer Portal](https://dev.teams.microsoft.com/)
2. Sign in with your Microsoft 365 account
3. Click "Apps" > "Import app"
4. Upload your ZIP file
5. Complete any required fields
6. Click "Publish" > "Publish to your org"

#### For Organization Deployment:
1. Go to [Teams Admin Center](https://admin.teams.microsoft.com/)
2. Navigate to "Teams apps" > "Manage apps"
3. Click "Upload new app"
4. Upload your ZIP file
5. Set availability and permissions as needed

### 4. App Capabilities

This manifest configures Teams2Go as:
- **Personal Tab**: Available in personal Teams scope
- **Configurable Tab**: Can be added to Teams channels
- **Static Tab**: Personal app experience

### 5. Permissions

The app requests these permissions:
- `identity` - Access to user identity information
- `messageTeamMembers` - Ability to send messages to team members

## Testing

After upload, you can:
1. Install the app in Teams
2. Add it as a personal app or channel tab
3. Test the service desk case creation functionality
4. Verify integration with your easitGO service desk

## Troubleshooting

If you encounter issues:
- Verify all URLs in manifest.json are accessible
- Check that your Azure Static Web App is deployed and running
- Ensure your API endpoints are working
- Validate the manifest using Teams Developer Portal

## Next Steps

Once testing is complete:
1. Update app store listing information
2. Add screenshots and descriptions
3. Submit for organization-wide deployment
4. Configure any additional Teams admin policies as needed