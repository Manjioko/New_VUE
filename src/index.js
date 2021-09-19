import VNode from "./vnode"

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
        Reflect.get(this.dataNotifyChain, key) ?? Reflect.set(this.dataNotifyChain, key, [])
        // 将构造函数 cb 推入 dataNotifyChain[key] 中,dataNotifyChain[key]值是个Array.
        this.dataNotifyChain[key].push(cb)

    }

    // 挂载函数实现
    $mount(root) {
        // 默认$potions内存在一个render函数，接受一个参数
        const vnode = this.$options?.render?.(this.createElement) ?? this.createElement(undefined,undefined,undefined)

        // 为类Vue创建一个$el变量
        this.$el = this.createElm(vnode)

        if (root) {
            // 由此可以推断出，root是document 或其子类 如 div, p, span等
            root.appendChild(this.$el)
        }
        // console.log(root)

        // 返回 proxy 本身
        return this

    }

    createElement(target, data, children) {
        // 这个函数仅返回VNode 的一个实例
        return new VNode(target, data, children)
    }

    // 这个函数只接受一个VNode实例
    createElm(vnode) {
        // 由此可以推断出this.$options.render返回的是一个对象
        const el = document.createElement(vnode.target)
        // console.log(el)

        // vnode.data是一个数组
        for (let key in vnode.data) {
            // 为el设置属性
            el.setAttribute(key, vnode.data[key])
        }

        // 构建DOM树
        if (typeof vnode.children === 'string') {
            // 如果vnode.children是字符串，就给el插入当字符串内容
            el.textContent = vnode.children
        } else {
            // 如果是数组，就遍历它
            vnode.children?.forEach(child => {
                // 开始套娃递归
                if (child === 'string') {
                    el.textContent = child
                } else {
                    // 插入el中当子DOM
                    el.appendChild(this.createElm(child))
                }
            })
        }

        return el
    }

    // 代理入口
    initDataProxy() {
        // 默认option对象中有一个data()属性
        const data = this.$options?.data?.() ?? {}
        // console.log("proxy this is : " + this)
        return new Proxy(this, {
            set: (_, key, value) => {

                if (Reflect.has(data, key)) {
                    const pre = Reflect.get(data, key)
                    // data[key] = value
                    Reflect.set(data, key, value)
                    // 唤醒观察者
                    this.notifyDataChange(key, pre, value)
                } else {
                    Reflect.set(data, key, value)
                }

                return true
            },
            get: (_, key) => {
                // return data[key]
                return Reflect.get(data, key) ?? Reflect.get(this, key)
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
        Reflect.get(this.dataNotifyChain, key)?.forEach(cb => cb(pre, val))
    }
}

export default Vue