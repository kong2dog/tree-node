import Component from '@/core/components/Component';
import { LINE_OFFSETX } from '@/constant/constant';
import {
    LINE_JOIN_LEN, LINE_RADIOUS
} from '../constant/constant';

export default class Line extends Component {
    constructor() {
        super();
        this.visible = true;
        this.componentType = 'line'; // 组件类型 device设备
        this.from = null;
        this.to = null;
    }

    Create() {
        super.Create();
        // 起始点坐标
        const { state } = this;
        this.order = this.state.index;
        this.start = {
            x: state.from.x + state.from.deviceWidth.width + LINE_OFFSETX,
            y: state.from.y
        };
        this.end = {
            x: state.to.x - LINE_OFFSETX,
            y: state.to.y
        };
        this.Update();
    }

    Update() {
        super.Update();
        if (this.visible && this.loaded) {
            const ctx = this.context;
            const { state, start, end } = this;
            const branchWidth = LINE_JOIN_LEN;
            const lineRadius = LINE_RADIOUS;
            ctx.beginPath();
            ctx.strokeStyle = '#646C73';
            ctx.fillStyle = '#646C73';
            ctx.moveTo(start.x, start.y);
            if (start.y === end.y) {
                ctx.lineTo(end.x, end.y);
            } else if (start.y > end.y) {
                ctx.lineTo(start.x + branchWidth, start.y);
                ctx.lineTo(start.x + branchWidth, end.y + lineRadius);
                ctx.arc(start.x + branchWidth + lineRadius, end.y + lineRadius, lineRadius, 1 * Math.PI, 1.5 * Math.PI);
                ctx.moveTo(start.x + branchWidth + lineRadius, end.y);
            } else if (start.y < end.y) {
                ctx.lineTo(start.x + branchWidth, start.y);
                ctx.lineTo(start.x + branchWidth, end.y - lineRadius);
                ctx.arc(start.x + branchWidth + lineRadius, end.y - lineRadius, lineRadius, 1 * Math.PI, 0.5 * Math.PI, true);
                ctx.moveTo(start.x + branchWidth + lineRadius, end.y);
            }
            ctx.lineTo(end.x, end.y);

            ctx.stroke();
            // 画三角
            ctx.beginPath();
            ctx.moveTo(end.x + 2, end.y);
            ctx.lineTo(end.x - 4, end.y + 4);
            ctx.lineTo(end.x - 4, end.y - 4);
            ctx.fill();
        }
    }

    Destroy() {
    }
}
