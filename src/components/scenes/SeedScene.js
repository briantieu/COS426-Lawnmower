import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { Flower, Land } from 'objects';
import { BasicLights } from 'lights';
import { Grass } from '../objects/Grass';
import { LawnMower } from '../objects/LawnMower';
import { Trees } from '../objects/Trees';
import { Farm } from '../objects/Farm';
import { Rocks } from '../objects/Rocks';
import { Weeds } from '../objects/Weeds';
import { Fence } from '../objects/Fence';
import * as constants from '../../constants.js';

class SeedScene extends Scene {
    constructor(props) {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            // gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(constants.BACKGROUND_COLOR);

        // Add meshes to scene
        const land = new Land();
        const flower = new Flower(this);
        const lights = new BasicLights();
        const grass = new Grass();
        const trees = new Trees();
        const farm  = new Farm();
        const lawnMower = new LawnMower(this);
        const rocks = new Rocks(props);
        const weeds = new Weeds();
        const fence = new Fence();
        // If this following line is changed, need to change constants.js to reflect it
        this.add(land, lights, grass, trees, lawnMower, farm, rocks, weeds, fence);

        // // Populate GUI
        // this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        // this.rotation.y = (rotationSpeed * timeStamp) / 10000;
        // // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default SeedScene;
