# 🕌 Dhikr Counter - Islamic Prayer App

An offline-first Progressive Web App (PWA) for Islamic dhikr (remembrance) counting, built with Next.js, Turso database, and modern web technologies.

## ✨ Features

### Core Functionality
- **🔄 Offline-First**: Works completely offline with automatic sync when online
- **👆 Touch Counter**: Large, responsive counter button with haptic feedback
- **🎯 Progress Tracking**: Set target counts (33, 99, 100, or custom)
- **📊 Visual Progress**: Beautiful circular progress indicator
- **🎨 Islamic Design**: Arabic fonts and Islamic-themed UI elements
- **💾 Data Persistence**: Local SQLite database with cloud sync via Turso

### Dhikr Library
- **📚 Pre-loaded Templates**: Common Islamic dhikr with Arabic text, transliteration, and translations
- **🌐 Multi-language**: Arabic, transliteration, and English translations
- **✨ Beautiful Typography**: Authentic Arabic fonts (Amiri, Noto Sans Arabic)

### Technical Features
- **🔌 PWA Ready**: Installable as native app on mobile devices
- **⚡ Real-time Sync**: Automatic background synchronization
- **🌐 Cross-Platform**: Works on iOS, Android, Windows, macOS, and web browsers
- **🎭 Smooth Animations**: Framer Motion animations and transitions
- **🎨 Modern UI**: Tailwind CSS with Islamic color scheme
- **♿ Accessible**: WCAG compliant with proper ARIA labels

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

3. **Setup environment (optional)**
   ```bash
   cp .env.local.example .env.local
   ```
   
   For local development, you can leave the Turso variables empty to use local SQLite files.

4. **Run the development server**
   ```bash
   bun run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Setup with Turso

For production deployment with cloud sync:

1. **Create a Turso account** at [turso.tech](https://turso.tech)

2. **Create a new database**
   ```bash
   turso db create dhikr-app
   ```

3. **Get your database URL and auth token**
   ```bash
   turso db show dhikr-app
   turso db tokens create dhikr-app
   ```

4. **Update your environment variables**
   ```bash
   NEXT_PUBLIC_TURSO_URL=libsql://your-db-name.turso.io
   NEXT_PUBLIC_TURSO_AUTH_TOKEN=your-auth-token
   ```

## 📱 Usage

### Basic Counting
1. Select a dhikr from the dropdown
2. Set a target count (optional)
3. Tap "Start" to begin your session
4. Tap the counter or progress ring to increment
5. The app tracks your progress automatically

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
