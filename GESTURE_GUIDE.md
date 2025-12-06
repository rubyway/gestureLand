# 🎄 Gesture Controls Quick Reference

## Camera Setup
1. Click "Enable Camera" button
2. Allow browser camera permissions
3. Position yourself 30-60cm from camera
4. Ensure good lighting

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
**Tip**: Start with fingers apart, then pinch slowly

### 👌 Photo Reveal
**Action**: Make "OK" sign (thumb and index wide spread, 8-15cm apart)  
**Effect**: Reveals hidden photo at that position  
**Tip**: Point at specific spheres to reveal their photos

## Two Hand Gestures

### 🙌 Scatter Effect
**Action**: Start with hands together, then spread them apart quickly  
**Effect**: Spheres scatter in all directions  
**Tip**: Move hands apart by at least 30cm

### 🤲 Gather Effect
**Action**: Start with hands apart, bring them together  
**Effect**: Spheres return to tree formation  
**Tip**: Bring hands within 10cm of each other

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
3. Keep hand clearly visible
4. Try moving closer or farther from camera
5. Make gestures more pronounced

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
- `processSingleHandGesture()` - Single hand gesture detection
- `processTwoHandsGesture()` - Two hand gesture detection
- Adjust distance thresholds for different sensitivity

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
