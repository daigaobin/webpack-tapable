//异步串行执行的结果传到下一个函数中
class AsyncWaterfallHook {
    constructor(args) {
        this.args = args;
        this.tasks = [];
    }

    tapAsync(name, task) {
        this.tasks.push(task);
    }

    callAsync(...args) {
        // 先取出最后传入的回调函数
        const finalCallback = args.pop();

        // 传入参数严格对应创建实例传入数组中的规定的参数，执行时多余的参数为 undefined
        args = args.slice(0, this.args.length);

        // 定义一个 i 变量和 next 函数，每次取出一个事件处理函数执行，并维护 i 的值
        // 直到所有事件处理函数都执行完，调用 callAsync 的回调
        // 如果事件处理函数中没有调用 next，则无法继续
        let i = 0;
        const next = (error, data) => {
            const task = this.tasks[i];
            task ? i === 0 ? task(...args, next) : task(data, next) : finalCallback();
            i++;
        };
        next();
    }

    tapPromise(name, task) {
        this.tasks.push(task);
    }

    promise(...args) {
        // 传入参数严格对应创建实例传入数组中的规定的参数，执行时多余的参数为 undefined
        args = args.slice(0, this.args.length);

        // 将每个事件处理函数执行并调用返回 Promise 实例的 then 方法
        // 让下一个事件处理函数在 then 方法成功的回调中执行
        const [first, ...others] = this.tasks;
        return others.reduce((promise, task) => {
            return promise.then((rep) => task(rep));
        }, first(...args));
    }
}

// 创建实例
const asyncWaterfallHook = new AsyncWaterfallHook(['name', 'age']);
console.time('time');
/* // 注册事件
asyncWaterfallHook.tapAsync('1', (name, age, next) => {
    setTimeout(() => {
        console.log('1', name, age, new Date());
        next(null, '结果');
    }, 1000);
});

asyncWaterfallHook.tapAsync('2', (data, next) => {
    setTimeout(() => {
        console.log('2', data, new Date());
        next(null, data);
    }, 2000);
});

asyncWaterfallHook.tapAsync('3', (data, next) => {
    setTimeout(() => {
        console.log('3', data, new Date());
        next(null, data);
    }, 3000);
});

// 触发事件，让监听函数执行
asyncWaterfallHook.callAsync('panda', 18, () => {
    console.log('complete');
}); */

asyncWaterfallHook.tapPromise('1', (name, age) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('1', name, age, new Date());
            resolve('1');
        }, 1000);
    });
});

asyncWaterfallHook.tapPromise('2', (data) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('2', data, new Date());
            resolve(data);
        }, 2000);
    });
});

asyncWaterfallHook.tapPromise('3', (data) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('3', data, new Date());
            resolve(data);
            console.timeEnd('time');
        }, 3000);
    });
});

// 触发事件，让监听函数执行
asyncWaterfallHook.promise('panda', 18).then(ret => {
    console.log(ret);
});
