
# gymix Dashboard

A futuristic, glassmorphic GROW YouR NEED dashboard for managing various applications and analytics, featuring a modular interface, real-time data visualization, and powerful AI integrations powered by the local ollama ai and openai api,google gemini api,claude api.

![gymix Screenshot](https://storage.googleapis.com/aurea-6a2ba.appspot.com/public/aura-os-screenshot.png)

---

## Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [API Key Setup](#api-key-setup)
  - [Installation](#installation)
- [Modules In-Depth](#modules-in-depth)
  - [Core Modules](#core-modules)
  - [Overlay Applications](#overlay-applications)
- [AI Integration](#ai-integration)

---

## About The Project

gymix is a web-based, OS-like dashboard designed to be a central hub for a modern provider saas to educational institution, organization znd individuals. It combines stunning visuals with powerful functionality, creating an intuitive and engaging user experience.

The entire interface is built around a **glassmorphic** design language, utilizing blurred backgrounds, vibrant gradients, and clean typography to create a sense of depth and modernity. The architecture is highly modular, allowing for easy expansion and management of different functionalities.

---

## Key Features

- **Modular Architecture:** The application is divided into distinct modules (`Dashboard`, `Analytics`, `School Hub`, etc.), each handling a specific domain of functionality.
- **Overlay Applications:** Full-screen applications like `Studio`, `Hobbies`, and `Marketplace` launch over the main interface, providing immersive, focused experiences.
- **Futuristic UI/UX:** A consistent and beautiful glassmorphic design is applied across all components, enhanced with smooth transitions and custom icons from `lucide-react`.
- **Centralized State Management:** A global context (`useAppContext`) manages the application's state, including active modules, open overlays, and the shopping cart.
- **AI-Powered:** Leverages the Google Gemini API to provide intelligent features, from a conversational AI assistant to content generation and data analysis tools.
- **Component-Based:** Built with React and TypeScript, ensuring a scalable and maintainable codebase.
- **No Build Step Required:** Uses an `importmap` in `index.html` to load ES modules directly from a CDN, simplifying the development setup.


Student
 AI-Powered Learning Guide
* Personalized Learning Pathways
* Learning Style Analyzer
* Gamified Growth Map
* School Token Economy (EduCoins)
* Goal Trees
* Calendar & To-Do System
* Personal Growth Journal
* Mood + Focus Check-In
* Mindfulness & Meditation Tools
* Personalized Study Playlist Generator
* AI Student Life Mentor
* Skills-Based Credentialing & Micro-Badges
* Universal Portfolio System
* AI Creative Assistant
* Personalized News & Opportunity Feed
* Digital Citizenship & Online Safety Module
* World Classroom Connector
* Peer-to-Peer Student Communities
* Global Learning Experience Hub
* Social Impact Simulator
* Language Learning Chatbots & Speech Recognition
* Self-Reflection & Growth Analytics
* Emergency Contact Notifications
* AI-Driven Virtual Study Assistant

for parent 
Daily/Weekly Snapshot Digest
* Learning Pulse Tracker
* Real-Time Communication Hub
* Auto-Translate Messaging
* Open Feedback Loop
* Live Parent-Teacher Conferences & Town Halls
* Sibling Switching & Comparison
* Parental Learning Hub
* Parent AI Coach
* Homework Support & AI Coaching
* AI Behavior & Wellness Alerts
* Child’s Emotional Health Insights
* Child Safety Tracking & Permissions
* Parenting Community & Resource Hub
* Volunteer Opportunities & Sign-Up
* Cafeteria Menu & Account Management
* School Policy & Handbook Quick Access
* Integrated Financial Aid System Access

teachers
AI-Powered Classroom Insights
* Smart Gap Detector
* Auto-Build Remediation & Enrichment Plans
* Customized Learning Content Generator
* AI-Assisted Grading & Feedback Tool
* Learning Target Tracker
* Behavior Dashboard & Communication Log
* IEP/504 Plan Integration & Support
* Formative Assessment Builder
* Shared Resource Hub & Collaboration Space
* Real-Time Collaboration Board
* AI Exam Generator + Secure Proctoring
* Automated Student Feedback Analysis
* Interactive Classroom Tools Integration
* Peer Feedback & Observation System
* Teacher Wellness Resources
* Substitute Teacher Portal
* Global Teacher Collaboration Network

administration
Academic Health Monitor
* Staff Load Balancer & Scheduling Assistant
* Attendance & Safety Overview
* Emergency Notification Center
* Internal Ticketing & Workflow System
* Policy Simulation Engine
* Crisis Simulation & Preparedness Engine
* Predictive Analytics for Early Intervention
* Data Privacy & Compliance Dashboard
* IT Asset & Software Management
* Vendor Management & Contract Tracker
* Alumni Relations Management Module
* Student Behavior & Safety Trend Analysis
* Virtual Campus Tour Builder
* Predictive Resource Planning
* Compliance & Accreditation Evidence Management
* Real-Time Crisis Management Communication Hub
* AI Conflict Resolution Support Tool
* Intelligent Resource Allocation Optimization
* Sustainability & Green School Dashboard
* Visitor Management System Integration

school
Multi-school/District Command Center
* Equity Heatmaps & Analysis
* Culture & Climate Sentiment Analysis
* School Innovation & Program Effectiveness Metrics
* Curriculum Audit & Alignment Tools
* Intervention & Program ROI Tracker
* Teacher Professional Development Hub & ROI Analysis
* Strategic Partnership Management
* Scenario Planning & Forecasting
* Global School Scorecard (Opt-In Benchmarking)
* Staff Wellness & Burnout Indicators
* Long-Term Curriculum & Program Planning Support
* International Leadership Collaboration Hub
* Leadership Decision-Making Simulator
* Customized Alumni Outcomes Tracking

finance
 Tuition & Fee Revenue Analytics
* Comprehensive Expense Management
* Cost Efficiency AI Suggestions
* Program & Grant ROI Analysis
* Advanced Financial Forecasting & Modeling
* Audit Compliance Monitor & Reporting
* Integrated Financial Aid Management System
* Grant Writing & Management Assistant
* Integrated Fundraising & Donor Management Platform
* School Investment & Endowment Tracker
* Financial Impact Analysis Tool

marketing
Enrollment Funnel Tracking & Analytics
* Persona-Based Campaign Engine
* Social Proof Stream & Internal Design Engine
* Marketing Campaign ROI Tracker
* Geo-Targeted Insights & Micro-Campaigns
* Omnichannel Communication & Distribution Engine
* Targeted Lead Nurturing System
* School Branding & Reputation Monitoring
* Campaign Success Predictor
* Virtual & Hybrid Admissions Event Platform
* Automated Event Follow-Up Sequences
* AI-Based Student Testimonial Curation
* Competitive Intelligence Tracker
* Augmented Reality Marketing Integration
* AI-Based School Event Planner
---

## Tech Stack

- **Frontend:**
  - [React](https://react.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/) (via CDN)
- **AI Engine:**
  - [@google/genai](https://www.npmjs.com/package/@google/genai) (Google Gemini API)
- **Icons:**
  - [Lucide React](https://lucide.dev/)
- **Charting:**
  - [Recharts](https://recharts.org/)

---

## Project Structure

The codebase is organized logically to separate concerns and promote reusability.

```


---

## Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

You only need a modern web browser that supports ES modules.

### API Key Setup

This project relies on the local ollama ai and openai api,google gemini api,claude api. for its AI features.

1.  Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  The application is hardcoded to look for the API key in `process.env.API_KEY`. Since this is a client-side application without a Node.js backend, you'll need to make the key available in your environment. For local development, the simplest way is to replace `process.env.API_KEY` with your actual API key string in the code where `new GoogleGenAI()` is called.

**Warning:** Do not commit your API key to a public repository. For a production deployment, this key should be managed securely.

### Installation

1.  Clone the repository or download the source files.
2.  Since there is no build step, you just need to serve the files from a local web server. The easiest way is using `serve`:
    ```bash
    # If you don't have serve, install it globally
    npm install -g serve

    # Navigate to the project directory and run the server
    serve .
    ```
3.  Open your browser and navigate to the local address provided by `serve` (e.g., `http://localhost:3000`).

---

## Modules In-Depth

### Core Modules

These are the main sections of the dashboard, accessible from the primary sidebar.

-   **Dashboard:** The landing page, providing a high-level overview with key statistics and data visualizations.
-   **Analytics:** A detailed analytics suite with L1/L2 navigation to explore data related to website traffic, marketing, and finance.
-   **School Hub:** The most extensive module, tailored for educational institutions. It features role-based dashboards for School Admins, Teachers, Students, and Parents, with dozens of specialized tools.
-   **Concierge AI:** A conversational AI assistant powered by Gemini. It can answer questions, summarize text, and perform various tasks within the application.
-   **Knowledge Base:** A repository of educational content, organized by subject, course, and media type.
-   **Marketplace:** An e-commerce platform for school merchandise, event tickets, and services.
-   **System Settings:** A comprehensive panel for configuring every aspect of the application, from branding and user roles to API keys and security settings.

### Overlay Applications

These full-screen applications provide focused, immersive experiences.

-   **Studio:** A productivity suite featuring a word processor, spreadsheet editor, presentation tool, and diagram maker.
-   **Hobbies Dashboard:** A personal dashboard for users to track and manage their hobbies, categorized into areas like Creative Arts, Sports, Gaming, and more.
-   **Marketplace:** The full-screen version of the marketplace module, providing a richer browsing and shopping experience.

---

## AI Integration

The Google Gemini API is a core part of the Aura OS experience, powering numerous features:

-   **Concierge AI:** Provides the conversational intelligence for the main AI assistant.
-   **AI Study Assistant:** Helps students with their homework by guiding them to answers without solving problems for them directly.
-   **Policy Generator:** Drafts formal school policies based on a topic and target audience.
-   **Community Feedback AI:** Analyzes raw text feedback to identify sentiment, key themes, and actionable suggestions.
-   **Predictive Analytics:** Forecasts future trends (e.g., student enrollment) based on historical data and contextual notes.
-   **AI Communication Drafts:** Assists administrators in writing clear and calm messages during crisis situations.
-   **AI-Assisted Grading:** Provides a first-pass grade and constructive feedback on student submissions based on a teacher-provided rubric.
-   **Smart Gap Detector:** Analyzes a set of student answers to identify common misunderstandings and suggest teaching strategies.
-   **Language Translation:** Seamlessly translates messages in the Parent-Teacher communication hub.
-   **AI Message Drafting:** Helps parents write polite and clear messages to teachers based on a simple intent.

This deep integration makes Aura OS not just a management tool, but an intelligent partner for its users.
