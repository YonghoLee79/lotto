let scene, camera, renderer, molecules;
let isSimulating = false;

function init() {
    // Three.js 초기화
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    
    const container = document.getElementById('molecularCanvas');
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // 조명 설정
    const light = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(light);
    
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    // 카메라 위치 설정
    camera.position.z = 15;
    
    // 분자 초기화
    initMolecules();
    
    // 애니메이션 시작
    animate();
}

function initMolecules() {
    molecules = new THREE.Group();
    scene.add(molecules);
    
    // 54개 분자 생성
    for (let i = 0; i < 54; i++) {
        const geometry = new THREE.SphereGeometry(0.3, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: getRandomColor(),
            shininess: 100
        });
        
        const molecule = new THREE.Mesh(geometry, material);
        molecule.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        
        molecule.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1
        );
        
        molecules.add(molecule);
    }
}

function getRandomColor() {
    return new THREE.Color(Math.random(), Math.random(), Math.random());
}

function animate() {
    requestAnimationFrame(animate);
    
    if (isSimulating) {
        updateMolecules();
    }
    
    molecules.rotation.y += 0.001;
    renderer.render(scene, camera);
}

function updateMolecules() {
    molecules.children.forEach(molecule => {
        molecule.position.add(molecule.velocity);
        
        // 경계 체크 및 반사
        ['x', 'y', 'z'].forEach(axis => {
            if (Math.abs(molecule.position[axis]) > 5) {
                molecule.velocity[axis] *= -1;
            }
        });
    });
}

function startSimulation() {
    isSimulating = true;
    fetch('/api/generate', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.numbers) {
            document.getElementById('numbers').textContent = 
                `예측된 번호: ${data.numbers.join(', ')}`;
        }
    })
    .catch(error => console.error('Error:', error));
}

function resetSimulation() {
    isSimulating = false;
    molecules.children.forEach(molecule => {
        molecule.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        molecule.velocity.set(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1
        );
    });
    document.getElementById('numbers').textContent = '시뮬레이션을 시작하세요...';
}

function showAnalysis() {
    fetch('/api/optimize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        if (data.numbers) {
            document.getElementById('numbers').textContent = 
                `최적화된 번호: ${data.numbers.join(', ')}`;
        }
    })
    .catch(error => console.error('Error:', error));
}

function uploadImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        
        fetch('/api/analyze-image', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.numbers) {
                document.getElementById('numbers').textContent = 
                    `이미지 기반 번호: ${data.numbers.join(', ')}`;
            }
        })
        .catch(error => console.error('Error:', error));
    };
    
    input.click();
}

function showSubscription() {
    alert('프리미엄 구독 서비스\n\n' +
          '- 기본 구독: 월 9,900원\n' +
          '- 연간 구독: 연 99,000원 (2개월 무료)\n' +
          '- VIP 멤버: 월 29,900원\n\n' +
          '현재 개발 중입니다.');
}

// 페이지 로드 시 초기화
window.addEventListener('load', init);

// 창 크기 변경 대응
window.addEventListener('resize', () => {
    const container = document.getElementById('molecularCanvas');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});
