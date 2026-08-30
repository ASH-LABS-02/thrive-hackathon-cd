import { useFrame, useThree } from '@react-three/fiber'
import React from 'react'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const GLOBE_RADIUS = 2.28
const UP = new THREE.Vector3(0, 0, 1)

const vertexShader = /* glsl */ `
  varying vec3 vNormalView;
  varying vec3 vPosition;

  void main() {
    vNormalView = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const globeFragmentShader = /* glsl */ `
  uniform float uAlpha;
  uniform float uTime;
  varying vec3 vNormalView;
  varying vec3 vPosition;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.52;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p = p * 2.03 + vec3(0.37, 0.19, 0.41);
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec3 p = normalize(vPosition);
    float terrain = fbm(p * 3.35 + vec3(1.7, 0.3, -0.8));
    float land = smoothstep(0.47, 0.60, terrain + sin(p.y * 5.8) * 0.035);
    float micro = fbm(p * 10.0 + 2.7) * 0.12;
    float rim = pow(1.0 - max(dot(normalize(vNormalView), vec3(0.0, 0.0, 1.0)), 0.0), 2.45);
    float pulse = 0.92 + sin(uTime * 0.42) * 0.035;

    vec3 ocean = vec3(0.025, 0.16, 0.24);
    vec3 landColor = vec3(0.19, 0.60, 0.69);
    vec3 color = mix(ocean, landColor, land);
    color += micro * vec3(0.08, 0.34, 0.42);
    color += rim * vec3(0.22, 0.88, 1.0) * 1.35 * pulse;

    gl_FragColor = vec4(color, uAlpha * 0.96);
  }
`

const atmosphereFragmentShader = /* glsl */ `
  uniform float uAlpha;
  varying vec3 vNormalView;

  void main() {
    float rim = pow(1.0 - abs(dot(normalize(vNormalView), vec3(0.0, 0.0, 1.0))), 2.8);
    gl_FragColor = vec4(0.20, 0.86, 1.0, rim * uAlpha * 0.78);
  }
`

const routePairs = [
  [[40.71, -74.0], [51.51, -0.12]],
  [[37.77, -122.42], [35.68, 139.69]],
  [[35.68, 139.69], [1.35, 103.82]],
  [[1.35, 103.82], [-33.87, 151.21]],
  [[51.51, -0.12], [19.08, 72.88]],
  [[19.08, 72.88], [1.35, 103.82]],
  [[-23.55, -46.63], [6.52, 3.38]],
  [[6.52, 3.38], [51.51, -0.12]],
  [[25.2, 55.27], [22.32, 114.17]],
  [[-33.92, 18.42], [52.52, 13.4]],
  [[43.65, -79.38], [37.77, -122.42]],
  [[59.91, 10.75], [35.68, 139.69]],
]

function latLonToVector(lat, lon, radius = GLOBE_RADIUS) {
  const phi = THREE.MathUtils.degToRad(90 - lat)
  const theta = THREE.MathUtils.degToRad(lon + 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

function createRoute([start, end], index) {
  const startPoint = latLonToVector(start[0], start[1], GLOBE_RADIUS + 0.035)
  const endPoint = latLonToVector(end[0], end[1], GLOBE_RADIUS + 0.035)
  const midpoint = startPoint.clone().add(endPoint).normalize()
  const separation = startPoint.angleTo(endPoint)
  midpoint.multiplyScalar(GLOBE_RADIUS + 0.46 + separation * 0.38 + (index % 3) * 0.055)
  return new THREE.QuadraticBezierCurve3(startPoint, midpoint, endPoint)
}

export function getGlobeMix(progress) {
  const enter = THREE.MathUtils.smoothstep(progress, 0.015, 0.15)
  const exit = 1 - THREE.MathUtils.smoothstep(progress, 0.88, 0.995)
  return enter * exit
}

export function getHeroMix(progress) {
  return 1 - THREE.MathUtils.smoothstep(progress, 0.012, 0.115)
}

function GlobeArc({ curve, index, globeProgress, heroProgress, reducedMotion, congested }) {
  const line = useRef(null)
  const material = useRef(null)
  const pointCount = 112
  const geometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(curve.getPoints(pointCount - 1)),
    [curve],
  )

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(() => {
    const replyProgress = globeProgress?.get?.() ?? 0
    const heroMix = getHeroMix(heroProgress?.get?.() ?? 0)
    const replyMix = getGlobeMix(replyProgress)
    const progress = heroMix > replyMix ? 0.5 : replyProgress
    const mix = Math.max(heroMix, replyMix)
    const reveal = reducedMotion
      ? 1
      : THREE.MathUtils.smoothstep(progress, 0.12 + index * 0.012, 0.38 + index * 0.018)
    geometry.setDrawRange(0, Math.max(1, Math.round(reveal * pointCount)))
    if (material.current) {
      material.current.opacity = mix * (index < 4 ? 0.72 : 0.28) * (congested && index === 0 ? 0.45 : 1)
    }
    if (line.current) line.current.visible = mix > 0.002
  })

  return (
    <line ref={line} geometry={geometry}>
      <lineBasicMaterial
        ref={material}
        color={congested && index === 0 ? '#ffb55e' : index % 4 === 0 ? '#e7fbff' : '#35d8fb'}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </line>
  )
}

function GlobePackets({ curves, globeProgress, heroProgress, reducedMotion, congestion, distance, loss }) {
  const mesh = useRef(null)
  const material = useRef(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const packetCount = congestion > 65 ? 30 : 22

  useEffect(() => {
    if (!mesh.current) return
    for (let index = 0; index < packetCount; index += 1) {
      mesh.current.setColorAt(index, new THREE.Color(index % 4 === 0 ? '#ffffff' : '#72ebff'))
    }
    mesh.current.instanceColor.needsUpdate = true
  }, [packetCount])

  useFrame(({ clock }) => {
    if (!mesh.current || !material.current) return
    const replyProgress = globeProgress?.get?.() ?? 0
    const heroMix = getHeroMix(heroProgress?.get?.() ?? 0)
    const replyMix = getGlobeMix(replyProgress)
    const progress = heroMix > replyMix ? 0.5 : replyProgress
    const mix = Math.max(heroMix, replyMix)
    const routeReveal = reducedMotion ? 1 : THREE.MathUtils.smoothstep(progress, 0.22, 0.5)
    const speed = 0.025 + (100 - congestion) * 0.00022
    const distanceDrag = THREE.MathUtils.lerp(1.2, 0.72, distance / 100)
    const elapsed = reducedMotion ? 0.62 : clock.elapsedTime * speed * distanceDrag + progress * 0.18

    for (let index = 0; index < packetCount; index += 1) {
      const rerouted = congestion > 65 && index % 3 !== 0
      const routeIndex = rerouted ? 1 + (index % (curves.length - 1)) : index % curves.length
      const curve = curves[routeIndex]
      const t = (elapsed + index / packetCount + routeIndex * 0.071) % 1
      const point = curve.getPointAt(t)
      const shouldDrop = loss > 38 && index === 5 && t > 0.5 && t < 0.69
      const retransmit = loss > 38 && index === 6 && t > 0.24 && t < 0.38
      const size = shouldDrop ? 0.001 : (index % 4 === 0 ? 1.45 : 0.9) * (retransmit ? 1.8 : 1)
      dummy.position.copy(point)
      dummy.scale.setScalar(size * mix * routeReveal)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(index, dummy.matrix)
    }

    material.current.opacity = mix * routeReveal * 0.96
    mesh.current.visible = mix > 0.002
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[null, null, packetCount]} frustumCulled={false}>
      <sphereGeometry args={[0.062, 10, 10]} />
      <meshBasicMaterial
        ref={material}
        vertexColors
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  )
}

function SurfacePoints({ globeProgress, heroProgress }) {
  const material = useRef(null)
  const geometry = useMemo(() => {
    let seed = 8206
    const random = () => {
      seed |= 0
      seed = (seed + 0x6D2B79F5) | 0
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
    const positions = new Float32Array(840 * 3)
    for (let index = 0; index < 840; index += 1) {
      const y = 1 - random() * 2
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = random() * Math.PI * 2
      const radius = GLOBE_RADIUS + 0.018
      positions[index * 3] = Math.cos(theta) * radiusAtY * radius
      positions[index * 3 + 1] = y * radius
      positions[index * 3 + 2] = Math.sin(theta) * radiusAtY * radius
    }
    const result = new THREE.BufferGeometry()
    result.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return result
  }, [])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(() => {
    if (material.current) material.current.opacity = Math.max(getHeroMix(heroProgress?.get?.() ?? 0), getGlobeMix(globeProgress?.get?.() ?? 0)) * 0.18
  })

  return (
    <points geometry={geometry}>
      <pointsMaterial ref={material} color="#b7f6ff" size={0.018} transparent opacity={0} depthWrite={false} />
    </points>
  )
}

function CityNodes({ globeProgress, heroProgress }) {
  const group = useRef(null)
  const nodes = useMemo(
    () => [
      latLonToVector(40.71, -74, GLOBE_RADIUS + 0.055),
      latLonToVector(1.35, 103.82, GLOBE_RADIUS + 0.055),
      latLonToVector(51.51, -0.12, GLOBE_RADIUS + 0.055),
    ],
    [],
  )

  useFrame(({ clock }) => {
    if (!group.current) return
    const mix = Math.max(getHeroMix(heroProgress?.get?.() ?? 0), getGlobeMix(globeProgress?.get?.() ?? 0))
    group.current.visible = mix > 0.002
    const pulse = 0.8 + Math.sin(clock.elapsedTime * 2.1) * 0.2
    group.current.children.forEach((node, index) => {
      node.scale.setScalar(mix * (1 + pulse * 0.28 + index * 0.05))
    })
  })

  return (
    <group ref={group}>
      {nodes.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[0.105, 18, 18]} />
          <meshBasicMaterial
            color={index === 1 ? '#ffffff' : '#6de8ff'}
            transparent
            opacity={0.95}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function GlowSprite({ globeProgress, heroProgress }) {
  const material = useRef(null)
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const context = canvas.getContext('2d')
    const gradient = context.createRadialGradient(128, 128, 8, 128, 128, 128)
    gradient.addColorStop(0, 'rgba(98, 230, 255, .55)')
    gradient.addColorStop(0.34, 'rgba(48, 190, 224, .22)')
    gradient.addColorStop(1, 'rgba(3, 22, 31, 0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 256, 256)
    const result = new THREE.CanvasTexture(canvas)
    result.colorSpace = THREE.SRGBColorSpace
    return result
  }, [])

  useEffect(() => () => texture.dispose(), [texture])

  useFrame(() => {
    if (material.current) material.current.opacity = Math.max(getHeroMix(heroProgress?.get?.() ?? 0), getGlobeMix(globeProgress?.get?.() ?? 0)) * 0.52
  })

  return (
    <sprite position={[0, 0, -0.7]} scale={[6.5, 6.5, 1]}>
      <spriteMaterial
        ref={material}
        map={texture}
        color="#39d7f8"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  )
}

export default function GlobalGlobe({ globeProgress, heroProgress, reducedMotion, congestion, distance, loss }) {
  const group = useRef(null)
  const globeMaterial = useRef(null)
  const atmosphereMaterial = useRef(null)
  const wireMaterial = useRef(null)
  const viewport = useThree((state) => state.viewport)
  const curves = useMemo(() => routePairs.map(createRoute), [])
  const globeUniforms = useMemo(() => ({ uAlpha: { value: 0 }, uTime: { value: 0 } }), [])
  const atmosphereUniforms = useMemo(() => ({ uAlpha: { value: 0 } }), [])
  const positionTarget = useMemo(() => new THREE.Vector3(), [])
  const scaleTarget = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }, delta) => {
    if (!group.current) return
    const replyProgress = globeProgress?.get?.() ?? 0
    const heroMix = getHeroMix(heroProgress?.get?.() ?? 0)
    const replyMix = getGlobeMix(replyProgress)
    const progress = heroMix > replyMix ? 0.5 : replyProgress
    const mix = Math.max(heroMix, replyMix)
    const mobile = viewport.width < 6.2
    const landing = heroMix > replyMix
    const reveal = THREE.MathUtils.smoothstep(progress, 0.02, 0.28)
    const exitDrift = THREE.MathUtils.smoothstep(progress, 0.74, 0.98)
    const baseScale = mobile ? 0.62 : landing ? 1.04 : 1

    group.current.visible = mix > 0.002
    positionTarget.set(
      mobile ? 0 : landing ? 1.32 : -1.42 - exitDrift * 0.28,
      mobile ? (landing ? 0.95 : 1.05 - exitDrift * 0.22) : -0.02,
      -0.25 + reveal * 0.24,
    )
    group.current.position.lerp(positionTarget, Math.min(1, delta * 4.2))
    scaleTarget.setScalar(baseScale * mix * (0.72 + reveal * 0.3 + exitDrift * 0.06))
    group.current.scale.lerp(scaleTarget, Math.min(1, delta * 4.8))

    if (!reducedMotion) {
      group.current.rotation.y = (landing ? -0.42 : -0.65 + progress * 0.68) + clock.elapsedTime * 0.018
      group.current.rotation.x = 0.1 + Math.sin(progress * Math.PI) * 0.055
      group.current.rotation.z = -0.04 + Math.sin(clock.elapsedTime * 0.09) * 0.012
    } else {
      group.current.rotation.set(0.11, -0.38, -0.04)
    }

    globeUniforms.uAlpha.value = mix
    globeUniforms.uTime.value = reducedMotion ? 0 : clock.elapsedTime
    atmosphereUniforms.uAlpha.value = mix
    if (wireMaterial.current) wireMaterial.current.opacity = mix * 0.055
  })

  return (
    <group ref={group} visible={false}>
      <GlowSprite globeProgress={globeProgress} heroProgress={heroProgress} />
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 96, 96]} />
        <shaderMaterial
          ref={globeMaterial}
          uniforms={globeUniforms}
          vertexShader={vertexShader}
          fragmentShader={globeFragmentShader}
          transparent
          depthWrite
        />
      </mesh>
      <mesh scale={1.006}>
        <sphereGeometry args={[GLOBE_RADIUS, 42, 42]} />
        <meshBasicMaterial
          ref={wireMaterial}
          color="#8beaff"
          wireframe
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={1.055}>
        <sphereGeometry args={[GLOBE_RADIUS, 72, 72]} />
        <shaderMaterial
          ref={atmosphereMaterial}
          uniforms={atmosphereUniforms}
          vertexShader={vertexShader}
          fragmentShader={atmosphereFragmentShader}
          transparent
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <SurfacePoints globeProgress={globeProgress} heroProgress={heroProgress} />
      {curves.map((curve, index) => (
        <GlobeArc
          key={index}
          curve={curve}
          index={index}
          globeProgress={globeProgress}
          heroProgress={heroProgress}
          reducedMotion={reducedMotion}
          congested={congestion > 65}
        />
      ))}
      <GlobePackets
        curves={curves}
        globeProgress={globeProgress}
        heroProgress={heroProgress}
        reducedMotion={reducedMotion}
        congestion={congestion}
        distance={distance}
        loss={loss}
      />
      <CityNodes globeProgress={globeProgress} heroProgress={heroProgress} />
    </group>
  )
}
