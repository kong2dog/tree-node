import {
    MIN_SCALE,
    MAX_SCALE,
    CANVAS_EVENTS,
    CLICK_MAX_OFFSET
} from '../../constant/constant';

import A from '../../assets/A.svg';
import B from '../../assets/B.svg';
import C from '../../assets/C.svg';
import D from '../../assets/D.svg';
import G from '../../assets/G.svg';

export default class Scene {
    constructor() {
        /** 预定义暂时没有用到的属性 --start */
        this.params = {};
        this.childrenMap = {};
        this.store = null; // 数据存储对象
        /** 预定义暂时没有用到的属性 --end */

        this.dom = null; // canvas的容器
        this.svgImgs = null; // svgs静态资源

        /** 画布相关属性 */
        this.canvas = null; // canvas 对象
        this.context = null; // 画笔工具
        this.canvasWidth = 0; // 画布宽
        this.canvasHeight = 0; // 画布高
        this.canvasRangeStartPos = { x: 0, y: 0 };// canvas 画布左上点坐标
        this.canvasRangeEndPos = { x: 0, y: 0 };// canvas 画布右下点坐标

        /** 坐标相关属性 */
        this.scale = 1; // 缩放比例
        this.translateX = 0; // 坐标translate x值
        this.translateY = 0; // 坐标translate y值

        /** 画布元素相关属性 */
        this.children = []; // 存储 画布元素对象的数组

        /** 事件相关全局变量 */
        this._haveMoving = false; // 是否有移动,移动后屏蔽点击事件
        this.eventMap = {}; // 存储事件
    }

    Init(dom) {
        if (!dom) return;
        this.dom = dom;
        const canvas = document.createElement('canvas');
        this.dom.appendChild(canvas);
        // 加载静态资源
        this.loaderStatic();
        // 初始化一些数据
        this.canvas = canvas;
        this.canvasWidth = this.dom.clientWidth;
        this.canvasHeight = this.dom.clientHeight;
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.canvasRangeEndPos = { x: this.canvasWidth, y: this.canvasHeight };
        this.context = canvas.getContext('2d', {
            antialias: true
        });
        this.context.lineJoin = 'round';
        this.context.globalCompositeOperation = 'source-over'; // 覆盖模式
        // 注册相关功能
        this.registerDrag(); // 拖拽功能
        this.registerScale(); // 缩放功能
        this.registerSceneMouseEvent(); // canvas 通用鼠标事件注册
        this.Create();
    }

    Render() {
        if (!this.context) {
            return;
        }

        // 清除画布
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        // 更新场景
        this.Update();

        // 设置 坐标轴的偏移 和 缩放
        this.context.translate(this.translateX, this.translateY);
        this.context.scale(this.scale, this.scale);

        // 更新2D组件
        this.updateChildren();

        // 处理没有作用在元素上的事件; 没有作用在元素上,那就是在空白处
        Object.keys(this.eventMap).forEach(eventType => {
            if (eventType === 'click') { // 只处理点击空白处的click
                const canvasEvent = this.eventMap[eventType];
                canvasEvent.eventType = 'clickOut';
                this.generalEventExecute(null, this.eventMap[eventType]);
            }
            this.setCanvasCursor('default');
            delete this.eventMap[eventType]; // 清掉事件 优化canvas渲染
        });
    }

    updateChildren() {
        const visibleChildren = this.children.filter(child => child.visible).sort((a, b) => {
            if (a._zIndex === b._zIndex) {
                return a.index < b.index;
            }
            return (a._zIndex > b._zIndex);
        });
        visibleChildren.forEach(child => {
            if (!child.loaded) {
                // 注入相关数据
                child.scene = this;
                child.context = this.context;
                child.state = this.store.getState(child.name);
                child.Create();
                child.loaded = true;
            } else child.Update();
        });
    }

    // 移动缩放属于 基本操作 应该放在基类中
    // 注册拖拽
    registerDrag() {
        if (!this.canvas) {
            return;
        }
        const points = [];
        let startPoint = null,
            movingStart = false; // 是否在移动
        // 开始移动
        this._moveStar = (evt) => {
            points[1] = {
                x: evt.offsetX,
                y: evt.offsetY
            };
            startPoint = {
                x: evt.offsetX,
                y: evt.offsetY
            };
            movingStart = true;
        };
        // 移动中
        this._movingHandle = (evt) => {
            if (!movingStart) {
                return;
            }
            // 判定鼠标移动优化
            if (startPoint && (Math.abs(startPoint.x - evt.offsetX) > CLICK_MAX_OFFSET || Math.abs(startPoint.y - evt.offsetY) > CLICK_MAX_OFFSET)) {
                this._haveMoving = true;
            }
            while (points.length >= 2) {
                points.shift();
            }
            points.push({
                x: evt.offsetX,
                y: evt.offsetY
            });
            if (points.length === 2) {
                const xLen = points[1].x - points[0].x;
                const yLen = points[1].y - points[0].y;
                this.translateX += xLen;
                this.translateY += yLen;
            }
        };
        // 移动结束
        this._moveEnd = (evt) => {
            while (points.length > 0) {
                points.shift();
            }
            this._calcCanvasRange();
            movingStart = false;
            setTimeout(() => { // click 事件在mouseup之后执行  所以要滞后执行
                this._haveMoving = false;
            });
        };

        // 注册事件
        this.canvas.addEventListener('mousedown', this._moveStar);
        this.canvas.addEventListener('mousemove', this._movingHandle);
        this.canvas.addEventListener('mouseup', this._moveEnd);
        this.canvas.addEventListener('mouseout', this._moveEnd);
    }

    // 移除拖拽
    removeDrag() {
        this.canvas.removeEventListener('mousedown', this._moveStar);
        this.canvas.removeEventListener('mousemove', this._movingHandle);
        this.canvas.removeEventListener('mouseup', this._moveEnd);
        this.canvas.removeEventListener('mouseout', this._moveEnd);
    }

    // 注册缩放
    registerScale() {
        this._scrollFunc = (evt) => {
            const e = evt || window.event;
            const increment = (e.wheelDelta || e.detail * 24) / 1200;
            const mouseX = e.offsetX;
            const mouseY = e.offsetY;
            this._calcScale(mouseX, mouseY, increment);
        };
        this.canvas.addEventListener('mousewheel', this._scrollFunc);
        this.canvas.addEventListener('DOMMouseScroll', this._scrollFunc, false);
    }

    // 移除缩放
    removeScale() {
        this.canvas.removeEventListener('mousewheel', this._scrollFunc);
        this.canvas.removeEventListener('DOMMouseScroll', this._scrollFunc);
    }

    /**
     * 缩放计算
     * @param {Number} x 缩放点到画布左边距离
     * @param {Number} y 缩放点到画布顶部距离
     * @param {Number} increment 缩放增量
     */
    _calcScale(x, y, increment) {
        this.scale += increment;
        if (this.scale < MIN_SCALE) {
            this.scale = MIN_SCALE;
            return;
        }
        if (this.scale > MAX_SCALE) {
            this.scale = MAX_SCALE;
            return;
        }
        const offsetX = (x - this.translateX) * (this.scale / (this.scale - increment)) - (x - this.translateX);
        const offsetY = (y - this.translateY) * (this.scale / (this.scale - increment)) - (y - this.translateY);
        this.translateX -= offsetX;
        this.translateY -= offsetY;
        this._calcCanvasRange();
    }

    /**
     * 计算 画布范围 的坐标
     */
    _calcCanvasRange() {
        this.canvasRangeStartPos.x = parseInt((0 - this.translateX) / this.scale);
        this.canvasRangeStartPos.y = parseInt((0 - this.translateY) / this.scale);
        this.canvasRangeEndPos.x = parseInt((this.canvasWidth - this.translateX) / this.scale);
        this.canvasRangeEndPos.y = parseInt((this.canvasHeight - this.translateY) / this.scale);
    }

    /**
     * 场景交互事件注册
     */
    registerSceneMouseEvent() {
        CANVAS_EVENTS.forEach(eventType => {
            this[`_general_event_function_${eventType}`] = (evt) => this._generalEventHandle(evt, eventType);
            this.canvas.addEventListener(eventType, this[`_general_event_function_${eventType}`]);
        });
    }

    /**
     * 移除场景交互事件
     */
    removeSceneMouseEvent() {
        CANVAS_EVENTS.forEach(eventType => {
            this.canvas.removeEventListener(this[`_general_event_function_${eventType}`]);
        });
    }

    /**
     * 通用事件处理函数
     * @param {Event} evt
     * @param {String} type
     */
    _generalEventHandle(evt, type) {
        if (type === 'click' && this._haveMoving) { // 移动后屏蔽点击事件
            return;
        }
        const pos = {
            x: evt.offsetX,
            y: evt.offsetY
        };
        this.eventMap[type] = {
            pos,
            originEventType: type,
            originEvent: evt
        };
    }

    /**
     * 加载静态资源
     */

    loaderStatic() {
        const svgs = {
            A, B, C, D, G
        };
        const svgImgs = {};
        Object.keys(svgs).forEach((svgName) => {
            svgImgs[svgName] = new Promise((resolve, reject) => {
                const img = new Image();
                img.src = svgs[svgName];
                img.style.display = 'none';
                document.body.appendChild(img);
                img.onload = () => {
                    resolve(img);
                };
                img.onerror = (err) => {
                    reject(err);
                };
            });
        });
        this.svgImgs = svgImgs;
    }

    /**
     * 设置 canvas的鼠标样式
     * @param {String} type
     */
    setCanvasCursor(type) {
        this.canvas.style.cursor = type;
    }

    /**
     * @abstract
     * 数据层的一些计算
     */
    Create() {}

    /**
     * @abstract
     * 更新场景
     */
    Update() {}

    /**
     * @abstract
     * 销毁时的钩子
     */
    Destroy() {}

    /**
     *  canvas通用事件的执行
    * @param {Device} targetCanvasElement canvas事件目标元素 可能是设备, 可能是 线条
    * @param {Object} canvasEvent canvas事件对象,canvasEvent.pos:事件触发点canvas坐标,canvasEvent.eventType:事件类型,canvasEvent.originEvent:原生事件对象
    * canvasEvent.eventType 值说明:
    *   clickOut 点击非元素区域
    *   clickCap 点击胶囊
    *   clickMore 点击胶囊的更多按钮
    *   clickBubble 点击数字小球
    *   mouseinCap 鼠标移入胶囊
    *   mouseoutCap 鼠标移出胶囊
    */
    generalEventExecute(targetCanvasElement, canvasEvent) {
        canvasEvent.targetCanvasElement = targetCanvasElement;
        if (this[`$${canvasEvent.eventType}`] && this[`$${canvasEvent.eventType}`].length) {
            this[`$${canvasEvent.eventType}`].forEach((callback) => {
                callback(canvasEvent);
            });
        }
    }

    // 定义挂载事件函数
    /**
     * type 说明:
     *   clickOut 点击非元素区域
     *   clickCap 点击胶囊
     *   clickMore 点击胶囊的更多按钮
     *   clickBubble 点击数字小球
     *   mouseinCap 鼠标移入胶囊
     *   mouseoutCap 鼠标移出胶囊
     */
    on(eventType, callback) {
        if (!callback) {
            console.error("Failed to execute 'on' on 'EventTarget': 2 arguments required, but only 1 present.");
            return this;
        }
        if (typeof callback !== 'function') {
            console.error("Failed to execute 'on' on 'EventTarget': parameter 2 is not of type 'function'.");
            return this;
        }
        if (!this[`$${eventType}`]) {
            this[`$${eventType}`] = [];
        }
        if (this[`$${eventType}`].indexOf(callback) >= 0) {
            this.removeEventListener(eventType, callback);
        }
        this[`$${eventType}`].push(callback);
        return this;
    }

    // 定义移除事件的函数
    off(eventType, callback) {
        if (!callback) {
            console.error("Failed to execute 'off' on 'EventTarget': 2 arguments required, but only 1 present.");
            return this;
        }
        if (typeof callback !== 'function') {
            console.error("Failed to execute 'off' on 'EventTarget': parameter 2 is not of type 'function'");
            return this;
        }
        if (this[`$${eventType}`] && this[`$${eventType}`].length) {
            const index = this[`$${eventType}`].indexOf(callback);
            if (index >= 0) {
                this[`$${eventType}`].splice(index, 1);
            }
        }
        return this;
    }
}
