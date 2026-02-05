# Project Management System

A comprehensive project management web application built with Next.js and Supabase, featuring project tracking, budget management, and backoffice administration.

## Features

### Main Features
- **Project Dashboard**: View all projects with filtering by status
- **Project Detail Page**: 
  - Status cards for Timing, Budget, and Scope
  - Financial snapshot with bar chart visualization
  - Circular progress indicator
  - Tabbed sections for Overview, Risks, Deliverables, Achievements, and TimeSheets
  - Manager information display

### Backoffice
- **User Management**: Create, view, and delete app users
- **Client Management**: View client summaries and their projects

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Vanilla CSS with CSS Modules
- **UI**: Custom design system with premium aesthetics

## Database Schema

The application uses the following main tables:
- `project`: Project information and metadata
- `appuser`: System users (delivery managers, account managers)
- `timesheet`: Time tracking for projects
- `risk`: Project risks
- `deliverable`: Project deliverables
- `achievement`: Project achievements
- `registration`: User-project associations
- `role`: User roles
- `pricetype`: Pricing types
- `note`: Notes

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account with database set up

### Installation

1. Navigate to the project directory:
```bash
cd project-management-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
The `.env.local` file should already contain:
```
NEXT_PUBLIC_SUPABASE_URL=https://yfxnzxqveewehyxfmsmp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_LbHAzSUCCGEhSy5ulDsYWg_sAx9IEb3
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
project-management-app/
├── app/
│   ├── backoffice/
│   │   ├── users/          # User management
│   │   └── clients/        # Client management
│   ├── project/
│   │   └── [id]/          # Project detail page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Projects listing page
├── components/
│   ├── Navigation.tsx     # Main navigation
│   ├── StatusCard.tsx     # Status display cards
│   ├── ProgressCircle.tsx # Circular progress indicator
│   ├── FinancialSnapshot.tsx # Budget visualization
│   └── TabNavigation.tsx  # Tab navigation
├── lib/
│   └── supabase.ts        # Supabase client
├── types/
│   └── database.ts        # TypeScript interfaces
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Design Features

- **Premium Aesthetics**: Gradient backgrounds, smooth animations, and modern typography
- **Responsive Design**: Mobile-friendly layouts
- **Color-Coded Status**: Visual indicators for project health
- **Interactive Elements**: Hover effects and smooth transitions
- **Accessibility**: Semantic HTML and proper ARIA labels

## Key Pages

### Projects Listing (`/`)
- Grid view of all projects
- Filter by status (All, Active, On Track, At Risk)
- Shows budget progress, managers, and key metrics
- Click any project to view details

### Project Detail (`/project/[id]`)
- Comprehensive project overview
- Status cards for timing, budget, and scope
- Financial snapshot with bar chart
- Tabbed sections for different data types
- Manager information and actions

### User Management (`/backoffice/users`)
- Create new users
- View all users in a table
- Delete users
- Track user information and roles

### Client Management (`/backoffice/clients`)
- View client summaries
- See all projects per client
- Track total budgets

## Contributing

This is a private project management system. For questions or issues, please contact the development team.

## License

Proprietary - All rights reserved
