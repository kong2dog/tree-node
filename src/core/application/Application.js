export default class Application {
    constructor({ dom, scene, store }) {
        this.dom = dom;
        this.store = store;
        this.scene = scene;
        this.loaded = false;
        this.storeDeltaTime = 1000;
        this.lastStoreTime = 0;
    }

    update() {
        requestAnimationFrame(() => this.update());
        this.scene.Render();
        if (Date.now() - this.lastStoreTime > this.storeDeltaTime) {
            this.lastStoreTime = Date.now();
            this.store.setState('updatedAt', this.lastStoreTime);
            this.store.persist();
        }
    }

    start() {
        this.store.load();
        this.scene.store = this.store;
        this.scene.Init(this.dom);
        this.loaded = true;
        this.update();
    }

    setData(treeData) {
        this.store.setState('treeData', treeData);
        this.scene.setData();
    }
}
