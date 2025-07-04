# Deployment Guide

This guide covers deployment options for the Swell Custom Checkout template.

## Prerequisites

Before deploying, ensure you have:
- A Swell store with API credentials
- Payment methods configured in your Swell dashboard
- Environment variables properly set

## Deployment Options

### 1. Vercel (Recommended)

Vercel offers the simplest deployment for React applications.

#### Setup Steps:

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository
   - Vercel will auto-detect the framework

2. **Environment Variables**
   ```
   VITE_SWELL_STORE_ID=your_store_id
   VITE_SWELL_PUBLIC_KEY=your_public_key
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key (optional)
   VITE_PAYPAL_CLIENT_ID=your_paypal_id (optional)
   ```

3. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Your checkout will be available at `https://your-project.vercel.app`

#### Custom Domain

1. Go to your Vercel project settings
2. Add your custom domain
3. Update DNS records as instructed
4. Add SSL certificate (automatic)

### 2. Netlify

Netlify is another excellent option for static site deployment.

#### Setup Steps:

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository

2. **Build Settings**
   - Build Command: `npm run build`
   - Publish Directory: `dist`

3. **Environment Variables**
   Go to Site Settings → Environment Variables and add:
   ```
   VITE_SWELL_STORE_ID=your_store_id
   VITE_SWELL_PUBLIC_KEY=your_public_key
   ```

4. **Deploy**
   - Click "Deploy site"
   - Your checkout will be available at `https://your-site.netlify.app`

### 3. AWS S3 + CloudFront

For enterprise deployments, AWS offers scalable hosting.

#### Setup Steps:

1. **Build Project**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   - Enable static website hosting
   - Upload `dist` folder contents

3. **Configure CloudFront**
   - Create distribution
   - Set S3 bucket as origin
   - Configure caching rules

4. **Environment Variables**
   - Build with environment variables locally
   - Or use AWS Systems Manager Parameter Store

### 4. Firebase Hosting

Google's Firebase offers free hosting with CDN.

#### Setup Steps:

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```

3. **Configure firebase.json**
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

## Environment Configuration

### Production Environment Variables

Create different environment configurations for different stages:

#### .env.production
```
VITE_SWELL_STORE_ID=your_production_store_id
VITE_SWELL_PUBLIC_KEY=your_production_public_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
VITE_PAYPAL_CLIENT_ID=your_live_paypal_id
```

#### .env.staging
```
VITE_SWELL_STORE_ID=your_staging_store_id
VITE_SWELL_PUBLIC_KEY=your_staging_public_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
VITE_PAYPAL_CLIENT_ID=your_test_paypal_id
```

## DNS Configuration

### Custom Domain Setup

1. **Purchase Domain**
   - Use any domain registrar
   - Configure DNS settings

2. **DNS Records**
   For Vercel/Netlify:
   ```
   Type: CNAME
   Name: checkout (or @ for root)
   Value: your-deployment-url
   ```

3. **SSL Certificate**
   - Most platforms provide automatic SSL
   - Verify HTTPS is working

## Performance Optimization

### 1. Build Optimization

```bash
# Analyze bundle size
npm run build -- --analyze

# Optimize images
npm install -D vite-plugin-imagemin

# Enable compression
npm install -D vite-plugin-compression
```

### 2. CDN Configuration

- Enable gzip compression
- Set appropriate cache headers
- Configure edge caching rules

### 3. Monitoring

- Set up error tracking (Sentry)
- Monitor performance (Web Vitals)
- Track conversion rates

## Security Considerations

### 1. Environment Variables

- Never commit sensitive keys to Git
- Use different keys for staging/production
- Rotate API keys regularly

### 2. HTTPS

- Always use HTTPS in production
- Configure HSTS headers
- Set up proper CORS policies

### 3. Content Security Policy

Add CSP headers:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify Node.js version compatibility
   - Clear node_modules and reinstall

2. **Runtime Errors**
   - Check browser console for errors
   - Verify API keys are correct
   - Test with different browsers

3. **Payment Issues**
   - Verify payment gateway configuration
   - Check webhook endpoints
   - Test with different payment methods

### Debugging

```bash
# Local debugging
npm run dev
npm run build && npm run preview

# Check build output
ls -la dist/

# Test production build locally
npx serve dist
```

## Maintenance

### Regular Updates

- Update dependencies monthly
- Monitor security advisories
- Test payment flows regularly
- Update Swell SDK when new versions are released

### Backup Strategy

- Regular Git commits
- Database backups (if applicable)
- Configuration backups
- Monitor deployment logs