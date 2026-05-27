# PSY-Q 🧠

A full-stack mock test platform built for psychology students, featuring test bundles, a real-time test interface, result analytics, and an admin panel for content management.

**Live Demo:** [psy-q-zeta.vercel.app](https://psy-q-zeta.vercel.app)

---

## Features

- **Mock Tests** — Timed, multiple-choice tests organized by subject and bundle
- **Test Bundles** — Group related tests together; students purchase bundles via Razorpay
- **Real-time Interface** — Clean test-taking UI with question navigation and auto-submit
- **Results & Analytics** — Detailed score breakdown and performance insights after each attempt
- **Admin Panel** — Create and manage subjects, tests, questions, and bundles via a dedicated dashboard
- **Authentication** — Firebase-powered user sign-up, login, and session management

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Material UI (MUI), Tailwind CSS |
| Routing | React Router DOM v7 |
| Backend / DB | Firebase (Firestore + Authentication) |
| Payments | Razorpay |
| Animations | Framer Motion |
| Charts | Recharts |
| Email | EmailJS, Resend |
| Deployment | Vercel |

---

## Project Structure

```
PSY-Q/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route-level page components
│   │   ├── MockTestDashboard.jsx
│   │   ├── MockTestInterface.jsx
│   │   ├── ResultAnalytics.jsx
│   │   └── admin/
│   │       ├── ContentManagement.jsx
│   │       ├── TestBuilder.jsx
│   │       ├── QuestionBank.jsx
│   │       └── BundleManagement.jsx
│   └── utils/
│       └── razorpay.js
├── backend/              # Node.js backend (payment & email helpers)
├── public/               # Static assets
├── supabase/             # Supabase config (auxiliary)
├── index.html
├── vite.config.js
└── package.json
```

---

## Data Model

```
subjects (collection)
└── {subjectId}
    └── tests (sub-collection)
        └── {testId}
            └── questions (sub-collection)
                └── {questionId}

bundles (collection)
└── {bundleId}
    ├── name
    ├── price
    └── testIds: ["testId1", "testId2", ...]

attempts (collection)
└── {attemptId}
    ├── userId
    ├── testId
    ├── score
    └── ...
```

---

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- A Firebase project with Firestore and Authentication enabled
- A Razorpay account (for payment features)

### Installation

```bash
# Clone the repository
git clone https://github.com/abnv-8083/PSY-Q.git
cd PSY-Q

# Install frontend dependencies
npm install

# Install backend dependencies
npm install --prefix backend
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

### Running Locally

```bash
# Start the frontend dev server
npm run dev

# Start the backend server (in a separate terminal)
npm run start:backend
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

---

## How It Works

**For Students:**
1. Sign up / log in
2. Browse available test bundles on the dashboard
3. Purchase a bundle to unlock its tests
4. Take a timed mock test
5. View your score and detailed analytics after submission

**For Admins:**
1. Create subjects (e.g., "Psychology" is auto-created on first run)
2. Create tests under a subject using the Test Builder
3. Add questions to each test via the Question Bank
4. Group tests into bundles with a price using Bundle Management

---

## Deployment

The frontend is deployed on **Vercel**. A `vercel.json` is included for SPA routing configuration. Push to `main` to trigger an automatic deployment.

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

---

## License

This project is private. All rights reserved.
