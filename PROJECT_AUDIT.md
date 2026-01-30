# Project Audit & Architecture Overview

## 1. Architecture Summary
- **Frontend Framework**: React (Vite) with Material UI (MUI) for component styling.
- **Backend Service**: Firebase (Firestore Database & Authentication).
- **Routing**: React Router DOM (`react-router-dom`).
- **Payment Gateway**: Razorpay (`src/utils/razorpay.js`).

## 2. Data Flow Map

### A. Admin: Content Creation
1.  **Subject Creation**: 
    - Managed in `ContentManagement.jsx`.
    - Data stored in `subjects` collection.
    - *Note*: "Psychology" subject is auto-created if missing.
2.  **Test Creation**:
    - Managed in `TestBuilder.jsx`.
    - Data stored in sub-collection: `subjects/{subjectId}/tests/{testId}`.
3.  **Question Management**:
    - Managed in `QuestionBank.jsx`.
    - Data stored in sub-collection: `subjects/{subjectId}/tests/{testId}/questions/{questionId}`.
4.  **Bundle Creation**:
    - Managed in `BundleManagement.jsx`.
    - Data stored in `bundles` collection.
    - Bundles contain an array of `testIds` to reference the individual tests they include.

### B. Student: Content Consumption
1.  **Dashboard (`MockTestDashboard.jsx`)**:
    - Fetches all `bundles` from Firestore.
    - Fetches all `subjects` and their nested `tests`.
    - **Aggregation**: Flattens all tests from all subjects into a single list.
    - **Filtering**: Matches tests to bundles using the `testIds` array stored in each bundle.
    - **Display**: 
        - Left Column: Bundles (Horizontal Scroll).
        - Right Column: Tests belonging to the selected bundle (Vertical List).

2.  **Test Interface (`MockTestInterface.jsx`)**:
    - Receives `subjectId` and `testId` via URL parameters.
    - Fetches test metadata directly from `subjects/{subjectId}/tests/{testId}`.
    - Fetches questions from `subjects/{subjectId}/tests/{testId}/questions`.
    - *Cleanup*: Placeholder/Demo questions logic has been removed.

3.  **Results & Analytics**:
    - Upon submission, results are saved to `attempts` collection.
    - User is navigated to `ResultAnalytics.jsx` with result data passed via Router State.

## 3. Data Model Hierarchy
```
subjects (collection)
└── {subjectId} (doc)
    └── tests (sub-collection)
        └── {testId} (doc)
            └── questions (sub-collection)
                └── {questionId} (doc)

bundles (collection)
└── {bundleId} (doc)
    ├── name
    ├── price
    └── testIds: ["testId1", "testId2"]

attempts (collection)
└── {attemptId} (doc)
    ├── userId
    ├── testId
    ├── score
    └── ...
```

## 4. Hardcoded Data Audit
- **Removed**: Placeholder question generation in `MockTestInterface.jsx` (previously generated 30 dummy questions if none were found).
- **Retained (Structural)**: `ContentManagement.jsx` automatically creates a "Psychology" subject if the database is empty. This is necessary for system initialization.
