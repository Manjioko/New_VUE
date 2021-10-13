
// 这是在export一个构造函数，构造函数的作用在于new实例
// 用于继承构造函数内的this.xxx数据
export default function VNode(target,data,children, componentOptions, componentInstance) {
    this.target = target
    this.data = data
    this.children = children
    this.componentOptions = componentOptions
    this.componentInstance = componentInstance
}


// export 一个普通函数，用于返回一个VNode的实例
export function createTextVNode(value) {
    return new VNode(undefined,undefined,value)
}