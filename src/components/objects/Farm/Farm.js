import { Group,
    AnimationMixer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import MODEL from './scene.gltf';

class Farm extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        // Load object
        const loader = new GLTFLoader();

        this.name = 'farm';
        // cow link: 'https://r105.threejsfundamentals.org/threejs/resources/models/animals/Cow.gltf'
        loader.load(MODEL, (gltf) => {
            gltf.scene.position.z += 40;
            gltf.scene.rotation.y += Math.PI;
            this.add(gltf.scene);    
            // const clone = gltf.scene.clone();
            // this.add(clone);
        });

        // Add self to parent's update list
        // parent.addToUpdateList(this);

        // Populate GUI
        // this.state.gui.add(this.state, 'bob');
        // this.state.gui.add(this.state, 'spin');
    }

    // update(timeStamp) {
    //     this.position.add(0);
    // }
}

export default Farm;
