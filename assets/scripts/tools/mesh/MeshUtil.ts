import { primitives, Quat } from "cc";
import { CatmullRomCurve3 } from "../curve/CatmullRomCurve3";
import { Vector3 } from "../curve/util/MathUtils";
import JLTween from "../tween/JLTween";

const forward = new Vector3();
const right = new Vector3();
const up = new Vector3();
const baseUp = new Vector3(0, 1, 0);

const vA = new Vector3();
const vB = new Vector3();
const vC = new Vector3();
const vD = new Vector3();
const va = new Vector3();
const vb = new Vector3();
const vc = new Vector3();
const vd = new Vector3();
const qA = new Quat();

const DEG2RAD = Math.PI / 180;

export class MeshUtil {
    /**创建赛道 */
    public static cTrackMesh(option: {
        /**路径点 */
        path: Array<Vector3>;
        /**分段数 */
        segment?: number;
        /**宽度 */
        width?: number;
        /**高度 */
        height?: number;
        /**向前延长 */
        forwardAdd?: number;
        /**向后延长 */
        backwardAdd?: number;
        /**头部旋转角度 */
        headAngle?: number;
        /**尾部旋转角度 */
        tailAngle?: number;
    }): primitives.IGeometry {
        let segment = option.segment || 2;
        let width = option.width || 1;
        let height = option.height || 0;
        let forwardAdd = option.forwardAdd || 1;
        let backwardAdd = option.backwardAdd || 1;
        let headAngle = option.headAngle || 0;
        let tailAngle = option.tailAngle || 0;

        //旋转
        let curT = 0;
        let stepT = 1 / segment;
        let tw = new JLTween(headAngle, tailAngle, 0);

        let curve = new CatmullRomCurve3(option.path);
        //平均采样取点
        let tempPath = curve.getSpacedPoints(option.path.length);
        curve.destroy();

        //利用平均采样出来的点构造一条平滑曲线
        let newCurve = new CatmullRomCurve3(tempPath);
        //平均采样取点，构造网格的关键点
        let trackPoints = newCurve.getSpacedPoints(segment);

        //<===============> 操作函数 <===============>
        let initSectionPoints = function (section: Array<Vector3>, num: number) {
            for (let i = 0; i < num; i++) {
                section.push(new Vector3());
            }
        };
        /**p1T < p2T */
        let calSectionPoints = function (
            p1: Vector3,
            p2: Vector3,
            section: Array<Vector3>,
            halfWid: number,
            height: number,
            rotAngle: number = 0
        ) {
            Vector3.subtract(p2, p1, forward);
            forward.normalize();
            Vector3.cross(forward, baseUp, right);
            Vector3.cross(right, forward, up);

            section[0].setValue(
                p1.x - right.x * halfWid,
                p1.y - right.y * halfWid,
                p1.z - right.z * halfWid
            );
            section[1].setValue(
                p1.x + right.x * halfWid,
                p1.y + right.y * halfWid,
                p1.z + right.z * halfWid
            );
            if (height !== 0) {
                //绘制两边
                section[2].copyFrom(section[1]);
                section[1].copyFrom(section[0]);
                section[3].copyFrom(section[2]);

                up.scale(-0.5);

                section[0].add(up);
                section[3].add(up);
            }

            rotSectionPoints(section, forward, rotAngle);
        };
        let rotSectionPoints = function (
            section: Array<Vector3>,
            forward: Vector3,
            rotAngle: number
        ) {
            Quat.fromAxisAngle(qA, forward, rotAngle * DEG2RAD);

            for (let i = 0; i < section.length; i++) {
                Vector3.transformQuat(section[i], qA, section[i]);
            }
        };
        let getSectionPoints = function (
            sectionA: Array<Vector3>,
            sectionB: Array<Vector3>,
            positions: Array<number>,
            normals: Array<number>
        ) {
            let v0: Vector3, v1: Vector3, v2: Vector3, v3: Vector3;
            for (let i = 0; i < sectionA.length - 1; i++) {
                v0 = sectionA[i];
                v1 = sectionB[i];
                v2 = sectionB[i + 1];
                v3 = sectionA[i + 1];

                positions.push(v0.x, v0.y, v0.z);
                positions.push(v1.x, v1.y, v1.z);
                positions.push(v2.x, v2.y, v2.z);
                positions.push(v3.x, v3.y, v3.z);

                normals.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
            }
        };
        //<===============> 操作函数 <===============>

        let halfWid = width * 0.5;
        let positions = new Array<number>();
        let normals = new Array<number>();
        let uvs = new Array<number>();
        let indices = new Array<number>();

        let sectionA = new Array<Vector3>();
        let sectionB = new Array<Vector3>();
        let tempSection: Array<Vector3> = null; //用作交换
        let num = height == 0 ? 2 : 4;
        initSectionPoints(sectionA, num);
        initSectionPoints(sectionB, num);

        //向后延申
        Vector3.subtract(trackPoints[1], trackPoints[0], forward);
        forward.normalize();
        forward.scale(-backwardAdd);
        Vector3.add(trackPoints[0], forward, vA);
        calSectionPoints(vA, trackPoints[0], sectionA, halfWid, height, headAngle);
        calSectionPoints(trackPoints[0], trackPoints[1], sectionB, halfWid, height, headAngle);
        getSectionPoints(sectionA, sectionB, positions, normals);

        for (let i = 1, il = trackPoints.length - 1; i < il; i++) {
            //交换 A, B
            tempSection = sectionB;
            sectionB = sectionA;
            sectionA = tempSection;

            curT += stepT;
            calSectionPoints(
                trackPoints[i],
                trackPoints[i + 1],
                sectionB,
                halfWid,
                height,
                tw.getValueByT(curT)
            );
            getSectionPoints(sectionA, sectionB, positions, normals);

            if (i == il - 1) {
                //最后一个点
                curT += stepT;
                //计算最后一段并加上向前延申的距离
                Vector3.scale(forward, forwardAdd, vA);
                Vector3.add(trackPoints[i + 1], vA, vA);
                Vector3.add(vA, forward, vB);

                //交换 A, B
                tempSection = sectionB;
                sectionB = sectionA;
                sectionA = tempSection;

                calSectionPoints(vA, vB, sectionB, halfWid, height, tw.getValueByT(curT));
                getSectionPoints(sectionA, sectionB, positions, normals);
            }
        }

        let index = 0;
        let a: number, b: number, c: number, d: number;
        for (let i = 0, il = positions.length; i < il; i += 3 * 4) {
            a = index;
            b = index + 1;
            c = index + 2;
            d = index + 3;

            indices.push(a, c, b, a, d, c);
            index += 4;
        }

        let iA = 0,
            iB = 0,
            iC = 0;
        for (let i = 0, il = indices.length; i < il; i += 3) {
            iA = indices[i + 0] * 3;
            iB = indices[i + 1] * 3;
            iC = indices[i + 2] * 3;

            vA.fromArray(positions, iA);
            vB.fromArray(positions, iB);
            vC.fromArray(positions, iC);

            Vector3.subtract(vB, vA, va);
            Vector3.subtract(vC, vA, vb);
            Vector3.cross(va, vb, vc);

            normals[iA + 0] += vc.x;
            normals[iA + 1] += vc.y;
            normals[iA + 2] += vc.z;

            normals[iB + 0] += vc.x;
            normals[iB + 1] += vc.y;
            normals[iB + 2] += vc.z;

            normals[iC + 0] += vc.x;
            normals[iC + 1] += vc.y;
            normals[iC + 2] += vc.z;
        }
        for (let i = 0, il = normals.length; i < il; i += 3) {
            vA.setValue(normals[i + 0], normals[i + 1], normals[i + 2]);
            vA.normalize();
            normals[i + 0] = vA.x;
            normals[i + 1] = vA.y;
            normals[i + 2] = vA.z;
        }

        //暂时不计算 uv
        // let stepCount = height == 0 ? 4 : 12;
        // let t = 0;
        // for (let i = 0, il = indices.length; i < il; i += stepCount) {

        // }

        return {
            positions: positions,
            normals: normals,
            indices: indices
        };
    }
}
