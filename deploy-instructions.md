
# AWS Amplify Deployment Instructions

## Prerequisites
1. AWS Account with Amplify access
2. GitHub repository connected to Amplify
3. Supabase project setup

## Deployment Steps

### 1. Connect Your Repository
- Go to AWS Amplify Console
- Click "New app" > "Host web app"
- Connect your GitHub repository
- Select the branch you want to deploy (main or my-new-feature-branch)

### 2. Build Settings
- Amplify should auto-detect the build settings from `amplify.yml`
- If not, use these settings:
  - Build command: `npm run build`
  - Build output directory: `dist`
  - Node.js version: 18

### 3. Environment Variables
Set these environment variables in Amplify Console:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

To add environment variables:
1. Go to your app in Amplify Console
2. Click "Environment variables" in the left sidebar
3. Add the variables listed above

### 4. Custom Domain (Optional)
- In Amplify Console, go to "Domain management"
- Add your custom domain
- Follow the DNS configuration steps

### 5. Supabase Configuration
Make sure your Supabase project has the correct redirect URLs:
1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add your Amplify URL to "Redirect URLs"
3. Set "Site URL" to your Amplify domain

## Important Notes
- The `_redirects` file handles client-side routing
- All environment variables must be prefixed with `VITE_`
- Make sure your Supabase RLS policies are properly configured
- Test authentication flows after deployment

## Troubleshooting
- If build fails, check the build logs in Amplify Console
- Ensure all dependencies are in package.json
- Verify environment variables are set correctly
- Check Supabase URL configuration for CORS issues
