import { Group, PlaneGeometry, DoubleSide, MeshBasicMaterial, Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './land.gltf';

class Land extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'land';

        /*
        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });
        */

        const geometry = new PlaneGeometry(10, 10);
        const material = new MeshBasicMaterial({color: 0x4B8E46, side: DoubleSide});
        const plane = new Mesh(geometry, material);
        plane.rotation.set(Math.PI / 2, 0, 0);
        this.add(plane);
    }
}

export default Land;
