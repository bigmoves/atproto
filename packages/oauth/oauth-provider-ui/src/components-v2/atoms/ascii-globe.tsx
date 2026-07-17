import { clsx } from 'clsx'
import { useEffect, useRef, useState } from 'react'
import globeTextureUrl from '../../assets/globe/globe-texture.png'
import solidmapUrl from '../../assets/globe/solidmap.webp'

export type AsciiGlobeProps = {
  /** Character rows in the ASCII grid (columns = `lines * TILE_SIZE`). */
  lines?: number
  className?: string
}

const DEFAULT_LINES = 36
const TILE_SIZE = 2 // 2x2 pixel tiles, each producing 2 characters
const RENDER_SCALE = 4 // render at higher resolution for box filtering
const ROTATION_SPEED = 0.001
const DRAG_SENSITIVITY = 0.01
const AXIAL_TILT_X = -8 * (Math.PI / 180) // Earth's axial tilt, towards camera
const AXIAL_TILT_Z = 0
const CAMERA_FOV = 0.1
const SPHERE_SCALE = 0.14
const OUTLINE_SCALE = 1.025 // outline sphere, relative to SPHERE_SCALE
const ASCII_VISIBLE_THRESHOLD = 64 // alpha (0-255) needed to register on the ascii map
// Faint real-Earth photo rendered behind the ASCII (matches atproto.com).
const TEXTURE_OPACITY = 0.2
const COLOR_CANVAS_SIZE = 512 // square drawing buffer for the color-texture pass

// ASCII characters for 1x2 vertical binary patterns: index = top(2) + bottom(1)
const ASCII_MAP = [' ', '.', "'", '#']

const VERTEX_SHADER = `#version 300 es
precision highp float;

in vec3 aPosition;
in vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

out vec2 vTexCoord;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  vTexCoord = aTexCoord;
}
`

// Black in the solid map = land (opaque), white = water (transparent).
const LAND_MASK_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;

uniform sampler2D uTexture;

out vec4 fragColor;

void main() {
  float land = texture(uTexture, vTexCoord).r;
  float alpha = 1.0 - land;
  fragColor = vec4(1.0, 1.0, 1.0, alpha);
}
`

const SOLID_FRAGMENT_SHADER = `#version 300 es
precision highp float;

out vec4 fragColor;

void main() {
  fragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`

// Samples the color Earth photo straight through — used only by the faint
// decorative texture layer behind the ASCII.
const COLOR_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;

uniform sampler2D uTexture;

out vec4 fragColor;

void main() {
  fragColor = texture(uTexture, vTexCoord);
}
`

function multiplyMatrices(
  a: Float32Array<ArrayBuffer>,
  b: Float32Array<ArrayBuffer>,
): Float32Array<ArrayBuffer> {
  const result = new Float32Array(16)
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      result[col * 4 + row] =
        a[0 * 4 + row] * b[col * 4 + 0] +
        a[1 * 4 + row] * b[col * 4 + 1] +
        a[2 * 4 + row] * b[col * 4 + 2] +
        a[3 * 4 + row] * b[col * 4 + 3]
    }
  }
  return result
}

function createRotationMatrix(
  axisX: number,
  axisY: number,
  axisZ: number,
  angle: number,
): Float32Array<ArrayBuffer> {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const t = 1 - c

  const len = Math.sqrt(axisX * axisX + axisY * axisY + axisZ * axisZ)
  const x = axisX / len
  const y = axisY / len
  const z = axisZ / len

  return new Float32Array([
    t * x * x + c,
    t * x * y + s * z,
    t * x * z - s * y,
    0,
    t * x * y - s * z,
    t * y * y + c,
    t * y * z + s * x,
    0,
    t * x * z + s * y,
    t * y * z - s * x,
    t * z * z + c,
    0,
    0,
    0,
    0,
    1,
  ])
}

function createPerspectiveMatrix(
  fov: number,
  aspect: number,
  near: number,
  far: number,
): Float32Array<ArrayBuffer> {
  const f = 1.0 / Math.tan(fov / 2)
  const nf = 1 / (near - far)
  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) * nf,
    -1,
    0,
    0,
    2 * far * near * nf,
    0,
  ])
}

function createModelViewMatrix(
  rotationMatrix: Float32Array<ArrayBuffer>,
  scaleMultiplier = 1,
): Float32Array<ArrayBuffer> {
  const tiltX = createRotationMatrix(1, 0, 0, -AXIAL_TILT_X)
  const tiltZ = createRotationMatrix(0, 0, 1, AXIAL_TILT_Z)
  const tiltMatrix = multiplyMatrices(tiltZ, tiltX)
  const combined = multiplyMatrices(tiltMatrix, rotationMatrix)

  const s = SPHERE_SCALE * scaleMultiplier
  return new Float32Array([
    combined[0] * s,
    combined[1] * s,
    combined[2] * s,
    0,
    combined[4] * s,
    combined[5] * s,
    combined[6] * s,
    0,
    combined[8] * s,
    combined[9] * s,
    combined[10] * s,
    0,
    0,
    0,
    -3,
    1,
  ])
}

function createUVSphere(latSegments: number, lonSegments: number) {
  const vertices: number[] = []
  const texCoords: number[] = []
  const indices: number[] = []

  for (let lat = 0; lat <= latSegments; lat++) {
    const theta = (lat * Math.PI) / latSegments
    const sinTheta = Math.sin(theta)
    const cosTheta = Math.cos(theta)

    for (let lon = 0; lon <= lonSegments; lon++) {
      const phi = (lon * 2 * Math.PI) / lonSegments
      const sinPhi = Math.sin(phi)
      const cosPhi = Math.cos(phi)

      const x = -cosPhi * sinTheta // negated to fix winding order
      const y = cosTheta
      const z = sinPhi * sinTheta

      vertices.push(x, y, z)
      texCoords.push(lon / lonSegments, lat / latSegments)
    }
  }

  for (let lat = 0; lat < latSegments; lat++) {
    for (let lon = 0; lon < lonSegments; lon++) {
      const first = lat * (lonSegments + 1) + lon
      const second = first + lonSegments + 1

      indices.push(first, second, first + 1)
      indices.push(second, second + 1, first + 1)
    }
  }

  return {
    vertices: new Float32Array(vertices),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices),
  }
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Failed to create shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Shader compile error: ${error}`)
  }

  return shader
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram {
  const program = gl.createProgram()
  if (!program) throw new Error('Failed to create program')
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    throw new Error(`Program link error: ${error}`)
  }

  return program
}

function loadTexture(
  gl: WebGL2RenderingContext,
  url: string,
): Promise<WebGLTexture> {
  return new Promise((resolve, reject) => {
    const texture = gl.createTexture()
    if (!texture) {
      reject(new Error('Failed to create texture'))
      return
    }
    const image = new Image()

    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      resolve(texture)
    }

    image.onerror = () => reject(new Error(`Failed to load texture: ${url}`))
    image.src = url
  })
}

// For a 2x2 pixel tile, produces 2 characters:
//   [TL] [TR]  ->  char1 (top=TL, bottom=BL)   char2 (top=TR, bottom=BR)
//   [BL] [BR]
// When RENDER_SCALE > 1, box-filters (averages) each scaled pixel block.
function convertToAscii(
  pixels: Uint8Array,
  width: number,
  height: number,
  outputLines: number,
): string {
  const outputWidth = outputLines * TILE_SIZE
  const outputHeight = outputLines * TILE_SIZE

  const getAveragedAlpha = (outX: number, outY: number): number => {
    let sum = 0
    for (let sy = 0; sy < RENDER_SCALE; sy++) {
      for (let sx = 0; sx < RENDER_SCALE; sx++) {
        const srcX = outX * RENDER_SCALE + sx
        const srcY = outY * RENDER_SCALE + sy
        const srcIndex = ((height - 1 - srcY) * width + srcX) * 4 + 3 // alpha, Y flipped
        sum += pixels[srcIndex]
      }
    }
    return sum / (RENDER_SCALE * RENDER_SCALE)
  }

  const lines: string[] = []
  const tilesX = outputWidth / TILE_SIZE
  const tilesY = outputHeight / TILE_SIZE

  for (let ty = 0; ty < tilesY; ty++) {
    let line = ''
    for (let tx = 0; tx < tilesX; tx++) {
      const baseY = ty * TILE_SIZE
      const baseX = tx * TILE_SIZE

      const tl = getAveragedAlpha(baseX, baseY) > ASCII_VISIBLE_THRESHOLD
      const tr = getAveragedAlpha(baseX + 1, baseY) > ASCII_VISIBLE_THRESHOLD
      const bl = getAveragedAlpha(baseX, baseY + 1) > ASCII_VISIBLE_THRESHOLD
      const br =
        getAveragedAlpha(baseX + 1, baseY + 1) > ASCII_VISIBLE_THRESHOLD

      const leftPattern = (tl ? 2 : 0) | (bl ? 1 : 0)
      const rightPattern = (tr ? 2 : 0) | (br ? 1 : 0)

      line += ASCII_MAP[leftPattern] + ASCII_MAP[rightPattern]
    }
    lines.push(line)
  }

  return lines.join('\n')
}

/**
 * Decorative animated ASCII-art rotating globe — WebGL2 port of the
 * "Atmosphere PDS" design prototype's `<ascii-globe>` element, which is
 * itself adapted from atproto.com's own `GlobeAnimation` component
 * (bluesky-social/atproto-website, `src/components/home/GlobeAnimation.tsx`).
 * Renders a real UV-sphere with a land/water texture to an offscreen canvas,
 * reads the pixels back, and box-filters them into a 2x2-tile ASCII grid.
 * Auto-rotates; draggable (mouse/touch) to spin manually.
 *
 * Unlike the source component, this doesn't render the separate colored
 * globe-texture.png overlay layer — that bakes in a fixed (non-brand) color
 * scheme, which would conflict with this app's rule that only buttons,
 * links, and the active nav state carry the operator's branding color.
 * Color here is fully inherited (`currentColor`) via the caller's
 * `className`, same as every other neutral decorative element.
 */
export function AsciiGlobe({
  lines = DEFAULT_LINES,
  className,
}: AsciiGlobeProps) {
  const canvasSize = lines * TILE_SIZE * RENDER_SCALE
  const charsPerLine = lines * TILE_SIZE
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textureCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [asciiText, setAsciiText] = useState('')

  const rotationMatrixRef = useRef(
    new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
  )
  const isDraggingRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      preserveDrawingBuffer: true,
    })
    if (!gl) {
      console.error('WebGL2 not supported')
      return
    }

    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    let animationId = 0
    let lastMouseX = 0
    let lastMouseY = 0

    const horizontalDrag = (deltaX: number) => {
      if (deltaX !== 0) {
        const rotY = createRotationMatrix(0, 1, 0, deltaX * DRAG_SENSITIVITY)
        rotationMatrixRef.current = multiplyMatrices(
          rotY,
          rotationMatrixRef.current,
        )
      }
    }

    const verticalDrag = (deltaY: number) => {
      if (deltaY !== 0) {
        const rotX = createRotationMatrix(1, 0, 0, deltaY * DRAG_SENSITIVITY)
        rotationMatrixRef.current = multiplyMatrices(
          rotX,
          rotationMatrixRef.current,
        )
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true
      lastMouseX = e.clientX
      lastMouseY = e.clientY
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      const deltaX = e.clientX - lastMouseX
      const deltaY = e.clientY - lastMouseY
      lastMouseX = e.clientX
      lastMouseY = e.clientY
      horizontalDrag(deltaX)
      verticalDrag(deltaY)
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
    }

    container.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('mouseleave', handleMouseUp)

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true
        lastMouseX = e.touches[0].clientX
        lastMouseY = e.touches[0].clientY
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return
      e.preventDefault()
      const deltaX = e.touches[0].clientX - lastMouseX
      const deltaY = e.touches[0].clientY - lastMouseY
      lastMouseX = e.touches[0].clientX
      lastMouseY = e.touches[0].clientY
      horizontalDrag(deltaX)
      verticalDrag(deltaY)
    }

    const handleTouchEnd = () => {
      isDraggingRef.current = false
    }

    container.addEventListener('touchstart', handleTouchStart)
    container.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    })
    container.addEventListener('touchend', handleTouchEnd)

    const init = async () => {
      const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
      const landMaskShader = compileShader(
        gl,
        gl.FRAGMENT_SHADER,
        LAND_MASK_FRAGMENT_SHADER,
      )
      const solidFragmentShader = compileShader(
        gl,
        gl.FRAGMENT_SHADER,
        SOLID_FRAGMENT_SHADER,
      )

      const program = createProgram(gl, vertexShader, landMaskShader)
      const outlineProgram = createProgram(
        gl,
        vertexShader,
        solidFragmentShader,
      )

      const aPosition = gl.getAttribLocation(program, 'aPosition')
      const aTexCoord = gl.getAttribLocation(program, 'aTexCoord')
      const uModelViewMatrix = gl.getUniformLocation(
        program,
        'uModelViewMatrix',
      )
      const uProjectionMatrix = gl.getUniformLocation(
        program,
        'uProjectionMatrix',
      )
      const uTexture = gl.getUniformLocation(program, 'uTexture')

      const outlineAPosition = gl.getAttribLocation(outlineProgram, 'aPosition')
      const outlineUModelViewMatrix = gl.getUniformLocation(
        outlineProgram,
        'uModelViewMatrix',
      )
      const outlineUProjectionMatrix = gl.getUniformLocation(
        outlineProgram,
        'uProjectionMatrix',
      )

      const sphere = createUVSphere(32, 64)

      const positionBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, sphere.vertices, gl.STATIC_DRAW)

      const texCoordBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, sphere.texCoords, gl.STATIC_DRAW)

      const indexBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW)

      const vao = gl.createVertexArray()
      gl.bindVertexArray(vao)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(aPosition)
      gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
      gl.enableVertexAttribArray(aTexCoord)
      gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

      const outlineVao = gl.createVertexArray()
      gl.bindVertexArray(outlineVao)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(outlineAPosition)
      gl.vertexAttribPointer(outlineAPosition, 3, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

      const texture = await loadTexture(gl, solidmapUrl)

      gl.enable(gl.DEPTH_TEST)
      gl.clearColor(0, 0, 0, 0)

      const projectionMatrix = createPerspectiveMatrix(CAMERA_FOV, 1, 0.1, 100)

      const pixels = new Uint8Array(canvasSize * canvasSize * 4)
      const oldPixels = new Uint8Array(canvasSize * canvasSize * 4)

      const render = () => {
        if (!isDraggingRef.current && !reduceMotion) {
          const autoRotation = createRotationMatrix(0, 1, 0, ROTATION_SPEED)
          rotationMatrixRef.current = multiplyMatrices(
            autoRotation,
            rotationMatrixRef.current,
          )
        }

        gl.viewport(0, 0, canvasSize, canvasSize)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        // Pass 1: outline (larger sphere, solid white)
        gl.useProgram(outlineProgram)
        const outlineModelViewMatrix = createModelViewMatrix(
          rotationMatrixRef.current,
          OUTLINE_SCALE,
        )
        gl.uniformMatrix4fv(
          outlineUModelViewMatrix,
          false,
          outlineModelViewMatrix,
        )
        gl.uniformMatrix4fv(outlineUProjectionMatrix, false, projectionMatrix)
        gl.bindVertexArray(outlineVao)
        gl.drawElements(
          gl.TRIANGLES,
          sphere.indices.length,
          gl.UNSIGNED_SHORT,
          0,
        )

        gl.clear(gl.DEPTH_BUFFER_BIT)

        // Pass 2: main sphere with land/water mask texture
        gl.useProgram(program)
        const modelViewMatrix = createModelViewMatrix(rotationMatrixRef.current)
        gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix)
        gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.uniform1i(uTexture, 0)
        gl.bindVertexArray(vao)
        gl.drawElements(
          gl.TRIANGLES,
          sphere.indices.length,
          gl.UNSIGNED_SHORT,
          0,
        )

        gl.readPixels(
          0,
          0,
          canvasSize,
          canvasSize,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          pixels,
        )

        // Trail/smooth the alpha values frame-to-frame.
        for (let i = 0; i < pixels.length; i++) {
          pixels[i] = oldPixels[i] * 0.99 + pixels[i] * 0.01
        }
        oldPixels.set(pixels)

        setAsciiText(convertToAscii(pixels, canvasSize, canvasSize, lines))

        animationId = requestAnimationFrame(render)
      }

      render()
    }

    init().catch((err: unknown) => {
      console.error('Failed to initialize ascii-globe WebGL context', err)
    })

    return () => {
      cancelAnimationFrame(animationId)
      container.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('mouseleave', handleMouseUp)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [canvasSize, lines])

  // Faint color Earth-photo layer rendered behind the ASCII. Its own WebGL
  // context/RAF loop, but it *reads* the same `rotationMatrixRef` the ASCII
  // pass mutates, so the photo stays perfectly in sync with the ASCII
  // rotation (and drag). Purely decorative; a WebGL failure here just leaves
  // the ASCII globe on its own.
  useEffect(() => {
    const canvas = textureCanvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: false,
    })
    if (!gl) return

    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    let animationId = 0

    const init = async () => {
      const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
      const fragmentShader = compileShader(
        gl,
        gl.FRAGMENT_SHADER,
        COLOR_FRAGMENT_SHADER,
      )
      const program = createProgram(gl, vertexShader, fragmentShader)

      const aPosition = gl.getAttribLocation(program, 'aPosition')
      const aTexCoord = gl.getAttribLocation(program, 'aTexCoord')
      const uModelViewMatrix = gl.getUniformLocation(
        program,
        'uModelViewMatrix',
      )
      const uProjectionMatrix = gl.getUniformLocation(
        program,
        'uProjectionMatrix',
      )
      const uTexture = gl.getUniformLocation(program, 'uTexture')

      const sphere = createUVSphere(32, 64)

      const positionBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, sphere.vertices, gl.STATIC_DRAW)

      const texCoordBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, sphere.texCoords, gl.STATIC_DRAW)

      const indexBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW)

      const vao = gl.createVertexArray()
      gl.bindVertexArray(vao)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(aPosition)
      gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
      gl.enableVertexAttribArray(aTexCoord)
      gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

      const texture = await loadTexture(gl, globeTextureUrl)

      gl.enable(gl.DEPTH_TEST)
      gl.clearColor(0, 0, 0, 0)

      const projectionMatrix = createPerspectiveMatrix(CAMERA_FOV, 1, 0.1, 100)

      const render = () => {
        gl.viewport(0, 0, COLOR_CANVAS_SIZE, COLOR_CANVAS_SIZE)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        gl.useProgram(program)
        const modelViewMatrix = createModelViewMatrix(rotationMatrixRef.current)
        gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix)
        gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.uniform1i(uTexture, 0)
        gl.bindVertexArray(vao)
        gl.drawElements(
          gl.TRIANGLES,
          sphere.indices.length,
          gl.UNSIGNED_SHORT,
          0,
        )

        // A static frame is enough when motion is disabled — the main pass
        // isn't advancing the shared rotation matrix either.
        if (!reduceMotion) animationId = requestAnimationFrame(render)
      }

      render()
    }

    init().catch((err: unknown) => {
      console.error('Failed to initialize ascii-globe texture layer', err)
    })

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={clsx('pointer-events-auto relative cursor-grab', className)}
    >
      <canvas ref={canvasRef} width={canvasSize} height={canvasSize} hidden />
      {/* Faint color Earth photo, positioned to fill (and rotate in sync
          with) the ASCII globe that paints on top of it. */}
      <canvas
        ref={textureCanvasRef}
        width={COLOR_CANVAS_SIZE}
        height={COLOR_CANVAS_SIZE}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ opacity: TEXTURE_OPACITY }}
      />
      <pre
        className={clsx(
          'relative m-0 select-none whitespace-pre font-mono font-bold',
          '[font-feature-settings:"liga"_0,"calt"_0] [font-kerning:none]',
        )}
        style={{
          width: `${charsPerLine}ch`,
          height: `${lines * 1.2}em`,
          // The grid is 72 chars wide x 36 lines tall, mapping a *square*
          // rendered region — so roundness requires each cell to be twice as
          // tall as wide, i.e. `line-height = 2 x char-advance`. For a
          // monospace font (advance ~= 0.6em) that's exactly 1.2. This MUST
          // be set explicitly: without it the pre inherits the app's base
          // `line-height: 1.5` (Tailwind preflight on `html`), which
          // vertically stretches the globe into an ellipse.
          lineHeight: 1.2,
        }}
      >
        {asciiText}
      </pre>
    </div>
  )
}
