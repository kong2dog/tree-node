import Application from '@/core/application/Application'; // 应用模块
import Store from '@/core/store/Store'; // 数据存储
import MainScene from '@/main-scenes/MainScene'; // 数据存储单元

const testTree = {
    type: 'A', // A:变压器; B:低压馈电柜 C:配电抽屉 D:低压末端配电柜 G:末端设备
    name: '变压器T1',
    isRoot: true,
    allchildren: 100,
    children: [{
        type: 'B',
        name: '低压馈电柜BBB',
        isRoot: false,
        allchildren: 99,
        children: [{
            type: 'C',
            name: '配电抽屉配电抽屉配电抽屉配电抽屉配电抽屉配电抽屉CCC',
            isRoot: false,
            allchildren: 98
        }, {
            type: 'C',
            name: '配电抽屉CCC1',
            isRoot: false,
            allchildren: 98
        }, {
            type: 'C',
            name: '配电抽屉CCC2',
            isRoot: false,
            allchildren: 98
        }]
    }, {
        type: 'B',
        name: '低压馈电柜低压馈电柜低压馈电柜低压馈电柜低压馈电柜BBB1',
        isRoot: false,
        allchildren: 99,
        children: [{
            type: 'C',
            name: '配电抽屉CCC20',
            isRoot: false,
            allchildren: 98
        }, {
            type: 'C',
            name: '配电抽屉CCC21',
            isRoot: false,
            allchildren: 98
        }, {
            type: 'C',
            name: '配电抽屉CCC22',
            isRoot: false,
            allchildren: 98
        },
        {
            type: 'C',
            name: '配电抽屉Cxxx2',
            isRoot: false,
            allchildren: 98
        },
        {
            type: 'C',
            name: '配电抽屉C55x2',
            isRoot: false,
            allchildren: 98
        },
        {
            type: 'C',
            name: '配电抽屉CCC55',
            isRoot: false,
            allchildren: 98
        }]
    }]
};

window.app = new Application({
    dom: document.getElementById('warp'),
    scene: new MainScene(),
    store: new Store()
});

/**
 *  支持的事件 如下
 *   clickOut 点击非元素区域
 *   clickCap 点击胶囊
 *   clickMore 点击胶囊的更多按钮
 *   clickBubble 点击数字小球
 *   mouseinCap 鼠标移入胶囊
 *   mouseoutCap 鼠标移出胶囊
 */

// 事件测试用例
const clickBlank = (canvasEvent) => {
    console.log('点击空白:', canvasEvent);
    // 点击一次后移除
    window.app.scene.off('clickOut', clickBlank);
};
// 支持级联写法
window.app.scene
    .on('clickOut', clickBlank)
    .on('clickCap', (canvasEvent) => {
        console.log('点击胶囊:', canvasEvent);
    })
    .on('clickCap', (canvasEvent) => {
        console.log('点击胶囊2:', canvasEvent);
    })
    .on('clickMore', (canvasEvent) => {
        console.log('点击胶囊内的更多:', canvasEvent);
    })
    .on('mouseinCap', (canvasEvent) => {
        console.log('移入胶囊:', canvasEvent);
    })
    .on('mouseoutCap', (canvasEvent) => {
        console.log('移出胶囊:', canvasEvent);
    });

window.app.start();
window.app.setData(testTree);
