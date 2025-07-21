# Memory Color Challenge 🎯

A brain-training memory game that tests your ability to remember and reproduce color sequences under time pressure. Built with modern web technologies and designed with accessibility and mobile-first principles.

## 🎮 Game Overview

**Memory Color Challenge** is an interactive puzzle game featuring two distinct game modes designed to challenge different aspects of memory and reaction skills:

### 🎯 **Game Modes**

#### **Levels Mode**
- **Progressive Difficulty**: Start with 4 colors on Level 1, increasing by 1 color each level
- **Fixed Secret Codes**: Each level has a unique shareable code (MEMO, PTRN, CLRS, etc.)
- **Time Pressure**: Complete patterns within decreasing time limits
- **20 Challenging Levels**: Unlock levels by completing sequences perfectly
- **Score System**: Earn points based on accuracy, speed, and level difficulty

#### **Challenge Mode (Rolling Sequence)**
- **Survival Gameplay**: Endless mode - survive as long as possible
- **Rolling Pattern**: Colors appear in continuous sequence with hidden elements
- **3-Second Timer**: Guess hidden colors within 3 seconds or face elimination
- **Dynamic Difficulty**: Sequences grow longer as you survive
- **Survival Scoring**: Your score is measured in seconds survived

### 🎮 **How to Play**

1. **Watch**: Memorize the color sequence as it's displayed
2. **Remember**: Colors disappear and you must recall the pattern
3. **Reproduce**: Click GREEN and RED buttons in the exact same order
4. **Survive**: In Challenge mode, guess hidden colors before time runs out

## ✨ Features

### 🎨 **User Experience**
- **Mobile-First Design**: Optimized for touch devices with large buttons (160px+ on mobile)
- **Color-Blind Friendly**: Unique patterns (circles for green, squares for red)
- **Keyboard Controls**: Use `Q` for green and `P` for red buttons
- **Accessibility**: Full screen reader support with ARIA live regions
- **Dark Theme**: Comfortable gaming experience with carefully chosen contrast

### 🧠 **Game Intelligence**
- **Smart Pattern Generation**: Allows up to 3 consecutive same colors for challenge
- **Anti-Exploit Protection**: Precise timing prevents AFK score inflation
- **Progressive Challenge**: Difficulty scales naturally with skill level
- **Memory Optimization**: Proper timer cleanup prevents memory leaks

### 📱 **Technical Excellence**
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Performance Optimized**: Smooth animations and efficient state management
- **Error Handling**: Graceful error recovery with user feedback
- **Local Storage**: Game progress saved automatically

## 🛠 Technology Stack

### **Frontend**
- **React 18** with TypeScript for type-safe component development
- **Vite** for fast development and optimized production builds
- **Tailwind CSS** for utility-first responsive design
- **shadcn/ui** components built on Radix UI primitives
- **TanStack Query** for server state management
- **Wouter** for lightweight client-side routing

### **Backend**
- **Node.js** with Express.js framework
- **TypeScript** with ES modules for type safety
- **Custom Rate Limiting** for API protection
- **Structured Error Handling** with proper HTTP status codes

### **Database**
- **PostgreSQL** via Neon Database (serverless)
- **Drizzle ORM** for type-safe database operations
- **Schema Validation** with Zod for runtime type checking

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn package manager

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/memory-color-challenge.git
cd memory-color-challenge
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Copy example environment file
cp .env.example .env

# Add your database URL (optional for development)
# DATABASE_URL=your_postgresql_connection_string
```

4. **Start development server**
```bash
npm run dev
```

The game will be available at `http://localhost:5000`

### **Production Build**
```bash
npm run build
npm start
```

## 🎯 Game Skills Developed

- **Working Memory**: Hold and manipulate information in your mind
- **Pattern Recognition**: Identify and remember complex sequences  
- **Reaction Speed**: Quick decision-making under time pressure
- **Focus & Concentration**: Sustained attention during challenging gameplay

## 📱 Mobile Optimization

The game is built with mobile-first principles:

- **Large Touch Targets**: All buttons exceed 56px for comfortable mobile use
- **Thumb-Zone Optimization**: Important actions within easy reach
- **Smooth Scrolling**: Native iOS scroll behavior
- **Viewport Optimization**: Properly sized modals and content
- **Performance**: Optimized for mobile devices with smooth animations

## 🎨 Accessibility Features

- **Color-Blind Support**: Geometric patterns distinguish colors
- **Keyboard Navigation**: Full keyboard control with visible focus indicators
- **Screen Reader Support**: Complete ARIA live regions and descriptions
- **High Contrast**: Carefully chosen color combinations
- **Text Scaling**: Responsive typography that works with browser zoom

## 🔧 API Endpoints

### **Leaderboard**
- `GET /api/leaderboard` - Retrieve top scores
- `POST /api/leaderboard` - Submit new score

### **Rate Limiting**
- General endpoints: 100 requests per 15 minutes
- Score submission: 5 requests per minute

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### **Development Guidelines**
- Follow TypeScript best practices
- Maintain mobile-first responsive design
- Ensure accessibility standards are met
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern React patterns and hooks
- UI components from shadcn/ui and Radix UI
- Icons by Lucide React
- Inspired by classic memory training games

---

**Ready to challenge your memory?** 🧠⚡  
Start playing and see how long you can survive the rolling sequence challenge!