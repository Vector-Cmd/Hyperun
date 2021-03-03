/**正弦曲线 */
export default class Sinusoid {
    private mAmplitude: number; //振幅
    private mFrequency: number; //频率
    private mTime: number;

    private mHeight: number;

    /**振幅 */
    get amplitude() {
        return this.mAmplitude;
    }
    /**振幅 */
    set amplitude(val: number) {
        this.mAmplitude = val;
    }
    /**振频 */
    get frequency() {
        return this.mFrequency;
    }
    /**振频 */
    set frequency(val: number) {
        this.mFrequency = val;
    }
    /**当前时间 */
    get time() {
        return this.mTime;
    }
    /**当前时间 */
    set time(val: number) {
        this.mTime = val;
    }
    /**当前高度 */
    get height() {
        return this.mHeight;
    }

    /**
     * 正弦波
     * @param amplitude 振幅
     * @param frequency 震频
     * @param time 时间
     */
    constructor(amplitude?: number, frequency?: number, time?: number) {
        this.mAmplitude = amplitude || 0.1;
        this.mFrequency = frequency || 1;
        this.mTime = time || 0;
        this.update(0);
    }
    public update(dt: number): void {
        this.mTime += this.mFrequency * dt;
        this.mHeight = Math.sin(this.mTime) * this.mAmplitude;
    }
    public reset(time = 0): void {
        this.mTime = time;
    }
}
