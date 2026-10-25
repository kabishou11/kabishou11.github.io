// ===== 3D BACKGROUND WITH THREE.JS =====
let scene, camera, renderer, particlesMesh, shapes = [];
let mouseX = 0, mouseY = 0;
let touchStartX = 0, touchStartY = 0;
let cameraRotationX = 0, cameraRotationY = 0;
let animationFrameId = null;
let isTouchInput = false;
let isLowPowerMode = false;

export function init3D() {
    if (renderer) return;

    const canvas = document.getElementById('canvas-3d');
    if (!canvas || typeof THREE === 'undefined') {
        return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        return;
    }

    isTouchInput = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const hasLowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
    isLowPowerMode = isTouchInput || hasLowMemory;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !isLowPowerMode,
        powerPreference: 'high-performance'
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(getPixelRatioCap());
    camera.position.z = 5;

    createParticles(isLowPowerMode ? 350 : 800);
    createGeometricShapes(isLowPowerMode ? 14 : 26);
    addLighting();
    setupInteractions(canvas);

    window.addEventListener('resize', onWindowResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    canvas.classList.add('loaded');
    animate();
}

function getPixelRatioCap() {
    const ratio = window.devicePixelRatio || 1;
    const maxRatio = isLowPowerMode ? 1.25 : 1.75;
    return Math.min(ratio, maxRatio);
}

function createParticles(particlesCount) {
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 30;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: isLowPowerMode ? 0.018 : 0.025,
        color: 0x667eea,
        transparent: true,
        opacity: 0.85
    });

    particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
}

function createGeometricShapes(shapeCount) {
    const geometryFactories = [
        () => new THREE.IcosahedronGeometry(0.55, 1),
        () => new THREE.OctahedronGeometry(0.58, 1),
        () => new THREE.TetrahedronGeometry(0.62, 0),
        () => new THREE.DodecahedronGeometry(0.52, 0),
        () => new THREE.TorusGeometry(0.38, 0.11, 14, 38),
        () => new THREE.ConeGeometry(0.42, 0.85, 7, 1),
        () => new THREE.CylinderGeometry(0.28, 0.28, 0.95, 10, 1, true),
        () => new THREE.BoxGeometry(0.72, 0.72, 0.72)
    ];

    const wireMaterial = new THREE.MeshPhongMaterial({
        color: 0x667eea,
        wireframe: true,
        transparent: true,
        opacity: 0.75,
        emissive: 0x667eea,
        emissiveIntensity: 0.3
    });
    const solidMaterial = new THREE.MeshPhongMaterial({
        color: 0x8fa2ff,
        wireframe: false,
        transparent: true,
        opacity: 0.22,
        emissive: 0x667eea,
        emissiveIntensity: 0.18,
        shininess: 120
    });
    const materials = [wireMaterial, wireMaterial, wireMaterial, solidMaterial];

    const spreadX = isLowPowerMode ? 14 : 18;
    const spreadY = isLowPowerMode ? 22 : 30;

    for (let i = 0; i < shapeCount; i++) {
        const geometry = geometryFactories[Math.floor(Math.random() * geometryFactories.length)]();
        const material = materials[Math.floor(Math.random() * materials.length)];
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.x = (Math.random() - 0.5) * spreadX;
        mesh.position.y = (Math.random() - 0.5) * spreadY;
        mesh.position.z = (Math.random() - 0.5) * 15;

        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;

        mesh.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            },
            originalY: mesh.position.y
        };

        scene.add(mesh);
        shapes.push(mesh);
    }
}

function addLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x667eea, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
}

function setupInteractions(canvas) {
    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });

    if (isTouchInput) {
        window.setTimeout(() => {
            const hint = document.getElementById('touchHint');
            if (hint) {
                hint.classList.add('show');
                window.setTimeout(() => {
                    hint.classList.remove('show');
                }, 3000);
            }
        }, 1200);
    }
}

function handleMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function handleTouchStart(e) {
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
}

function handleTouchMove(e) {
    if (e.touches.length === 1) {
        e.preventDefault();

        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;

        const deltaX = touchX - touchStartX;
        const deltaY = touchY - touchStartY;

        cameraRotationY += deltaX * 0.005;
        cameraRotationX += deltaY * 0.005;

        touchStartX = touchX;
        touchStartY = touchY;
    }
}

function handleTouchEnd() {
    // no-op
}

function onWindowResize() {
    if (!camera || !renderer) return;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(getPixelRatioCap());
}

function handleVisibilityChange() {
    if (document.hidden) {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        return;
    }

    if (!animationFrameId && renderer) {
        animate();
    }
}

function animate() {
    if (!renderer || document.hidden) {
        animationFrameId = null;
        return;
    }

    animationFrameId = requestAnimationFrame(animate);

    if (!particlesMesh) return;

    particlesMesh.rotation.y += 0.0005;
    particlesMesh.rotation.x += 0.0003;

    shapes.forEach(shape => {
        shape.rotation.x += shape.userData.rotationSpeed.x;
        shape.rotation.y += shape.userData.rotationSpeed.y;
        shape.rotation.z += shape.userData.rotationSpeed.z;
    });

    if (isTouchInput) {
        camera.position.x = Math.sin(cameraRotationY) * 5;
        camera.position.y = Math.sin(cameraRotationX) * 3;
        camera.position.z = Math.cos(cameraRotationY) * 5;
    } else {
        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
    }

    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}

export function update3DOnScroll() {
    if (shapes.length === 0) return;

    const denominator = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const scrollPercent = window.scrollY / denominator;

    shapes.forEach((shape, index) => {
        const offset = index * 0.2;
        const scrollMovement = Math.sin(scrollPercent * Math.PI * 4 + offset) * 3;
        shape.position.y = shape.userData.originalY + scrollMovement;

        shape.position.x += Math.sin(scrollPercent * Math.PI + offset) * 0.002;
    });

    if (particlesMesh) {
        particlesMesh.rotation.z = scrollPercent * Math.PI * 2;
        particlesMesh.position.y = -scrollPercent * 2;
    }
}

export function cleanup3D() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    window.removeEventListener('resize', onWindowResize);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('mousemove', handleMouseMove);
}
