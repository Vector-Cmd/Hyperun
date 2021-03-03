import { primitives } from "cc";
import { CatmullRomCurve3 } from "../curve/CatmullRomCurve3";
import { Vector3 } from "../curve/util/MathUtils";

const forward = new Vector3();
const right = new Vector3();
const up = new Vector3();

export class CreateMesh {

    /**创建赛道 */
    public static cTrackMesh(option: {
        /**路径点 */
        path: Array<Vector3>,
        /**分段数 */
        segment?: number,
        /**宽度 */
        width?: number,
        /**高度 */
        height?: number,
        /**向前延长 */
        forwardAdd?: number,
        /**向后延长 */
        backwardAdd?: number,
        startAngle?: number,
        endAngle?: number
    }): primitives.IGeometry {
        let segment = option.segment || 2;
        let width = option.width || 1;
        let height = option.height || 0;
        let forwardAdd = option.forwardAdd || 1;
        let backwardAdd = option.backwardAdd || 1;
        let startAngle = option.startAngle || 0;
        let endAngle = option.endAngle || 0;

        let curve = new CatmullRomCurve3(option.path);
        let tempPath = curve.getSpacedPoints(segment);
        curve.destroy();

        let newCurve = new CatmullRomCurve3(tempPath);

        let section = new Array<Vector3>();

        return;
    }

}