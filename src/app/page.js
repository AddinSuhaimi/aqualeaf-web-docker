import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: 'AquaLeaf',
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/aqualeaf-logo.png"
              alt="AquaLeaf Logo"
              width={40}
              height={40}
            />
            <span className="text-2xl font-semibold text-gray-800">AquaLeaf</span>
          </div>
          {/* Nav Links */}
          <nav className="flex items-center gap-6">
            <Link href="#updates" className="text-gray-600 hover:text-gray-900">
              Latest Updates
            </Link>
            <Link href="#info" className="text-gray-600 hover:text-gray-900">
              Seaweed Information
            </Link>
            <Link href="#contact" className="text-gray-600 hover:text-gray-900">
              Contact
            </Link>
          </nav>
          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/register"
              className="px-4 py-2 bg-leaf hover:bg-leaf text-white rounded-md"
            >
              Register
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-ocean hover:bg-ocean text-white rounded-md"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-grow bg-gray-50">
        <div className="container mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Logo & Tagline */}
          <div className="space-y-6">
            <Image
              src="/aqualeaf-logo-words.png"
              alt="AquaLeaf Hero"
              width={400}
              height={400}
            />
            <h1 className="text-4xl font-bold text-gray-800">
              AI-Based Mobile App for Seaweed Quality Control
            </h1>
          </div>
          {/* Right: CTAs */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Get Started Now
              </h2>
              <Link
                href="/register"
                className="inline-block px-6 py-3 bg-leaf hover:bg-leaf text-white rounded-md"
              >
                Register Farm Account
              </Link>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Already Have an Account?
              </h2>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-ocean hover:bg-ocean text-white rounded-md"
              >
                Sign In as Farm Manager
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section id="info" className="bg-white py-16">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Info Card 1 */}
          <div className="flex flex-col items-center text-center gap-4">
            <Image
              src="/info-icon.svg"
              alt="What is AquaLeaf?"
              width={24}
              height={24}
            />
            <h3 className="text-lg font-semibold text-gray-800">
              What is AquaLeaf?
            </h3>
            <p className="text-gray-600">
              AquaLeaf is a smart seaweed quality inspection system powered by AI.
              It helps farmers assess seaweed health instantly using just their
              mobile device.
            </p>
          </div>

          {/* Info Card 2 */}
          <div className="flex flex-col items-center text-center gap-4">
            <Image
              src="/info-icon.svg"
              alt="AI Quality Detection"
              width={24}
              height={24}
            />
            <h3 className="text-lg font-semibold text-gray-800">
              AI Quality Detection
            </h3>
            <p className="text-gray-600">
              Using advanced computer vision models, it can detect
              discoloration, texture issues, and other defects so you can harvest
              with confidence.
            </p>
          </div>

          {/* Info Card 3 */}
          <div className="flex flex-col items-center text-center gap-4">
            <Image
              src="/info-icon.svg"
              alt="Mobile App for Farmers"
              width={24}
              height={24}
            />
            <h3 className="text-lg font-semibold text-gray-800">
              Mobile App for Farmers
            </h3>
            <p className="text-gray-600">
              Scan, analyze, and log seaweed quality in real-time, anytime.
              AquaLeaf simplifies inspections and increases productivity.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-6 flex items-center justify-center gap-3">
          {/* Placeholder admin icon */}
          <Image
            src="/aqualeaf-logo.png"
            alt="Admin Icon"
            width={24}
            height={24}
          />
          <Link
            href="/admin/login"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-medium flex items-center"
          >
            Login as Administrator
          </Link>
        </div>
      </footer>

    </div>
  )
}
