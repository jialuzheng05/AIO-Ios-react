import { useEffect, useRef, useState } from 'react'
import { defaultPaywallConfig } from './config'
import { paywallBridge } from './bridge'
import overviewVideo from './assets/figma/raw-2.png'
import satScore1520 from './assets/figma/raw-1.png'
import satScorePhone from './assets/figma/raw-4.png'
import satScore1530 from './assets/figma/raw-7.png'
import statusIcons from './assets/figma/status-icons.svg'
import examPlusIcon from './assets/figma/exam-plus-icon.svg'
import playIcon from './assets/figma/play-icon.svg'
import checkIcon from './assets/figma/check-icon.svg'
import starIcon from './assets/figma/star-icon.svg'
import quoteIcon from './assets/figma/quote-icon.svg'
import shieldCheckIcon from './assets/figma/shield-check.svg'
import fireIcon from './assets/figma/fire-icon.svg'
import topicIcon from './assets/figma/Icon-Solvely-Topic2.svg'
import focusTopicsPreview from './assets/figma/product-preview/focus-topics.png'
import focusedPracticePreview from './assets/figma/product-preview/focused-practice.png'
import mockExamPreview from './assets/figma/product-preview/mock-exam.png'
import scoreReportPreview from './assets/figma/product-preview/score-report.png'
import videoGuidePreview from './assets/figma/product-preview/video-guide.png'
import examPrepOverview from './assets/exam-prep-overview.mp4'

function StatusBar({ className = '' }) {
  return <div className={`pw-status${className ? ` ${className}` : ''}`}><strong>9:41</strong><img src={statusIcons} alt="" aria-hidden="true" /></div>
}

function PaywallBackdrop({ onClose }) {
  return <>
    <div className="paywall-backdrop" aria-hidden="true">
      <StatusBar className="backdrop-status" />
    </div>
    <button className="backdrop-close" onClick={onClose} aria-label="Close paywall" />
  </>
}

function SalesIntro() {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef(null)

  const playOverview = async () => {
    setIsPlaying(true)
    window.requestAnimationFrame(() => {
      videoRef.current?.play().catch(() => setIsPlaying(false))
    })
  }

  return <section className="sales-intro">
    <div className="hero-copy">
      <span className="exam-plus-badge"><img src={examPlusIcon} alt="" />EXAM PLUS</span>
      <h1>Ace <em>SAT®</em> with a personalized study plan</h1>
      <p>Practice with real SAT questions tailored to your weak spots. Learn faster with expert-led SAT videos covering key topics, test strategies, and question walkthroughs.</p>
    </div>
    <div className="sales-video-card">
      <div className={`sales-video${isPlaying ? ' is-playing' : ''}`}>
        {isPlaying
          ? <video ref={videoRef} src={examPrepOverview} poster={overviewVideo} controls playsInline preload="metadata" onEnded={() => setIsPlaying(false)} aria-label="Exam Prep by Solvely AI overview video" />
          : <><img className="sales-video-poster" src={overviewVideo} alt="Study smarter, score higher with Solvely AI" /><button onClick={playOverview} aria-label="Play overview video"><img src={playIcon} alt="" /></button></>}
      </div>
      <strong>Exam Prep by Solvely AI - Quick Overview</strong>
    </div>
  </section>
}

const slides = [
  { caption: 'Focus on high-impact SAT topics', image: focusTopicsPreview },
  { caption: 'Video, guide, and Practice in every topic', image: videoGuidePreview },
  { caption: 'Take a realistic full-length mock exam', image: mockExamPreview },
  { caption: 'Get a detailed SAT score report', image: scoreReportPreview },
  { caption: 'Turn weak skills into focused practice', image: focusedPracticePreview },
]

const previewLoop = [slides[slides.length - 1], ...slides, slides[0]]

function useHorizontalSwipe({ onNext, onPrevious, threshold = 48, onInteraction }) {
  const gesture = useRef({ pointerId: null, startX: 0, startY: 0, deltaX: 0, axis: null })
  const dragEndedAt = useRef(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)

  const finishGesture = (event, cancelled = false) => {
    const current = gesture.current
    if (current.pointerId === null || (event.pointerId != null && current.pointerId !== event.pointerId)) return

    const pointerId = current.pointerId
    const draggedHorizontally = current.axis === 'x' && Math.abs(current.deltaX) > 6
    const shouldChange = !cancelled && current.axis === 'x' && Math.abs(current.deltaX) >= threshold
    if (draggedHorizontally) dragEndedAt.current = Date.now()

    gesture.current = { pointerId: null, startX: 0, startY: 0, deltaX: 0, axis: null }
    setDragOffset(0)
    setIsDragging(false)
    setIsInteracting(false)

    if (event.currentTarget.hasPointerCapture?.(pointerId)) event.currentTarget.releasePointerCapture(pointerId)
    if (!shouldChange) return
    if (current.deltaX < 0) onNext()
    else onPrevious()
  }

  const pointerHandlers = {
    onPointerDown: event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      if (gesture.current.pointerId !== null) return
      gesture.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, deltaX: 0, axis: null }
      setIsInteracting(true)
      onInteraction?.()
      event.currentTarget.setPointerCapture?.(event.pointerId)
    },
    onPointerMove: event => {
      const current = gesture.current
      if (current.pointerId !== event.pointerId) return

      const deltaX = event.clientX - current.startX
      const deltaY = event.clientY - current.startY
      current.deltaX = deltaX

      if (!current.axis && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
        current.axis = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y'
        if (current.axis === 'x') setIsDragging(true)
      }

      if (current.axis !== 'x') return
      event.preventDefault()
      setDragOffset(deltaX)
    },
    onPointerUp: event => finishGesture(event),
    onPointerCancel: event => finishGesture(event, true),
    onLostPointerCapture: event => finishGesture(event, true),
  }

  return {
    dragOffset,
    isDragging,
    isInteracting,
    pointerHandlers,
    shouldIgnoreClick: () => Date.now() - dragEndedAt.current < 500,
  }
}

function DevicePreview() {
  const [trackIndex, setTrackIndex] = useState(1)
  const [teleporting, setTeleporting] = useState(false)
  const [autoplayVersion, setAutoplayVersion] = useState(0)
  const activeSlide = trackIndex === 0 ? slides.length - 1 : trackIndex === slides.length + 1 ? 0 : trackIndex - 1
  const markInteraction = () => setAutoplayVersion(value => value + 1)
  const showNext = () => setTrackIndex(value => Math.min(value + 1, slides.length + 1))
  const showPrevious = () => setTrackIndex(value => Math.max(value - 1, 0))
  const swipe = useHorizontalSwipe({ onNext: showNext, onPrevious: showPrevious, onInteraction: markInteraction })

  useEffect(() => {
    if (swipe.isInteracting) return undefined
    const timer = window.setTimeout(showNext, 4200)
    return () => window.clearTimeout(timer)
  }, [trackIndex, swipe.isInteracting, autoplayVersion])

  const finishTransition = event => {
    if (event.target !== event.currentTarget || event.propertyName !== 'transform') return
    if (trackIndex !== 0 && trackIndex !== slides.length + 1) return
    setTeleporting(true)
    setTrackIndex(trackIndex === 0 ? slides.length : 1)
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => setTeleporting(false)))
  }

  const handleCanvasClick = event => {
    if (swipe.shouldIgnoreClick()) {
      event.preventDefault()
      return
    }
    markInteraction()
    showNext()
  }

  return <section className="product-preview">
    <div className="product-title"><span>PRODUCT PREVIEW</span><h2>Solvely in Action</h2></div>
    <button className={`preview-canvas${swipe.isDragging ? ' dragging' : ''}`} {...swipe.pointerHandlers} onClick={handleCanvasClick} aria-label="Swipe or tap to show another product preview">
      <div className={`slides-track${swipe.isDragging ? ' dragging' : ''}${teleporting ? ' teleporting' : ''}`} style={{ transform: `translateX(calc(-${trackIndex * 100}% + ${swipe.dragOffset}px))` }} onTransitionEnd={finishTransition}>{previewLoop.map((slide, index) => <div className="preview-slide" key={`${slide.caption}-${index}`} aria-hidden={trackIndex !== index}><img src={slide.image} alt={slide.caption} draggable="false" /></div>)}</div>
    </button>
    <div className="preview-caption"><p>{slides[activeSlide].caption}</p><div className="carousel-dots">{slides.map((slide, index) => <button key={slide.caption} aria-label={`Show preview ${index + 1}`} className={activeSlide === index ? 'active' : ''} onClick={() => { markInteraction(); setTrackIndex(index + 1) }} />)}</div></div>
  </section>
}

function Benefits({ benefits }) {
  return <section className="sat-benefits">
    <div className="benefit-heading"><h2>Everything You need for SAT Success</h2><img className="benefit-topic-icon" src={topicIcon} alt="" aria-hidden="true" /></div>
    <div className="benefit-divider" />
    <div className="benefit-list">{benefits.map(benefit => <div className="sat-benefit" key={benefit.title}><p>{benefit.title}</p><img src={checkIcon} alt="Included" /></div>)}</div>
  </section>
}

function ScoreProof() {
  return <section className="score-proof"><strong>95%</strong><p>of our students improve their SAT scores<br />by 150+ points</p></section>
}

const reviews = [
  { name: 'Sarah L.', score: '1520', image: satScore1520, text: 'First attempt and scored 1520! Math 800 full score! The score tracking feature helped me focus on my weak areas and ace the test on my first try.', mode: 'cover' },
  { name: 'Nick', score: '1500', image: satScorePhone, text: 'Improved from 1380 to 1500. Reading and Writing 760! The explanations and practice tests helped me build confidence and avoid careless mistakes.', mode: 'cover' },
  { name: 'Alex W.', score: '1530', image: satScore1530, text: 'My SAT score jumped from 1460 to 1530 in just 3 months. The practice questions were incredibly similar to the real test.', mode: 'contain' },
]

const reviewLoop = [reviews[2], ...reviews, reviews[0]]

function StudentReviews() {
  const [trackIndex, setTrackIndex] = useState(1)
  const [teleporting, setTeleporting] = useState(false)
  const [autoplayVersion, setAutoplayVersion] = useState(0)
  const hasAutoAdvanced = useRef(false)
  const activeReview = trackIndex === 0 ? reviews.length - 1 : trackIndex === reviews.length + 1 ? 0 : trackIndex - 1
  const markInteraction = () => setAutoplayVersion(value => value + 1)
  const showNext = () => setTrackIndex(value => Math.min(value + 1, reviews.length + 1))
  const showPrevious = () => setTrackIndex(value => Math.max(value - 1, 0))
  const swipe = useHorizontalSwipe({ onNext: showNext, onPrevious: showPrevious, onInteraction: markInteraction })

  useEffect(() => {
    if (swipe.isInteracting) return undefined
    const timer = window.setTimeout(() => {
      hasAutoAdvanced.current = true
      showNext()
    }, hasAutoAdvanced.current ? 2500 : 2000)
    return () => window.clearTimeout(timer)
  }, [trackIndex, swipe.isInteracting, autoplayVersion])

  const finishTransition = event => {
    if (event.target !== event.currentTarget || event.propertyName !== 'transform') return
    if (trackIndex !== 0 && trackIndex !== reviews.length + 1) return
    setTeleporting(true)
    setTrackIndex(trackIndex === 0 ? reviews.length : 1)
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => setTeleporting(false)))
  }

  return <section className="student-reviews" aria-label="Student success stories">
    <div className={`review-viewport${swipe.isDragging ? ' dragging' : ''}`} {...swipe.pointerHandlers}>
      <div className={`review-track${swipe.isDragging ? ' dragging' : ''}${teleporting ? ' teleporting' : ''}`} style={{ transform: `translateX(${21 - trackIndex * 324 + swipe.dragOffset}px)` }} onTransitionEnd={finishTransition}>
        {reviewLoop.map((review, index) => <article className="review-card" key={`${review.name}-${index}`} aria-hidden={trackIndex !== index}>
          <div className="review-meta"><strong>{review.name}</strong><span aria-label="5 out of 5 stars">{Array.from({ length: 5 }, (_, star) => <img src={starIcon} alt="" key={star} />)}</span></div>
          <div className="review-copy"><img src={quoteIcon} alt="" /><p>{review.text}</p></div>
          <div className={`review-score-image ${review.mode}`}><img src={review.image} alt={`${review.name} SAT score ${review.score}`} draggable="false" /></div>
        </article>)}
      </div>
    </div>
    <div className="review-dots">{reviews.map((review, index) => <button key={review.name} className={activeReview === index ? 'active' : ''} aria-label={`Show ${review.name} review`} onClick={() => { markInteraction(); setTrackIndex(index + 1) }} />)}</div>
  </section>
}

function SocialReviews() {
  return <section className="social-reviews"><ScoreProof /><StudentReviews /></section>
}

function GuaranteeCard() {
  return <section className="guarantee-section"><div className="guarantee-card"><div><img src={shieldCheckIcon} alt="" /><strong>Score improvement guaranteed!</strong></div><p>Complete at least 50% of your study plan, and if your score doesn't improve, we'll refund your entire purchase price. No hassle, no questions asked.</p></div></section>
}

function OfferPrice({ price }) {
  const match = price.match(/^(\D*)(\d+)(.*)$/)
  if (!match) return <strong className="offer-price">{price}</strong>
  return <strong className="offer-price"><span>{match[1]}</span><b>{match[2]}</b><span>{match[3]}</span></strong>
}

export default function PaywallPage({ config = defaultPaywallConfig, onClose }) {
  const [status, setStatus] = useState('ready')
  const [previewScale, setPreviewScale] = useState(1)

  useEffect(() => {
    const fitDevice = () => setPreviewScale(Math.min(1, (window.innerWidth - 32) / 406, (window.innerHeight - 32) / 860))
    fitDevice(); window.addEventListener('resize', fitDevice)
    return () => window.removeEventListener('resize', fitDevice)
  }, [])

  useEffect(() => {
    const onMessage = event => {
      if (event.detail?.type === 'purchaseResult') setStatus(event.detail.success ? 'success' : 'error')
      if (event.detail?.type === 'restoreResult') setStatus(event.detail.success ? 'success' : 'ready')
    }
    window.handlePaywallMessage = message => window.dispatchEvent(new CustomEvent('paywall:message', { detail: message }))
    window.addEventListener('paywall:message', onMessage)
    return () => { window.removeEventListener('paywall:message', onMessage); delete window.handlePaywallMessage }
  }, [])

  const purchase = () => {
    if (status === 'purchasing' || status === 'success') return
    setStatus('purchasing'); paywallBridge.purchase(config.productId)
  }

  return <main className="paywall-stage">
    <div className="device-viewport" style={{ width: 406 * previewScale, height: 860 * previewScale }}>
      <div className="device-frame" style={{ transform: `scale(${previewScale})` }}>
        <div className="paywall-page">
          <PaywallBackdrop onClose={onClose || paywallBridge.close} />
          <div className="paywall-sheet-backplate" aria-hidden="true" />
          <section className="paywall-sheet" aria-label="SAT Exam Plus offer">
            <div className="paywall-sheet-handle" aria-hidden="true"><span /></div>
            <div className="figma-paywall-scroll">
              <SalesIntro />
              <DevicePreview />
              <Benefits benefits={config.benefits} />
              <SocialReviews />
              <GuaranteeCard />
              <div className="purchase-spacer" />
            </div>
            <section className="figma-purchase-bar">
              {status === 'success' ? <p className="purchase-feedback success">Your SAT access is active.</p> : status === 'error' ? <p className="purchase-feedback error">Purchase failed. Please try again.</p> : <div className="offer-line"><div><span>First Week Offer</span><del>{config.originalPrice}</del></div><OfferPrice price={config.offerPrice} /><em>{config.discount.replace('🔥', '').trim()}<img src={fireIcon} alt="" /></em></div>}
              <div className="purchase-action"><button disabled={status === 'purchasing' || status === 'success'} onClick={purchase}>{status === 'purchasing' ? 'Connecting…' : status === 'success' ? 'Access Activated' : config.ctaText}</button><p>then {config.renewalPrice}. Cancel anytime</p></div>
              <div className="purchase-home-indicator"><span /></div>
            </section>
          </section>
        </div>
      </div>
    </div>
  </main>
}
