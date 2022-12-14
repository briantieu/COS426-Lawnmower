import {
    Group,
    PlaneGeometry,
    DoubleSide,
    MeshBasicMaterial,
    Mesh,
    TextureLoader,
    RepeatWrapping,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './land.gltf';

class Land extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        // const loader = new GLTFLoader();
        const loader = new TextureLoader();

        this.name = 'land';

        /*
        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });
        */
        let texture = loader.load('src/components/images/grass-texture.jpg');
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        const timesToRepeatHorizontally = 100;
        const timesToRepeatVertically = 100;
        texture.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);

        const geometry = new PlaneGeometry(1000, 1000);
        const material = new MeshBasicMaterial({
            color: 0x4b8e46,
            map: texture,
            side: DoubleSide,
        });
        
        const plane = new Mesh(geometry, material);
        plane.rotation.set(Math.PI / 2, 0, 0);
        this.add(plane);
    }
}

export default Land;
