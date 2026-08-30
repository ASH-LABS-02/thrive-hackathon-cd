import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion'
import { ArrowDown, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import React from 'react'
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { chapters } from './data.js'

const JourneyCanvas = lazy(() => import('./JourneyCanvas.jsx'))

function useSoundscape(enabled) {
  const audioRef = useRef(null)

  useEffect(() => {
    if (!enabled) {
      if (audioRef.current) audioRef.current.gain.gain.setTargetAtTime(0, audioRef.current.context.currentTime, 0.08)
      return
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    if (!audioRef.current) {
      const context = new AudioContext()
      const master = context.createGain()
      const bed = context.createOscillator()
      const overtone = context.createOscillator()
      const filter = context.createBiquadFilter()
      master.gain.value = 0
      bed.type = 'sine'
      overtone.type = 'triangle'
      bed.frequency.value = 48
      overtone.frequency.value = 96.4
      filter.type = 'lowpass'
      filter.frequency.value = 320
      bed.connect(filter)
      overtone.connect(filter)
      filter.connect(master)
      master.connect(context.destination)
      bed.start()
      overtone.start()
      audioRef.current = { context, gain: master }
    }

    const { context, gain } = audioRef.current
    context.resume()
    gain.gain.setTargetAtTime(0.022, context.currentTime, 0.25)
  }, [enabled])

  useEffect(() => () => {
    if (!audioRef.current) return
    audioRef.current.gain.gain.cancelScheduledValues(audioRef.current.context.currentTime)
    audioRef.current.context.close()
    audioRef.current = null
  }, [])

  return useCallback(() => {
    if (!enabled || !audioRef.current) return
    const { context, gain } = audioRef.current
    const oscillator = context.createOscillator()
    const cue = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(420, context.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(980, context.currentTime + 0.28)
    cue.gain.setValueAtTime(0.0001, context.currentTime)
    cue.gain.exponentialRampToValueAtTime(0.055, context.currentTime + 0.025)
    cue.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.34)
    oscillator.connect(cue)
    cue.connect(gain)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.36)
  }, [enabled])
}

function LoadingScreen({ progress }) {
  return (
    <motion.div className="loader" exit={{ opacity: 0 }} transition={{ duration: 0.48 }}>
      <div className="loader-mark"><span /></div>
      <p>Preparing the route</p>
      <div className="loader-track"><motion.div animate={{ width: `${progress}%` }} /></div>
      <span className="loader-value">{progress}%</span>
    </motion.div>
  )
}

function AnimatedTitle({ children, active, as: Heading = 'h2' }) {
  const words = children.split(' ')

  return (
    <Heading aria-label={children}>
      {words.map((word, index) => (
        <span className="title-word" aria-hidden="true" key={`${word}-${index}`}>
          <motion.span
            initial={false}
            animate={active ? { y: 0, rotateX: 0, opacity: 1 } : { y: '112%', rotateX: -42, opacity: 0 }}
            transition={{ duration: 0.58, delay: active ? index * 0.04 : 0, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
          </motion.span>
          {index < words.length - 1 ? '\u00a0' : ''}
        </span>
      ))}
    </Heading>
  )
}

function Chapter({ chapter, position, active, onEnter }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%'])
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.13, 1.025, 1.14])
  const imageOpacity = useTransform(scrollYProgress, [0, 0.16, 0.82, 1], [0.35, 1, 1, 0.35])
  const copyY = useTransform(scrollYProgress, [0, 0.2, 0.68, 1], [105, 0, 0, -105])
  const copyX = useTransform(
    scrollYProgress,
    [0, 0.2, 0.72, 1],
    chapter.align === 'right' ? [90, 0, 0, -55] : [-90, 0, 0, 55],
  )
  const copyOpacity = useTransform(scrollYProgress, [0, 0.15, 0.75, 1], [0, 1, 1, 0])
  const copyScale = useTransform(scrollYProgress, [0, 0.22, 0.76, 1], [0.94, 1, 1, 0.97])
  const edgeOpacity = useTransform(scrollYProgress, [0, 0.18, 0.8, 1], [0.2, 1, 1, 0.15])
  const scanX = useTransform(scrollYProgress, [0.04, 0.96], ['-115%', '115%'])
  const scanOpacity = useTransform(scrollYProgress, [0, 0.12, 0.86, 1], [0, 0.34, 0.34, 0])
  const ghostY = useTransform(scrollYProgress, [0, 1], [120, -130])
  const ghostRotate = useTransform(scrollYProgress, [0, 1], [-8, 8])
  const transitionScale = useTransform(scrollYProgress, [0.7, 1], [0, 1])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.28) onEnter(position)
      },
      { threshold: [0.28, 0.52], rootMargin: '-8% 0px -8% 0px' },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [onEnter, position])

  const isHero = chapter.id === 'send'
  const isArrival = chapter.id === 'arrival'

  return (
    <section ref={ref} id={chapter.id} className={`chapter chapter-${chapter.align} chapter-${chapter.id} chapter-layout-${chapter.layout ?? 'edge'} ${active ? 'chapter-active' : ''} ${isHero ? 'chapter-hero' : ''}`}>
      <motion.div
        className="chapter-image"
        style={{ backgroundImage: isHero ? 'none' : `url(${chapter.image})`, y: imageY, scale: imageScale, opacity: imageOpacity }}
        role="img"
        aria-label={`${chapter.label}: ${chapter.title}`}
      />
      <motion.div className="chapter-edge" style={{ opacity: edgeOpacity }} />
      <motion.div className="chapter-scan" style={{ x: scanX, opacity: scanOpacity }} />
      <motion.div className="chapter-number-ghost" style={{ y: ghostY, rotate: ghostRotate }} aria-hidden="true">{chapter.index}</motion.div>
      <motion.div
        className="chapter-copy"
        style={{ opacity: copyOpacity, x: copyX, y: copyY, scale: copyScale }}
      >
        <div className="chapter-marker"><span>{chapter.index}</span><i /></div>
        <motion.p className="chapter-label" initial={false} animate={active ? { opacity: 1, letterSpacing: '.2em' } : { opacity: 0, letterSpacing: '.3em' }} transition={{ duration: .48 }}>{chapter.label}</motion.p>
        <AnimatedTitle active={active} as={isHero ? 'h1' : 'h2'}>{chapter.title}</AnimatedTitle>
        <motion.p className="chapter-lead" initial={false} animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }} transition={{ duration: .54, delay: active ? .1 : 0 }}>{chapter.copy}</motion.p>
        {!isHero && <motion.p className="chapter-detail" initial={false} animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }} transition={{ duration: .54, delay: active ? .16 : 0 }}>{chapter.detail}</motion.p>}
        <motion.div className="chapter-fact" initial={false} animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: chapter.align === 'right' ? 20 : -20 }} transition={{ duration: .5, delay: active ? .2 : 0 }}><span className="pulse-dot" />{chapter.fact}</motion.div>
        {isHero && (
          <button className="begin-button" onClick={() => document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' })}>
            <span>Begin the journey</span><ArrowDown size={18} />
          </button>
        )}
        {isArrival && (
          <button className="replay-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <RotateCcw size={17} /><span>Replay the journey</span>
          </button>
        )}
      </motion.div>
      <motion.div className="chapter-transition" style={{ scaleX: transitionScale }} />
      <AnimatePresence>{active && !isHero ? <motion.div className="active-glow" initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} exit={{ scaleY: 0, opacity: 0 }} transition={{ duration: .7, ease: [0.22, 1, 0.36, 1] }} /> : null}</AnimatePresence>
    </section>
  )
}

function GlobeOverlay({ chapter, progress, active }) {
  const opacity = useTransform(progress, [0, 0.07, 0.88, 1], [0.78, 1, 1, 0])
  const panelX = useTransform(progress, [0, 0.2, 0.76, 1], [42, 0, 0, 72])
  const panelY = useTransform(progress, [0, 0.24, 0.76, 1], [16, 0, 0, -34])
  const panelScale = useTransform(progress, [0, 0.22, 0.82, 1], [0.97, 1, 1, 0.97])
  const panelRotate = useTransform(progress, [0, 0.24, 0.78, 1], [-3, 0, 0, 4])
  const labelsOpacity = useTransform(progress, [0.1, 0.27, 0.76, 0.9], [0, 1, 1, 0])
  const railScale = useTransform(progress, [0.05, 0.82], [0, 1])

  return (
    <motion.section
      className={`globe-overlay ${active ? 'active' : ''}`}
      style={{ opacity }}
      aria-hidden={!active}
      aria-label={`${chapter.label}: ${chapter.title}`}
    >
      <motion.div className="globe-city-label globe-city-label-source" style={{ opacity: labelsOpacity }}>
        <span /> New York
      </motion.div>
      <motion.div className="globe-city-label globe-city-label-destination" style={{ opacity: labelsOpacity }}>
        Singapore <span />
      </motion.div>

      <motion.div
        className="globe-copy-panel"
        style={{ x: panelX, y: panelY, scale: panelScale, rotateY: panelRotate }}
      >
        <div className="chapter-marker"><span>{chapter.index}</span><i /></div>
        <p className="chapter-label">{chapter.label}</p>
        <AnimatedTitle active={active}>{chapter.title}</AnimatedTitle>
        <p className="globe-lead">{chapter.copy}</p>
        <p className="globe-detail">{chapter.detail}</p>
        <div className="globe-route-state" aria-label="Return route active">
          <span className="route-node route-node-live" />
          <i />
          <span className="route-packet" />
          <i />
          <span className="route-node" />
          <b>return route · encrypted · live</b>
        </div>
      </motion.div>

      <div className="globe-timeline" aria-hidden="true">
        <motion.i style={{ scaleX: railScale }} />
        {chapters.map((item) => (
          <span key={item.id} className={item.id === chapter.id ? 'active' : ''}>
            <b>{item.index}</b><em />
          </span>
        ))}
      </div>
    </motion.section>
  )
}

function GlobeScrollChapter({ chapter, position, active, onEnter, sectionRef }) {
  const localRef = useRef(null)
  const setRef = useCallback((node) => {
    localRef.current = node
    sectionRef.current = node
  }, [sectionRef])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onEnter(position)
      },
      { threshold: 0, rootMargin: '-28% 0px -28% 0px' },
    )
    if (localRef.current) observer.observe(localRef.current)
    return () => observer.disconnect()
  }, [onEnter, position])

  return (
    <section
      ref={setRef}
      id={chapter.id}
      className={`globe-scroll-chapter ${active ? 'active' : ''}`}
      aria-label={`${chapter.label}: ${chapter.title}`}
    >
      <div className="globe-scroll-aura" aria-hidden="true" />
      <span className="sr-only">{chapter.copy} {chapter.detail} {chapter.fact}</span>
    </section>
  )
}

function RouteLab({ congestion, setCongestion, distance, setDistance, loss, setLoss }) {
  const latency = Math.round(14 + distance * 0.74 + congestion * 0.46 + loss * 0.35)
  const routes = congestion > 65 ? 3 : congestion > 28 ? 2 : 1

  return (
    <motion.section id="route-lab" className="route-lab" initial="hidden" whileInView="visible" viewport={{ amount: .3, once: false }}>
      <motion.div className="route-copy" variants={{ hidden: { opacity: 0, x: -80 }, visible: { opacity: 1, x: 0, transition: { duration: .7, ease: [0.16, 1, 0.3, 1] } } }}>
        <div className="chapter-marker"><span>LAB</span><i /></div>
        <h2>Change the invisible route.</h2>
        <p>Increase congestion, distance, or packet loss. The live 3D stream above adapts just as real networks do.</p>
        <div className="route-metrics" aria-live="polite">
          <div><strong>{latency}</strong><span>ms latency</span></div>
          <div><strong>{routes}</strong><span>active {routes === 1 ? 'route' : 'routes'}</span></div>
          <div><strong>{loss > 38 ? 'retrying' : 'stable'}</strong><span>delivery state</span></div>
        </div>
      </motion.div>
      <motion.div className="control-panel" variants={{ hidden: { opacity: 0, x: 90, rotateY: -8, scale: .94 }, visible: { opacity: 1, x: 0, rotateY: 0, scale: 1, transition: { duration: .78, delay: .08, ease: [0.16, 1, 0.3, 1] } } }}>
        <Slider label="Congestion" value={congestion} setValue={setCongestion} low="Clear" high="Crowded" />
        <Slider label="Distance" value={distance} setValue={setDistance} low="Local" high="Global" />
        <Slider label="Packet loss" value={loss} setValue={setLoss} low="None" high="Severe" warning />
      </motion.div>
    </motion.section>
  )
}

function Slider({ label, value, setValue, low, high, warning }) {
  return (
    <label className="slider-row">
      <span className="slider-head"><strong>{label}</strong><b>{value}%</b></span>
      <input
        aria-label={label}
        className={warning && value > 38 ? 'warning' : ''}
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(event) => setValue(Number(event.currentTarget.value))}
        style={{ '--value': `${value}%` }}
      />
      <span className="slider-scale"><i>{low}</i><i>{high}</i></span>
    </label>
  )
}

function HowItWorks() {
  return (
    <section id="how" className="how-section">
      <div className="how-heading">
        <p>What stays invisible</p>
        <h2>A message is never one thing.</h2>
      </div>
      <div className="packet-anatomy">
        <div className="packet-visual" aria-hidden="true">
          <span className="packet-header">TO</span>
          <span className="packet-order">08</span>
          <span className="packet-body">••••••••</span>
        </div>
        <div className="anatomy-lines">
          <div><strong>Address</strong><span>Tells routers where the packet belongs.</span></div>
          <div><strong>Sequence</strong><span>Lets the destination rebuild the right order.</span></div>
          <div><strong>Payload</strong><span>Holds a small encrypted piece of the message.</span></div>
        </div>
      </div>
      <p className="sources">An artistic visualization grounded in packet switching, fiber-optic transmission, routing, encryption, and retransmission. Timings are illustrative and vary by route and network conditions.</p>
    </section>
  )
}

export default function App() {
  const prefersReducedMotion = useReducedMotion()
  const globeSectionRef = useRef(null)
  const [active, setActive] = useState(0)
  const [soundOn, setSoundOn] = useState(false)
  const [paused, setPaused] = useState(false)
  const [congestion, setCongestion] = useState(36)
  const [distance, setDistance] = useState(58)
  const [loss, setLoss] = useState(12)
  const [loadProgress, setLoadProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const { scrollYProgress } = useScroll()
  const { scrollYProgress: globeProgress } = useScroll({
    target: globeSectionRef,
    offset: ['start start', 'end end'],
  })
  const scaleX = useSpring(scrollYProgress, { stiffness: 95, damping: 22, restDelta: 0.001 })
  const rawScrollVelocity = useVelocity(scrollYProgress)
  const scrollVelocity = useSpring(rawScrollVelocity, { stiffness: 90, damping: 28, mass: .35 })
  const ambientY = useTransform(scrollYProgress, [0, 1], ['-15%', '115%'])
  const ambientRotate = useTransform(scrollYProgress, [0, 1], [-22, 28])
  const playCue = useSoundscape(soundOn)

  useEffect(() => {
    let cancelled = false
    let revealTimer
    let preloadHandle
    const uniqueImages = [...new Set(chapters.map((chapter) => chapter.image).filter(Boolean))]
    const [heroSource, ...laterSources] = uniqueImages

    const preloadLaterScenes = () => {
      laterSources.forEach((src) => {
        const image = new Image()
        image.src = src
      })
    }

    const reveal = () => {
      if (cancelled) return
      setLoadProgress(100)
      revealTimer = window.setTimeout(() => {
        if (cancelled) return
        setReady(true)
        if ('requestIdleCallback' in window) {
          preloadHandle = window.requestIdleCallback(preloadLaterScenes, { timeout: 1800 })
        } else {
          preloadHandle = window.setTimeout(preloadLaterScenes, 450)
        }
      }, 220)
    }

    setLoadProgress(24)
    if (!heroSource) {
      reveal()
    } else {
      const heroImage = new Image()
      heroImage.onload = reveal
      heroImage.onerror = reveal
      heroImage.src = heroSource
    }

    return () => {
      cancelled = true
      window.clearTimeout(revealTimer)
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(preloadHandle)
      else window.clearTimeout(preloadHandle)
    }
  }, [])

  useEffect(() => {
    if (!ready || !window.location.hash) return undefined
    const targetId = decodeURIComponent(window.location.hash.slice(1))
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [ready])

  const handleEnter = useCallback((index) => {
    setActive((previous) => {
      if (previous !== index) playCue()
      return index
    })
  }, [playCue])

  const activeLabel = useMemo(() => chapters[active]?.label ?? 'The send', [active])
  const activeChapter = chapters[active] ?? chapters[0]
  const globeActive = activeChapter.id === 'reply'

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to the story</a>
      <AnimatePresence>{!ready && <LoadingScreen progress={loadProgress} />}</AnimatePresence>
      <motion.div className="scroll-progress" style={{ scaleX }} />
      <motion.div className="scroll-aurora" style={{ y: ambientY, rotate: ambientRotate }} aria-hidden="true" />
      <div className="site-grain" aria-hidden="true" />
      <header className="site-header">
        <a href="#send" className="brand" aria-label="The Secret Life of a Message, back to start">
          <span className="brand-signal" />
          <span>Secret life<br />of a message</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#city">Journey</a>
          <a href="#route-lab">Route lab</a>
          <a href="#reply">The reply</a>
          <a href="#how">How it works</a>
        </nav>
        <div className="header-chapter-status" aria-live="polite">
          <span>{activeChapter.index}</span>
          <i />
          <b>{activeLabel}</b>
        </div>
        <div className="header-controls">
          <button
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? 'Resume visual motion' : 'Pause visual motion'}
            aria-pressed={paused}
          >
            {paused ? <Play size={17} /> : <Pause size={17} />}
          </button>
          <button
            onClick={() => setSoundOn((value) => !value)}
            aria-label={soundOn ? 'Mute sound' : 'Enable sound'}
            aria-pressed={soundOn}
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </header>
      <aside className="chapter-progress" aria-label={`Current chapter: ${activeLabel}`}>
        {chapters.map((chapter, index) => (
          <a
            key={chapter.id}
            href={`#${chapter.id}`}
            className={index === active ? 'active' : ''}
            aria-label={`Go to ${chapter.label}`}
            aria-current={index === active ? 'step' : undefined}
          >
            <span>{chapter.index}</span><i />
          </a>
        ))}
      </aside>
      <Suspense fallback={null}>
        <JourneyCanvas
          congestion={congestion}
          distance={distance}
          loss={loss}
          globeActive={globeActive}
          heroActive={activeChapter.id === 'send'}
          globeProgress={globeProgress}
          reducedMotion={Boolean(prefersReducedMotion || paused)}
          scrollProgress={scrollYProgress}
          scrollVelocity={scrollVelocity}
        />
      </Suspense>
      <GlobeOverlay chapter={chapters[6]} progress={globeProgress} active={globeActive} />
      <main id="main-content">
        {chapters.slice(0, 6).map((chapter, index) => (
          <Chapter key={chapter.id} chapter={chapter} position={index} active={active === index} onEnter={handleEnter} />
        ))}
        <RouteLab
          congestion={congestion}
          setCongestion={setCongestion}
          distance={distance}
          setDistance={setDistance}
          loss={loss}
          setLoss={setLoss}
        />
        <GlobeScrollChapter
          chapter={chapters[6]}
          position={6}
          active={globeActive}
          onEnter={handleEnter}
          sectionRef={globeSectionRef}
        />
        <Chapter chapter={chapters[7]} position={7} active={active === 7} onEnter={handleEnter} />
        <HowItWorks />
      </main>
      <footer>
        <span>The Secret Life of a Message</span>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><RotateCcw size={15} /> Replay</button>
        <span>Visualizing the invisible · 2026</span>
      </footer>
    </>
  )
}
