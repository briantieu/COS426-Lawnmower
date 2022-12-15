import { Group,
    AnimationMixer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import MODEL from './fence.gltf';
require('./fence.bin');
require('./wood.jpg');

class Fence extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        // Load object
        const loader = new GLTFLoader();

        this.name = 'fences';
        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
            gltf.scene.scale.setScalar(0.55)
        });

        this.position.x = -26;
        this.position.z = 26;
    }

    // update(timeStamp) {
    //     this.position.add(0);
    // }
}

export default Fence;
