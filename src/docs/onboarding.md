
# Momentum OS Onboarding Flow

This document describes the onboarding flow for Momentum OS, detailing each slide's purpose, inputs, and downstream modules.

## Onboarding Flow Overview

The onboarding process consists of 9 slides that gather critical information to personalize the user experience:

1. Welcome
2. Four Pillars
3. Vision Definition
4. Daily Rhythm
5. Health & Supplements
6. Financial Alignment
7. Emotional Baseline
8. Community Preferences
9. Completion

## Detailed Slide Descriptions

### 1. Welcome Slide

**Purpose**: Introduce users to Momentum OS and provide an entry point to the onboarding process.

**Inputs**: None (Just a "Let's get started" button)

**Downstream Modules**: None

### 2. Four Pillars Slide

**Purpose**: Educate users about the four core pillars of the Momentum OS ecosystem.

**Pillars**:
- MPOS (Metabolism, Psychology, Organ Systems, Sleep)
- Wealth Alignment
- Flow & Focus
- Legacy & Reflection

**Inputs**: None (Just a "Next" button)

**Downstream Modules**: None

### 3. Vision Definition Slide

**Purpose**: Capture the user's core values and long-term goals to align the OS experience with their aspirations.

**Inputs**:
- Three core values (text fields)
- Three 5-year goals (text fields)

**Downstream Modules**:
- Clarity Hub
- Epoch Tracker
- Legacy Planning

**API Endpoint**: `/api/onboarding/vision`

### 4. Daily Rhythm Slide

**Purpose**: Understand the user's daily energy patterns for optimal scheduling.

**Inputs**:
- High-energy window (time range picker)
- Wake time (time selector)
- Sleep time (time selector)

**Downstream Modules**:
- Flow State Detector
- Focus Blocks
- Sleep Tracker
- MPOS Optimization

**API Endpoint**: `/api/onboarding/rhythm`

### 5. Health & Supplement Slide

**Purpose**: Gather basic health information and supplement usage to personalize MPOS recommendations.

**Inputs**:
- Supplements (multi-select)
- Average sleep hours (numeric input)
- Exercise frequency (dropdown)

**Downstream Modules**:
- MPOS Dashboard
- Supplement Tracker
- Health Analytics

**API Endpoint**: `/api/onboarding/health`

### 6. Financial Alignment Slide

**Purpose**: Understand the user's financial goals and risk tolerance to provide tailored wealth insights.

**Inputs**:
- Primary financial goal (dropdown)
- Risk tolerance (slider: 1-10)
- Monthly budget (numeric input)

**Downstream Modules**:
- Wealth Alignment Dashboard
- Financial Projections
- Budget Tracking

**API Endpoint**: `/api/onboarding/wealth`

### 7. Emotional Baseline Slide

**Purpose**: Establish an emotional baseline for personalized nudges and psychological support.

**Inputs**:
- Current mood (slider: 1-10)
- Stressors (free text field)

**Downstream Modules**:
- Emotional Heatmap
- Nudge Engine
- Drift Correction

**API Endpoint**: `/api/onboarding/emotion`

### 8. Community & Support Slide

**Purpose**: Configure community engagement preferences and notification settings.

**Inputs**:
- Group challenges toggle (boolean)
- Reminder channel (radio: in-app, push, email)

**Downstream Modules**:
- Community Hub
- Notification Center
- Challenge Dashboard

**API Endpoint**: `/api/onboarding/community`

### 9. Completion Slide

**Purpose**: Confirm completion of onboarding and transition to the main dashboard.

**Inputs**: None (Just a "Get Started" button)

**Downstream Actions**:
- Set `hasCompletedOnboarding` to true
- Prefetch all module data
- Redirect to main dashboard

## Integration Points

After collecting user data through the onboarding flow, the following systems are initialized:

1. **MPOS System**: Configures supplement recommendations and health tracking based on user inputs.

2. **Wealth Engine**: Sets up financial goals, budget tracking, and investment strategy suggestions.

3. **Flow Management**: Configures optimal focus blocks based on reported energy patterns.

4. **Emotional Mapping**: Establishes baseline emotional state and configures the nudge engine.

5. **Community Integration**: Sets up user preferences for social engagement and notifications.

All collected data is stored locally and can be updated later through individual module settings.

## Technical Implementation

- All API endpoints follow RESTful conventions
- Form validation occurs client-side before submission
- Data is securely transmitted and stored
- The onboarding flow is responsive and works across all device types
- Progress is saved at each step to prevent data loss
