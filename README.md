# 🎤 Thakkir - Voice-Enabled Islamic Dhikr Counter

A revolutionary Islamic dhikr counter PWA with **voice recognition** as the core feature. Simply speak your dhikr and watch the counter increment automatically. Built with Next.js, Turso database, and cutting-edge voice technology.

## 🌟 Revolutionary Voice Recognition

**The first Islamic dhikr counter that listens to your voice!**

- 🗣️ **Speak Naturally**: Just say "SubhanAllah" and watch the counter increment
- 🌍 **Multilingual**: Recognizes both Arabic pronunciation and transliteration
- ⚡ **Instant Response**: Real-time recognition with immediate feedback
- 🎯 **Smart Detection**: Automatically identifies which dhikr you're reciting
- 🔊 **Offline Capable**: Voice recognition works without internet

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

## 🚀 Getting Started

### Prerequisites
- **Bun** - JavaScript runtime and package manager
- **Node.js** - For compatibility

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd thakkir
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Run the development server**
   ```bash
   bun run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

The app will work immediately in **demo mode** with voice recognition! Your dhikr counts won't be permanently saved, but all features are functional.

### Database Setup (Optional)

For permanent data storage and cloud sync, set up Turso:

1. **Sign up at [turso.tech](https://turso.tech/)**

2. **Install Turso CLI**
   ```bash
   # macOS
   brew install tursodatabase/tap/turso
   
   # Linux/Windows
   curl -sSfL https://get.tur.so/install.sh | bash
   ```

3. **Create your database**
   ```bash
   turso auth login
   turso db create thakkir-dhikr
   turso db show thakkir-dhikr  # Get your database URL
   turso db tokens create thakkir-dhikr  # Get your auth token
   ```

4. **Create `.env.local` file**
   ```bash
   # Add these to your .env.local file:
   NEXT_PUBLIC_TURSO_DATABASE_URL=libsql://your-database-name.turso.io
   NEXT_PUBLIC_TURSO_AUTH_TOKEN=your-auth-token-here
   ```

5. **Restart the development server**
   Your dhikr sessions will now be saved permanently!

### Troubleshooting

**Voice recognition not working?**
- Ensure you're using a modern browser (Chrome, Safari, Firefox)
- Allow microphone access when prompted
- Check that your microphone is working in other applications
- Try speaking clearly and close to the microphone

**Database/persistence questions?**
- The app works perfectly without any database setup (demo mode)
- Demo mode has full voice recognition - dhikr counts just aren't saved between sessions
- Blue info banner indicates demo mode (this is normal and expected)
- For permanent storage, follow the Database Setup section above

## 📱 Usage

### Voice-Powered Counting (Primary Method)
1. **Open the app** in a modern browser (Chrome, Safari, Firefox)
2. **Allow microphone access** when prompted
3. **Select your dhikr** from the dropdown
4. **Set your target count** (default: 33)
5. **Click "Start Voice Dhikr"**
6. **Begin speaking** your chosen dhikr - the counter increments automatically!
7. **View real-time feedback** showing what was recognized
8. **Complete your session** when target is reached

### Manual Counting (Backup Method)
1. Select a dhikr from the dropdown
2. Set a target count (optional) 
3. Use "Manual +1" button to increment
4. Track your progress visually

### Offline Usage
- The app works completely offline
- Your dhikr counts are saved locally
- Data syncs automatically when you reconnect
- Offline indicator shows connection status

### PWA Installation
1. Open the app in your browser
2. Look for "Install" or "Add to Home Screen" prompt
3. Install to use as a native app
4. Launch from your home screen or app drawer

## 🏗 Architecture

### Database Schema
```sql
-- Dhikr templates (pre-loaded Islamic dhikr)
dhikr_templates (id, arabic_text, transliteration, translation, category, reference)

-- User sessions (counting sessions)
dhikr_sessions (id, user_id, dhikr_template_id, count, target_count, started_at, completed_at)

-- Individual counts (detailed tracking)
dhikr_counts (id, session_id, count_method, timestamp)

-- User goals and preferences
user_goals (id, user_id, dhikr_template_id, daily_target, weekly_target)
```

### Offline-First Strategy
1. **Local-First Writes**: All data written to local SQLite first
2. **Background Sync**: Automatic sync when online
3. **Conflict Resolution**: Simple last-write-wins for dhikr data
4. **Graceful Degradation**: Full functionality offline

### State Management
- **Zustand Store**: Centralized state with persistence
- **Database Service**: Clean separation of concerns
- **Sync Manager**: Handles online/offline transitions

## 🔧 Scripts

```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
bun run type-check   # Run TypeScript checks

# Database
bun run db:migrate   # Run database migrations (if needed)
bun run db:seed      # Seed default dhikr templates
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Islamic Content**: Traditional dhikr sourced from authentic Islamic texts
- **Design Inspiration**: Islamic geometric patterns and calligraphy
- **Turso Team**: For the excellent offline-first database solution
- **Muslim Developer Community**: For feedback and contributions

## 📞 Support

For questions, issues, or contributions:
- Open an issue on GitHub
- Reach out to the development team
- Check the documentation for common solutions

---

**May Allah accept our dhikr and grant us taqwa** 🤲

*Built with ❤️ for the Muslim community*
