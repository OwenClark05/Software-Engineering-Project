# Software-Engineering-Project
This repo is for our software engineering project.

## Publish to GitHub Pages

Expected URL: https://owenclark05.github.io/Software-Engineering-Project/

1. For free GitHub Pages hosting, use a public repository. In GitHub repository **Settings → Pages**, select **GitHub Actions** as the source.
2. Under **Settings → Secrets and variables → Actions → Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, using the corresponding values from your local `.env`. These are public browser configuration values; never use a Supabase service-role or secret key here. Keep `.env` out of Git.
3. In Supabase **Authentication → URL Configuration**, set the Site URL to the expected URL above (including the trailing slash), and allow that URL as a redirect URL. Keep your localhost redirect URL if you also develop locally.
4. Commit these changes and push/merge them into `main`. The **Deploy to GitHub Pages** workflow will build and deploy the site. Check its progress in GitHub's **Actions** tab.

The workflow configures the asset base path, and the router uses that same path. It also publishes an app copy as `404.html` so direct links and refreshes on routes such as `/dashboard` can load the app on Pages. GitHub returns HTTP 404 for these fallback requests even though the app renders.

The frontend is public; the dashboard still requires Supabase login in production. Supabase continues to provide authentication and data services independently of Pages. Database access should be enforced through Supabase row-level security policies. Verify sign-in and email confirmation after deployment; these require the live Supabase configuration.

To check the production build locally:

```sh
npm run build -- --base=/Software-Engineering-Project/
npm run preview
```
