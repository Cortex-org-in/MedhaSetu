# MedhaSetu (🧠 मेधासेतु)

<p align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" width="220" height="132" style="max-width: 100%;">
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.15" />
    </filter>
    <path d="M 250 100 L 750 100 L 750 220 L 900 220 L 900 320 L 750 320 L 750 380 L 750 500 L 680 500 L 680 380 L 630 380 L 630 500 L 560 500 L 560 380 L 440 380 L 440 500 L 370 500 L 370 380 L 320 380 L 320 500 L 250 500 L 250 380 L 250 320 L 100 320 L 100 220 L 250 220 Z" fill="#799CBB" stroke="#485D6F" stroke-width="12" stroke-linejoin="round" stroke-linecap="round" filter="url(#shadow)" />
    <g fill="none" stroke="#D2A782" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 270 110 L 270 140 L 300 170" />
      <path d="M 470 110 L 450 130 L 370 130" />
      <path d="M 730 110 L 730 140 L 700 170" />
      <path d="M 590 110 L 610 130 L 630 130" />
      <path d="M 110 250 L 230 250 L 270 290 L 320 290" />
      <path d="M 110 290 L 210 290 L 250 340 L 250 370" />
      <path d="M 890 250 L 770 250 L 730 290 L 680 290" />
      <path d="M 890 290 L 790 290 L 750 340 L 750 370" />
      <path d="M 285 500 L 285 410 L 315 380 L 345 380" />
      <path d="M 395 500 L 395 430 L 435 390 L 490 390" />
      <path d="M 715 500 L 715 410 L 685 380 L 655 380" />
      <path d="M 605 500 L 605 430 L 565 390 L 510 390" />
    </g>
    <rect x="310" y="150" width="80" height="80" rx="22" fill="#59748C" stroke="#485D6F" stroke-width="6"/>
    <circle cx="350" cy="190" r="28" fill="#273849"/>
    <path d="M 350 168 Q 350 182 336 182 Q 350 182 350 196 Q 350 182 364 182 Q 350 182 350 168 Z" fill="white"/>
    <circle cx="366" cy="204" r="5" fill="white"/>
    <rect x="610" y="150" width="80" height="80" rx="22" fill="#59748C" stroke="#485D6F" stroke-width="6"/>
    <circle cx="650" cy="190" r="28" fill="#273849"/>
    <path d="M 650 168 Q 650 182 636 182 Q 650 182 650 196 Q 650 182 664 182 Q 650 182 650 168 Z" fill="white"/>
    <circle cx="666" cy="204" r="5" fill="white"/>
    <path d="M 485 260 Q 500 275 515 260" fill="none" stroke="#485D6F" stroke-width="5" stroke-linecap="round"/>
  </svg>
</p>

MedhaSetu is a premium cognitive training and daily brain exercise web application designed specifically to promote mental agility, memory maintenance, and logical reasoning for senior citizens. Combining clean, accessible UX patterns with game-like consistency rewards, MedhaSetu empowers users to train their minds daily across 10 specialized categories.

---

## 🔗 Live Application
The live application is hosted on Firebase Hosting at:  
👉 **[https://medhasetu-agility.web.app](https://medhasetu-agility.web.app)**

---

## 🤖 The Animated Robot Mascot: MedhaMascot
To make cognitive training friendly, encouraging, and highly interactive, MedhaSetu features an animated vector robot mascot custom-crafted for the application. The mascot supports four dynamic visual states:
* 🤖 **Static Mascot (`state="static"`)**: Standard vector emblem of the character logo.
* 🎈 **Floating Idle Mascot (`state="idle"`)**: A gentle, slow floating up-and-down animation that serves as a calming guide on progress screens and menus.
* 👋 **Waving Welcome Mascot (`state="wave"`)**: An animated waving arm sequence that welcomes users on landing screens and celebrates successful quiz completions.
* ⚡ **Glow Loading Mascot (`state="loading"`)**: An animated state featuring glowing circuit details, ground shadow expansions, and blinking loading text designed to represent "cognitive processing".

### Mascot Integrations:
1. **Login, Signup & Password Reset**: The waving mascot welcomes users on all landing gates.
2. **App-wide Splash Screen**: Shows a full-screen card with the animated loading mascot during authentication state checks.
3. **Protected Navigation Guards**: The loading mascot displays while user profiles resolve from the database.
4. **Dashboard Greeting**: The waving mascot is placed in the Welcome Hero Card, and the floating idle mascot comforts users inside the Streak Reset alert.
5. **Progress Dashboard**: Renders next to the profile stats card.
6. **Community Circle**: Welcomes users above the leaderboard rankings.
7. **Quiz Workouts**: Acts as a loading transition before questions mount, and cheers users with a waving success animation on the completion screen.

---

## ✨ Key Features

### 1. Dynamic Dashboard & Welcome Hero
* **Welcoming Presence**: Greets users by name, displays their active training streaks, and offers a primary Call-to-Action to begin daily exercises.
* **Quick Access Navigations**: Fluid shortcuts to core pages (Progress Statistics, Leaderboard, and Admin Seeding tools).

### 2. Subject-Matter Quizzes (10 Cognitive Categories)
Engage in 10-question daily quizzes covering diverse cognitive domains:
* 🎨 **Arts** — Visual culture, history, and classical arts.
* 🔢 **Mathematics** — Quick calculations, math puzzles, and numerical patterns.
* 🌍 **General Knowledge** — Global facts, science, and world history.
* 🗺️ **Indian History & Geography** — Landmarks, history, and physical geography.
* 🔬 **Science** — Astronomy, chemistry, physics, and biological trivia.
* 🧠 **Logical Reasoning** — Critical thinking, series completions, and puzzles.
* 💰 **Economics & Finance** — Financial literacy, savings concepts, and simple economics.
* 📚 **Literature & Classics** — Epics, prose, poetry, and linguistic masterpieces.
* 🎬 **Cinema & Nostalgia** — Music, classic films, and retro retro-trivia.
* 🗣️ **Word Power Puzzles** — Spelling checks, grammar, and language riddles.

### 3. Subject Accuracy Breakdown & Statistics
* **Performance Tracking**: Calculates user accuracy individually across each of the 10 subjects using the mathematical formula:
  $$\text{Subject Accuracy (\%)} = \left( \frac{\text{Total Correct Answers in Subject}}{\text{Total Questions Answered in Subject}} \right) \times 100$$
* **Visual Progress Bars**: Displays accuracy color tracks and lists quizzes taken count.
* **Historical Trend Line**: Renders an inline SVG line graph plotting overall accuracy percentage across the last 10 quiz sessions.

### 4. Daily Brain Training Streak System
* **Consistency Tracking**: Monitors daily quiz attempts, increasing user streaks for consecutive days of training.
* **Polite Expiration Modal**: Runs checks on dashboard mount. If the user misses a training day, their streak resets and they are greeted with a polite warning modal encouraging them to start fresh.

### 5. Leaderboard & community Circle
* **Community Ranking**: Lists users based on their active streaks and quizzes completed.
* **Milestones Goal Tracker**: Monitors collective milestones (e.g., total questions answered correctly as a community).

### 6. Email Verification Protection
* **Registration Validation**: Automatically dispatches a verification link on signup.
* **Navigation Interceptors**: Redirects unverified accounts to `/verify-email` with an info block prompting users to check their Spam/All Mail folders.

---

## 📱 Mobile-Native Responsive Design
MedhaSetu uses an adaptive design system built on **CSS3 Variables** and custom media overrides to feel like a native mobile app:
* **Edge-to-Edge Fitting**: On screens below `600px`, layout margins, shadows, and borders collapse. The application expands to fill 100% of the screen.
* **Tap-Target Optimization**: Buttons adjust to a minimum height of `48px` to comply with standard mobile ergonomics.
* **Single-Column Formats**: Category grids and cards collapse to single-column lists on mobile viewports to prevent awkward text-wrapping or button clipping.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Core** | React 18 / Vite 5 | Fast, component-driven modular framework with Hot Module Reloading (HMR). |
| **Styling** | Vanilla CSS3 | Modular design tokens and media queries for layouts and fluid typography. |
| **Backend Database** | Firebase Firestore | Real-time synchronization of user profiles, scores, and questions. |
| **Authentication** | Firebase Auth | Secure signup, signin, password resets, Google OAuth, and email verification. |
| **Hosting** | Firebase Hosting | Scalable static web hosting on the `medhasetu-agility` domain. |
| **Icons** | Lucide React | Clean, scalable vector illustrations for dashboard controls. |
| **Animations** | CSS Animations / Canvas Confetti | Celebration effects and page transition fades. |

---

## 📁 Repository Directory Structure

```
MedhaSetu/
├── .firebase/                  # Firebase cache directory
├── dist/                       # Compiled production build directory (ignored by git)
├── public/                     # Static question JSON files and assets
│   ├── arts_questions.json
│   ├── maths_questions.json
│   ├── science questions.json
│   └── ...
├── src/
│   ├── components/
│   │   ├── Mascot.jsx          # Reusable robot mascot SVG renderer
│   │   └── PrivateRoute.jsx    # Custom route interceptor & verification guard
│   ├── contexts/
│   │   └── AuthContext.jsx     # User authentication and Firebase context
│   ├── pages/
│   │   ├── Dashboard.jsx       # Welcome cards, start quiz CTA, streak checkers
│   │   ├── CategorySelect.jsx  # 10 categories responsive selector list
│   │   ├── Quiz.jsx            # Quiz question renderer, results, and confetti modal
│   │   ├── Profile.jsx         # Detailed statistics charts, high scores, active badges
│   │   ├── SocialHub.jsx       # Milestones and Leaderboard pagination lists
│   │   ├── SeedDatabase.jsx    # Admin console to seed Firestore collections
│   │   ├── Login.jsx           # User sign-in & Google OAuth trigger
│   │   ├── Signup.jsx          # Register user with verification dispatch
│   │   ├── ForgotPassword.jsx  # Reset password request forms
│   │   └── VerifyEmail.jsx     # Email verification status manager
│   ├── firebase.js             # Firebase initialization file
│   ├── index.css               # Design system token setup and mobile overrides
│   └── main.jsx                # App entrypoint
├── firebase.json               # Firebase CLI configuration
├── index.html                  # Viewport meta tags and base HTML template
├── package.json                # Project script declarations & dependencies
└── vite.config.js              # Vite compiler configuration
```

---

## 🚀 Installation & Local Development

Follow these steps to run MedhaSetu on your local machine:

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) and the **Firebase CLI** installed:
```bash
node --version
npm install -g firebase-tools
```

### 2. Clone the Repository
```bash
git clone https://github.com/SparshMishra09/MedhaSetu.git
cd MedhaSetu
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Dev Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser to view the application.

---

## 💾 Admin Database Seeding

To populate Firestore with the 1,000+ cognitive questions:
1. Register an administrator account using the email: **`seniorsetu07@gmail.com`**.
2. Log in and navigate to the admin console: **`[Admin] Seed Database`** (or go directly to `/seed`).
3. Click **`Seed Data`**. This will parse all JSON data sets under `/public` and batch-write them to the `questions` and `categories` Firestore collections.

---

## 📦 Deployment to Firebase Hosting

To bundle the application and deploy updates to the live domain:

### 1. Build the Application
```bash
npm run build
```

### 2. Deploy to Firebase
```bash
firebase deploy --only hosting
```
The application will deploy to **`medhasetu-agility.web.app`**.
