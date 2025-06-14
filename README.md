# Thakkir (ذَكِّر) - Voice-Enabled Islamic Dhikr Counter

**Thakkir** (ذَكِّر) is a modern Islamic dhikr counter PWA built with Next.js, featuring experimental voice recognition capabilities alongside traditional manual counting.

> **🚧 Voice Recognition Status**: Currently in development with limited accuracy - manual counting remains the primary reliable method

## ✨ Why Thakkir?

- **👆 Reliable Manual Counting**: Traditional tap-to-count method that always works
- **🎤 Experimental Voice Features**: Voice recognition in development (accuracy varies)
- **🚀 Zero Setup**: Works immediately - no registration, no configuration
- **📱 One-Page Design**: Clean, responsive layout that fits any screen
- **⚡ Offline-Ready**: Full functionality without internet connection
- **🔄 Dual Input Methods**: Choose between manual tapping or experimental voice recognition

## 🗣️ Voice Recognition (Experimental)

> **⚠️ Important**: Voice recognition is experimental and has significant limitations. Manual counting is recommended for reliable dhikr tracking.

The app attempts to recognize these 5 dhikr phrases, but accuracy varies significantly:

| Arabic | Transliteration | English | Recognition Status |
|--------|----------------|---------|--------------------|
| **سُبْحَانَ اللَّهِ** | SubhanAllah | Glory be to Allah | ⚠️ Limited accuracy |
| **الْحَمْدُ لِلَّهِ** | Alhamdulillah | All praise is due to Allah | ⚠️ Limited accuracy |
| **اللَّهُ أَكْبَرُ** | Allahu Akbar | Allah is the Greatest | ⚠️ Limited accuracy |
| **لَا إِلَهَ إِلَّا اللَّهُ** | La ilaha illa Allah | There is no god but Allah | ⚠️ Limited accuracy |
| **أَسْتَغْفِرُ اللَّهَ** | Astaghfirullah | I seek forgiveness from Allah | ⚠️ Limited accuracy |

## 🚀 Quick Start

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/AmrElsayyad/thakkir.git
cd thakkir

# Install dependencies (Bun recommended)
bun install

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) and start counting!

### 2. First Use
1. **Open the app** - Works immediately in demo mode
2. **Allow microphone** - Click "Allow" when browser prompts
3. **Start speaking** - Say any dhikr phrase
4. **Watch it count** - Automatic recognition and counting

## 🎯 How to Use Voice Recognition (Experimental)

> **💡 Recommendation**: Start with manual counting for reliable dhikr tracking. Voice recognition can be tested as an additional feature.

### Current Limitations
- **Low Recognition Accuracy**: Voice detection is inconsistent and unreliable
- **Browser Compatibility**: Works only in Chrome, Edge, and some mobile browsers
- **Language Processing**: Arabic pronunciation recognition needs significant improvement
- **Background Noise**: Very sensitive to ambient sound
- **False Positives**: May count unintended sounds or words

### If You Want to Test Voice Features
1. **Use Chrome or Edge browser** (best compatibility)
2. **Click "Start Voice Recognition"**
3. **Allow microphone access** when prompted
4. **Speak very clearly and slowly**
5. **Expect mixed results** - manual verification recommended

### Voice Recognition Tips (For Testing)
- **Perfect pronunciation required** - especially for Arabic phrases
- **Completely quiet environment** - any background noise interferes
- **Speak slowly and distinctly** - fast speech won't be recognized
- **Use transliteration** - English versions may work better than Arabic
- **Keep backup manual counting** - voice recognition will miss counts

### Browser Support Status
```
✅ Chrome (Desktop) - Best support but still unreliable
✅ Edge (Desktop) - Similar to Chrome
⚠️ Safari - Limited support, inconsistent results
❌ Firefox - Poor Web Speech API support
⚠️ Mobile browsers - Varies significantly
```

## 🛠️ Technology Stack

### Core Technologies
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://typescriptlang.org/)** - Type safety and better developer experience
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management
- **[Bun](https://bun.sh/)** - Fast JavaScript runtime and package manager

### Voice & PWA Features
- **Web Speech API** - Browser-native voice recognition
- **PWA** - Install as native app on any device
- **Offline-First** - Works without internet connection
- **IndexedDB** - Local data persistence

### Voice Recognition Architecture (Needs Improvement)
```typescript
// Current implementation with limited accuracy
const DHIKR_PATTERNS = {
  subhanallah: {
    arabic: ["سبحان الله", "سُبْحَانَ اللَّهِ"],
    transliteration: ["subhan allah", "subhanallah"],
    confidence: 0.85 // Often lower in practice
  }
  // ... more patterns - all need refinement
};

// Known Issues:
// - Pattern matching too simplistic
// - No fuzzy matching for Arabic pronunciation variations
// - Confidence scoring not calibrated properly
// - No noise filtering or audio preprocessing
```

## 🏗️ Project Structure

```
thakkir/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── dhikr/          # Dhikr-specific components
│   │   └── ui/             # Reusable UI components
│   ├── hooks/
│   │   ├── useVoiceRecognition.ts  # Voice recognition hook
│   │   └── useDhikrDatabase.ts     # Database integration
│   ├── stores/             # Zustand stores
│   ├── types/              # TypeScript definitions
│   └── lib/                # Utilities and services
├── public/                 # Static assets
└── package.json
```

## ⚠️ Known Issues & Improvements Needed

### Voice Recognition Limitations
Based on the [React Speech Recognition implementation guide](https://reverieinc.com/blog/implementing-react-speech-recognition-in-your-apps/), our current implementation needs significant improvements:

#### Current Problems
- **Poor Arabic Recognition**: Web Speech API has limited Arabic language support
- **No Noise Reduction**: Background noise severely impacts recognition accuracy
- **Simplistic Pattern Matching**: Current regex patterns are too basic for pronunciation variations
- **No Audio Preprocessing**: Raw audio input without filtering or enhancement
- **Missing Fallback Mechanisms**: No graceful degradation when recognition fails
- **Inconsistent Browser Support**: Results vary dramatically across browsers and devices

#### Planned Improvements
- **Enhanced Arabic Support**: Integration with specialized Arabic speech recognition APIs
- **Audio Preprocessing**: Noise reduction and audio enhancement before recognition
- **Fuzzy Matching**: Better handling of pronunciation variations and accents
- **Machine Learning Models**: Custom trained models for Islamic dhikr recognition
- **Progressive Enhancement**: Better fallback to manual counting when voice fails
- **Real-time Feedback**: Visual indicators for recognition confidence and status

#### Technical Debt
- **Web Speech API Limitations**: Consider migrating to more robust speech recognition services
- **Pattern Recognition**: Replace simple string matching with ML-based approaches
- **Performance Optimization**: Reduce recognition latency and improve accuracy
- **Cross-Platform Consistency**: Ensure similar behavior across all supported browsers

## ⚙️ Configuration

### Environment Variables
Create a `.env.local` file for optional database features:

```env
# Optional: For future cloud sync features
TURSO_DATABASE_URL=your_database_url
TURSO_AUTH_TOKEN=your_auth_token
```

> **Note**: The app works perfectly without these - they're only for future cloud sync features.

## 📱 PWA Installation

### Install on Mobile
1. Open app in mobile browser
2. Look for "Add to Home Screen" prompt
3. Tap "Install" or "Add"
4. Launch from home screen like a native app

### Install on Desktop
1. Look for install icon in browser address bar
2. Click "Install" when prompted
3. Launch as desktop app

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/thakkir.git`
3. **Install** dependencies: `bun install`
4. **Create** feature branch: `git checkout -b feature/your-feature`
5. **Make** your changes and test thoroughly
6. **Submit** a pull request

### What We're Looking For
- 🎤 **Voice recognition improvements** - better Arabic support
- 🌍 **Internationalization** - support for more languages
- 🎨 **UI/UX enhancements** - better mobile experience
- 📊 **Analytics features** - dhikr tracking and insights
- 🔧 **Performance optimizations** - faster load times

## 🐛 Troubleshooting

### Voice Recognition Issues (Most Common)

> **🔧 Quick Fix**: Use manual counting instead - it's reliable and always works.

#### Voice Recognition Not Working At All
**Symptoms**: No response when speaking, microphone icon doesn't show activity
- ✅ **Check microphone permissions** in browser settings (chrome://settings/content/microphone)
- ✅ **Use Chrome or Edge** - Firefox and Safari have poor Web Speech API support
- ✅ **Refresh the page** and try again
- ✅ **Test in incognito mode** to rule out extension conflicts
- ❌ **If still not working**: This is a known limitation - use manual counting

#### Poor Recognition Accuracy (Expected Behavior)
**Symptoms**: Wrong dhikr detected, random words counted, missed phrases
- ⚠️ **This is normal** - voice recognition accuracy is currently very low
- ✅ **Use manual counting** for reliable dhikr tracking
- ✅ **Speak very slowly** and pause between phrases if testing voice features
- ✅ **Use English transliteration** instead of Arabic for slightly better results
- ✅ **Perfect quiet environment** required - any background noise will cause issues

#### Browser-Specific Issues
**Chrome/Edge (Best Support)**
- Generally works but with low accuracy
- May stop working randomly - restart recognition

**Safari (Limited Support)**
- Very inconsistent results
- Often fails to recognize Arabic completely
- iOS Safari may work better than desktop

**Firefox (Not Recommended)**
- Poor Web Speech API implementation
- May not work at all for Arabic
- Use Chrome/Edge instead

**Mobile Browsers**
- Results vary dramatically by device
- Older devices often don't work
- Use manual counting on mobile

#### When Voice Recognition Stops Working
**Common Causes:**
- Browser updated and broke compatibility
- Microphone permissions revoked
- System audio settings changed
- Network connectivity issues (some browsers require internet)

**Solutions:**
1. **Reset browser permissions** for the site
2. **Clear browser cache** and cookies
3. **Restart the browser** completely
4. **Test on different device/browser**
5. **Fall back to manual counting** (recommended)

### General App Issues

**App Won't Load**
- Clear browser cache and cookies
- Check internet connection
- Try incognito/private mode
- Disable browser extensions temporarily

**Manual Counting Not Working**
- This should always work - if not, report as critical bug
- Try refreshing the page
- Check if JavaScript is enabled

**PWA Installation Problems**
- Use Chrome or Safari for installation
- Check if already installed (look in app drawer/start menu)
- Try uninstalling and reinstalling
- Some browsers don't support PWA installation

**Performance Issues**
- App running slowly may indicate browser compatibility issues
- Try different browser
- Close other tabs to free up memory
- Restart browser if problems persist

### Getting Help

If you're experiencing issues:

1. **Try manual counting first** - it's the reliable method
2. **Check browser compatibility** - use Chrome or Edge
3. **Report persistent bugs** on GitHub Issues with:
   - Browser type and version
   - Operating system
   - Specific error messages
   - Steps to reproduce

> **Remember**: Voice recognition is experimental. Manual counting is the primary, reliable method for dhikr tracking.

## 📊 Features Roadmap

### Current (v1.0)
- ✅ **Manual dhikr counting** - Reliable tap-to-count functionality
- ✅ **One-page responsive design** - Clean mobile-first layout
- ✅ **Offline PWA functionality** - Works without internet
- ✅ **Real-time progress tracking** - Visual feedback and statistics
- ⚠️ **Experimental voice recognition** - Limited accuracy, needs improvement

### High Priority (v1.1) - Voice Recognition Overhaul
- 🔧 **Improved Arabic speech recognition** - Better pattern matching and pronunciation handling
- 🔧 **Audio preprocessing** - Noise reduction and signal enhancement
- 🔧 **Enhanced browser compatibility** - More consistent cross-platform behavior
- 🔧 **Confidence indicators** - Real-time feedback on recognition quality
- 🔧 **Fallback mechanisms** - Graceful degradation when voice fails

### Coming Soon (v1.2)
- 🔄 **Cloud sync and backup** - Save dhikr sessions across devices
- 📊 **Enhanced analytics** - Detailed progress tracking and insights
- 🌙 **Islamic calendar integration** - Prayer times and Islamic dates
- 🎨 **Accessibility improvements** - Better support for assistive technologies

### Future (v2.0)
- 🎤 **Advanced voice features** - Custom dhikr phrases and voice commands
- 📚 **Extended dhikr library** - More Islamic prayers and supplications
- 👥 **Community features** - Share progress and join dhikr circles
- 🌍 **Multi-language interface** - Support for more languages beyond Arabic/English
- 🔔 **Smart notifications** - Prayer reminders and dhikr suggestions

## 🙏 Acknowledgments

- **Inspiration**: Islamic tradition of dhikr and remembrance of Allah
- **Voice Technology**: Built on Web Speech API standards
- **Community**: Muslim developers who provided feedback and testing
- **Design**: Inspired by Islamic art and typography

## 📞 Support & Community

- **🐛 Report Issues**: [GitHub Issues](https://github.com/AmrElsayyad/thakkir/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/AmrElsayyad/thakkir/discussions)
- **📧 Contact**: [Open an issue](https://github.com/AmrElsayyad/thakkir/issues/new) for questions

---

**May Allah accept our dhikr and grant us consistency in His remembrance. Ameen.** 🤲

*Built with ❤️ for the Muslim Ummah*
