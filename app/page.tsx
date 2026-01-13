import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Zap, Sparkles, Users, Calendar, FolderKanban } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tudoo - Task Tracker & Project Management Gratis | Pencatatan Tugas Modern",
  description: "Tudoo adalah aplikasi task tracker dan pencatatan tugas gratis untuk individu dan tim. Kelola proyek, lacak progress, dan tingkatkan produktivitas dengan mudah. Daftar gratis sekarang!",
  keywords: [
    "task tracker gratis",
    "aplikasi pencatatan tugas",
    "project management",
    "to do list online",
    "manajemen tugas",
    "aplikasi produktivitas",
    "task management app",
    "tudoo app"
  ],
}

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Tudoo",
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "Aplikasi task tracker dan project management modern untuk mengorganisir pekerjaan dan melacak progress tim Anda.",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "150"
  },
  "featureList": [
    "Task Management",
    "Project Organization",
    "Team Collaboration",
    "Calendar View",
    "Real-time Sync",
    "Dark Mode"
  ]
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Tudoo",
  "url": "https://tudoo.app",
  "logo": "https://tudoo.app/icon.svg",
  "sameAs": [
    "https://twitter.com/tudooapp"
  ]
}

export default function LandingPage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>

        {/* Navigation */}
        <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50" aria-label="Main navigation">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent" aria-label="Tudoo Home">
              Tudoo
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-white hover:bg-white/10">Login</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                  Daftar Gratis
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative" aria-labelledby="hero-heading">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="inline-block">
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-sm text-purple-300 mb-6 animate-pulse">
                  ✨ Task Tracker & Project Management Modern
                </div>
              </div>
              <h1 id="hero-heading" className="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent text-balance leading-tight">
                Tudoo — Pencatatan Tugas & Task Tracker
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 text-balance max-w-3xl mx-auto leading-relaxed">
                Aplikasi task tracker gratis untuk mengorganisir pekerjaan, mencatat tugas harian, dan melacak progress proyek. Cocok untuk individu maupun tim.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/auth/sign-up">
                <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] transition-all">
                  Mulai Gratis Sekarang
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="text-lg px-10 py-6 bg-white/5 text-white border-white/20 hover:bg-white/10 backdrop-blur-sm">
                  Masuk ke Akun
                </Button>
              </Link>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-600/30 rounded-full blur-[120px] animate-pulse" aria-hidden="true"></div>
          <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-blue-600/30 rounded-full blur-[120px] animate-pulse delay-1000" aria-hidden="true"></div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10" aria-labelledby="features-heading">
          <div className="text-center mb-16">
            <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-white mb-4">
              Fitur Lengkap untuk Produktivitas Maksimal
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola tugas dan proyek dalam satu aplikasi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <article className="group p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-7 h-7 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Task Management</h3>
              <p className="text-gray-400 leading-relaxed">
                Buat, edit, dan kelola tugas dengan mudah. Atur status To Do, In Progress, dan Done untuk melacak progress.
              </p>
            </article>

            <article className="group p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FolderKanban className="w-7 h-7 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Project & Folder</h3>
              <p className="text-gray-400 leading-relaxed">
                Organisir tugas dalam proyek dan folder. Drag & drop untuk memindahkan proyek antar folder dengan mudah.
              </p>
            </article>

            <article className="group p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-600 to-pink-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Kolaborasi Tim</h3>
              <p className="text-gray-400 leading-relaxed">
                Undang anggota tim untuk berkolaborasi dalam proyek. Notifikasi real-time untuk setiap update.
              </p>
            </article>

            <article className="group p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Calendar View</h3>
              <p className="text-gray-400 leading-relaxed">
                Lihat semua tugas dalam tampilan kalender. Set due date dan pantau deadline dengan mudah.
              </p>
            </article>

            <article className="group p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-600 to-yellow-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Real-time Sync</h3>
              <p className="text-gray-400 leading-relaxed">
                Sinkronisasi real-time di semua perangkat. Perubahan langsung terlihat tanpa perlu refresh.
              </p>
            </article>

            <article className="group p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Dark Mode</h3>
              <p className="text-gray-400 leading-relaxed">
                Tampilan gelap yang nyaman untuk mata. Desain modern dan minimalis untuk fokus maksimal.
              </p>
            </article>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10" aria-labelledby="cta-heading">
          <div className="relative rounded-3xl p-12 border border-white/10 bg-gradient-to-br from-purple-900/30 via-black/50 to-blue-900/30 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10" aria-hidden="true"></div>
            <div className="relative z-10">
              <h2 id="cta-heading" className="text-4xl md:text-5xl font-bold text-white mb-6">
                Siap Meningkatkan Produktivitas?
              </h2>
              <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Mulai gunakan Tudoo sekarang dan rasakan cara baru mengelola tugas dengan lebih efisien. Gratis selamanya untuk penggunaan personal.
              </p>
              <Link href="/auth/sign-up">
                <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:shadow-[0_0_60px_rgba(168,85,247,0.7)] transition-all">
                  Daftar Gratis Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/50 backdrop-blur-xl py-12 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
                  Tudoo
                </h3>
                <p className="text-gray-400 text-sm">
                  Aplikasi task tracker dan project management modern untuk produktivitas maksimal.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Produk</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="/auth/sign-up" className="hover:text-white transition-colors">Daftar Gratis</Link></li>
                  <li><Link href="/auth/login" className="hover:text-white transition-colors">Login</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Fitur</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>Task Management</li>
                  <li>Project Organization</li>
                  <li>Team Collaboration</li>
                  <li>Calendar View</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Kata Kunci</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>Task Tracker</li>
                  <li>Pencatatan Tugas</li>
                  <li>To Do List</li>
                  <li>Project Management</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
              <p>© 2025 Tudoo. Task Tracker & Project Management. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
