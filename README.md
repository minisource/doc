# Fumadocs + Payload CMS Integration

A comprehensive documentation platform combining the power of [Fumadocs](https://fumadocs.dev) and [Payload CMS](https://payloadcms.com), featuring dynamic navigation, component system, OpenAPI documentation, and full CMS-driven content management.

![Fumadocs + Payload CMS](public/fumadocs-payloadcms-landing-page.png)

## ✨ Features

### 🚀 Core Features
- **Full-Stack Documentation**: Modern documentation platform with Fumadocs UI
- **CMS-Driven Content**: Payload CMS for content management and administration
- **Dynamic Navigation**: Header and sidebar navigation managed through CMS
- **Component System**: Rich content components (accordions, callouts, code blocks, etc.)
- **OpenAPI Integration**: Interactive API documentation from OpenAPI specs
- **Theme System**: Environment-driven theming with multiple color schemes
- **RTL Support**: Right-to-left language support (Persian, Arabic, Hebrew)
- **Search Integration**: Full-text search across documentation
- **Responsive Design**: Mobile-first responsive design

### 🎨 Theme System
- **11 Built-in Themes**: neutral, dusk, ocean, purple, black, catppuccin, shadcn, vitepress, etc.
- **Environment Configuration**: Set theme via `FUMADOCS_THEME` environment variable
- **Build-time Theme Selection**: Automatic CSS import based on configuration

### 🌐 Internationalization
- **Multi-language Support**: English, Spanish, French, German, Persian
- **RTL Layout**: Automatic right-to-left layout for Persian and other RTL languages
- **Dynamic Locale**: Configure default locale via `FUMADOCS_DEFAULT_LOCALE`

### 📚 Content Management
- **Rich Text Editor**: Payload's Lexical-based rich text editor
- **Component Integration**: Insert Fumadocs components via placeholders (`{{component}}`)
- **Version Control**: Document versioning and draft management
- **Media Management**: Image and file uploads with Vercel Blob/S3 integration

### 🔧 Developer Experience
- **TypeScript**: Full TypeScript support with generated types
- **Environment Variables**: Comprehensive configuration via env vars
- **Build Scripts**: Automated theme setup and build optimization
- **Database**: SQLite with option for PostgreSQL/Turso
- **Deployment Ready**: Vercel, Netlify, and other platform support

## 🏗️ Architecture

```
├── Payload CMS (Admin Panel)
│   ├── Collections
│   │   ├── Docs (Documentation pages)
│   │   ├── NavigationLinks (Header navigation)
│   │   ├── SidebarGroups (Navigation categories)
│   │   ├── SidebarItems (Navigation items)
│   │   ├── Components (Rich content components)
│   │   └── OpenAPISpecs (API documentation)
│   └── Media (File uploads)
│
├── Fumadocs (Documentation UI)
│   ├── Dynamic Navigation
│   ├── Component Rendering
│   ├── Search Integration
│   └── OpenAPI Documentation
│
└── Configuration
    ├── Environment Variables
    ├── Theme System
    └── Build Scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/fumadocs-payloadcms.git
cd fumadocs-payloadcms
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Environment Setup**
```bash
cp .env.example .env
```

4. **Configure Environment Variables**
```env
# Database
DATABASE_URI="file:./sqlite.db"

# Payload CMS
PAYLOAD_SECRET="your-secret-key"

# Fumadocs Configuration
FUMADOCS_TITLE="My Documentation"
FUMADOCS_THEME="neutral"
FUMADOCS_DEFAULT_LOCALE="en"
FUMADOCS_USE_DYNAMIC_NAV="true"
FUMADOCS_CUSTOM_LAYOUT_WIDTH="false"

# Optional: External Services
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

5. **Run Database Migrations**
```bash
npm run dev
# Visit http://localhost:3000/admin to complete setup
```

6. **Seed Sample Data**
```bash
# In browser, visit: http://localhost:3000/api/seed
# Or use the admin panel
```

## 📖 Usage

### Content Management

#### Creating Documentation Pages
1. Go to **Payload Admin** → **Docs Collection**
2. Create new documentation pages with rich text content
3. Use component placeholders: `{{callout}}`, `{{accordion}}`, etc.

#### Managing Navigation
1. **Header Navigation**: **NavigationLinks Collection**
2. **Sidebar Navigation**: **SidebarGroups** and **SidebarItems Collections**
3. Set order and enable/disable items as needed

#### Adding Components
1. **Components Collection**: Define reusable components
2. Set placeholders and configuration
3. Components render automatically in documentation

#### API Documentation
1. **OpenAPISpecs Collection**: Upload OpenAPI/Swagger files
2. Configure servers and authentication
3. Access at `/api/{slug}` (e.g., `/api/v1`)

### Theme Configuration

#### Changing Theme
```bash
# Set theme in .env
FUMADOCS_THEME=dusk

# Apply theme
npm run setup-theme

# Restart development server
npm run dev
```

#### Available Themes
- `neutral` (default)
- `dusk`, `ocean`, `purple`
- `black`, `catppuccin`
- `shadcn`, `vitepress`
- `preset`, `shiki`

### Language Configuration

#### RTL Support
```bash
# Enable Persian with RTL
FUMADOCS_DEFAULT_LOCALE=fa
```

#### Supported Locales
- `en` - English (LTR)
- `es` - Spanish (LTR)
- `fr` - French (LTR)
- `de` - German (LTR)
- `fa` - Persian (RTL)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URI` | Database connection string | `file:./sqlite.db` |
| `PAYLOAD_SECRET` | Payload CMS secret key | Required |
| `FUMADOCS_TITLE` | Site title | `"Documentation Platform"` |
| `FUMADOCS_THEME` | UI theme | `"neutral"` |
| `FUMADOCS_DEFAULT_LOCALE` | Default language | `"en"` |
| `FUMADOCS_GITHUB_URL` | GitHub repository URL | - |
| `FUMADOCS_USE_DYNAMIC_NAV` | Enable CMS navigation | `"true"` |
| `FUMADOCS_CUSTOM_LAYOUT_WIDTH` | Custom layout width | `"false"` |

### Build Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Setup theme (run automatically on build)
npm run setup-theme

# Clean database
npm run clean
```

## 📚 Component System

### Available Components

| Component | Placeholder | Description |
|-----------|-------------|-------------|
| Callout | `{{callout}}` | Info/warning/error messages |
| Accordion | `{{accordion}}` | Collapsible content sections |
| Banner | `{{banner}}` | Prominent notification banners |
| Code Block | `{{code-block}}` | Syntax-highlighted code |
| Steps | `{{steps}}` | Numbered step instructions |
| Type Table | `{{type-table}}` | API type definitions |

### Custom Components

1. Add to **Components Collection**
2. Define placeholder and configuration
3. Components render automatically

## 🔍 API Documentation

### OpenAPI Integration

#### Setup
1. **Install Package**: `npm install fumadocs-openapi`
2. **Upload Spec**: Add OpenAPI JSON/YAML to **OpenAPISpecs Collection**
3. **Configure**: Set servers, authentication, and metadata
4. **Access**: Visit `/api/{slug}` for interactive documentation

#### Features (After Package Installation)
- ✅ Interactive API testing
- ✅ Request/response examples
- ✅ Authentication UI
- ✅ Multiple server environments
- ✅ Version management

#### Current Status
The OpenAPI collection and basic infrastructure are ready. Install `fumadocs-openapi` to enable full interactive API documentation.

## 🐳 Docker Deployment

### Quick Start with Docker

#### Prerequisites
- Docker and Docker Compose installed
- At least 2GB RAM available

#### Production Deployment
```bash
# 1. Clone and setup environment
git clone <repository-url>
cd fumadocs-payloadcms
cp .env.example .env
# Edit .env with your configuration

# 2. Build and start with Docker Compose
make setup

# Or manually:
docker-compose build
docker-compose up -d

# 3. Check health
curl http://localhost:3000/api/health
```

#### Development with Docker
```bash
# Start development environment with hot reload
make setup-dev

# Or manually:
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

### Docker Commands

#### Using Make (Recommended)
```bash
make help           # Show all available commands
make build          # Build production image
make up             # Start production containers
make dev            # Start development containers
make down           # Stop all containers
make logs           # Show container logs
make restart        # Restart containers
make shell          # Open shell in container
make clean          # Remove containers and volumes
```

#### Using Docker Compose Directly
```bash
# Production
docker-compose build
docker-compose up -d
docker-compose logs -f

# Development
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
docker-compose -f docker-compose.yml -f docker-compose.override.yml logs -f

# Database operations
docker-compose exec fumadocs-payloadcms npx payload migrate
docker-compose exec fumadocs-payloadcms npm run seed
```

### Docker Configuration

#### Environment Variables
Set these in your `.env` file:
```env
# Database
DATABASE_URI=file:./sqlite.db

# Payload CMS
PAYLOAD_SECRET=your-super-secret-key

# Fumadocs
FUMADOCS_TITLE="My Documentation"
FUMADOCS_THEME=neutral
FUMADOCS_USE_DYNAMIC_NAV=true
```

#### Volumes
- `sqlite_data`: Persists SQLite database
- `media_data`: Stores uploaded files
- `postgres_data`: PostgreSQL data (if using PostgreSQL)

#### Networks
- `fumadocs-network`: Isolated container network

### Docker Image Details

#### Multi-stage Build
- **deps**: Installs dependencies
- **builder**: Builds the application
- **runner**: Production runtime (minimal image)

#### Security Features
- Non-root user (`nextjs`)
- Proper signal handling (`dumb-init`)
- Minimal attack surface

#### Performance Optimizations
- Layer caching
- Standalone Next.js output
- Compressed production image

## 🚀 Other Deployment Options

### Vercel (Recommended for Serverless)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For production database, use Vercel Postgres or Turso
```

### Netlify
```bash
# Build command
npm run build

# Publish directory
.next
```

### Railway, Render, or Fly.io
```bash
# Use the provided Dockerfile
# Set environment variables in dashboard
# Deploy from Git repository
```

### Environment Variables
Set all environment variables in your deployment platform's dashboard.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Fumadocs](https://fumadocs.dev) - Modern documentation framework
- [Payload CMS](https://payloadcms.com) - Headless CMS platform
- [Next.js](https://nextjs.com) - React framework
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework

## 📞 Support

- 📖 [Documentation](https://your-docs-site.com)
- 🐛 [Issues](https://github.com/your-org/fumadocs-payloadcms/issues)
- 💬 [Discussions](https://github.com/your-org/fumadocs-payloadcms/discussions)

---

Built with ❤️ using Fumadocs and Payload CMS