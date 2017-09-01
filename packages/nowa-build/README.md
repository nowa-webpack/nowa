## Config Alias
```js
exports.nowa = {
    build: {
        define: {}, // 传递给 definePlugin
        alias: {}, // 传递给 resolve.alias
        provide: {}, // 传递给 providePlugin
        // entryPath: '', // 类似于1.0的 pages， 暂不可用
        
        externals: {}, 
        entry: {},
        watch: false,
        watchOptions: {},
        output: {
            path: '',
            filename: '',
            publicPath: '',
            jsonpFunction: '',
        },
    }
};
```
