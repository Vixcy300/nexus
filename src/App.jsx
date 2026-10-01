import { useState, useEffect } from 'react'
import { MotionConfig } from 'framer-motion'

import CustomCursor from './components/ui/CustomCursor'
import ScrollProgressBar from './components/ui/ScrollProgressBar'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import LogoCloud from './components/sections/LogoCloud'
import StorySection from './components/sections/StorySection'
import ServicesGrid from './components/sections/ServicesGrid'
import ProcessTimeline from './components/sections/ProcessTimeline'
import CaseStudies from './components/sections/CaseStudies'
import StatsSection from './components/sections/StatsSection'
import TeamSection from './components/sections/TeamSection'
import TestimonialsCarousel from './components/sections/TestimonialsCarousel'
import TechStack from './components/sections/TechStack'
import PricingSection from './components/sections/PricingSection'
import FAQSection from './components/sections/FAQSection'
import BlogPreview from './components/sections/BlogPreview'
import CTASection from './components/sections/CTASection'

import AccessModal from './components/modals/AccessModal'
import AdminLoginModal from './components/admin/AdminLoginModal'
import AdminDashboard from './components/admin/AdminDashboard'

import { checkAdminAuth, getRemainingSlots } from './services/storeService'

export default function App() {
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false)
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false)
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false)
  
  const [remainingSlots, setRemainingSlots] = useState(() => {
    try {
      return getRemainingSlots()
    } catch {
      return 988
    }
  })

  const updateSlots = () => {
    try {
      setRemainingSlots(getRemainingSlots())
    } catch {}
  }

  // Open admin ONLY when URL path is /admin or #admin
  // No keyboard shortcuts (no Alt+A, etc.)
  useEffect(() => {
    const checkAdminRoute = () => {
      const path = (window.location.pathname || '').toLowerCase()
      const hash = (window.location.hash || '').toLowerCase()

      if (path === '/admin' || path === '/admin/' || hash === '#admin') {
        if (checkAdminAuth()) {
          setIsAdminDashboardOpen(true)
          setIsAdminLoginOpen(false)
        } else {
          setIsAdminLoginOpen(true)
          setIsAdminDashboardOpen(false)
        }
      }
    }

    checkAdminRoute()

    window.addEventListener('popstate', checkAdminRoute)
    window.addEventListener('hashchange', checkAdminRoute)

    const handleSlotsEvent = () => updateSlots()
    window.addEventListener('nexus_slots_updated', handleSlotsEvent)
    window.addEventListener('storage', handleSlotsEvent)

    return () => {
      window.removeEventListener('popstate', checkAdminRoute)
      window.removeEventListener('hashchange', checkAdminRoute)
      window.removeEventListener('nexus_slots_updated', handleSlotsEvent)
      window.removeEventListener('storage', handleSlotsEvent)
    }
  }, [])

  const handleOpenAccessModal = () => {
    setIsAccessModalOpen(true)
  }

  const handleCloseAdmin = () => {
    setIsAdminDashboardOpen(false)
    setIsAdminLoginOpen(false)
    const path = (window.location.pathname || '').toLowerCase()
    const hash = (window.location.hash || '').toLowerCase()
    if (path === '/admin' || path === '/admin/' || hash === '#admin') {
      window.history.pushState(null, '', '/')
    }
  }

  const handleAdminLoginSuccess = () => {
    setIsAdminLoginOpen(false)
    setIsAdminDashboardOpen(true)
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative bg-ink-950 font-body text-mist-100 overflow-x-hidden selection:bg-signal selection:text-ink-950">
        <CustomCursor />
        <ScrollProgressBar />
        
        {/* Navigation Bar */}
        <Navbar 
          onOpenAccessModal={handleOpenAccessModal} 
          remainingSlots={remainingSlots} 
        />
        
        <main>
          <Hero 
            onOpenAccessModal={handleOpenAccessModal} 
            remainingSlots={remainingSlots} 
          />
          <LogoCloud />
          <StorySection />
          <ServicesGrid />
          <ProcessTimeline 
            onOpenAccessModal={handleOpenAccessModal} 
            remainingSlots={remainingSlots} 
          />
          <CaseStudies />
          <StatsSection />
          <TeamSection />
          <TestimonialsCarousel />
          <TechStack />
          <PricingSection 
            onOpenAccessModal={handleOpenAccessModal} 
            remainingSlots={remainingSlots} 
          />
          <FAQSection />
          <BlogPreview />
          <CTASection 
            onOpenAccessModal={handleOpenAccessModal} 
            remainingSlots={remainingSlots} 
          />
        </main>
        
        <Footer />

        {/* User Registration Modal */}
        <AccessModal 
          isOpen={isAccessModalOpen} 
          onClose={() => setIsAccessModalOpen(false)} 
          onUserRegistered={updateSlots} 
        />

        {/* Admin Login Modal - Only opened via /admin URL */}
        <AdminLoginModal 
          isOpen={isAdminLoginOpen} 
          onClose={handleCloseAdmin} 
          onLoginSuccess={handleAdminLoginSuccess} 
        />

        {/* Admin Dashboard */}
        <AdminDashboard 
          isOpen={isAdminDashboardOpen} 
          onClose={handleCloseAdmin} 
          onRefreshData={updateSlots} 
        />
      </div>
    </MotionConfig>
  )
}
