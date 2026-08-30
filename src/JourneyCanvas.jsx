import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import React from 'react'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import GlobalGlobe, { getGlobeMix, getHeroMix } from './GlobalGlobe.jsx'

const routeSets = [
  [[-5, -2, 0], [-2.8, -0.8, 0.5], [-0.5, 1.4, 0], [2.5, 0.9, -0.4], [5, 2.2, 0]],
  [[-5, 1.7, 0], [-2.6, 0.5, 0.2], [-0.2, -1.3, 0], [2.2, -0.2, -0.5], [5, -1.9, 0]],
  [[-5, 0.2, -0.2], [-2.5, 1.5, 0], [0, 0, 0.4], [2.5, -1.4, 0], [5, -0.1, -0.2]],
]

function RouteLine({ curve, color = '#30d9ff', opacity = 0.46 }) {
  const geometry = useMemo(() => {
    const points = curve.getPoints(160)
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [curve])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} />
    </line>
  )
}

function PacketStream({ curves, packetCount, congestion, distance, loss, reducedMotion, scrollProgress, scrollVelocity }) {
  const mesh = useRef(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const position = useMemo(() => new THREE.Vector3(), [])
  const tangent = useMemo(() => new THREE.Vector3(), [])
  const lookTarget = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    if (mesh.current) mesh.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  }, [packetCount])

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const progress = scrollProgress?.get?.() ?? 0
    const velocity = Math.min(Math.abs(scrollVelocity?.get?.() ?? 0), 1.4)
    const distanceDrag = THREE.MathUtils.lerp(1.12, .74, distance / 100)
    const speed = 0.055 + (100 - congestion) * 0.00038

    for (let index = 0; index < packetCount; index += 1) {
      const pathIndex = congestion > 65 && index % 3 ? (index % 2) + 1 : 0
      const curve = curves[pathIndex]
      const offset = index / packetCount
      const t = reducedMotion ? offset : (clock.elapsedTime * (speed + velocity * .018) * distanceDrag + offset + progress * .72) % 1
      curve.getPointAt(t, position)
      curve.getTangentAt(t, tangent)
      lookTarget.copy(position).add(tangent)
      let packetScale = 1
      const lost = loss > 38 && index === 5
      if (lost && t > .48 && t < .64) packetScale = 1 - THREE.MathUtils.smoothstep(t, .48, .64)
      if (lost && t >= .64 && t < .79) packetScale = THREE.MathUtils.smoothstep(t, .64, .79)

      dummy.position.copy(position)
      dummy.lookAt(lookTarget)
      if (!reducedMotion) dummy.rotateZ(clock.elapsedTime * .3 + index * .17)
      dummy.scale.setScalar(packetScale * (1 + velocity * .22))
      dummy.updateMatrix()
      mesh.current.setMatrixAt(index, dummy.matrix)
    }

    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[null, null, packetCount]} frustumCulled={false}>
      <boxGeometry args={[0.17, 0.17, 0.17]} />
      <meshBasicMaterial
        color="#22d8ff"
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  )
}

function SignalCore({ scrollProgress, scrollVelocity, reducedMotion }) {
  const core = useRef()
  const ringA = useRef()
  const ringB = useRef()
  const targetScale = useRef(new THREE.Vector3(1, 1, 1))

  useFrame(({ clock }, delta) => {
    if (!core.current) return
    const progress = scrollProgress?.get?.() ?? 0
    const velocity = Math.min(Math.abs(scrollVelocity?.get?.() ?? 0), 1.5)
    const pulse = 1 + Math.sin(progress * Math.PI * 14) * .08 + velocity * .12
    targetScale.current.setScalar(pulse)
    core.current.scale.lerp(targetScale.current, Math.min(1, delta * 7))
    if (!reducedMotion) {
      core.current.rotation.y = clock.elapsedTime * .14 + progress * Math.PI * 3
      core.current.rotation.x = progress * Math.PI * 1.4
      ringA.current.rotation.z = clock.elapsedTime * .18 + progress * Math.PI * 4
      ringB.current.rotation.x = -clock.elapsedTime * .12 - progress * Math.PI * 3
    }
  })

  return (
    <group ref={core} position={[0, 0, -0.35]}>
      <mesh>
        <icosahedronGeometry args={[0.32, 2]} />
        <meshPhysicalMaterial color="#092a37" emissive="#25c9ee" emissiveIntensity={2.2} wireframe transparent opacity={0.78} />
      </mesh>
      <mesh ref={ringA} rotation={[1.2, .2, 0]}>
        <torusGeometry args={[.54, .008, 8, 96]} />
        <meshBasicMaterial color="#30d9ff" transparent opacity={.46} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ringB} rotation={[.2, 1.1, .4]}>
        <torusGeometry args={[.72, .006, 8, 96]} />
        <meshBasicMaterial color="#8deaff" transparent opacity={.22} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}

function CameraRig({ scrollProgress, scrollVelocity, globeProgress, heroActive, reducedMotion }) {
  const { camera } = useThree()
  const target = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    if (reducedMotion) return
    const progress = scrollProgress?.get?.() ?? 0
    const globeMix = Math.max(getHeroMix(scrollProgress?.get?.() ?? 0), getGlobeMix(globeProgress?.get?.() ?? 0))
    const velocity = Math.min(Math.abs(scrollVelocity?.get?.() ?? 0), 1.5)
    target.current.set(
      THREE.MathUtils.lerp(Math.sin(progress * Math.PI * 3.5) * .42, 0, globeMix),
      THREE.MathUtils.lerp(Math.cos(progress * Math.PI * 5) * .2, 0, globeMix),
      THREE.MathUtils.lerp(7 - Math.sin(progress * Math.PI * 2) * .34 - velocity * .08, 7.15, globeMix),
    )
    camera.position.lerp(target.current, Math.min(1, delta * 2.7))
    camera.lookAt(0, 0, 0)
    camera.rotation.z += (Math.sin(progress * Math.PI * 6) * .018 - camera.rotation.z) * Math.min(1, delta * 3)
  })

  return null
}

function Network({ congestion, distance, loss, reducedMotion, scrollProgress, scrollVelocity, globeProgress, heroActive }) {
  const group = useRef()
  const targetPosition = useRef(new THREE.Vector3())
  const targetScale = useRef(new THREE.Vector3(1, 1, 1))
  const curves = useMemo(
    () => routeSets.map((points) => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))),
    [],
  )
  const packetCount = congestion > 65 ? 26 : 17

  useFrame(({ clock }, delta) => {
    if (!group.current) return
    const progress = scrollProgress?.get?.() ?? 0
    const globeMix = Math.max(getHeroMix(scrollProgress?.get?.() ?? 0), getGlobeMix(globeProgress?.get?.() ?? 0))
    const velocity = Math.min(Math.abs(scrollVelocity?.get?.() ?? 0), 1.5)
    targetPosition.current.set(
      Math.sin(progress * Math.PI * 4) * .46,
      Math.cos(progress * Math.PI * 3) * .2 + (reducedMotion ? 0 : Math.sin(clock.elapsedTime * .22) * .08),
      Math.sin(progress * Math.PI * 2) * -.52,
    )
    group.current.position.lerp(targetPosition.current, Math.min(1, delta * 3.2))
    const scale = (.94 + Math.sin(progress * Math.PI * 7) * .08 + velocity * .045) * (1 - globeMix * .94)
    const distanceStretch = .88 + distance * .0032
    targetScale.current.set(scale * distanceStretch, scale, scale)
    group.current.scale.lerp(targetScale.current, Math.min(1, delta * 4))
    group.current.visible = globeMix < .985
    if (!reducedMotion) {
      group.current.rotation.x = -.08 + Math.sin(progress * Math.PI * 4) * .16
      group.current.rotation.y = -.1 + Math.cos(progress * Math.PI * 5) * .18
      group.current.rotation.z = -.1 + Math.sin(progress * Math.PI * 6) * .12 + Math.sin(clock.elapsedTime * .13) * .03
    }
  })

  return (
    <group ref={group} rotation={[-0.08, -0.1, -0.1]}>
      <RouteLine curve={curves[0]} opacity={congestion > 65 ? 0.26 : 0.6} color={congestion > 65 ? '#ffb55e' : '#30d9ff'} />
      <RouteLine curve={curves[1]} opacity={0.36} />
      <RouteLine curve={curves[2]} opacity={0.24} />
      <PacketStream
        curves={curves}
        packetCount={packetCount}
        congestion={congestion}
        distance={distance}
        loss={loss}
        reducedMotion={reducedMotion}
        scrollProgress={scrollProgress}
        scrollVelocity={scrollVelocity}
      />
      <Float
        speed={reducedMotion ? 0 : 1.3}
        rotationIntensity={reducedMotion ? 0 : 0.25}
        floatIntensity={reducedMotion ? 0 : 0.2}
      >
        <SignalCore scrollProgress={scrollProgress} scrollVelocity={scrollVelocity} reducedMotion={reducedMotion} />
      </Float>
    </group>
  )
}

function MotionInvalidator({ reducedMotion, scrollProgress, globeProgress }) {
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    if (!reducedMotion) return undefined
    const unsubscribeScroll = scrollProgress?.on?.('change', invalidate)
    const unsubscribeGlobe = globeProgress?.on?.('change', invalidate)
    invalidate()
    return () => {
      unsubscribeScroll?.()
      unsubscribeGlobe?.()
    }
  }, [globeProgress, invalidate, reducedMotion, scrollProgress])

  return null
}

export default function JourneyCanvas({ congestion, distance, loss, globeActive, heroActive, globeProgress, reducedMotion, scrollProgress, scrollVelocity, burstKey, arrivalActive }) {
  return (
    <div className={`journey-canvas ${globeActive ? 'globe-active' : ''} ${heroActive ? 'hero-active' : ''} ${arrivalActive ? 'arrival-active' : ''}`} aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={reducedMotion ? 'demand' : 'always'}
        camera={{ position: [0, 0, 7], fov: 48 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.34} />
        <pointLight position={[2, 3, 4]} color="#4be3ff" intensity={18} distance={9} />
        <MotionInvalidator reducedMotion={reducedMotion} scrollProgress={scrollProgress} globeProgress={globeProgress} />
        <CameraRig scrollProgress={scrollProgress} scrollVelocity={scrollVelocity} globeProgress={globeProgress} heroActive={heroActive} reducedMotion={reducedMotion} />
        <Network
          congestion={congestion}
          distance={distance}
          loss={loss}
          reducedMotion={reducedMotion}
          scrollProgress={scrollProgress}
          scrollVelocity={scrollVelocity}
          globeProgress={globeProgress}
          heroProgress={scrollProgress}
        />
        <GlobalGlobe
          globeProgress={globeProgress}
          heroProgress={scrollProgress}
          burstKey={burstKey}
          reducedMotion={reducedMotion}
          congestion={congestion}
          distance={distance}
          loss={loss}
        />
        <Sparkles count={reducedMotion ? 20 : 65} scale={[11, 6, 3]} size={0.7} speed={reducedMotion ? 0 : 0.12} opacity={0.34} color="#72dff6" />
      </Canvas>
    </div>
  )
}
