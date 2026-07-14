import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const CAM_HEIGHT = 3.2
const CAM_DISTANCE = 5.5

export default function CameraRig({ ballPosRef, holePosition }) {
  const { camera } = useThree()
  const tmpForward = useRef(new THREE.Vector3())
  const tmpTarget = useRef(new THREE.Vector3())
  const tmpDesired = useRef(new THREE.Vector3())

  useFrame(() => {
    const [bx, by, bz] = ballPosRef.current
    const [hx, , hz] = holePosition

    const forward = tmpForward.current.set(hx - bx, 0, hz - bz)
    if (forward.lengthSq() < 0.0001) forward.set(0, 0, 1)
    forward.normalize()

    const desired = tmpDesired.current.set(
      bx - forward.x * CAM_DISTANCE,
      by + CAM_HEIGHT,
      bz - forward.z * CAM_DISTANCE
    )

    camera.position.lerp(desired, 0.08)

    const target = tmpTarget.current.set(bx + forward.x * 1.5, by + 0.3, bz + forward.z * 1.5)
    camera.lookAt(target)
  })

  return null
}
