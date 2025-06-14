# 🎤 Thakkir - Enhanced Voice-Enabled Islamic Dhikr Counter

Thakkir is a modern, voice-enabled Islamic dhikr counter PWA (Progressive Web App) built with Next.js 15. Experience seamless dhikr counting with **advanced Arabic voice recognition** powered by enhanced pattern matching and intelligent duplicate detection.

## 🌟 Revolutionary Voice Recognition

**The first Islamic dhikr counter that listens to your voice!**

- 🗣️ **Speak Naturally**: Just say "SubhanAllah" and watch the counter increment
- 🌍 **Multilingual**: Recognizes both Arabic pronunciation and transliteration
- ⚡ **Instant Response**: Real-time recognition with immediate feedback
- 🎯 **Smart Detection**: Automatically identifies which dhikr you're reciting
- 🔊 **Offline Capable**: Voice recognition works without internet

## ✨ Enhanced Features

### 🎙️ Advanced Voice Recognition
- **Enhanced Arabic Support**: Improved pattern matching for better recognition of Islamic phrases
- **Dual Language Processing**: Supports both Arabic and English transliterations
- **Fuzzy Matching**: Intelligent recognition even with pronunciation variations
- **Confidence Scoring**: Real-time confidence feedback for better accuracy
- **Continuous Listening**: Automatic restart and session management
- **Offline Capability**: Works without internet connection

### 🗃️ Intelligent Data Management
- **Duplicate Detection**: Automatically identifies and removes duplicate dhikr sessions
- **Data Integrity Checks**: Comprehensive database health monitoring
- **Smart Cleanup**: Keeps the most complete sessions while removing duplicates
- **Orphaned Data Removal**: Cleans up sessions with missing templates
- **Performance Optimization**: Improved app speed through data cleanup

### 📱 Core Features
- **5 Essential Dhikr**: SubhanAllah, Alhamdulillah, Allahu Akbar, La ilaha illa Allah, Astaghfirullah
- **Real-time Counting**: Voice and manual counting with instant feedback
- **Progress Tracking**: Visual progress bars and session statistics
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **PWA Ready**: Install on your device for offline access
- **Local Storage**: Data persistence with IndexedDB

## ✨ Key Features

### Voice-Powered Counting
- **🎤 Voice Recognition**: Primary feature - count by speaking dhikr
- **👆 Manual Backup**: Traditional tap counting still available
- **🔄 Offline-First**: Works completely offline with automatic sync when online
- **📱 One-Page Design**: Perfectly optimized single-page layout for any screen
- **🎯 Smart Progress**: Set target counts and track your dhikr journey
- **💾 Cloud Sync**: Local SQLite database with Turso cloud synchronization

### Supported Voice Dhikr
The app recognizes these dhikr in both Arabic and transliteration:

- **سُبْحَانَ اللَّهِ** (SubhanAllah) - "Glory be to Allah"
- **الْحَمْدُ لِلَّهِ** (Alhamdulillah) - "All praise is due to Allah"  
- **اللَّهُ أَكْبَرُ** (Allahu Akbar) - "Allah is the Greatest"
- **لَا إِلَهَ إِلَّا اللَّهُ** (La ilaha illa Allah) - "There is no god but Allah"
- **أَسْتَغْفِرُ اللَّهَ** (Astaghfirullah) - "I seek forgiveness from Allah"

### Dhikr Library
- **📚 Pre-loaded Templates**: All common Islamic dhikr with voice recognition
- **🌐 Multi-language**: Arabic, transliteration, and English translations
- **✨ Beautiful Typography**: Authentic Arabic fonts (Amiri, Noto Sans Arabic)

### Technical Features
- **🔌 PWA Ready**: Installable as native app on mobile devices
- **⚡ Client-First Architecture**: Immediate functionality, optional persistence
- **🌐 Cross-Platform**: Works on iOS, Android, Windows, macOS, and web browsers
- **🎭 Smooth Animations**: Framer Motion animations and transitions
- **🎨 Modern UI**: Tailwind CSS with Islamic color scheme
- **♿ Accessible**: WCAG compliant with proper ARIA labels
- **🔧 Zero-Config**: Works instantly without any setup required

## 🛠 Technology Stack

### Frontend
- **Next.js** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **Zustand** - Lightweight state management

### Database & Backend
- **Turso** - SQLite at the edge with offline sync
- **libSQL** - Turso's SQLite fork with sync capabilities
- **Database-per-User** - Isolated user data architecture

### PWA & Performance
- **Next-PWA** - Service worker and PWA functionality
- **Workbox** - Advanced caching strategies
- **Offline Support** - Full app functionality without internet

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **Bun** (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/thakkir.git
cd thakkir

# Install dependencies with Bun (recommended)
bun install

# Or with npm
npm install

# Start development server
bun dev
# Or with npm
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🎯 Voice Recognition Guide

### Supported Phrases
The enhanced voice recognition system supports multiple variations of each dhikr:

#### SubhanAllah (سُبْحَانَ اللَّهِ)
- Arabic: "سبحان الله"
- English: "subhan allah", "subhanallah", "sobhan allah"

#### Alhamdulillah (الْحَمْدُ لِلَّهِ)
- Arabic: "الحمد لله"
- English: "alhamdulillah", "al hamdu lillah", "elhamdulillah"

#### Allahu Akbar (اللَّهُ أَكْبَرُ)
- Arabic: "الله أكبر"
- English: "allahu akbar", "allah akbar", "allah u akbar"

#### La ilaha illa Allah (لَا إِلَهَ إِلَّا اللَّهُ)
- Arabic: "لا إله إلا الله"
- English: "la ilaha illa allah", "la ilaha illallah"

#### Astaghfirullah (أَسْتَغْفِرُ اللَّهَ)
- Arabic: "أستغفر الله"
- English: "astaghfirullah", "astagh firullah"

### Tips for Better Recognition
1. **Speak Clearly**: Pronounce each word distinctly
2. **Normal Pace**: Don't speak too fast or too slow
3. **Quiet Environment**: Minimize background noise
4. **Microphone Permission**: Ensure browser has microphone access
5. **Supported Browsers**: Use Chrome, Safari, or Firefox for best results

## 🛠️ Data Management

### Automatic Cleanup
The app includes intelligent data cleanup features:

- **Duplicate Detection**: Finds sessions with same template, user, and timeframe
- **Smart Preservation**: Keeps the most complete and recent sessions
- **Integrity Checks**: Regular database health monitoring
- **Performance Boost**: Improved app speed after cleanup

### Manual Cleanup
Access the cleanup tool:
1. Look for the "Cleanup" button in the status banner (SQLite mode only)
2. Review the integrity report
3. Run cleanup to remove duplicates and orphaned data
4. App will reload with cleaned data

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom voice UI components
- **Voice Recognition**: Enhanced Web Speech API with custom pattern matching
- **State Management**: Zustand with persistence
- **Database**: IndexedDB via custom SQLite service
- **PWA**: Next.js PWA configuration

### Enhanced Voice Recognition System
```typescript
// Advanced pattern matching with confidence scoring
const DHIKR_PATTERNS = {
  subhanallah: {
    arabic: ["سبحان الله", "سُبْحَانَ اللَّهِ"],
    transliteration: ["subhan allah", "subhanallah", "sobhan allah"],
    keywords: ["subhan", "sophan", "sobhan"],
    weight: 1.0
  }
  // ... more patterns
};

// Fuzzy matching with similarity scoring
function detectDhikrAdvanced(transcript: string) {
  // Exact match (95% confidence)
  // Keyword matching (85% confidence)  
  // Fuzzy matching with Levenshtein distance
  return { dhikr, confidence, method };
}
```

### Data Deduplication
```typescript
// Intelligent duplicate detection
class DataDeduplication {
  // Find duplicates based on:
  // - Same user and template
  // - Started within 5 minutes
  // - Similar target count
  static async findDuplicateSessions()
  
  // Keep best session (completed > higher count > more recent)
  static async removeDuplicateSessions()
}
```

## 🎨 Customization

### Voice Recognition Settings
```typescript
// Configure recognition behavior
const voiceConfig = {
  language: "both", // "arabic" | "english" | "both"
  continuousListening: true,
  confidenceThreshold: 0.6,
  autoRestart: true
};
```

### Database Configuration
```typescript
// Choose database mode
const dbConfig = {
  type: "sqlite", // "sqlite" | "demo"
  autoCleanup: true,
  integrityChecks: true
};
```

## 📱 PWA Installation

### Mobile Installation
1. Open the app in your mobile browser
2. Look for "Add to Home Screen" prompt
3. Follow the installation steps
4. Launch from your home screen

### Desktop Installation
1. Look for the install icon in your browser's address bar
2. Click "Install" when prompted
3. Launch as a native app

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Fork and clone the repository
git clone https://github.com/yourusername/thakkir.git

# Create a feature branch
git checkout -b feature/enhanced-recognition

# Make your changes and test thoroughly
bun dev

# Submit a pull request
```

## 🐛 Troubleshooting

### Voice Recognition Issues
- **Not Working**: Check microphone permissions in browser settings
- **Poor Accuracy**: Ensure quiet environment and clear pronunciation
- **Browser Support**: Use Chrome, Safari, or Firefox for best results

### Data Issues
- **Duplicates**: Use the built-in cleanup tool in SQLite mode
- **Missing Data**: Check if you're in demo mode vs SQLite mode
- **Performance**: Run data cleanup to optimize database

### General Issues
- **App Not Loading**: Clear browser cache and reload
- **PWA Problems**: Try reinstalling the PWA
- **Audio Issues**: Check device audio settings

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Inspiration**: [Tarteel](https://tarteel.ai) for advanced Arabic voice recognition patterns
- **Voice Recognition**: Enhanced with custom pattern matching algorithms
- **Islamic Content**: Traditional dhikr phrases with proper Arabic text
- **Community**: Muslim developers and users who provided feedback

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/thakkir/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/thakkir/discussions)
- **Email**: support@thakkir.app

---

**May Allah accept our dhikr and grant us His remembrance at all times. Ameen.** 🤲

*Built with ❤️ for the Muslim Ummah*
