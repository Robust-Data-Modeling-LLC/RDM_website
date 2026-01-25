# DS Project Website

This repository contains a static website project.

## Publishing to GitHub Pages

### Quick Start

Your website is already set up with Git. Follow these steps to publish it on GitHub Pages:

### Step 1: Commit Your Changes

First, make sure all your changes are committed:

```bash
git add .
git commit -m "Update website"
git push origin main
```

### Step 2: Enable GitHub Pages

1. Go to your GitHub repository: https://github.com/yurigrant49/DS_project
2. Click on **Settings** (top right of the repository)
3. Scroll down to the **Pages** section in the left sidebar
4. Under **Source**, select:
   - **Branch**: `main`
   - **Folder**: `/ (root)` (since your `index.html` is in the root)
5. Click **Save**

### Step 3: Access Your Website

After enabling GitHub Pages, your website will be available at:
- **URL**: `https://yurigrant49.github.io/DS_project/`

It may take a few minutes for the site to be available after the first deployment.

### Step 4: Update Your Website

Whenever you make changes:

1. Make your changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
3. GitHub Pages will automatically rebuild your site (usually within 1-2 minutes)

## Website Structure

- `index.html` - Main homepage
- `invention.html` - Invention page
- `static.html` - Static analysis page
- `String_deformation.html` - String deformation analysis
- `Stringing_math.html` - Stringing math calculations
- `free_vibration.html` - Free vibration analysis
- `vibration.html` - Vibration analysis
- `AB_test_analysis/` - A/B testing analysis tools
- `images/` - Image assets
- Various calculation image directories

## Custom Domain (Optional)

If you want to use a custom domain:

1. In the GitHub Pages settings, enter your custom domain
2. Configure your DNS records to point to GitHub Pages
3. GitHub will provide instructions for DNS configuration

## Troubleshooting

- **Site not updating?** Wait 1-2 minutes and hard refresh (Ctrl+F5)
- **404 errors?** Make sure `index.html` is in the root directory
- **CSS/JS not loading?** Check that file paths are relative (e.g., `./styles.css` not `C:/...`)

## Need Help?

For more information, visit: https://docs.github.com/en/pages


