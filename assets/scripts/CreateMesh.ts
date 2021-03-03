import { _decorator, Component, utils, MeshRenderer } from "cc";
import { QuadraticBezierCurve3 } from "./tools/curve/QuadraticBezierCurve3";
import { Vector3 } from "./tools/curve/util/MathUtils";
import { MeshUtil } from "./tools/mesh/MeshUtil";
const { ccclass, property } = _decorator;

@ccclass("CreateMesh")
export class CreateMesh extends Component {
    start() {
        // let path = new Array<Vector3>();

        // let deg2rad = Math.PI / 180;

        // let radius = 50;
        // let totalAng = 360 * 5;//五圈
        // let stepAng = 30;

        // let height = 0;
        // let stepHeight = 1;
        // let x: number, z: number;
        // for (let curAng = 0; curAng < totalAng; curAng += stepAng) {
        //     x = Math.cos(curAng * deg2rad) * radius;
        //     z = Math.sin(curAng * deg2rad) * radius;

        //     path.push(new Vector3(x, height, z));
        //     height += stepHeight;
        // }

        let curve = new QuadraticBezierCurve3(
            new Vector3(),
            new Vector3(0, 10, 250),
            new Vector3(0, 0, 500)
        );
        let path = curve.getSpacedPoints(100);

        let meshInfo = MeshUtil.cTrackMesh({
            path: path,
            segment: 500,
            width: 5,
            height: 2,
            headAngle: 0,
            tailAngle: 30
        });

        let mesh = utils.createMesh(meshInfo[0]);
        let meshRender = this.getComponent(MeshRenderer);
        meshRender && (meshRender.mesh = mesh);
    }
}
