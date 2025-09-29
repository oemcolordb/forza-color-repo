<div align="center">
<img width="1200" height="475" alt="Forza Color Universe Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Forza Color Universe 🎨
<!-- Deploy trigger -->

**Explore 10,000+ Official Automotive Colors from Forza Racing Games**

[![Next.js](https://img.shields.io/badge/Next.js-15.1.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Netlify](https://img.shields.io/badge/Deployed%20on-Netlify-00C7B7?style=flat-square&logo=netlify)](https://netlify.com/)

</div>

## ✨ Features

- 🎨 **10,000+ Colors**: Comprehensive collection of official automotive paint colors
- 🔍 **Advanced Search**: Filter by manufacturer, model, year, and color type
- 🌓 **Dark/Light Mode**: Seamless theme switching with system preference detection
- 📱 **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- ⚡ **Performance Optimized**: Lazy loading, virtual scrolling, and efficient rendering
- 🎯 **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- 💾 **Favorites System**: Save and manage your favorite colors locally
- 📊 **Color Analytics**: Detailed HSB values and color type information
- 🚀 **PWA Ready**: Progressive Web App capabilities for offline usage
- 🔗 **Share Colors**: Easy sharing of individual colors and collections

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/forza-color-repo.git
   cd forza-color-repo
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and add your configuration:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

### Project Structure

```
forza-color-repo/
├── app/                    # Next.js App Router
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── services/              # Data services
│   └── colorData.ts       # Color data management
├── public/                # Static assets
├── netlify/               # Netlify functions
└── docs/                  # Documentation
```

## 🎨 Color Data

The application includes a comprehensive dataset of automotive colors extracted from Forza racing games, featuring:

- **Manufacturers**: 200+ automotive brands
- **Color Types**: Metal Flake, Normal, Two-Tone, Matte, Carbon Fiber, and more
- **Color Information**: HSB values, manufacturer details, model years
- **Search Capabilities**: Full-text search across all color properties

## 🚀 Deployment

### Netlify (Recommended)

1. **Connect your repository** to Netlify
2. **Set build settings**:
   - Build command: `npm run build`
   - Publish directory: `out`
3. **Configure environment variables** in Netlify dashboard
4. **Deploy** automatically on push to main branch

### Manual Deployment

```bash
npm run build
# Upload the 'out' directory to your hosting provider
```

## 🧪 Testing

The project includes comprehensive testing setup:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ResinRonin** - Original Forza color data extraction and curation
- **Forza Motorsport Series** - Source of automotive color data
- **Next.js Team** - Amazing React framework
- **Tailwind CSS** - Utility-first CSS framework

## 📞 Support

If you have any questions or need help:

- 📧 Email: support@forza-colors.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/forza-color-repo/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/forza-color-repo/discussions)

---

<div align="center">
  <p>Made with ❤️ by the Forza Color Universe team</p>
  <p>⭐ Star this repo if you find it useful!</p>
</div>