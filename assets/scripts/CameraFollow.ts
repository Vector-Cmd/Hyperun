
import { _decorator, Component, Node, utils, MeshRenderer, Quat } from 'cc';
import { Curve } from './tools/curve/Curve';
import { MathUtils, Vector3 } from './tools/curve/util/MathUtils';
import { MeshUtil } from './tools/mesh/MeshUtil';
const { ccclass, property } = _decorator;

@ccclass('CameraFollow')
export class CameraFollow extends Component {

    @property({ type: Node, tooltip: "track" })
    track: Node = null

    private mCurve: Curve<Vector3>;
    private mCurLength: number;
    private mTotalLength: number;

    private mPoint: Vector3;
    private mForward: Vector3;
    private mUp: Vector3;

    start() {
        let path = new Array<Vector3>();
        let deg2rad = Math.PI / 180;

        let radius = 50;
        let totalAng = 360 * 5;//五圈
        let stepAng = 30;

        let height = 0;
        let stepHeight = 1;
        let x: number, z: number;
        for (let curAng = 0; curAng < totalAng; curAng += stepAng) {
            x = Math.cos(curAng * deg2rad) * radius;
            z = Math.sin(curAng * deg2rad) * radius;

            path.push(new Vector3(x, height, z));
            height += stepHeight;
        }

        let meshInfo = MeshUtil.cTrackMesh({
            path: path,
            segment: 500,
            width: 5,
            height: 2,
            // headAngle: 0,
            // tailAngle: 30
        });

        let mesh = utils.createMesh(meshInfo[0]);
        let meshRender = this.track.getComponent(MeshRenderer);
        meshRender && (meshRender.mesh = mesh);

        this.mCurve = meshInfo[1];
        this.mTotalLength = this.mCurve.getLength();
        this.mCurLength = 0;

        this.mPoint = new Vector3();
        this.mForward = new Vector3();
        this.mUp = new Vector3(0, 1, 0);
    }

    public update(dt: number) {
        this.mCurLength += dt * 10;
        let t = MathUtils.clamp(this.mCurLength / this.mTotalLength, 0, 1);
        this.mCurve.getPoint(t, this.mPoint);
        this.mCurve.getTangent(t, this.mForward);

        //位置
        this.mPoint.y += 0.5;
        let pos = this.node.position;
        pos.lerp(this.mPoint.vec3, 0.2);
        this.node.position = pos;

        //旋转
        Vector3.scale(this.mForward, -1, this.mForward);
        let rot = this.node.rotation;
        Quat.fromViewUp(rot, this.mForward, this.mUp.vec3);
        this.node.rotation = rot;

    }


}


