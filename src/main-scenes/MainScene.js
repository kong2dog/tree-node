import Scene from '@/core/scenes/Scene';
import Device from '@/components/Device';
import Line from '@/components/Line';
import { getDeviceWidth } from '@/utils/utils';
import {
    CAP_RADIOUS, SINGLE_CHILD_OFFSETX, MULTIPLE_CHILD_OFFSETX, CHILD_OFFSETY
} from '@/constant/constant';

export default class MainScene extends Scene {
    Create() {
        // 子母映射
        this.childToParentMap = {};
        // 母子映射
        this.parentToChildrenMap = {};
        // 设备位置信息
        this.devices = {};
        // 设备连线信息
        this.lines = {};
        // 初始坐标
        this.initialX = 100;
        this.initialY = 300;
        // 最大，最小x,y
        this.minX = 0;
        this.minY = 0;
        this.maxX = 0;
        this.maxY = 0;
    }

    setData() {
        const { treeData } = this.store.state;
        this.setParent(treeData, treeData.children);
        this.devices[treeData.name] = {
            data: treeData,
            name: treeData.name,
            x: this.initialX,
            level: 0, // 等级 0是顶级，子级+1
            y: this.initialY,
            deviceWidth: getDeviceWidth(this.context, treeData.name),
            areaHeight: this.parentToChildrenMap[treeData.name] ? this.parentToChildrenMap[treeData.name].length * (2 * CAP_RADIOUS + CHILD_OFFSETY) - CHILD_OFFSETY : 2 * CAP_RADIOUS
        };
        this.minX = this.initialX;
        this.minY = this.initialY;
        this.maxX = this.initialX + this.devices[treeData.name].deviceWidth.width;
        this.maxY = this.initialY + (2 * CAP_RADIOUS);
        this.deviceHeight = 2 * CAP_RADIOUS;
        this.calculatePositions(treeData);
        this.createDisplayObjects();
    }

    setParent(parent, children) {
        this.parentToChildrenMap[parent.name] = children;
        children.forEach(c => {
            this.childToParentMap[c.name] = parent.name;
            if (c.children && c.children.length) {
                this.setParent(c, c.children);
            }
        });
    }

    calculatePositions(parent) {
        this.initialPositiosn(parent);
        this.updatePositions();
    }

    initialPositiosn(parent) {
        const parentDevice = this.devices[parent.name];
        const topY = parentDevice.y + CAP_RADIOUS - parentDevice.areaHeight / 2;
        const children = this.parentToChildrenMap[parent.name];
        const offsetX = children.length > 1 ? parentDevice.x + parentDevice.deviceWidth.width + MULTIPLE_CHILD_OFFSETX : parentDevice.x + parentDevice.deviceWidth.width + SINGLE_CHILD_OFFSETX;
        children.forEach((c, index) => {
            if (parentDevice) {
                const areaHeight = this.parentToChildrenMap[c.name] ? this.parentToChildrenMap[c.name].length * (2 * CAP_RADIOUS + CHILD_OFFSETY) - CHILD_OFFSETY : 2 * CAP_RADIOUS;
                const deviceWidth = getDeviceWidth(this.context, c.name);
                this.devices[c.name] = {
                    data: c,
                    name: c.name,
                    x: offsetX,
                    y: topY + index * (2 * CAP_RADIOUS + CHILD_OFFSETY),
                    level: parentDevice.level + 1,
                    deviceWidth,
                    areaHeight
                };
                this.lines[`${parent.name}-${c.name}`] = {
                    order: index,
                    name: `${parent.name}-${c.name}`,
                    from: parentDevice,
                    to: this.devices[c.name]
                };
                if (c.children && c.children.length) {
                    this.initialPositiosn(c, c.children);
                }
            }
        });
    }

    updatePositions() {
        Object.keys(this.devices).forEach(k => {
            const selfAreaHeight = this.devices[k].areaHeight;
            if (selfAreaHeight > 30) {
                const diff = selfAreaHeight - 30;
                this.updateBrotherPositions(k, diff / 2);
            }
        });
    }

    updateBrotherPositions(nodeKey, addHeight) {
        const parentDevice = this.childToParentMap[nodeKey];
        if (parentDevice) {
            const childrenList = this.parentToChildrenMap[parentDevice],
                index = childrenList.findIndex((item) => item.name === nodeKey);
            childrenList.forEach((item, _index) => {
                let _offset = 0;
                if (_index < index) {
                    _offset = -addHeight;
                } else if (_index === index) {
                    return;
                } else if (_index > index) {
                    _offset = addHeight;
                }
                this.devices[item.name].y += _offset;
                const children = this.parentToChildrenMap[item.name];
                if (children) {
                    this.updateChildrenPositions(children, _offset);
                }
            });
            this.updateBrotherPositions(parentDevice, addHeight);
        }
    }

    updateChildrenPositions(children, offset) {
        children.forEach((item) => {
            this.devices[item.name].y += offset;
            const children = this.parentToChildrenMap[item.name];
            if (children) {
                this.updateChildrenPositions(children, offset);
            }
        });
    }

    createDisplayObjects() {
        Object.keys(this.devices).forEach(k => {
            const d = new Device();
            d.name = k;
            this.children.push(d);
            this.store.setState(k, this.devices[k]);
        });
        Object.keys(this.lines).forEach(k => {
            const l = new Line();
            l.name = k;
            this.children.push(l);
            this.store.setState(k, this.lines[k]);
        });
    }

    /**
     * @override
     * 抽象方法重写; 被基类render方法调用
     * 渲染背景
     */
    Update() {
        if (this.canvas) {
            // 绘制背景
            const ctx = this.context;
            ctx.fillStyle = '#F8F9FA';
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            for (let x = 12; x < this.canvasWidth + 22; x = x + 22) {
                for (let y = 12; y < this.canvasHeight + 22; y = y + 22) {
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, 2 * Math.PI);
                    ctx.fillStyle = '#E4E6E7';
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }

    Destroy() {}
}
