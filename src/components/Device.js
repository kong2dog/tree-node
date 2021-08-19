import Component from '@/core/components/Component';
import {
    CAP_FONT_SIZE, CAP_RADIOUS, CAP_MIN_WIDTG, CANVAS_FONT_STYLE
} from '../constant/constant';

export default class Device extends Component {
    constructor() {
        super();
        this.visible = true;
        this.componentType = 'device'; // 组件类型 device设备
        this.backgroundColor = 'blue';
        this.deviceWidth = {};
    }

    Create() {
        super.Create();
        const { state } = this;
        const deviceContent = state.deviceWidth;
        this.rectWidth = deviceContent.width - 2 * CAP_RADIOUS;
        this.textWidth = deviceContent.textWidth;
        this.text = deviceContent.text;
        this.hoverMore = false;
        this.Update();
    }

    Update() {
        super.Update();
        if (this.visible && this.loaded) {
            const {
                state, scene, textWidth, text, rectWidth
            } = this;
            const ctx = this.context;
            const radius = CAP_RADIOUS;
            // 画胶囊
            ctx.beginPath();
            this.drawCap();
            ctx.shadowColor = 'rgb(31, 36, 41, 0.1)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 2;
            ctx.shadowOffsetX = 0;
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            // 恢复设置
            ctx.shadowColor = 'rgba(0,0,0,0)';
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 0;
            // 事件处理
            Object.keys(scene.eventMap).forEach(key => {
                const canvasEvent = scene.eventMap[key];
                if (ctx.isPointInPath(canvasEvent.pos.x, canvasEvent.pos.y)) {
                    if (canvasEvent.originEventType === 'mousemove') { // 移动事件 处理鼠标移入移出
                        if (!this.mouseIn) { // 上次不在组件内
                            canvasEvent.eventType = 'mouseinCap';
                            this.mouseIn = true;
                            scene.generalEventExecute(this, canvasEvent);
                        }
                        if (this.mouseIn) {
                            // 判定鼠标 有没有在 更多 按钮上
                            ctx.beginPath();
                            this.drawMoreArea();
                            if (ctx.isPointInPath(canvasEvent.pos.x, canvasEvent.pos.y)) {
                                this.hoverMore = true;
                            } else {
                                this.hoverMore = false;
                            }
                        } else {
                            this.hoverMore = false;
                        }
                        delete scene.eventMap[key];
                    } else if (canvasEvent.originEventType === 'click') {
                        canvasEvent.eventType = 'clickCap';
                        if (this.mouseIn) {
                            // 判定鼠标点击 有没有在 更多 按钮上
                            ctx.beginPath();
                            this.drawMoreArea();
                            if (ctx.isPointInPath(canvasEvent.pos.x, canvasEvent.pos.y)) {
                                canvasEvent.eventType = 'clickMore';
                            }
                        }
                        scene.generalEventExecute(this, canvasEvent);
                        delete scene.eventMap[key];
                    }
                } else {
                    if (canvasEvent.originEventType === 'mousemove' && this.mouseIn) { // 上次不在组件内
                        canvasEvent.eventType = 'mouseoutCap';
                        this.mouseIn = false;
                        scene.generalEventExecute(this, canvasEvent);
                    }
                }
            });
            // 画图标
            ctx.beginPath();
            ctx.arc(state.x + radius, state.y, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = '#E4E6E7';
            ctx.stroke();
            if (scene.svgImgs && scene.svgImgs[state.data.type]) {
                scene.svgImgs[state.data.type].then(img => {
                    ctx.drawImage(img, state.x + radius - img.width / 2, state.y - img.height / 2);
                });
            }
            // 画文字
            ctx.font = `${CAP_FONT_SIZE}px ${CANVAS_FONT_STYLE}`;
            ctx.fillStyle = this.mouseIn ? '#0091FF' : '#1F2429';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, state.x + 2 * radius + 8, state.y + 1, textWidth);
            if (this.mouseIn) {
                this.scene.setCanvasCursor('pointer');
                ctx.beginPath();
                this.drawCap();
                ctx.strokeStyle = '#0091FF';
                ctx.stroke();

                // 绘制 更多 按钮
                ctx.beginPath();
                ctx.arc(state.x + rectWidth + radius + 2, state.y - 5, 1.5, 0, 2 * Math.PI);
                ctx.arc(state.x + rectWidth + radius + 2, state.y, 1.5, 0, 2 * Math.PI);
                ctx.arc(state.x + rectWidth + radius + 2, state.y + 5, 1.5, 0, 2 * Math.PI);
                ctx.fillStyle = this.hoverMore ? '#0091FF' : '#646C73';
                ctx.fill();
            }
        }
    }

    // 画胶囊
    drawCap() {
        const {
            state, scene, textWidth, text, rectWidth
        } = this;
        const ctx = this.context;
        const radius = CAP_RADIOUS;
        ctx.moveTo(state.x + radius, state.y + radius);
        ctx.arc(state.x + radius, state.y, radius, 0.5 * Math.PI, 1.5 * Math.PI);
        ctx.lineTo(state.x + radius, state.y - radius);
        ctx.lineTo(state.x + radius + rectWidth, state.y - radius);
        ctx.arc(state.x + radius + rectWidth, state.y, radius, 1.5 * Math.PI, 0.5 * Math.PI);
        ctx.lineTo(state.x + radius + rectWidth, state.y + radius);
        ctx.lineTo(state.x + radius, state.y + radius);
    }

    // 画更多 的hover区域
    drawMoreArea() {
        const {
            state, scene, textWidth, text, rectWidth
        } = this;
        const ctx = this.context;
        const radius = CAP_RADIOUS;
        ctx.rect(state.x + rectWidth + radius - 4, state.y - 8, 12, 16);
    }

    Destroy() {}
}
