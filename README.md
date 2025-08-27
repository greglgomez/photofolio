# Photography Portfolio Website

A clean, minimalist photography portfolio website with smooth animations and a responsive design. Perfect for showcasing your photography on GitHub Pages.

## Features

- **Clean & Minimalist Design**: Modern, elegant layout that puts focus on your photography
- **Smooth Animations**: Subtle hover effects and smooth transitions throughout
- **Responsive Gallery**: Automatically adapts to different screen sizes
- **Fullscreen Modal**: Click any image to view it in fullscreen with navigation
- **Keyboard Navigation**: Use arrow keys and Escape to navigate in fullscreen mode
- **Touch Support**: Swipe gestures work on mobile devices
- **Lazy Loading**: Images load as you scroll for better performance
- **Dark Theme**: Sophisticated dark theme perfect for photography
- **Tiled Layout**: Dynamic masonry-style grid that respects image aspect ratios

## Quick Start

### 1. Add Your Images
Place your photography images in the `images/` folder:
- Supported formats: JPG, PNG, GIF, WebP, BMP, TIFF
- Recommended size: At least 800px wide for best quality
- The website will automatically detect and display them

### 2. Deploy to GitHub Pages

1. **Create a new repository** on GitHub
2. **Push your code**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
3. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll down to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

Your portfolio will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

### 3. Customize
- **Title**: Edit the title and subtitle in `index.html`
- **Colors**: Modify the CSS variables in `styles.css`
- **Layout**: Adjust the grid settings in the CSS for different gallery layouts

## Local Development

For local development and testing:

```bash
# Using Python (recommended)
python3 server.py

# Using Node.js
npm start

# Or simply open index.html in your browser
```

## File Structure

```
vibefolio/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript functionality
├── images/             # Your photography images go here
├── server.py           # Local development server
├── package.json        # Node.js dependencies
└── README.md           # This file
```

## How It Works

The website automatically detects images in the `images/` folder using intelligent naming pattern recognition. It supports common camera naming conventions like:
- `DSC001.jpg`, `DSC002.jpg` (Sony cameras)
- `IMG_001.jpg`, `IMG_002.jpg` (Canon cameras)
- `photo1.jpg`, `photo2.jpg` (Generic naming)
- `1.jpg`, `2.jpg` (Simple numbering)

## Customization

### Changing Colors
Edit the CSS variables in `styles.css`:
- Background color: `#0a0a0a`
- Text color: `#ffffff`
- Accent colors: Various shades in the CSS

### Changing Fonts
The website uses Inter font by default. You can change this in the CSS or add Google Fonts links in the HTML.

### Adding More Features
The JavaScript is modular and easy to extend. You can add:
- Image captions
- Categories/filtering
- Social media links
- Contact information

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

- Optimize your images before adding them (compress JPGs, use WebP when possible)
- Keep image files under 2MB each for fast loading
- Use consistent aspect ratios for a more uniform gallery layout

## License

This project is open source and available under the MIT License.
