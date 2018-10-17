"use strict";
if (! Detector.webgl) Detector.addGetWebGLMessage();

var container;
var camera, scene, renderer, cube, mixer = null;
var clock = new THREE.Clock();

var npcPool = [];
function NPC ( name )
{
    this.name = name;
    this.model = new THREE.Group();
    this.mixer = null;
    this.animations = {}
    this.switchStateTimer = 5;
    this.torque = 0;
    this.raycast = null;
    this.rayHeight = new THREE.Vector3( 0, 0, 0 );
    this.fwdDir = new THREE.Vector3();

    this.states = {
        move : 0,
        idle : 1,
    }
    this.state = this.states.move;

    this.Init = function ( filename, pos, rot ) 
    {
        SetupCharacter( filename, this.model, this.animations );
        this.mixer = new THREE.AnimationMixer( this.model );
        this.model.position.set( pos.x, pos.y, pos.z);
        this.model.setRotationFromEuler( rot );

        scene.add( this.model );
        for (var key in this.animations) {
            console.log(key);
        }

        this.raycast = new THREE.Raycaster(
            this.model.position + this.rayHeight,
            this.fwdDir,
            0, 0.5
        )
    }

    this.Update = function( delta ) 
    {
        // State Machine
        switch ( this.state ) {
            case this.states.move:
                if ( this.FwdCast() == true ) {
                    this.RotateY( 180 )
                }

                this.AnimSet( this.animations.Walk );
                
                this.RotateY( this.torque * delta );
                this.model.translateZ( delta );

                if ( this.switchStateTimer <= 0 ) {
                    this.AnimSet( this.animations.Walk, false );
                    this.state = this.states.idle;
                    this.switchStateTimer = 3;
                }
                break;
            default:
                this.AnimSet( this.animations.Idle );

                if ( this.switchStateTimer <= 0 ) {
                    this.AnimSet( this.animations.Idle, false );
                    this.torque = ( Math.random() * -100 ) + 50;
                    this.state = this.states.move;
                    this.switchStateTimer = 5;
                }
        }

        this.model.getWorldDirection( this.fwdDir );
        
        // Change State when time reaches 0
        this.switchStateTimer -= delta;

        // Update animations
        this.mixer.update( delta );
    }

    this.RotateY = function( degrees )
    {
        this.model.rotateY( THREE.Math.degToRad( degrees ) );
    }

    this.AnimSet = function( animation, start = true )
    {
        if ( animation ) {
            start ? this.mixer.clipAction( animation ).play() : 
                    this.mixer.clipAction( animation ).stop() ;
        }
    }

    this.FwdCast = function() {
        if ( this.raycast ) {
            this.raycast = new THREE.Raycaster(
                this.model.position,
                this.fwdDir,
                0, 1
            );
            let hits = this.raycast.intersectObjects( scene.children );
            if ( hits.length > 0 ) { return true; }
        }
        return false;
    }
}

Init();
Update();

function Init() 
{
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera();

    // Load Scene
    let loader = new THREE.GLTFLoader();
    loader.load( 'models/computer/computer.gltf', function ( gltf ) {
        // Get the scene and camera from our model
        camera = gltf.cameras[0];
        scene = gltf.scene;
        mixer = new THREE.AnimationMixer( scene );
        let anims = gltf.animations

        // Setup scene animations
        for ( let i = 0; i < anims.length; ++i ) {
            mixer.clipAction(anims[i]).play();
            // Clamp animations tagged with [ONCE]
            if ( anims[i].name.indexOf("[ONCE]" ) !== -1) {
                mixer.clipAction( gltf.animations[i] ).clampWhenFinished = true;
                mixer.clipAction( gltf.animations[i] ).loop = THREE.LoopOnce;
            }
        }

        // Setup the desired parameters of all objects in our scene
        scene.traverse( ( node ) => {
            if ( !node.isMesh ) return;
            if ( node.material.map ) {
                // Change [PIXEL] texture filters to nearest
                if ( node.material.name.indexOf( "[PIXEL]" ) !== -1) {
                    node.material.map.magFilter = THREE.NearestFilter;
                    node.material.map.minFilter = THREE.NearestFilter;
                }

                // Disable wrap on [CLAMP] tagged materials
                if ( node.material.name.indexOf( "[CLAMP]" ) !== -1 ) {
                    node.material.map.wrapS = THREE.ClampToEdgeWrapping;
                    node.material.map.wrapT = THREE.ClampToEdgeWrapping;
                }
            }

            // Change out materials to wireframe
            if ( node.material.name == "Wireframe" ) {
                node.material.wireframe = true;
                node.material.wireframeLinewidth = 2;
            }

            // Find the cube so we can rotate it
            if ( node.name == "Cube" ) {
                cube = node;
            }

            // Put the characters at the spawn location
            if ( node.name == "Spawn" ) {
                // Create our characters
                setTimeout( function () {
                    let char = new NPC( 'Magus' );
                    char.Init( 
                        'models/computer/magus.gltf',
                        node.position,
                        new THREE.Euler( 0, THREE.Math.degToRad(-90), 0)
                    );
                    npcPool.push( char );
                }, 1000);

                setTimeout( function () {
                    let char = new NPC( 'Jam' );
                    char.Init( 
                        'models/computer/jam.gltf',
                        node.position,
                        new THREE.Euler( 0, THREE.Math.degToRad(-90), 0)
                    );
                    npcPool.push( char );
                }, 15000);

                setTimeout( function () {
                    let char = new NPC( 'Chup Chup' );
                    char.Init( 
                        'models/computer/chup.gltf',
                        node.position,
                        new THREE.Euler( 0, THREE.Math.degToRad(-90), 0)
                    );
                    npcPool.push( char );
                }, 30000);

                setTimeout( function () {
                    let char = new NPC( 'Mona' );
                    char.Init( 
                        'models/computer/mona.gltf',
                        node.position,
                        new THREE.Euler( 0, THREE.Math.degToRad(-90), 0)
                    );
                    npcPool.push( char );
                }, 60000);

                setTimeout( function () {
                    let char = new NPC( 'Grill' );
                    char.Init( 
                        'models/computer/girl.gltf',
                        node.position,
                        new THREE.Euler( 0, THREE.Math.degToRad(-90), 0)
                    );
                    npcPool.push( char );
                }, 75000);

                setTimeout( function () {
                    let char = new NPC( 'Appa' );
                    char.Init( 
                        'models/computer/appa.gltf',
                        node.position,
                        new THREE.Euler( 0, THREE.Math.degToRad(-90), 0)
                    );
                    npcPool.push( char );
                }, 90000);
            }
        });
    }, undefined, function ( e ) {
        console.error( e );
    });

    // Setup the viewport
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    //renderer.gammaOutput = true; // False is easier on the eyes
    container.appendChild( renderer.domElement );

    // Hook mouse move events
    document.addEventListener( "mousemove", moveCallback, false );
}

function SetupCharacter( filename, model, anims ) 
{
    let loader = new THREE.GLTFLoader();
    loader.load( filename, function ( gltf ) {
        gltf.scene.traverse( function ( node ) {
            if ( !node.isMesh ) return;
            if ( node.material.map ) {
                // Change [PIXEL] texture filters to nearest
                if ( node.material.name.indexOf("[PIXEL]" ) !== -1) {
                    node.material.map.magFilter = THREE.NearestFilter;
                    node.material.map.minFilter = THREE.NearestFilter;
                }
                // Disable wrap on [CLAMP] tagged materials
                if ( node.material.name.indexOf("[CLAMP]" ) !== -1) {
                    node.material.map.wrapS = THREE.ClampToEdgeWrapping;
                    node.material.map.wrapT = THREE.ClampToEdgeWrapping;
                }
            }
        });

        for ( let i = 0; i < gltf.animations.length; ++i ) {
            anims[gltf.animations[i].name] = gltf.animations[i];
        }
        model.add( gltf.scene );
    });
}

function WindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function moveCallback(e) 
{
    var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

    // Rotate the camera
    camera.rotateOnWorldAxis( new THREE.Vector3( -movementY, 0, movementX ), 0.00001 );
}

// Called Every Frame
function Update() 
{
    // Fun cube rotation
    if ( cube ) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }

    // Update animation time
    var delta = clock.getDelta();
    if ( mixer != null ) {
        mixer.update( delta );
    }

    // Character behaviour
    for ( let i = 0; i < npcPool.length; ++i ) {
        npcPool[i].Update( delta );
    }

    requestAnimationFrame( Update );
    renderer.render( scene, camera );
    WindowResize();
}
