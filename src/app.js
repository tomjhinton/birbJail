import './style.scss'
import * as THREE from 'three'
import p5 from 'p5';

import { gsap } from 'gsap'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const textureLoader = new THREE.TextureLoader()

const canvas = document.querySelector('canvas.webgl')


import vertexShader from './shaders/vertex.glsl'

import screen1Frag from './shaders/screen-1Frag.glsl'

import screen2Frag from './shaders/screen-2Frag.glsl'

import screenFrag from './shaders/screenFrag.glsl'

import screen3Frag from './shaders/screen-3Frag.glsl'
import {Pane} from 'tweakpane';


const PARAMS = {
  s1A: 0.5,
  s1B: 0.5,
  psychedelic: false,

  s2A: 0.5,
  s2B: 0.5,

  s3A: 0.5,
  s3B: 0.5,

  s4A: 0.5,
  s4B: 0.5
};

const pane = new Pane();

const s1 = pane.addFolder({
  title: 'Screen 1',
  expanded: false

});

const s2 = pane.addFolder({
  title: 'Screen 2',
  expanded: false
});

const s3 = pane.addFolder({
  title: 'Screen 3',
  expanded: false

});

const s4 = pane.addFolder({
  title: 'Screen 4',
  expanded: false

});



const psychedelic = s1.addInput(PARAMS, 'psychedelic')

psychedelic.on('change', function(ev) {

  console.log(ev)
  if(ev.value){
    screenMaterial.uniforms.uValueC.value = .8
  }else if(!ev.value){
    screenMaterial.uniforms.uValueC.value = .3
  }
})

const s1A = s1.addInput(PARAMS, 's1A', {min: 0.03, max: 1, step: 0.01} )

s1A.on('change', function(ev) {
  screenMaterial.uniforms.uValueA.value = ev.value

})

const s1B = s1.addInput(PARAMS, 's1B', {min: 0.03, max: 1, step: 0.01} )

s1B.on('change', function(ev) {
  screenMaterial.uniforms.uValueB.value = ev.value

})


s2.addInput(PARAMS, 's2A', {min: 0.03, max: 1, step: 0.01});
s2.addInput(PARAMS, 's2B' , {min: 0.03, max: 1, step: 0.01});

s3.addInput(PARAMS, 's3A' , {min: 0.03, max: 1, step: 0.01});
s3.addInput(PARAMS, 's3B' , {min: 0.03, max: 1, step: 0.01});

s4.addInput(PARAMS, 's4A' , {min: 0.03, max: 1, step: 0.01});
s4.addInput(PARAMS, 's4B' , {min: 0.03, max: 1, step: 0.01});



const scene = new THREE.Scene()
// scene.background = new THREE.Color( 0xffffff )
const loadingBarElement = document.querySelector('.loading-bar')
const loadingBarText = document.querySelector('.loading-bar-text')
const loadingManager = new THREE.LoadingManager(
  // Loaded
  () =>{
    window.setTimeout(() =>{
      gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })

      loadingBarElement.classList.add('ended')
      loadingBarElement.style.transform = ''

      loadingBarText.classList.add('fade-out')

    }, 500)
  },

  // Progress
  (itemUrl, itemsLoaded, itemsTotal) =>{
    const progressRatio = itemsLoaded / itemsTotal
    loadingBarElement.style.transform = `scaleX(${progressRatio})`

  }
)

const gtlfLoader = new GLTFLoader(loadingManager)

const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
  depthWrite: false,
  uniforms:
    {
      uAlpha: { value: 1 }
    },
  transparent: true,
  vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
  fragmentShader: `
  uniform float uAlpha;
        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `
})

const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)


const containerElement = document.getElementById('p5-container');

let width = 800
let height = 800
p5.disableFriendlyErrors = true
let p5C, p5CTex
const sketch = (p) => {

  let l, bg;
let squareDim, diaDim, squareCols, squareRows, diaCols, diaRows;
let squares = [];
let dias = [];
let shouldSquareSpin = true;
const spinSpeed = 0.01; // Try changing this
const squareSpinFrames = Math.floor(Math.PI / (2 * spinSpeed));
const diaSpinFrames = Math.floor(Math.PI / spinSpeed);
let count = 0;

class Square {
    constructor(x, y, l, dir) {
        this.l = l;
        this.n = 4;
        this.centralAngle = p.radians(90);
        this.color = p.color(squareColor);
        this.bW = p.sqrt(2) * this.l * p.cos(p.PI / 12);
        this.bH = this.bW;
        this.x = x;
        this.y = y;
        this.initAngle = (dir * p.PI) / 12;
        this.rotation = this.initAngle;
    }

    draw() {
        p.push();
        p.fill(this.color);
        p.stroke(this.color);
        p.strokeWeight(0.5);
        p.translate(this.x, this.y);
        p.rotate(this.rotation);
        let angle = 0;
        let point = p5.Vector.fromAngle(angle);
        point.setMag(this.l / (2 * p.sin(this.centralAngle / 2)));

        p.beginShape();
        for (let i = 0; i < this.n; i++) {
            p.vertex(point.x, point.y);
            angle += this.centralAngle;
            point.setHeading(angle);
        }

        p.endShape(p.CLOSE);
        p.pop();
    }

    spin() {
        if (!shouldSquareSpin) {
            this.rotation = this.initAngle;
            return;
        }
        this.rotation += spinSpeed;
    }
}

class Diamond {
    constructor(x, y, l, dir) {
        this.x = x;
        this.y = y;
        this.l = l;
        this.n = 4;
        this.centralAngle = p.radians(90);
        this.color = p.color(diaColor);
        this.initAngle = dir * (p.PI / 4) - p.PI / 4;
        this.rotation = this.initAngle;
    }

    draw() {
        p.push();
        p.fill(this.color);
        p.noStroke();
        p.translate(this.x, this.y);
        p.rotate(this.rotation);
        let angle = 0;
        let point = p5.Vector.fromAngle(angle);
        let mag;

        p.beginShape();

        for (let i = 0; i < this.n; i++) {
            i % 2 == 0
                ? (mag = this.l * p.cos(p.PI / 3))
                : (mag = this.l * p.sin(p.PI / 3));
            point.setMag(mag);

            p.vertex(point.x, point.y);

            angle += p.TAU / this.n;
            point.setHeading(angle);
        }

        p.endShape(p.CLOSE);
        p.pop();
    }

    spin() {
        if (shouldSquareSpin) {
            this.rotation = this.initAngle;
            return;
        }
        this.rotation += spinSpeed;
    }
}

let squareColor = "#262104";
let diaColor = "#fffbe6";
  p.preload = function(){
  // customFont = p.loadFont('./static/BasementGrotesque-Black_v1.202.otf.'); //use  preload to load the custom font
}


  p.setup = function() {
    p.createCanvas(800, 800);
    // p.textFont(customFont); //use the custom font for text display
  p.textAlign(p.TOP, p.TOP); //adjust the anchor point of text alignment to the horizontal and vertical centers
  p.textSize(38); //make the text 20 pixels in size
    p5C  = document.getElementById('defaultCanvas0')
    p5CTex = new THREE.CanvasTexture(p5C)
    // p5CTex.wrapS = THREE.RepeatWrapping;
    // p5CTex.wrapT = THREE.RepeatWrapping;
    // p5CTex.repeat.set( 4, 4 );
    console.log(p5CTex)
    screenMaterial.uniforms.uTexture2 ={
      value: p5CTex
    }
    l = 50;
    squareDim = {
        w: p.sqrt(2) * l * p.cos(p.PI / 12),
        h: p.sqrt(2) * l * p.cos(p.PI / 12),
    };

    diaDim = {
        w: 2 * l * p.cos(p.PI / 3),
        h: 2 * l * p.cos(p.PI / 6),
    };
    squareCols = p.floor(width / squareDim.w) + 1;
    squareRows = p.floor(height / squareDim.h) + 1;
    diaCols = squareCols + 2;
    diaRows = squareRows + 2;

    for (let j = -1; j < squareRows; j++) {
        let dir = -1;
        if (j % 2 == 0) dir = 1;
        for (let i = -1; i < squareCols; i++) {
            let x = (i + 0.5) * squareDim.w;
            let y = (j + 0.5) * squareDim.h;
            dir *= -1;
            squares.push(new Square(x, y, l, dir));
        }
    }
    for (let j = -1; j < diaRows; j++) {
        let dir = 1;
        if (j % 2 == 0) dir = -1;
        for (let i = -1; i < diaCols; i++) {
            let x = i * squareDim.w;
            let y = j * squareDim.h;
            dir *= -1;
            dias.push(new Diamond(x, y, l, dir));
        }
    }


    // console.log(material)

  };
  let t = 0
  p.draw = function() {
      p5CTex.needsUpdate = true
    // p.textFont('kindly')
    if (0 <= count && count <= squareSpinFrames) {
       shouldSquareSpin = true;
   }
   if (squareSpinFrames < count && count <= squareSpinFrames + diaSpinFrames) {
       shouldSquareSpin = false;
   }

   shouldSquareSpin ? (bg = p.color(diaColor)) : (bg = p.color(squareColor));

   p.background(bg);

   if (shouldSquareSpin) {
       dias.forEach((e) => {
           e.draw();
           e.spin();
       });
       squares.forEach((e) => {
           e.draw();
           e.spin();
       });
   } else {
       squares.forEach((e) => {
           e.draw();
           e.spin();
       });
       dias.forEach((e) => {
           e.draw();
           e.spin();
       });
   }
   count++;
   if (count === squareSpinFrames + diaSpinFrames) count = 0;


  // p.background(255);p.stroke('#E0F7DA'); let j=30;
  // for(let x=0;x<width;x+=j){
  // for(let y=0;y<height;y+=j){
  // if(p.noise(x,y)<p.abs(p.sin(t)))p.line(x,y,x+j,y+j);
  // else p.line(x,y+j,x+j,y)}}t+=0.02




    // p.fill(0, 102, 153);
    // screenMaterial.needsUpdate = true
  };
};

let p5C2, p5CTex2
const sketch2 = (p) => {

  let content = 'The dataset contains no bias. This task is ethical, needs doing and is best done with this toolset. '; //variable for text string
let yStart = 0; //starting position of the text wall
  let customFont; //variable for custom font

  p.preload = function(){
  // customFont = p.loadFont('./static/BasementGrotesque-Black_v1.202.otf.'); //use  preload to load the custom font
}


  p.setup = function() {
     p.frameRate(.5)
    p.createCanvas(800, 400);
    // p.textFont(customFont); //use the custom font for text display
  p.textAlign(p.TOP, p.TOP); //adjust the anchor point of text alignment to the horizontal and vertical centers
  p.textSize(238); //make the text 20 pixels in size
    p5C2  = document.getElementById("defaultCanvas1");
    p5CTex2 = new THREE.CanvasTexture(p5C2)
    screen3Material.uniforms.uTexture2 ={
      value: p5CTex2
    }


    // console.log(material)

  };

  p.draw = function() {
    p.textFont('Basement')
    p.clear()
    // p.text('🏃', width/6 - 50, 70);
    p.background("rgba(0, 0, 0, .1)")
    p.shadowBlur = 50;
    p.shadowColor = 'green';


    p.fill(`rgba(${Math.floor(Math.random() *255)},${Math.floor(Math.random() *255)},${Math.floor(Math.random() *255)}, 1)`)


    // p.textAlign(p.TOP)



    p.textSize(34);

   p.text("Jail Jail Jail Jail Jail Jail Jail Jail Jail Jail Jail Jail Jail Jail Jail Jail".toUpperCase()
,  width/5 , height /6, 450, height ); //display text
  // p.noFill()
  // p.rect(width/4 , height /5, 450, height);
  p5CTex2.needsUpdate = true



  //
  // yStart+=1
  // if(yStart === height){
  //   yStart = -height
  // }
// console.log(yStart)








    // p.fill(0, 102, 153);
    screen3Material.needsUpdate = true
  };
};

let sketcHT = new p5(sketch, containerElement);

let sketch2T = new p5(sketch2, containerElement);

containerElement.style.display = 'none'

let p5Tex


const canvasT = document.createElement('canvas')
  canvasT.id = 'textBox1'
  canvasT.width = 200
  canvasT.height = 100
  canvasT.style.display = 'none'
  document.body.appendChild(canvasT)

  const textTexture = document.getElementById("textBox1")

  var ctx = canvasT.getContext('2d')
  ctx.font = "50px Arial";
  ctx.fillText("🪞", 100, 50);

const screen1Material  = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    uTime: { value: 0},
    uResolution: { type: 'v2', value: new THREE.Vector2() },
    uMouse: {
      value: {x: 0.5, y: 0.5}
    },
    uTexture: {
      value: new THREE.CanvasTexture(textTexture)
    },
    uValueA: {
      value: .3
    },
    uValueB: {
      value: .3
    }

  },
  vertexShader: vertexShader,
  fragmentShader: screen1Frag,
  side: THREE.DoubleSide
})

const screen2Material  = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    uTime: { value: 0},
    uResolution: { type: 'v2', value: new THREE.Vector2() },
    uMouse: {
      value: {x: 0.5, y: 0.5}
    },
    uValueA: {
      value: .3
    },
    uValueB: {
      value: .3
    }
  },
  vertexShader: vertexShader,
  fragmentShader: screen2Frag,
  side: THREE.DoubleSide
})


const screenMaterial  = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    uTime: { value: 0},
    uResolution: { type: 'v2', value: new THREE.Vector2() },
    uMouse: {
      value: {x: 0.5, y: 0.5}
    },
    uValueA: {
      value: .3
    },
    uValueB: {
      value: .3
    },
    uValueC: {
      value: .3
    }
  },
  vertexShader: vertexShader,
  fragmentShader: screenFrag,
  side: THREE.DoubleSide
})


const screen3Material  = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    uTime: { value: 0},
    uResolution: { type: 'v2', value: new THREE.Vector2() },
    uMouse: {
      value: {x: 0.5, y: 0.5}
    },
    uValueA: {
      value: .3
    },
    uValueB: {
      value: .3
    }
  },
  vertexShader: vertexShader,
  fragmentShader: screen3Frag,
  side: THREE.DoubleSide
})


const invisibleMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, depthWrite: false})

const bakedTexture = textureLoader.load('jail7.jpg')


bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture,
  side: THREE.DoubleSide})



let sceneGroup, screen1, screen2, screenM, screen3,  jail, bars
gtlfLoader.load(
  'jailJ5.glb',
  (gltf) => {
    gltf.scene.scale.set(4.5,4.5,4.5)
    sceneGroup = gltf.scene
    sceneGroup.needsUpdate = true
    sceneGroup.position.y -= 3
    scene.add(sceneGroup)


    jail = gltf.scene.children.find((child) => {
      return child.name === 'jail'
    })

    bars = gltf.scene.children.find((child) => {
      return child.name === 'bars'
    })


    screen1 = gltf.scene.children.find((child) => {
      return child.name === 'screen-1'
    })

    screen2 = gltf.scene.children.find((child) => {
      return child.name === 'screen-2'
    })

    screenM = gltf.scene.children.find((child) => {
      return child.name === 'screen'
    })

    screen3 = gltf.scene.children.find((child) => {
      return child.name === 'screen-3'
    })



    // fire.needsUpdate = true
    //
    // fire.material = fireMaterial
    // eyes.material = eyesMaterial
    screenM.material = screenMaterial
    screen1.material = screen1Material
    screen2.material = screen2Material
    screen3.material = screen3Material
    // thought.material = thoughtMaterial


    jail.material = bakedMaterial
    bars.material = bakedMaterial


  }
)

document.querySelector('#titular').addEventListener('click', (e) => {
 if(bars.material === bakedMaterial){
   bars.material = invisibleMaterial
   document.querySelector('#body').classList.add('blink-bg')
 }
 else if(bars.material !== bakedMaterial){
   bars.material = bakedMaterial
    document.querySelector('#body').classList.remove('blink-bg')
 }

})
// gtlfLoader.load(
//   'birds.glb',
//   (gltf) => {
//
//     gltf.scene.scale.set(5.5,5.5,5.5)
//     sceneGroup = gltf.scene
//     sceneGroup.needsUpdate = true
//     sceneGroup.position.z -= 15
//     sceneGroup.position.y -= 3
//     sceneGroup.position.x += 6
//     scene.add(sceneGroup)
//
//     if(gltf.animations[0]){
//       mixer = new THREE.AnimationMixer(gltf.scene)
//
//       const action2 = mixer.clipAction(gltf.animations[1])
//
//       action2.play()
//
//     }
//
//
//   }
// )


// const light = new THREE.AmbientLight( 0x404040 )
// scene.add( light )
// const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 )
// scene.add( directionalLight )

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () =>{

  screenMaterial.uniforms.uResolution.value.x = renderer.domElement.width
screenMaterial.uniforms.uResolution.value.y = renderer.domElement.height

  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2 ))


})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 10
camera.position.y = -10
camera.position.z = 15
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.maxPolarAngle = Math.PI / 2 - 0.1
//controls.enableZoom = false;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
})
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor( 0x000000, 0)
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()







const clock = new THREE.Clock()

const tick = () =>{

  const elapsedTime = clock.getElapsedTime()

  if(screenMaterial.uniforms.uResolution.value.x === 0 && screenMaterial.uniforms.uResolution.value.y === 0 ){
    screenMaterial.uniforms.uResolution.value.x = renderer.domElement.width
    screenMaterial.uniforms.uResolution.value.y = renderer.domElement.height
  }
  // Update controls
  controls.update()

  screen1Material.uniforms.uTime.value = elapsedTime
  screen1Material.needsUpdate=true
  // window1Material.fragmentShader = fragArray[selectedArray[0]]
  //
  screen2Material.uniforms.uTime.value = elapsedTime
  screen2Material.needsUpdate=true


  screenMaterial.uniforms.uTime.value = elapsedTime
  screenMaterial.needsUpdate=true


  screen3Material.uniforms.uTime.value = elapsedTime
  screen3Material.needsUpdate=true

if(sceneGroup){
  // sceneGroup.rotation.y += .005
}



  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
