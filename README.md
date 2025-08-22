# QuickNote

A sleek, modern note-taking application built with Electron that lives in your system tray, allowing you to capture thoughts instantly with global keyboard shortcuts.

## Features

### 🚀 Quick Capture
- **Global Hotkey**: Press `Ctrl+Alt+Space` anywhere to instantly open the quick capture modal
- **Smooth Animations**: Beautiful slide-down animation when opening, slide-up when closing
- **Multiple Note Types**: Organize notes as Ideas, Notes, Todos, Reminders, or Code snippets
- **Auto-dismiss**: Click outside or press `ESC` to close the capture modal
- **Smart Save**: Press `Ctrl+Enter` to quickly save your note

### 📝 Main Notes App
- **Global Access**: Press `Ctrl+Alt+N` to open/hide the main notes window
- **Rich Text Support**: Full markdown rendering with syntax highlighting for code blocks
- **Search & Filter**: Search through all your notes and filter by type
- **Tags System**: Automatically extract and organize notes with #tags
- **Dark Theme**: Easy on the eyes with a modern dark interface

### 💾 System Tray Integration
- **Always Running**: Minimizes to system tray instead of closing
- **Quick Access Menu**: Right-click the tray icon for:
  - Open QuickNote
  - Quick Capture
  - Quit Application
- **Double-Click**: Double-click tray icon to open main window

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup
1. Clone the repository
```bash
git clone [repository-url]
cd quicknote
```

2. Install dependencies
```bash
npm install
```

3. Start the application
```bash
npm start
```

### Building for Distribution
```bash
npm run build
```
This will create distributable packages in the `dist` folder.

## Usage

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+Alt+Space` | Toggle Quick Capture modal |
| `Ctrl+Alt+N` | Toggle Main Notes window |
| `Ctrl+Enter` | Save note (in Quick Capture) |
| `ESC` | Close Quick Capture |

### Quick Capture
1. Press `Ctrl+Alt+Space` from anywhere
2. Select note type (Idea, Note, Todo, Reminder, Code)
3. Add optional title
4. Type your content
5. Press the arrow button or `Ctrl+Enter` to save

### System Tray
- The app runs in the background and appears in your system tray
- Right-click the tray icon for quick access to all features
- The app stays running even when all windows are closed
- Use "Quit" from the tray menu to fully exit the application

## Features in Detail

### Note Types
- **💡 Idea**: For quick thoughts and inspirations
- **📝 Note**: General notes and information
- **✅ Todo**: Tasks and action items
- **⏰ Reminder**: Time-sensitive notes
- **💻 Code**: Code snippets with syntax highlighting

### Tag System
- Add hashtags anywhere in your notes (e.g., #project #important)
- Tags are automatically extracted and indexed
- Filter notes by tags in the main window

### Image Support
- Paste images directly into the quick capture modal
- Images are saved alongside your notes
- Perfect for screenshots and visual references

## Project Structure
```
quicknote/
├── src/
│   ├── main/
│   │   ├── main.js          # Main process & system tray
│   │   └── database.js      # SQLite database handler
│   └── renderer/
│       ├── index.html       # Main notes window
│       ├── quick-capture.html # Quick capture modal
│       └── quick-capture.js # Quick capture logic
├── assets/
│   ├── css/
│   │   ├── styles.css      # Main window styles
│   │   └── quick-capture.css # Quick capture styles
│   ├── icons/
│   │   └── icons.svg       # UI icons
│   └── icon.png            # System tray icon
├── data/
│   └── notes.db            # SQLite database (auto-created)
└── package.json
```

## Technologies Used
- **Electron**: Cross-platform desktop application framework
- **SQLite**: Lightweight database for storing notes
- **Marked.js**: Markdown parsing and rendering
- **Highlight.js**: Syntax highlighting for code blocks

## Customization

### Changing Keyboard Shortcuts
Edit the shortcuts in `src/main/main.js`:
```javascript
// Quick Capture shortcut
globalShortcut.register('CommandOrControl+Alt+Space', ...)

// Main Window shortcut
globalShortcut.register('CommandOrControl+Alt+N', ...)
```

### Styling
- Main window styles: `assets/css/styles.css`
- Quick capture styles: `assets/css/quick-capture.css`

## Troubleshooting

### App doesn't start
- Make sure all dependencies are installed: `npm install`
- Check if ports are available
- Try running with: `npm start`

### Keyboard shortcuts not working
- Ensure no other applications are using the same shortcuts
- On Windows, run as administrator if needed
- Check if the app is running in the system tray

### Notes not saving
- Check if the `data` folder exists and is writable
- Verify the database file isn't corrupted
- Check console for error messages

## Development

### Running in Development Mode
```bash
npm start
```

### Debugging
- Press `F12` in any window to open Developer Tools
- Check the console for error messages
- Main process logs appear in the terminal

## License
[Your License Here]

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## Support
For issues and questions, please open an issue on the repository.

---

Made with ❤️ using Electron
