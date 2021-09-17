class Vue {
    constructor(options) {
        this.$options = options
        const proxy = this.initDataProxy()
        this.initWatch()
        return proxy
    }

    // 观察者定义入口
    $watch(key, cb) {
        // cb 就是 callback function
        // 如果key 不是 dataNotifyChain 的属性,就将key 设置为dataNotifyChain的新属性,并将 [] 赋值给它
        Reflect.get(this.dataNotifyChain,key) ?? Reflect.set(this.dataNotifyChain,key,[])
        // 将构造函数 cb 推入 dataNotifyChain[key] 中,dataNotifyChain[key]值是个Array.
        this.dataNotifyChain[key].push(cb)
        
    }

    // 代理入口
    initDataProxy() {
        // 默认option对象中有一个data()属性
        const data = this.$options?.data() ?? {}
        // console.log("proxy this is : " + this)
        return new Proxy(this, {
            set: (_, key, value) => {
                const pre = Reflect.get(data,key)
                // 唤醒观察者
                this.notifyDataChange(key,pre,value)
                // data[key] = value
                Reflect.set(data,key,value)
                return true
            },
            get: (_,key) => {
                // return data[key]
                return Reflect.get(this,key) ?? Reflect.get(data,key)
            }
        })
    }

    initWatch() {
        // 相当于在 contructor 内定义 this.dataNotifyChain = {}
        this.dataNotifyChain = {}
    }

    // 观察者执行函数
    notifyDataChange(key, pre, val) {
        // Reflect.get(this.dataNotifyChain,key) 返回一个数组
        Reflect.get(this.dataNotifyChain,key)?.forEach(cb => cb(pre,val))
    }
}

export default Vue