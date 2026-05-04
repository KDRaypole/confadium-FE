import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useState } from "react";
import {
  CheckIcon,
  SparklesIcon,
  BoltIcon,
  ChartBarIcon,
  EnvelopeIcon,
  UserGroupIcon,
  CogIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  TagIcon,
  CalendarIcon,
  ArrowRightIcon,
  Bars3Icon,
  XMarkIcon,
  PlayCircleIcon,
  PuzzlePieceIcon,
  AdjustmentsHorizontalIcon,
  CubeTransparentIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

export const meta: MetaFunction = () => {
  return [
    { title: "Confadium - Modular CRM That Fits Your Business" },
    { name: "description", content: "Build your perfect CRM with modular configurations that fit together like puzzle pieces. Automate, customize, and scale with Confadium." },
  ];
};

// Confadium Logo SVG component
function ConfadiumLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#6366f1' }} />
          <stop offset="100%" style={{ stopColor: '#8b5cf6' }} />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#logo-grad)" />
      <path d="M6 9h6v3a2 2 0 100 4v3H6a1 1 0 01-1-1v-8a1 1 0 011-1z" fill="white" fillOpacity="0.85" />
      <path d="M14 9h6a1 1 0 011 1v8a1 1 0 01-1 1h-6v-3a2 2 0 110-4z" fill="white" />
    </svg>
  );
}

// Large decorative puzzle piece SVG
function PuzzlePiece({ className = "", variant = "left" }: { className?: string; variant?: "left" | "right" | "top" | "bottom" }) {
  if (variant === "left") {
    return (
      <svg className={className} viewBox="0 0 120 100" fill="currentColor">
        <path d="M0 10C0 4.477 4.477 0 10 0h70v30c0 5.523-4.477 10-10 10s-10 4.477-10 10 4.477 10 10 10 10 4.477 10 10v30H10C4.477 90 0 85.523 0 80V10z" />
      </svg>
    );
  }
  if (variant === "right") {
    return (
      <svg className={className} viewBox="0 0 120 100" fill="currentColor">
        <path d="M40 0h70c5.523 0 10 4.477 10 10v70c0 5.523-4.477 10-10 10H40V60c0-5.523 4.477-10 10-10s10-4.477 10-10-4.477-10-10-10-10-4.477-10-10V0z" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 100 120" fill="currentColor">
      <path d="M0 10C0 4.477 4.477 0 10 0h30c5.523 0 10 4.477 10 10s4.477 10 10 10 10-4.477 10-10 4.477-10 10-10h10c5.523 0 10 4.477 10 10v100c0 5.523-4.477 10-10 10H10C4.477 120 0 115.523 0 110V10z" />
    </svg>
  );
}

// Interlocking puzzle graphic for hero - uses circular arc connectors like the logo
function InterlockingPuzzle({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 300" fill="none">
      <defs>
        <linearGradient id="piece1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="piece2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="piece3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <linearGradient id="piece4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>

      {/* Left piece - has circular TAB (outward bump) on right side, matching logo style */}
      <path d="
        M20 20
        L130 20
        L130 70
        a15 15 0 1 0 0 30
        L130 180
        L20 180
        C8.954 180, 0 171.046, 0 160
        L0 40
        C0 28.954, 8.954 20, 20 20 Z
      " fill="url(#piece1)" />

      {/* Right piece - has circular NOTCH (inward indent) on left side, matching logo style */}
      <path d="
        M160 20
        L280 20
        C291.046 20, 300 28.954, 300 40
        L300 160
        C300 171.046, 291.046 180, 280 180
        L160 180
        L160 100
        a15 15 0 1 1 0 -30
        L160 20 Z
      " fill="url(#piece2)" />

      {/* Bottom piece - has circular TAB on top, matching logo style */}
      <path d="
        M60 230
        L100 230
        a15 15 0 1 1 30 0
        L200 230
        L200 280
        C200 291.046, 191.046 300, 180 300
        L80 300
        C68.954 300, 60 291.046, 60 280
        L60 230 Z
      " fill="url(#piece3)" fillOpacity="0.85" />

      {/* Floating piece - has circular NOTCH on right side, matching logo style */}
      <g transform="translate(285, 120) rotate(15)">
        <path d="
          M0 10
          C0 4.477, 4.477 0, 10 0
          L70 0
          C75.523 0, 80 4.477, 80 10
          L80 30
          a10 10 0 1 1 0 20
          L80 70
          C80 75.523, 75.523 80, 70 80
          L10 80
          C4.477 80, 0 75.523, 0 70
          L0 10 Z
        " fill="url(#piece4)" fillOpacity="0.6" />
      </g>
    </svg>
  );
}

const configurationModules = [
  {
    icon: BoltIcon,
    title: "Trigger Modules",
    description: "Define what events start your automations - contact creation, field changes, time-based triggers, and more.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: AdjustmentsHorizontalIcon,
    title: "Condition Modules",
    description: "Set up smart conditions with AND/OR logic. Filter exactly which records should flow through your workflow.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: CogIcon,
    title: "Action Modules",
    description: "Choose from dozens of actions - send emails, update fields, create records, add tags, and more.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: CubeTransparentIcon,
    title: "Custom Modules",
    description: "Build your own modules with custom logic. Connect to external APIs and extend functionality infinitely.",
    color: "from-pink-500 to-rose-500",
  },
];

const features = [
  {
    icon: UserGroupIcon,
    title: "Contact Management",
    description: "Organize contacts with custom fields, tags, and segments that fit your business model.",
  },
  {
    icon: EnvelopeIcon,
    title: "Email Builder",
    description: "Visual drag-and-drop email builder with variables and conditional content blocks.",
  },
  {
    icon: GlobeAltIcon,
    title: "Landing Pages",
    description: "Build conversion-optimized pages that connect directly to your CRM data.",
  },
  {
    icon: ChartBarIcon,
    title: "Pipeline Analytics",
    description: "Track every stage of your deals with visual pipelines and forecasting.",
  },
  {
    icon: TagIcon,
    title: "Smart Tagging",
    description: "Automatic tagging based on behavior, source, and custom rules you define.",
  },
  {
    icon: CalendarIcon,
    title: "Activity Tracking",
    description: "Log every interaction and see a complete timeline of customer touchpoints.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "29",
    period: "per user/month",
    description: "Perfect for small teams getting started",
    features: [
      "Up to 1,000 contacts",
      "5 automation configurations",
      "Basic email templates",
      "3 custom modules",
      "Standard support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "79",
    period: "per user/month",
    description: "For teams that need full customization",
    features: [
      "Up to 25,000 contacts",
      "Unlimited configurations",
      "Advanced email builder",
      "Unlimited custom modules",
      "Priority support",
      "API access",
      "Custom fields & objects",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "199",
    period: "per user/month",
    description: "For large organizations",
    features: [
      "Unlimited contacts",
      "White-label options",
      "Dedicated infrastructure",
      "Custom integrations",
      "SSO & advanced security",
      "Dedicated success manager",
      "SLA guarantees",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const testimonials = [
  {
    quote: "The modular configuration system is genius. We built automations that would have taken months to code - in just hours.",
    author: "Sarah Chen",
    role: "VP of Operations, TechStart Inc",
    rating: 5,
  },
  {
    quote: "Finally, a CRM where the pieces actually fit together. Our sales and marketing teams are finally aligned.",
    author: "Marcus Johnson",
    role: "Founder, GrowthLab",
    rating: 5,
  },
  {
    quote: "The custom modules let us integrate our unique processes. It's like the CRM was built just for us.",
    author: "Emily Rodriguez",
    role: "Sales Director, CloudScale",
    rating: 5,
  },
];

const stats = [
  { value: "10,000+", label: "Configurations Built" },
  { value: "2M+", label: "Automations Run Daily" },
  { value: "500+", label: "Custom Modules Created" },
  { value: "98%", label: "Customer Satisfaction" },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <ConfadiumLogo className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-900">Confadium</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#configurations" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Configurations
              </a>
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </a>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                Get Started Free
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100">
            <div className="px-4 py-4 space-y-3">
              <a href="#configurations" className="block text-sm font-medium text-gray-600">Configurations</a>
              <a href="#features" className="block text-sm font-medium text-gray-600">Features</a>
              <a href="#pricing" className="block text-sm font-medium text-gray-600">Pricing</a>
              <Link to="/login" className="block text-sm font-medium text-gray-600">Sign In</Link>
              <Link to="/signup" className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />

        {/* Floating puzzle pieces */}
        <div className="absolute top-20 left-10 opacity-10">
          <PuzzlePiece className="w-32 h-32 text-indigo-500 animate-pulse" variant="left" />
        </div>
        <div className="absolute top-40 right-20 opacity-10">
          <PuzzlePiece className="w-24 h-24 text-purple-500 animate-pulse" variant="right" />
        </div>
        <div className="absolute bottom-20 left-1/4 opacity-5">
          <PuzzlePiece className="w-40 h-48 text-indigo-400" variant="top" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-indigo-50 rounded-full text-indigo-700 text-sm font-medium mb-6">
                <PuzzlePieceIcon className="h-4 w-4 mr-2" />
                Modular by Design
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
                CRM pieces that
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent"> fit together </span>
                perfectly
              </h1>

              <p className="mt-6 text-xl text-gray-600">
                Build your ideal CRM with modular configurations. Connect triggers, conditions, and actions like puzzle pieces to automate any workflow.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Start Building Free
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-md">
                  <PlayCircleIcon className="mr-2 h-6 w-6 text-indigo-500" />
                  Watch Demo
                </button>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                No credit card required. 14-day free trial.
              </p>
            </div>

            {/* Hero visual - Interlocking puzzle graphic */}
            <div className="relative">
              <InterlockingPuzzle className="w-full h-auto" />

              {/* Floating module cards */}
              <div className="absolute top-10 right-0 bg-white rounded-xl shadow-lg p-4 border border-gray-100 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <BoltIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Trigger</div>
                    <div className="text-xs text-gray-500">Contact Created</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-20 left-0 bg-white rounded-xl shadow-lg p-4 border border-gray-100 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <EnvelopeIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Action</div>
                    <div className="text-xs text-gray-500">Send Welcome Email</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Configuration Modules Section */}
      <section id="configurations" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background puzzle pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 5a5 5 0 0 1 5-5h20v10a5 5 0 0 0 10 0V0h20a5 5 0 0 1 5 5v20h-10a5 5 0 0 0 0 10h10v20a5 5 0 0 1-5 5H35v-10a5 5 0 0 0-10 0v10H5a5 5 0 0 1-5-5V35h10a5 5 0 0 0 0-10H0V5z' fill='%236366f1' fill-opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-4">
              <PuzzlePieceIcon className="h-4 w-4 mr-2" />
              Modular Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Snap together powerful
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent"> configurations</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Each module is a puzzle piece designed to connect perfectly with others. Build complex automations without writing a single line of code.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {configurationModules.map((module, index) => (
              <div
                key={index}
                className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group overflow-hidden"
              >
                {/* Puzzle piece connector visual */}
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-16 bg-gray-100 rounded-l-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${module.color} rounded-xl text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <module.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{module.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{module.description}</p>
              </div>
            ))}
          </div>

          {/* Visual workflow example */}
          <div className="mt-20 bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-indigo-500 to-purple-600">
              <h3 className="text-2xl font-bold text-white mb-2">See how the pieces connect</h3>
              <p className="text-indigo-100">A complete automation built from modular configurations</p>
            </div>
            <div className="p-8">
              <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
                {/* Trigger piece */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 w-64">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <BoltIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Trigger</span>
                    </div>
                    <h4 className="font-semibold text-gray-900">Contact Status Changed</h4>
                    <p className="text-sm text-gray-600 mt-1">When status becomes "Customer"</p>
                  </div>
                  {/* Connector */}
                  <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 w-8 h-8">
                    <div className="w-8 h-8 bg-amber-300 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-amber-500 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Arrow for mobile */}
                <div className="lg:hidden text-gray-300">
                  <ArrowRightIcon className="h-8 w-8 rotate-90" />
                </div>

                {/* Condition piece */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 w-64">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <AdjustmentsHorizontalIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Condition</span>
                    </div>
                    <h4 className="font-semibold text-gray-900">Has Made Purchase</h4>
                    <p className="text-sm text-gray-600 mt-1">Deal value &gt; $1,000</p>
                  </div>
                  {/* Connectors */}
                  <div className="hidden lg:block absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-emerald-200 rounded-l-full" />
                  <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 w-8 h-8">
                    <div className="w-8 h-8 bg-emerald-300 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Arrow for mobile */}
                <div className="lg:hidden text-gray-300">
                  <ArrowRightIcon className="h-8 w-8 rotate-90" />
                </div>

                {/* Action piece */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6 w-64">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <EnvelopeIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Action</span>
                    </div>
                    <h4 className="font-semibold text-gray-900">Send VIP Welcome</h4>
                    <p className="text-sm text-gray-600 mt-1">Template: VIP Onboarding</p>
                  </div>
                  {/* Left connector */}
                  <div className="hidden lg:block absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-indigo-200 rounded-l-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              All the pieces you need to
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent"> succeed</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Beyond configurations, Confadium includes everything for modern CRM management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-6 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Decorative puzzle pieces */}
        <div className="absolute top-10 right-10 opacity-5">
          <PuzzlePiece className="w-48 h-48 text-purple-500" variant="right" />
        </div>
        <div className="absolute bottom-10 left-10 opacity-5">
          <PuzzlePiece className="w-32 h-32 text-indigo-500" variant="left" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Pricing that scales with you
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free, upgrade when you need more configurations and power.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-8 ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl scale-105"
                    : "bg-white border border-gray-200 shadow-sm"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-sm font-medium text-white shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="text-center">
                  <h3 className={`text-xl font-semibold ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className={`text-5xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                      ${plan.price}
                    </span>
                    <span className={`ml-2 text-sm ${plan.highlighted ? "text-indigo-100" : "text-gray-500"}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`mt-2 text-sm ${plan.highlighted ? "text-indigo-100" : "text-gray-600"}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className={`h-5 w-5 mr-3 flex-shrink-0 ${plan.highlighted ? "text-indigo-200" : "text-green-500"}`} />
                      <span className={plan.highlighted ? "text-indigo-50" : "text-gray-700"}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/signup"
                  className={`mt-8 block w-full text-center py-3 px-6 rounded-xl font-medium transition-all ${
                    plan.highlighted
                      ? "bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg"
                      : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-md"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Teams love how the pieces fit
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See how businesses are building their perfect CRM with Confadium.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100 relative"
              >
                {/* Puzzle piece accent */}
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <PuzzlePieceIcon className="h-6 w-6 text-white" />
                </div>

                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden">
        {/* Background puzzle pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10">
            <PuzzlePiece className="w-64 h-64 text-white" variant="left" />
          </div>
          <div className="absolute bottom-10 right-10">
            <PuzzlePiece className="w-48 h-48 text-white" variant="right" />
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl mb-8">
            <PuzzlePieceIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to build your perfect CRM?
          </h2>
          <p className="text-xl text-indigo-100 mb-10">
            Start connecting the pieces today. Your ideal workflow is just a few configurations away.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 text-lg font-medium text-indigo-600 bg-white rounded-xl hover:bg-indigo-50 transition-all shadow-lg transform hover:-translate-y-0.5"
            >
              Start Building Free
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 text-lg font-medium text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all"
            >
              Sign In
            </Link>
          </div>
          <p className="mt-6 text-indigo-200 text-sm">
            No credit card required. 14-day free trial.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <ConfadiumLogo className="h-8 w-8" />
                <span className="text-xl font-bold text-white">Confadium</span>
              </div>
              <p className="text-sm mb-4">
                The modular CRM where every piece fits perfectly. Build, automate, and scale.
              </p>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <PuzzlePieceIcon className="h-4 w-4" />
                <span>Pieces that fit together</span>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#configurations" className="hover:text-white transition-colors">Configurations</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Confadium. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
