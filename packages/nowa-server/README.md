## Config Alias
```js
exports.nowa = {
    server: {
        define: {}, // 传递给 definePlugin
        alias: {}, // 传递给 resolve.alias
        provide: {}, // 传递给 providePlugin
        // entryPath: '', // 类似于1.0的 pages， 暂不可用
        
        entry: {},
        externals: {},
        output: {
            path: '',
            filename: '',
            publicPath: '',
            jsonpFunction: '',
        },
        devServer: {
            port: 9000, // 端口号
            inline: false,
            proxy: {}, // proxy 配置
            contentBase: '',
            overlay: true,
        }    
    }
};
```

