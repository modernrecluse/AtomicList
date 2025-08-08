# Atomic List Mobile - PWA

A beautiful hierarchical note-taking Progressive Web App (PWA) specifically rebuilt from the ground up for mobile devices. Features touch gestures, offline support, and a responsive design that adapts to any screen size.

## ✨ Features

### 🎯 Mobile-First Design
- **Touch Optimized**: All interactions designed for touch screens with proper touch targets (44px minimum)
- **Gesture Support**: 
  - Long press to select nodes
  - Swipe right to indent
  - Swipe left to outdent
  - Pull-to-refresh (coming soon)
- **Keyboard Aware**: Automatically adjusts layout when virtual keyboard appears
- **Safe Area Support**: Respects device notches and rounded corners

### 📝 Note Taking
- **Hierarchical Structure**: Organize thoughts in nested levels
- **Task Management**: Create tasks with `[]` syntax, complete with tap
- **Multiple Themes**: 8 beautiful themes including Matcha, Ocean, Midnight, and more
- **Instant Save**: All changes automatically saved to device storage

### 🔄 PWA Capabilities
- **Offline First**: Works completely offline once installed
- **App-like Experience**: Install to home screen, runs in standalone mode
- **Background Sync**: Seamless data synchronization
- **Fast Loading**: Optimized for mobile networks

### 🎨 Themes
- **Matcha** - Calming green tones
- **Latte** - Warm coffee-inspired colors
- **Ocean** - Cool blue palette
- **Sunset** - Warm orange and pink hues
- **Midnight** - Dark mode with purple accents
- **Plum** - Rich purple theme
- **Chess** - Clean black and white
- **Espresso** - Dark brown theme

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd atomic-list-mobile

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development
The app runs on `http://localhost:5173` by default and is accessible on your local network for mobile testing.

## 📱 Mobile Usage

### Basic Operations
1. **Adding Notes**: Type in the input field at the bottom and press Enter
2. **Creating Hierarchy**: Use the indent/outdent buttons or swipe gestures
3. **Task Creation**: Type `[]` to create a task, `[x]` for completed
4. **Theme Switching**: Tap the menu button (☰) and select a theme

### Gestures
- **Long Press**: Select a node to show action menu
- **Swipe Right**: Indent the selected node
- **Swipe Left**: Outdent the selected node  
- **Tap Circle**: Toggle task completion

### Menu Actions
- **Export Data**: Save your notes as JSON file
- **Import Data**: Load notes from JSON file
- **Clear All**: Remove all notes (with confirmation)
- **About**: Learn more about the app

## 🛠️ Technical Details

### Architecture
- **React 18** with TypeScript
- **Vite** for fast development and building
- **PWA Plugin** for service worker and manifest
- **Mobile-First CSS** with modern features

### Performance Optimizations
- **Code Splitting**: Vendor and icon chunks separated
- **Tree Shaking**: Unused code automatically removed
- **Image Optimization**: Sharp for PWA icon generation
- **Lazy Loading**: Components loaded on demand

### Storage
- **localStorage**: Primary storage for notes and settings
- **IndexedDB**: Fallback storage for better reliability
- **Data Migration**: Automatic migration from older versions

### Browser Support
- **Modern Browsers**: Chrome 88+, Safari 14+, Firefox 85+
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **PWA Features**: Full support on compatible browsers

## 🔧 Configuration

### Environment Variables
Create a `.env` file for custom configuration:

```env
VITE_APP_TITLE="My Atomic List"
VITE_APP_DESCRIPTION="Personal note taking app"
```

### PWA Customization
Edit `vite.config.ts` to customize PWA settings:
- App name and description
- Theme colors
- Icon configurations
- Caching strategies

## 📦 Building & Deployment

### Production Build
```bash
npm run build
```

The build creates optimized files in the `dist/` directory including:
- Service worker for offline functionality
- Web app manifest for installation
- Optimized and minified assets

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: Cloudflare, AWS CloudFront
- **Self-Hosted**: Any web server with HTTPS

### HTTPS Requirement
PWA features require HTTPS in production. Most hosting platforms provide this automatically.

## 🧪 Testing

### Mobile Testing
1. Connect mobile device to same network
2. Access `http://[your-ip]:5173`
3. Test touch gestures and responsiveness

### PWA Testing
1. Build the app: `npm run build`
2. Serve locally: `npm run preview`
3. Open in browser and test installation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Commit changes: `git commit -m "Add feature"`
5. Push to branch: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- [Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [Touch Events API](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

Built with ❤️ for mobile-first thinking and atomic note-taking.