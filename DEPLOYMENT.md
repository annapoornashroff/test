# Forever N Co. - Deployment Guide

## 🚀 Netlify Deployment with Custom Domain

This guide will help you deploy Forever N Co. to Netlify and set up a custom domain using Entri.

### Prerequisites

1. **GitHub Repository**: Your code should be pushed to a GitHub repository
2. **Firebase Project**: Set up with Phone Authentication enabled
3. **Custom Domain**: Purchase a domain (we'll use Entri for DNS management)
4. **Netlify Account**: Free account at [netlify.com](https://netlify.com)

### Step 1: Prepare for Deployment

#### 1.1 Environment Variables Setup

Create your production environment variables. You'll need these for Netlify:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=https://api.forevernco.com/api/v1
```

#### 1.2 Firebase Configuration for Production

1. **Add Production Domain to Firebase**:
   - Go to Firebase Console → Authentication → Settings
   - Add your custom domain to "Authorized domains"
   - Example: `forevernco.com`, `www.forevernco.com`

2. **Update Firebase Security Rules** (if using Firestore):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### Step 2: Deploy to Netlify

#### 2.1 Connect GitHub Repository

1. **Login to Netlify**: Go to [netlify.com](https://netlify.com) and sign in
2. **New Site from Git**: Click "New site from Git"
3. **Choose GitHub**: Connect your GitHub account
4. **Select Repository**: Choose your Forever N Co. repository
5. **Configure Build Settings**:
   - **Branch to deploy**: `main` or `master`
   - **Build command**: `npm run build`
   - **Publish directory**: `out`

#### 2.2 Add Environment Variables

1. **Site Settings**: Go to your site dashboard
2. **Environment Variables**: Site settings → Environment variables
3. **Add Variables**: Add all your Firebase configuration variables

```
NEXT_PUBLIC_FIREBASE_API_KEY = your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID = your_app_id
NEXT_PUBLIC_API_URL = https://api.forevernco.com/api/v1
```

#### 2.3 Deploy

1. **Trigger Deploy**: Click "Deploy site"
2. **Monitor Build**: Watch the build logs for any errors
3. **Test Deployment**: Visit the generated Netlify URL to test

### Step 3: Custom Domain Setup with Entri

#### 3.1 Purchase Domain

1. **Choose Domain**: Select a domain name (e.g., `forevernco.com`)
2. **Purchase**: Buy through your preferred registrar or Entri

#### 3.2 Configure DNS with Entri

1. **Login to Entri**: Go to [entri.com](https://entri.com)
2. **Add Domain**: Add your purchased domain
3. **DNS Management**: Set up DNS records

#### 3.3 Netlify Domain Configuration

1. **Domain Settings**: In Netlify, go to Site settings → Domain management
2. **Add Custom Domain**: Click "Add custom domain"
3. **Enter Domain**: Add your domain (e.g., `forevernco.com`)
4. **DNS Configuration**: Netlify will provide DNS settings

#### 3.4 DNS Records Setup

In Entri DNS management, add these records:

**For Apex Domain (forevernco.com):**
```
Type: A
Name: @
Value: 75.2.60.5
TTL: 3600
```

**For WWW Subdomain:**
```
Type: CNAME
Name: www
Value: your-site-name.netlify.app
TTL: 3600
```

**Alternative: Use Netlify DNS**
```
Type: CNAME
Name: @
Value: your-site-name.netlify.app
TTL: 3600
```

### Step 4: SSL Certificate

1. **Automatic SSL**: Netlify automatically provisions SSL certificates
2. **Force HTTPS**: Enable "Force HTTPS" in Domain settings
3. **Verification**: Wait for SSL certificate to be issued (usually 24-48 hours)

### Step 5: Performance Optimization

#### 5.1 Build Optimization

The `netlify.toml` file includes:
- Static asset caching
- Security headers
- Redirect rules for SPA routing

#### 5.2 CDN Configuration

Netlify automatically provides:
- Global CDN distribution
- Asset optimization
- Gzip compression

### Step 6: Monitoring and Analytics

#### 6.1 Netlify Analytics

1. **Enable Analytics**: In site settings, enable Netlify Analytics
2. **Monitor Performance**: Track page views, load times, and errors

#### 6.2 Google Analytics (Optional)

Add Google Analytics tracking ID to environment variables:
```
NEXT_PUBLIC_GA_TRACKING_ID = your_ga_tracking_id
```

### Step 7: Continuous Deployment

#### 7.1 Automatic Deployments

- **Git Integration**: Pushes to main branch automatically trigger deployments
- **Preview Deployments**: Pull requests create preview deployments
- **Rollback**: Easy rollback to previous deployments

#### 7.2 Deploy Hooks

Set up deploy hooks for:
- Content updates
- Scheduled rebuilds
- External service integrations

### Troubleshooting

#### Common Issues

1. **Build Failures**:
   - Check environment variables are set correctly
   - Verify Node.js version compatibility
   - Review build logs for specific errors

2. **Firebase Authentication Issues**:
   - Ensure domain is added to Firebase authorized domains
   - Check Firebase configuration variables
   - Verify reCAPTCHA settings for production

3. **DNS Propagation**:
   - DNS changes can take 24-48 hours to propagate
   - Use DNS checker tools to verify propagation
   - Clear browser cache and DNS cache

4. **SSL Certificate Issues**:
   - Ensure DNS is properly configured
   - Wait for certificate provisioning (can take up to 24 hours)
   - Check domain verification status

#### Support Resources

- **Netlify Documentation**: [docs.netlify.com](https://docs.netlify.com)
- **Firebase Documentation**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Entri Support**: [entri.com/support](https://entri.com/support)

### Production Checklist

- [ ] Firebase project configured for production
- [ ] All environment variables set in Netlify
- [ ] Custom domain configured and verified
- [ ] SSL certificate issued and active
- [ ] DNS records properly configured
- [ ] Site accessible via custom domain
- [ ] Authentication working in production
- [ ] All pages loading correctly
- [ ] Performance optimized
- [ ] Analytics configured
- [ ] Monitoring set up

### Security Considerations

1. **Environment Variables**: Never commit sensitive data to repository
2. **Firebase Security**: Configure proper security rules
3. **HTTPS**: Always use HTTPS in production
4. **Headers**: Security headers configured in netlify.toml
5. **Domain Verification**: Verify domain ownership

### Performance Metrics

Target performance metrics:
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Maintenance

1. **Regular Updates**: Keep dependencies updated
2. **Security Patches**: Apply security updates promptly
3. **Performance Monitoring**: Regular performance audits
4. **Backup Strategy**: Regular backups of critical data
5. **Disaster Recovery**: Plan for service outages

---

**Deployment Status**: Ready for Production  
**Estimated Setup Time**: 2-4 hours  
**DNS Propagation**: 24-48 hours  
**SSL Certificate**: Automatic (24-48 hours)