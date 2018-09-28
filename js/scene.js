//if (! Detector.webgl) Detector.addGetWebGLMessage();

var container;
var camera, scene, renderer, cube, mixer = null;
var clock = new THREE.Clock();

init();
animate();
    
function init () {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera();
    resize = true;

    // Load Scene
    var loader = new THREE.GLTFLoader();
    loader.load( 'models/computer/computer.gltf', function ( gltf ) {
        // Get the scene and camera from our model
        camera = gltf.cameras[0];
        scene = gltf.scene;
        // Play the default scene animation
        mixer = new THREE.AnimationMixer(scene);
        mixer.clipAction(gltf.animations[0]).clampWhenFinished = true;
        mixer.clipAction(gltf.animations[0]).loop = THREE.LoopOnce;
        mixer.clipAction(gltf.animations[0]).play();
        // Setup the desired parameters of all objects in our scene
        scene.traverse((node) =>{
            if (!node.isMesh) return;
            // Change all texture filters to nearest
            if (node.material.map) {
                node.material.map.magFilter = THREE.NearestFilter;
                node.material.map.minFilter = THREE.NearestFilter;
            }
            // Change out materials to wireframe
            if (node.material.name == "Wireframe")
                node.material.wireframe = true;
                node.material.wireframeLinewidth = 2;
            // Find the cube so we can rotate it
            if (node.name == "Cube")
                cube = node;
        });
    }, undefined, function ( e ) {
        console.error( e );
    });

    // Setup the viewport
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    //renderer.gammaOutput = true; // Easier on the eyes
    container.appendChild( renderer.domElement );

    // Hook mouse move events
    document.addEventListener("mousemove", this.moveCallback, false);
}

function WindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function moveCallback(e) {
    var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

    // Rotate the camera
    camera.rotateOnWorldAxis(new THREE.Vector3(-movementY,0,movementX), 0.00001);
}

function animate() {
    // Fun cube rotation
    if (cube) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }

    // Update animation time
    var delta = clock.getDelta();
    if (mixer != null) {
        mixer.update(delta);
    }

    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    WindowResize();
}
