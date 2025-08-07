# Atomic List - PWA

A beautiful hierarchical note-taking Progressive Web App with task management and multiple themes.

## 🚀 Live Demo

Visit the live PWA: [https://modernrecluse.github.io/AtomicList/](https://modernrecluse.github.io/AtomicList/)

## ✨ Features

- **📱 Progressive Web App** - Install on any device
- **🌐 Offline Support** - Works without internet connection
- **📝 Hierarchical Notes** - Organize thoughts with indentation
- **✅ Task Management** - Convert notes to tasks with completion tracking
- **🎨 Multiple Themes** - Matcha, Latte, Ocean, and more
- **📱 Touch Gestures** - Swipe to indent/outdent on mobile
- **⌨️ Keyboard Navigation** - Full keyboard support
- **💾 Export/Import** - Save as HTML or Markdown
- **🔗 Link Creation** - Connect related lists
- **📱 Mobile Optimized** - Perfect mobile experience

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/modernrecluse/AtomicList.git
cd AtomicList

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

### GitHub Pages (Automatic)

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

1. Push changes to the `main` or `master` branch
2. GitHub Actions will automatically build and deploy the PWA
3. Visit your GitHub Pages URL: `https://username.github.io/AtomicList/`

### Manual GitHub Pages Deployment

```bash
# Build and deploy manually
npm run deploy
```

### Other Hosting Platforms

The built files in `dist/` can be deployed to any static hosting service:

- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your GitHub repository
- **Firebase Hosting**: Use `firebase deploy`
- **Surge.sh**: Run `surge dist/`

## 📱 PWA Installation

### Desktop
- Visit the app in Chrome, Edge, or Firefox
- Look for the "Install" button in the address bar
- Click to install as a desktop app

### Mobile
- Visit the app in your mobile browser
- Tap the browser menu (⋮)
- Select "Add to Home Screen" or "Install App"

## 🔧 Configuration

### Base Path
For subdirectory deployment, update `base` in `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ...
})
```

### PWA Settings
Customize PWA settings in `vite.config.ts`:

```typescript
VitePWA({
  manifest: {
    name: 'Your App Name',
    short_name: 'App',
    description: 'Your app description',
    theme_color: '#your-color',
    background_color: '#your-bg-color',
    // ...
  }
})
```

## 🎯 Usage

### Creating Notes
- Type in the input field and press Enter
- Use Tab to indent (create sub-items)
- Use Shift+Tab to outdent

### Task Management
- Click the task icon to convert notes to tasks
- Click the circle to mark tasks as complete
- Tasks show completion status with strikethrough

### Navigation
- Use arrow keys to navigate between items
- Press 't' to toggle task status
- Press 'f' to focus and add notes
- Press 'x' to create linked lists
- Press 'd' to delete items

### Themes
- Click the palette icon to change themes
- Choose from Matcha, Latte, Ocean, Sunset, and more

### Export/Import
- Click the save icon to export as HTML or Markdown
- Use the upload icon to import previously saved lists

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **PWA**: Vite PWA Plugin with Workbox
- **Styling**: Tailwind CSS (via inline styles)
- **Icons**: Lucide React
- **Deployment**: GitHub Actions + GitHub Pages

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🐛 Issues

Found a bug or have a feature request? Please open an issue on GitHub.

---

Made with ❤️ for productive note-taking