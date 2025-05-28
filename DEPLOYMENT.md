# Deployment Checklist

## Pre-deployment Steps

### 1. Environment Variables
- [ ] `RIOT_API_KEY` - Primary Riot API key
- [ ] `RIOT_API_KEY_2` - Secondary Riot API key (optional)

### 2. Build Verification
\`\`\`bash
npm run build
npm run start
\`\`\`

### 3. Performance Checks
- [ ] All console.logs removed from production code
- [ ] Error handling is production-ready
- [ ] Cache is working properly
- [ ] API rate limiting is configured
- [ ] Images are optimized

### 4. Security
- [ ] API keys are not exposed in client-side code
- [ ] Security headers are configured
- [ ] CORS is properly configured

### 5. Testing
- [ ] Test profile loading with valid summoner
- [ ] Test error handling with invalid summoner
- [ ] Test rate limiting behavior
- [ ] Test export functionality
- [ ] Test search and filtering
- [ ] Test pagination

## Deployment Platforms

### Vercel (Recommended)
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Ensure Node.js 18+ support
- Configure environment variables
- Set build command: `npm run build`
- Set start command: `npm run start`

## Post-deployment Verification
- [ ] Profile pages load correctly
- [ ] API calls work without CORS issues
- [ ] Error pages display properly
- [ ] Export functionality works
- [ ] Search and filtering work
- [ ] Performance is acceptable

## Monitoring
- Monitor API rate limits
- Track error rates
- Monitor page load times
- Check for failed API calls
\`\`\`

Finally, let's update the package.json with production scripts:
