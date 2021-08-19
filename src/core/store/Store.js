export default class Store {
    constructor() {
        this.state = {
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            updatedAt: Date.now(),
            treeData: {}
        };
        this.prefix = 'treenode:';
        this.loaded = false;
        this.deltaTime = 3 * 1000;
    }

    load() {
        this.restore();
        this.loaded = true;
    }

    persist() {
        // if (this.loaded === false) return;
        // const { prefix } = this;
        // const allKeys = [];
        // Object.keys(this.state).forEach(key => {
        //     const unitValue = JSON.stringify(this.state[key]);
        //     const unitKey = prefix + key;
        //     localStorage.setItem(unitKey, unitValue);
        // });
        // localStorage.setItem(`${prefix}store:allKeys`, JSON.stringify(allKeys));
    }

    restore() {
        // const { prefix } = this;
        // const allKeys = JSON.parse(localStorage.getItem(`${prefix}store:allKeys`) || '[]');
        // allKeys.forEach(key => {
        //     const value = localStorage.getItem(key);
        //     if (value != null && key.indexOf(prefix) === 0) {
        //         const unitKey = key.replace(prefix, '');
        //         const unitValue = JSON.parse(value);
        //         this.state[unitKey] = unitValue;
        //     }
        // });
    }

    getState(key) {
        return this.state[key];
    }

    setState(key, state) {
        this.state[key] = state;
    }
}
