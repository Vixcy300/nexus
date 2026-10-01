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

import { checkAdminAuth, getStoredUsers, TOTAL_FREE_QUOTA } from './services/storeService'

export default function App() {
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false)
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false)
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false)
  
  const [remainingSlots, setRemainingSlots] = useState(() => {
    try {
      return Math.max(0, TOTAL_FREE_QUOTA - getStoredUsers().length)
    } catch {
      return 988
    }
  })

  const updateRemainingSlots = () => {
    try {
      setRemainingSlots(Math.max(0, TOTAL_FREE_QUOTA - getStoredUsers().length))
    } catch {}
  }

  // Check URL hash (#admin) or keyboard shortcut (Alt+A) to open admin
  useEffect(() => {
    updateRemainingSlots()

    const checkHash = () => {
      if (window.location.hash === '#admin') {
        handleOpenAdminLogin()
      }
    }

    checkHash()
    window.addEventListener('hashchange', checkHash)

    const handleKeyDown = (e) => {
      if ((e.altKey && (e.key === 'a' || e.key === 'A')) || (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault()
        handleOpenAdminLogin()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('hashchange', checkHash)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleOpenAccessModal = () => {
    setIsAccessModalOpen(true)
  }

  const handleOpenAdminLogin = () => {
    if (checkAdminAuth()) {
      setIsAdminDashboardOpen(true)
    } else {
      setIsAdminLoginOpen(true)
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
          <ProcessTimeline />
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
        
        <Footer 
          onOpenAdminLogin={handleOpenAdminLogin} 
        />

        {/* User Registration Modal (Silent background geolocation capture) */}
        <AccessModal 
          isOpen={isAccessModalOpen} 
          onClose={() => setIsAccessModalOpen(false)} 
          onUserRegistered={updateRemainingSlots} 
        />

        {/* Discreet Admin Authentication Modal */}
        <AdminLoginModal 
          isOpen={isAdminLoginOpen} 
          onClose={() => setIsAdminLoginOpen(false)} 
          onLoginSuccess={handleAdminLoginSuccess} 
        />

        {/* Standard Informative Admin Dashboard */}
        <AdminDashboard 
          isOpen={isAdminDashboardOpen} 
          onClose={() => {
            setIsAdminDashboardOpen(false)
            if (window.location.hash === '#admin') {
              history.pushState("", document.title, window.location.pathname + window.location.search);
            }
          }} 
          onRefreshData={updateRemainingSlots} 
        />
      </div>
    </MotionConfig>
  )
}
