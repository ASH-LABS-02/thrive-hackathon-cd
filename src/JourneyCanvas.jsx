import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import React from 'react'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

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

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} />
    </line>
  )
}

function Packet({ curve, offset, speed, lost, reducedMotion }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = reducedMotion ? offset : (clock.elapsedTime * speed + offset) % 1
    const position = curve.getPointAt(t)
    const tangent = curve.getTangentAt(t)
    ref.current.position.copy(position)
    ref.current.lookAt(position.clone().add(tangent))
    const vanish = lost && t > 0.52 && t < 0.68
    ref.current.scale.setScalar(vanish ? Math.max(0.02, (0.68 - t) * 5.8) : 1)
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.17, 0.17, 0.17]} />
      <meshBasicMaterial
        color="#22d8ff"
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

function Network({ congestion, loss, reducedMotion }) {
  const group = useRef()
  const curves = useMemo(
    () => routeSets.map((points) => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))),
    [],
  )
  const packetCount = congestion > 65 ? 26 : 17

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.13) * 0.035
    group.current.position.y = Math.sin(clock.elapsedTime * 0.22) * 0.08
  })

  return (
    <group ref={group} rotation={[-0.08, -0.1, -0.1]}>
      <RouteLine curve={curves[0]} opacity={congestion > 65 ? 0.26 : 0.6} color={congestion > 65 ? '#ffb55e' : '#30d9ff'} />
      <RouteLine curve={curves[1]} opacity={0.36} />
      <RouteLine curve={curves[2]} opacity={0.24} />
      {Array.from({ length: packetCount }, (_, index) => {
        const pathIndex = congestion > 65 && index % 3 ? (index % 2) + 1 : 0
        return (
          <Packet
            key={index}
            curve={curves[pathIndex]}
            offset={index / packetCount}
            speed={0.055 + (100 - congestion) * 0.00038}
            lost={loss > 38 && index === 5}
            reducedMotion={reducedMotion}
          />
        )
      })}
      <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.2}>
        <mesh position={[0, 0, -0.35]}>
          <icosahedronGeometry args={[0.32, 2]} />
          <meshPhysicalMaterial color="#092a37" emissive="#25c9ee" emissiveIntensity={2.2} wireframe transparent opacity={0.75} />
        </mesh>
      </Float>
    </group>
  )
}

export default function JourneyCanvas({ congestion, loss, reducedMotion }) {
  return (
    <div className="journey-canvas" aria-hidden="true">
      <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 7], fov: 48 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.34} />
        <pointLight position={[2, 3, 4]} color="#4be3ff" intensity={18} distance={9} />
        <Network congestion={congestion} loss={loss} reducedMotion={reducedMotion} />
        <Sparkles count={reducedMotion ? 20 : 65} scale={[11, 6, 3]} size={0.7} speed={reducedMotion ? 0 : 0.12} opacity={0.34} color="#72dff6" />
      </Canvas>
    </div>
  )
}
