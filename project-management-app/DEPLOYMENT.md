# How to Deploy ProjectHub to Vercel

The easiest way to deploy your Next.js application is to use the [Vercel Platform](https://vercel.com/new).

## Prerequisites

- A [GitHub](https://github.com/) account
- A [Vercel](https://vercel.com/) account

## Steps

1. **Push your code to GitHub**
   - Create a new repository on GitHub.
   - Run the following commands in your terminal:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin <your-github-repo-url>
     git push -u origin main
     ```

2. **Deploy to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard).
   - Click **"Add New..."** -> **"Project"**.
   - Import your GitHub repository.
   - Vercel will automatically detect that it's a Next.js project.

3. **Configure Environment Variables**
   - In the "Configure Project" screen, look for **"Environment Variables"**.
   - Add the following variables (copy values from your `.env.local` file):
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy**
   - Click **"Deploy"**.
   - Wait for a minute, and your site will be live!

## Alternative: Netlify

You can also deploy to [Netlify](https://www.netlify.com/):
1. Connect your GitHub repository.
2. Set build command to `npm run build`.
3. Set publish directory to `.next`.
4. Add the Environment Variables in "Site Settings" > "Build & deploy" > "Environment".
