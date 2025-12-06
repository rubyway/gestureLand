# 🎄 Gesture Controls Quick Reference

## Camera Setup
1. Click "Enable Camera" button
2. Allow browser camera permissions
3. Position yourself 30-60cm from camera
4. Ensure good lighting
5. Wait for the hand tracking model to load (first time only)

## How Gesture Recognition Works

The app uses **TensorFlow.js HandPose** model to track 21 hand landmarks in real-time. To improve accuracy and reduce false positives, the system includes:

- **Temporal Smoothing**: Hand positions are smoothed using exponential moving average to reduce jitter
- **Confidence Tracking**: Gestures require 3 consecutive frames of detection before triggering
- **Cooldown Periods**: 1-second cooldown between gesture triggers to prevent accidental repeats
- **Optimized Thresholds**: Carefully tuned distance and movement thresholds for reliable detection

## Single Hand Gestures

### 🤚 Hand Movement
**Action**: Move hand left/right  
**Effect**: Rotates the Christmas tree  
**Tip**: Move slowly for smooth rotation

### 👆 Vertical Control  
**Action**: Move hand up/down  
**Effect**: Moves tree up or down  
**Tip**: Keep hand flat and parallel to screen

### 🤏 Pinch Gesture
**Action**: Pinch thumb and index finger together/apart  
**Effect**: Controls tree size (zoom in/out)  
**Detection**: Triggers when fingers are less than 40 pixels apart
**Tip**: Start with fingers apart, then pinch slowly. The gesture requires confirmation over multiple frames for stability

### 👌 Photo Reveal
**Action**: Make wide spread between thumb and index (7-18cm apart)  
**Effect**: Reveals hidden photo at that position  
**Detection**: Triggers when fingers are 70-180 pixels apart (wider range for easier use)
**Tip**: Point at specific spheres to reveal their photos. Has 1-second cooldown to prevent rapid triggering

## Two Hand Gestures

### 🙌 Scatter Effect
**Action**: Start with hands together, then spread them apart quickly  
**Effect**: Spheres scatter in all directions  
**Detection**: Requires 80+ pixels increase in distance between palms with 3-frame confirmation
**Tip**: Move hands apart deliberately and wait for effect to trigger. Has 1-second cooldown

### 🤲 Gather Effect
**Action**: Start with hands apart, bring them together  
**Effect**: Spheres return to tree formation  
**Detection**: Requires 80+ pixels decrease in distance between palms with 3-frame confirmation
**Tip**: Bring hands together deliberately. Has 1-second cooldown

## Manual Controls (Button Alternative)

If gestures aren't working, use manual controls:
- **Scatter Button**: Instantly scatter spheres
- **Gather Button**: Return spheres to tree
- **Reset Button**: Reset all transformations
- **Sliders**: Adjust density, size, rotation speed

## Troubleshooting

### Gestures Not Responding
1. Check camera is enabled (top-right preview)
2. Ensure good lighting
3. Keep hand clearly visible in camera view
4. Try moving closer or farther from camera (optimal: 30-60cm)
5. Make gestures more pronounced and deliberate
6. Hold gestures for 2-3 frames (about 0.1 seconds) for confirmation
7. Wait for cooldown period (1 second) between repeated gestures
8. Ensure only 1-2 hands are visible in frame

### Camera Not Working
1. Verify browser permissions granted
2. Close other apps using camera
3. Use HTTPS or localhost URL
4. Try different browser
5. Check browser console for errors

### Performance Issues
1. Reduce sphere density
2. Lower sphere size
3. Disable camera if not needed
4. Close other browser tabs
5. Use demo.html for lighter version

## Tips for Best Experience

✅ **Do:**
- Use in well-lit environment
- Make clear, deliberate gestures
- Keep hand movements smooth
- Position yourself at arm's length from camera
- Wear solid-colored clothing

❌ **Don't:**
- Move too quickly
- Put multiple hands in view unless using two-hand gestures
- Stand too close or too far from camera
- Use in dark environments
- Expect instant response (ML processing takes time)

## Keyboard Shortcuts (Future Enhancement)

Currently no keyboard shortcuts implemented. Use on-screen controls.

## Customization

You can customize sensitivity and gesture thresholds by editing `app.js`:

### Gesture Thresholds (lines 47-56)
```javascript
const gestureThresholds = {
    pinchDistance: 40,           // Pinch detection threshold (pixels)
    photoRevealMin: 70,          // Min distance for photo reveal (pixels)
    photoRevealMax: 180,         // Max distance for photo reveal (pixels)
    movementSensitivity: 5,      // Movement threshold to reduce jitter (pixels)
    twoHandsScatterDelta: 80,    // Distance change to trigger scatter (pixels)
    twoHandsGatherDelta: -80,    // Distance change to trigger gather (pixels)
    rotationSpeed: 0.002,        // Rotation speed multiplier
    verticalSpeed: 0.015         // Vertical movement speed multiplier
};
```

### Gesture State Configuration (lines 36-38)
```javascript
gestureCooldown: 1000,           // Cooldown between gestures (milliseconds)
smoothingFactor: 0.3,            // Smoothing factor (0=max smoothing, 1=no smoothing)
confidenceThreshold: 3,          // Frames required to confirm gesture
```

### Tips for Customization
- **Increase `pinchDistance`** if pinch triggers too easily
- **Decrease `movementSensitivity`** for more responsive movement (but more jitter)
- **Increase `confidenceThreshold`** to reduce false positives (but slower response)
- **Decrease `smoothingFactor`** for smoother but less responsive tracking
- **Adjust cooldown** to allow faster or slower repeated gestures

## Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+

Requires:
- WebGL support
- getUserMedia API
- Web Audio API (for music)
- TensorFlow.js compatibility

---

**Enjoy your interactive Christmas tree! 🎄✨**

For more information, see README.md or DEPLOYMENT.md
