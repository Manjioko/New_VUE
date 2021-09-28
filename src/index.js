import VNode from "./vnode"

class Vue {
    constructor(options) {
        this.$options = options
        // this.$mount = this.$mount.bind(this)
        this.proxy = this.initDataProxy()
        this.initWatch()
        return this.proxy
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
        // const vnode = this.$options?.render?.(this.createElement) ?? this.createElement(undefined,undefined,undefined)
        const { mounted, render } = this.$options
        const vnode = render?.call(this.proxy, this.createElement) ?? this.createElement(undefined,undefined,undefined)


        // 为类Vue创建一个$el变量
        this.$el = this.createElm(vnode)

        if (root) {
            // 由此可以推断出，root是document 或其子类 如 div, p, span等
            root.appendChild(this.$el)
        }
        mounted?.call(this.proxy)

        // 返回 proxy 本身
        return this

    }

    update() {
        // 删除旧有的DOM
        const parent = this.$el.parentNode
        parent?.removeChild(this.$el)
        // 重新构建DOM树
        const vnode = this.$options?.render?.call(this.proxy, this.createElement) ?? this.createElement(undefined,undefined,undefined)
        this.$el = this.patch(null, vnode)
        // 添加新DOM树
        parent?.appendChild(this.$el)
    }

    patch(oldVnode, newVnode) {
        return this.createElm(newVnode)
    }

    createElement(target, data, children) {
        // 这个函数仅返回VNode 的一个实例
        return new VNode(target, data, children)
    }

    // 这个函数只接受一个VNode实例
    createElm(vnode) {
        // 由此可以推断出this.$options.render返回的是一个对象实例
        const el = document.createElement(vnode.target)

        // vnode.data是一个数组
        for (let key in vnode.data) {
            // 为el设置属性
            el.setAttribute(key, vnode.data[key])
        }

        const events = vnode?.data?.on ?? {}
        for(let key in events) {
            el.addEventListener(key, events[key])
        }

        // 构建DOM树
        if (!Array.isArray(vnode.child)) {
            // 如果vnode.children是字符串，就给el插入当字符串内容
            el.textContent = vnode.children + ''
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
        
        const createDataProxyHandler = path => { 
            return {
                set: (object, key, value) => {
                    const fullPath = path ? path + '.' + key : key
                    
                    const pre = Reflect.get(object,key)
                    Reflect.set(object,key,value)
                    this.notifyDataChange(fullPath,pre,value)
                    
                    return true
                },

                get: (object, key) => {
                    const fullPath = path ? path + '.' + key : key
                    // console.log(fullPath)
                    this.collect(fullPath)
                    if(typeof Reflect.get(object,key) === 'object' && Reflect.get(object,key) !== null) {
                        return new Proxy(Reflect.get(object,key), createDataProxyHandler(fullPath))
                    } else {
                        return Reflect.get(object,key)
                    }
                },


            }
        }

        const handler = {
            set: (_, key, value) => {
                if(Reflect.has(data, key)) {
                    return createDataProxyHandler().set(data,key,value)
                } else {
                    Reflect.set(this, key, value)
                }

                return true
            },

            get: (_, key, value) => {
                const methods = this.$options?.methods ?? {}

                if(Reflect.has(data,key)) {
                    return createDataProxyHandler().get(data,key)
                }

                return Reflect.get(methods, key)?.bind(this.proxy) ?? Reflect.get(this, key)
            }
        }
        // return new Proxy(this, {
        //     set: (_, key, value) => {

        //         if (Reflect.has(data, key)) {
        //             const pre = Reflect.get(data, key)
        //             // data[key] = value
        //             Reflect.set(data, key, value)
        //             // 唤醒观察者
        //             this.notifyDataChange(key, pre, value)
        //         } else {
        //             Reflect.set(this, key, value)
        //         }

        //         return true
        //     },
        //     get: (_, key) => {
        //         const methods = this.$options?.methods ?? {}
        //         // return data[key]
        //         if(Reflect.has(data,key)) {
        //             Reflect.get(this.dataNotifyChain,key) ?? this.$watch(key, this.update.bind(this))
        //             return Reflect.get(data, key)
        //         } 
        //         return Reflect.get(methods, key)?.bind(this.proxy) ?? Reflect.get(this, key)
        //     }
        // })

        return new Proxy(this,handler)
    }

    collect(key) {
        // console.log("collect 'this' is :")
        // console.log(this)
        this.collected = this.collected ?? {}
        if(!this.collected[key]) {
            this.$watch(key,this.update.bind(this))
            this.collected[key] = true
        }
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