import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
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
    <motion.div className="loader" exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
      <div className="loader-mark"><span /></div>
      <p>Preparing the route</p>
      <div className="loader-track"><motion.div animate={{ width: `${progress}%` }} /></div>
      <span className="loader-value">{progress}%</span>
    </motion.div>
  )
}

function Chapter({ chapter, position, active, onEnter }) {
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.45) onEnter(position)
      },
      { threshold: [0.45, 0.7] },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [onEnter, position])

  const isHero = chapter.id === 'send'
  const isArrival = chapter.id === 'arrival'

  return (
    <section ref={ref} id={chapter.id} className={`chapter chapter-${chapter.align} ${isHero ? 'chapter-hero' : ''}`}>
      <div
        className="chapter-image"
        style={{ backgroundImage: `url(${chapter.image})` }}
        role="img"
        aria-label={`${chapter.label}: ${chapter.title}`}
      />
      <div className="chapter-edge" />
      <motion.div
        className="chapter-copy"
        initial={{ opacity: 0, y: 45 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.48, once: false }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="chapter-marker"><span>{chapter.index}</span><i /></div>
        <p className="chapter-label">{chapter.label}</p>
        <h1>{chapter.title}</h1>
        <p className="chapter-lead">{chapter.copy}</p>
        {!isHero && <p className="chapter-detail">{chapter.detail}</p>}
        <div className="chapter-fact"><span className="pulse-dot" />{chapter.fact}</div>
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
      {active && !isHero && <div className="active-glow" />}
    </section>
  )
}

function RouteLab({ congestion, setCongestion, distance, setDistance, loss, setLoss }) {
  const latency = Math.round(14 + distance * 0.74 + congestion * 0.46 + loss * 0.35)
  const routes = congestion > 65 ? 3 : congestion > 28 ? 2 : 1

  return (
    <section id="route-lab" className="route-lab">
      <div className="route-copy">
        <div className="chapter-marker"><span>LAB</span><i /></div>
        <h2>Change the invisible route.</h2>
        <p>Increase congestion, distance, or packet loss. The live 3D stream above adapts just as real networks do.</p>
        <div className="route-metrics" aria-live="polite">
          <div><strong>{latency}</strong><span>ms latency</span></div>
          <div><strong>{routes}</strong><span>active {routes === 1 ? 'route' : 'routes'}</span></div>
          <div><strong>{loss > 38 ? 'retrying' : 'stable'}</strong><span>delivery state</span></div>
        </div>
      </div>
      <div className="control-panel">
        <Slider label="Congestion" value={congestion} setValue={setCongestion} low="Clear" high="Crowded" />
        <Slider label="Distance" value={distance} setValue={setDistance} low="Local" high="Global" />
        <Slider label="Packet loss" value={loss} setValue={setLoss} low="None" high="Severe" warning />
      </div>
    </section>
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
        onInput={(event) => setValue(Number(event.currentTarget.value))}
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
  const [active, setActive] = useState(0)
  const [soundOn, setSoundOn] = useState(false)
  const [paused, setPaused] = useState(false)
  const [congestion, setCongestion] = useState(36)
  const [distance, setDistance] = useState(58)
  const [loss, setLoss] = useState(12)
  const [loadProgress, setLoadProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 95, damping: 22, restDelta: 0.001 })
  const playCue = useSoundscape(soundOn)

  useEffect(() => {
    let loaded = 0
    const uniqueImages = [...new Set(chapters.map((chapter) => chapter.image))]
    uniqueImages.forEach((src) => {
      const image = new Image()
      const done = () => {
        loaded += 1
        const progress = Math.round((loaded / uniqueImages.length) * 100)
        setLoadProgress(progress)
        if (loaded === uniqueImages.length) window.setTimeout(() => setReady(true), 280)
      }
      image.onload = done
      image.onerror = done
      image.src = src
    })
  }, [])

  const handleEnter = useCallback((index) => {
    setActive((previous) => {
      if (previous !== index) playCue()
      return index
    })
  }, [playCue])

  const activeLabel = useMemo(() => chapters[active]?.label ?? 'The send', [active])

  return (
    <>
      <AnimatePresence>{!ready && <LoadingScreen progress={loadProgress} />}</AnimatePresence>
      <motion.div className="scroll-progress" style={{ scaleX }} />
      <header className="site-header">
        <a href="#send" className="brand" aria-label="The Secret Life of a Message, back to start">
          <span className="brand-signal" />
          <span>Secret life<br />of a message</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#city">Journey</a>
          <a href="#route-lab">Route lab</a>
          <a href="#how">How it works</a>
        </nav>
        <div className="header-controls">
          <button onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Resume animation' : 'Pause animation'}>
            {paused ? <Play size={17} /> : <Pause size={17} />}
          </button>
          <button onClick={() => setSoundOn((value) => !value)} aria-label={soundOn ? 'Mute sound' : 'Enable sound'}>
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </header>
      <aside className="chapter-progress" aria-label={`Current chapter: ${activeLabel}`}>
        {chapters.map((chapter, index) => (
          <a key={chapter.id} href={`#${chapter.id}`} className={index === active ? 'active' : ''} aria-label={`Go to ${chapter.label}`}>
            <span>{chapter.index}</span><i />
          </a>
        ))}
      </aside>
      <Suspense fallback={null}>
        <JourneyCanvas congestion={congestion} loss={loss} reducedMotion={Boolean(prefersReducedMotion || paused)} />
      </Suspense>
      <main>
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
        <Chapter chapter={chapters[6]} position={6} active={active === 6} onEnter={handleEnter} />
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
