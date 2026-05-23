import Link from 'next/link';
import Image from 'next/image';

const GOOGLE_LOGIN_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/auth/google/login`;

const features = [
  {
    icon: 'edit_document',
    title: 'Draft & Sign',
    description: 'Create instant editing and archiving permissions.',
  },
  {
    icon: 'receipt_long',
    title: 'Smart Invoicing',
    description: 'Process quality, worry-free payment tracking.',
  },
  {
    icon: 'calendar_today',
    title: 'Seamless Scheduling',
    description: 'Trusted by Modern B2B teams of 200+ professionals',
  },
  {
    icon: 'notifications_active',
    title: 'Stay Notified',
    description: 'Limit notifications, monitor automated tracking of refractory editing and progress.',
  },
  {
    icon: 'person_add',
    title: 'Easy Onboarding',
    description: 'Complete onboarding, billed properly from initial introduction.',
  },
  {
    icon: 'devices',
    title: 'Stay Notified',
    description: 'Lease omnifunction integrated device, observing solid precise activity on additions.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080f1e]">
      {/* Navigation */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <nav className="flex items-center px-10 py-5 max-w-7xl mx-auto">
          {/* Logo — left */}
          <div className="flex items-center gap-2 flex-none">
            <span className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-black"
                style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}
              >
                business_center
              </span>
            </span>
            <span className="text-white font-semibold text-sm tracking-wide whitespace-nowrap">
              B2B Business Ops
            </span>
          </div>

          {/* Links — center */}
          <div className="flex items-center gap-8 mx-auto">
            <Link
              href="/login"
              className="text-white/85 text-sm font-medium hover:text-white transition-colors"
            >
              Log In
            </Link>
            <a
              href="#features"
              className="text-white/85 text-sm font-medium hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href={GOOGLE_LOGIN_URL}
              className="text-white/85 text-sm font-medium hover:text-white transition-colors"
            >
              Sign Up with Google
            </a>
          </div>

          {/* CTA — right */}
          <Link
            href="/register"
            className="flex-none bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm px-7 py-2.5 rounded-full transition-colors shadow-lg"
          >
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Background photo — fills the full section */}
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.jpg"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Dark overlay for text legibility */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(5,8,15,0.60) 0%, rgba(5,8,15,0.20) 30%, rgba(5,8,15,0.45) 70%, rgba(5,8,15,0.97) 100%)',
            }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center px-6 max-w-3xl mx-auto">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.08] tracking-tight mb-6 text-center">
            B2B Business
            <br />
            Ops
          </h1>
          <p className="text-white/70 text-lg max-w-lg leading-relaxed text-center">
            The intelligent AI workspace to generate contracts, manage invoices, and sync your
            meetings in one ultra-clean environment.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-[#080f1e] pt-20 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-bold tracking-[0.45em] uppercase text-white mb-20">
            F E A T U R E S
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-14">
            {features.map((feature, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  <span
                    className="material-symbols-outlined text-white/60"
                    style={{ fontSize: '22px', fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                  >
                    {feature.icon}
                  </span>
                </div>
                <h3 className="font-semibold text-base text-white">{feature.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#080f1e] border-t border-white/5 py-6 text-center">
        <p className="text-white/30 text-sm">© 2026 | B2B Business Ops | All rights reserved</p>
      </footer>
    </div>
  );
}
