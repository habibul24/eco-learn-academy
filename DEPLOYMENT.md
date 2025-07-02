
# Deployment Guide

This project is ready for deployment on AWS Amplify. Follow these steps:

## Prerequisites
- AWS Account
- GitHub repository with your code

## Deployment Steps

1. **Push to GitHub**
   - Make sure all your code is committed and pushed to a GitHub repository

2. **Connect to AWS Amplify**
   - Go to AWS Amplify Console
   - Click "New App" > "Host web app"
   - Connect your GitHub repository
   - Select the branch you want to deploy

3. **Configure Build Settings**
   - Amplify will automatically detect the `amplify.yml` file
   - The build configuration is already set up in `amplify.yml`

4. **Set Environment Variables**
   - In Amplify Console, go to App Settings > Environment Variables
   - Add the following variables:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

5. **Deploy**
   - Click "Save and Deploy"
   - Wait for the build to complete
   - Your app will be live at the provided URL

## Environment Variables Required

The following environment variables need to be set in AWS Amplify:

- `VITE_SUPABASE_URL`: wufjtlnxiwipdjqsntqk.supabase.co
- `VITE_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Zmp0bG54aXdpcGRscXNudHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTExNjAsImV4cCI6MjA2NTUyNzE2MH0.kmfmAWpH_8IxIro1J1hd_mwbvwKCEYzaJhrOWY4Ohxw

## Troubleshooting

If the build fails:
1. Check the build logs in Amplify Console
2. Make sure all dependencies are listed in package.json
3. Verify environment variables are set correctly

## Custom Domain (Optional)

To use a custom domain:
1. Go to Domain Management in Amplify Console
2. Add your domain
3. Follow the DNS configuration steps
