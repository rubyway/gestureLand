# Deployment Guide

## Overview
This guide will help you deploy the 3D Christmas Tree application to various hosting platforms.

## Quick Deployment Options

### 1. GitHub Pages (Recommended)

1. Push your code to a GitHub repository
2. Go to repository Settings → Pages
3. Select source branch (usually `main` or `master`)
4. Your site will be available at: `https://yourusername.github.io/gestureLand`

**Note**: GitHub Pages serves over HTTPS, which is required for camera access.

### 2. Netlify

1. Create account at https://netlify.com
2. Drag and drop your project folder, or connect to your Git repository
3. Site will be deployed automatically with HTTPS enabled
4. Custom domain support available

**Deploy from Git:**
```bash
# Build command: (none needed - static site)
# Publish directory: /
```

### 3. Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run from project directory: `vercel`
3. Follow the prompts
4. Automatic HTTPS and CDN distribution

### 4. Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Build settings:
   - Build command: (none)
   - Build output directory: /
3. Deploy with global CDN and DDoS protection

### 5. Local Development Server

For local testing, you need a local web server:

**Python:**
```bash
python3 -m http.server 8000
# Visit http://localhost:8000
```

**Node.js:**
```bash
npx http-server -p 8000
# Visit http://localhost:8000
```

**PHP:**
```bash
php -S localhost:8000
# Visit http://localhost:8000
```

## Important Notes

### Camera Access Requirements
- **HTTPS Required**: Camera access only works on HTTPS or localhost
- **Permissions**: Users must grant camera permission when prompted
- **Browser Support**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)

### CDN Dependencies
The application loads these libraries from CDN:
- Three.js (r128) - 3D rendering engine
- TensorFlow.js (3.11.0) - Machine learning framework
- HandPose (0.0.7) - Hand gesture recognition model

**Internet Connection Required**: First load requires internet to download these libraries from CDN.

### Performance Considerations

For optimal performance:
- Use modern browsers with WebGL support
- Enable hardware acceleration in browser settings
- Recommended specs:
  - CPU: Dual-core 2GHz+
  - RAM: 4GB+
  - GPU: Integrated graphics or better

### File Structure

```
gestureLand/
├── index.html          # Main application (requires CDN access)
├── app.js             # Main application logic
├── demo.html          # Standalone demo (works offline)
├── demo.js            # Demo logic
├── README.md          # Documentation
└── DEPLOYMENT.md      # This file
```

## Testing Your Deployment

1. **Open the application** in a modern browser
2. **Check console** for any errors (F12 → Console)
3. **Test camera access** by clicking "Enable Camera"
4. **Try controls**:
   - Adjust sliders for density/size
   - Click scatter/gather buttons
   - Upload photos and music
5. **Test gestures** (if camera enabled):
   - Move hand left/right
   - Pinch fingers
   - Use two hands

## Troubleshooting

### Camera Not Working
- Ensure HTTPS connection (or localhost)
- Check browser camera permissions
- Close other applications using camera
- Try different browser

### 3D Not Rendering
- Check if Three.js loaded (see browser console)
- Ensure WebGL is supported (`chrome://gpu`)
- Try disabling browser extensions
- Update graphics drivers

### Performance Issues
- Reduce sphere density (slider control)
- Lower sphere size
- Close other tabs
- Use `demo.html` for lighter version

### Libraries Not Loading
- Check internet connection
- Verify CDN URLs are not blocked
- Try different network (corporate firewalls may block CDNs)
- Use `demo.html` which works without CDN

## Custom Domain Setup

### GitHub Pages
1. Add CNAME file with your domain
2. Configure DNS:
   ```
   Type: CNAME
   Name: www (or @)
   Value: yourusername.github.io
   ```

### Netlify/Vercel
- Add custom domain in dashboard
- Follow DNS configuration instructions
- Automatic HTTPS certificate provisioning

## Advanced Configuration

### Customizing the Application

Edit `index.html` to change:
- Default colors
- Initial sphere density
- Tree dimensions
- UI text and styling

Edit `app.js` to modify:
- Gesture recognition sensitivity
- Animation behaviors
- Tree shape algorithm
- Audio visualization parameters

### Adding Custom Features

The codebase is designed for extensibility:

1. **New Gestures**: Add to `processGestures()` function
2. **Custom Shapes**: Modify `ChristmasTree.createTree()`
3. **New Effects**: Extend `ChristmasTree.update()`
4. **UI Controls**: Add HTML controls and event listeners

## Security Considerations

- Never commit API keys or secrets
- Validate file uploads on client side
- Use CSP headers for production
- Keep dependencies updated

## Support

For issues or questions:
- Open an issue on GitHub
- Check browser console for errors
- Review browser compatibility
- Test on different devices

## License

MIT License - See LICENSE file for details
