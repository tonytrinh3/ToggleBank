# ToggleBank Demo App

A modern banking application demo built to showcase how **feature flags** work in a real-world banking scenario. This app demonstrates LaunchDarkly feature flag integration, authentication flows, and progressive feature rollouts.

## Purpose

ToggleBank serves as a demonstration platform for:

- **Feature Flag Management**: Show how LaunchDarkly can control feature releases, A/B testing, and targeted rollouts
- **Banking UI Demo**: A realistic banking interface with accounts, wealth management, and user dashboards
- **Authentication Patterns**: Demonstrates protected routes, login/logout flows with loading states
- **AI Integration**: Includes AWS Bedrock integration for AI-powered financial analysis

## Features

- 🏦 **Banking Dashboard** - View checking, credit, and mortgage accounts
- 📊 **Wealth Management** - Portfolio visualization with charts
- 🤖 **AI Chatbot** - AI-powered financial assistant (AWS Bedrock)
- 🎯 **Feature Flags** - LaunchDarkly integration for feature management
- 👥 **Multi-Persona Login** - Quick switch between different user personas
- 🔐 **Protected Routes** - Auth guards with loading states
- 📱 **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (Pages Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **Feature Flags**: LaunchDarkly (Client & Server SDKs)
- **AI**: AWS Bedrock
- **Database**: PostgreSQL with Drizzle ORM
- **Animation**: Framer Motion
- **Charts**: Recharts, Chart.js

## Prerequisites

- Node.js 18+ 
- npm or yarn
- LaunchDarkly account (for feature flags)
- AWS account (optional, for AI features)

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd ToggleBank-Template
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# LaunchDarkly
NEXT_PUBLIC_LD_CLIENT_KEY=your-client-side-id
LD_SDK_KEY=your-server-side-sdk-key

# AWS Bedrock (optional - for AI features)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

# Database (optional)
DATABASE_URL=your-postgres-connection-string
```

### 4. Run the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3005](http://localhost:3005)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3005 |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
├── components/
│   ├── chatbot/           # AI chatbot component
│   ├── generators/        # Experimentation automation tools
│   ├── hooks/             # Custom React hooks
│   │   ├── use-delayed-redirect.tsx  # Delayed navigation hook
│   │   ├── use-mobile.tsx            # Mobile detection
│   │   └── use-tablet.tsx            # Tablet detection
│   └── ui/
│       ├── bankcomponents/   # Banking-specific components
│       ├── NavComponent/     # Navigation components
│       ├── auth-loading.tsx  # Loading state component
│       ├── forbidden-page.tsx # 403 unauthorized page
│       └── with-auth-guard.tsx # HOC for protected routes
├── pages/
│   ├── api/               # API routes
│   ├── bank.tsx           # Home page (public)
│   ├── dashboard.tsx      # User dashboard (protected)
│   ├── signup.tsx         # Sign up flow
│   └── ...
├── utils/
│   ├── contexts/          # React contexts (Login, LiveLogs)
│   ├── ld-server/         # LaunchDarkly server-side setup
│   └── ...
├── Terraform/             # Infrastructure as Code for LaunchDarkly
└── public/                # Static assets
```

## Key Concepts

### Authentication Flow

The app uses a context-based authentication system:

1. **Login**: User clicks "Login with SSO" → Shows "Authenticating..." → Redirects to `/dashboard`
2. **Logout**: User clicks "Logout" → Shows "Logging out..." → Redirects to `/bank`
3. **Protected Routes**: Uses `withAuthGuard` HOC to protect pages

```tsx
// Example: Protecting a page
import { withAuthGuard } from "@/components/ui/with-auth-guard";

function Dashboard() {
  return <div>Protected content</div>;
}

export default withAuthGuard(Dashboard);
```

### Feature Flags

LaunchDarkly flags are used throughout the app:

```tsx
import { useFlags } from "launchdarkly-react-client-sdk";

function MyComponent() {
  const { wealthManagement, federatedAccounts } = useFlags();
  
  return (
    <>
      {wealthManagement && <WealthManagementSheet />}
      {federatedAccounts && <FederatedAccounts />}
    </>
  );
}
```

### Delayed Redirect Hook

Custom hook for navigation with loading states:

```tsx
import { useDelayedRedirect } from "@/components/hooks/use-delayed-redirect";

// Redirect after 2 seconds (default)
useDelayedRedirect(isLoggedIn, "/dashboard");

// Immediate redirect
useDelayedRedirect(shouldRedirect, "/home", 0);
```

## Terraform Setup

The `/Terraform` directory contains Infrastructure as Code for setting up LaunchDarkly resources:

```bash
cd Terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
terraform init
terraform plan
terraform apply
```

See [Terraform/README.md](./Terraform/README.md) for detailed instructions.

## Running Without LaunchDarkly

The app includes error handling to work without LaunchDarkly configured:

- Login/logout will still function
- Feature flags will use default values
- Console warnings will appear for missing SDK

## Docker

Build and run with Docker:

```bash
docker build -t togglebank .
docker run -p 3000:3000 togglebank
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Private - For demonstration purposes only.