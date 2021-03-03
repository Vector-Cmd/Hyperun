import { _decorator, Component, utils, MeshRenderer } from "cc";
import { QuadraticBezierCurve3 } from "./tools/curve/QuadraticBezierCurve3";
import { Vector3 } from "./tools/curve/util/MathUtils";
import { MeshUtil } from "./tools/mesh/MeshUtil";
const { ccclass, property } = _decorator;

@ccclass("CreateMesh")
export class CreateMesh extends Component {
    start() {
        let curve = new QuadraticBezierCurve3(
            new Vector3(),
            new Vector3(0, 5, 50),
            new Vector3(0, 0, 100)
        );

        let path = curve.getSpacedPoints(100);
        let geometry = MeshUtil.cTrackMesh({
            path: path,
            segment: 100,
            width: 5,
            height: 2
        });

        let mesh = utils.createMesh(geometry);
        let meshRender = this.getComponent(MeshRenderer);
        meshRender && (meshRender.mesh = mesh);
    }
}
