import React from 'react'
import Vue from 'vue'
import useReactInVue from './useReactInVue'
export class VueContainer extends React.Component {
  constructor (props) {
    super(props)
    // 捕获vue组件
    this.currentVueComponent = props.component
    this.createVueInstance = this.createVueInstance.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    const { component, ...props } = nextProps
    if (this.currentVueComponent !== component) {
      this.updateVueComponent(component)
    }
    // 更改vue组件的data
    Object.assign(this.vueInstance.$data, props)
  }

  componentWillUnmount () {
    this.vueInstance.$destroy()
  }

  // 将通过react组件的ref回调方式接收组件的dom对象，并且在class的constructor中已经绑定了上下文
  createVueInstance (targetElement) {
    const { component, ...props } = this.props

    // 过滤vue组件实例化后的$attrs
    let filterAttrs = (props) => {
      // 对mixin进行合并
      let mixinsPropsArray = []
      let mixinsPropsJson = {}
      if (component.mixins) {
        component.mixins.forEach((v) => {
          if (v.props) {
            if (v.props instanceof Array) {
              mixinsPropsArray = [...v.props]
            } else {
              mixinsPropsJson = { ...v.props }
            }
          }
        })
      }

      let attrs = Object.assign({}, props)
      if (component.props) {
        if (component.props instanceof Array) {
          let tempArr = [...component.props, ...mixinsPropsArray]
          tempArr.forEach((v) => {
            delete attrs[v]
          })
        } else {
          let tempJson = { ...component.props, ...mixinsPropsJson }
          for (let i in tempJson) {
            if (!tempJson.hasOwnProperty(i)) continue
            delete attrs[i]
          }
        }
      }
      return attrs
    }
    // 获取作用域插槽
    // 将react组件传入的$scopedSlots属性逐个转成vue组件
    let getScopedSlots = (createElement, $scopedSlots) => {
      let tempScopedSlots = Object.assign({}, $scopedSlots)
      for (let i in tempScopedSlots) {
        if (!tempScopedSlots.hasOwnProperty(i)) continue
        tempScopedSlots[i] = ((scopedSlot) => {
          return (context) => {
            return createElement(useReactInVue(() => scopedSlot(context)))
          }
        })(tempScopedSlots[i])
      }
      return tempScopedSlots
    }
    // 获取具名插槽
    // 将react组件传入的$slots属性逐个转成vue组件
    let getNamespaceSlots = (createElement, $slots) => {
      let tempSlots = Object.assign({}, $slots)
      for (let i in tempSlots) {
        if (!tempSlots.hasOwnProperty(i)) continue
        tempSlots[i] = ((slot, slotName) => {
          return createElement(useReactInVue(() => slot), { slot: slotName })
        })(tempSlots[i], i)
      }
      return Object.keys(tempSlots).map((key) => tempSlots[key])
    }
    // 将vue组件的inheritAttrs设置为false，以便组件可以顺利拿到任何类型的attrs
    // 这一步不确定是否多余，但是vue默认是true，导致属性如果是函数，又不在props中，会出警告，正常都需要在组件内部自己去设置false
    // component.inheritAttrs = false
    // 创建vue实例
    this.vueInstance = new Vue({
      el: targetElement,
      data: props,
      render (createElement) {
        // 这里很重要，将不是属性的内容过滤掉，并单独抽取
        let { component, on, $slots, $scopedSlots, ...props } = this.$data
        return createElement(
          'use_vue_wrapper',
          {
            props: props,
            on,
            // 手动把props丛attrs中去除，
            // 这一步有点繁琐，但是又必须得处理
            attrs: filterAttrs(props),
            // 作用域插槽的处理
            scopedSlots: getScopedSlots(createElement, $scopedSlots)
          },
          // children是react jsx的插槽，需要使用useReactInVue转换成vue的组件选项对象
          [createElement(useReactInVue(() => this.children)),
            // 具名插槽的处理
            ...getNamespaceSlots(createElement, $slots)
          ]
        )
      },
      components: {
        'use_vue_wrapper': component
      }
    })
  }

  updateVueComponent (nextComponent) {
    this.currentVueComponent = nextComponent

    // 使用$forceUpdate强制重新渲染vue实例，因为此方法只会重新渲染当前实例和插槽，不会重新渲染子组件，所以不会造成性能问题
    // $options.components包含了vue实例中所对应的组件序列, $option是只读,但是确实可以修改components属性,依靠此实现了动态组件替换
    this.vueInstance.$options.components.use_vue_wrapper = nextComponent
    this.vueInstance.$forceUpdate()
  }

  render () {
    return <div ref={this.createVueInstance} />
  }
}

export default function useVueInReact (component) {
  // 兼容esModule
  if (component.__esModule && component.default) {
    component = component.default
  }
  return props => <VueContainer {...props} component={component} />
}
