import React from 'react'
import ReactDOM from 'react-dom'
import useVueInReact from './useVueInReact'

const createReactContainer = (Component, useReactOptions) => {
  return class useReact extends React.Component {
    // 用于reactDevTools调试用
    static displayName = `useReact_${Component.displayName || Component.name || 'Component'}`

    constructor (props) {
      super(props)

      // 将所有的属性全部寄存在中间件的状态中，原理是通过一个有状态的React组件作为中间件，触发目标组件的props
      this.state = { ...props }
    }

    // 对于插槽的处理仍然需要将VNode转换成React组件
    createSlot (children) {
      return {
        render: createElement => createElement(useReactOptions.slotWrap, { attrs: { __use_react_slot_wrap: '', ...useReactOptions.slotWrapAttrs } }, children)
      }
    }

    render () {
      const {
        children,
        // Vue附加的事件处理程序
        '': _invoker,
        ...rest
      } = this.state

      // 插槽的解析
      for (let i in rest){
        if (!rest.hasOwnProperty(i)) continue
        if (rest[i].__slot){
          // 执行useVueInReact方法将直接获得react组件对象，无需使用jsx
          rest[i] = useVueInReact(this.createSlot(rest[i]))()
        } else if (rest[i].__scopedSlot) {
          // 作用域插槽是个纯函数，在react组件中需要传入作用域调用，然后再创建vue的插槽组件
          rest[i] = rest[i](this.createSlot)
        }
      }
      const wrappedChildren = this.createSlot(children)
      return (
        <Component {...rest}>
          {children && useVueInReact(wrappedChildren)()}
        </Component>
      )
    }
  }
}
export default function useReactInVue (component, useReactOptions = {}) {
  // 兼容esModule
  if (component.__esModule && component.default) {
    component = component.default
  }
  // 处理附加参数
  useReactOptions = {
    componentWrap: 'div',
    componentWrapAttrs: {},
    slotWrap: 'div',
    slotWrapAttrs: {},
    ...useReactOptions
  }
  return {
    props: ['passedProps'],
    render (createElement) {
      return createElement(useReactOptions.componentWrap, { ref: 'react', attrs: { __use_react_component_wrap: '', ...useReactOptions.componentWrapAttrs } })
    },
    methods: {
      mountReactComponent (component) {
        const Component = createReactContainer(component, useReactOptions)
        const children = this.$slots.default !== undefined ? { children: this.$slots.default } : {}
        // 处理具名插槽，将作为属性被传递
        let normalSlots = {}
        // 对插槽类型的属性做标记
        for (let i in this.$slots) {
          // 去除默认插槽
          if (i === 'default') continue
          normalSlots[i] = this.$slots[i]
          normalSlots[i].__slot = true
        }
        // 对作用域插槽进行处理
        let scopedSlots = {}
        // 用多阶函数解决作用域插槽的传递问题
        function getScopeSlot (slotFunction) {
          function scopedSlotFunction (createReactSlot) {
            return function (context) {
              return useVueInReact(createReactSlot(slotFunction(context)))()
            }
          }
          scopedSlotFunction.__scopedSlot = true
          return scopedSlotFunction
        }
        for (let i in this.$scopedSlots) {
          // 去除默认插槽
          if (i === 'default' && this.$slots.default) continue
          // 过滤普通插槽
          if (normalSlots[i]) continue
          scopedSlots[i] = getScopeSlot(this.$scopedSlots[i])
        }
        let reactRootComponent = <Component
          {...this.$props.passedProps}
          {...this.$attrs}
          {...this.$listeners}
          {...children}
          {...normalSlots}
          {...scopedSlots}
          ref={ref => (this.reactComponentRef = ref)}
        />
        // 必须通过ReactReduxContext连接context
        if (this.$redux && this.$redux.store && this.$redux.ReactReduxContext) {
          let ReduxContext = this.$redux.ReactReduxContext
          reactRootComponent = <ReduxContext.Provider value={{ store: this.$redux.store }}>{reactRootComponent}</ReduxContext.Provider>
        }
        ReactDOM.render(
          reactRootComponent,
          this.$refs.react
        )
      }
    },
    mounted () {
      this.mountReactComponent(component, this.$refs.react)
    },
    beforeDestroy () {
      ReactDOM.unmountComponentAtNode(this.$refs.react)
    },
    updated () {
      // 强制更新插槽
      if (this.$slots.default !== undefined) {
        this.reactComponentRef.setState({ children: this.$slots.default })
      } else {
        this.reactComponentRef.setState({ children: null })
      }
    },
    inheritAttrs: false,
    watch: {
      $attrs: {
        handler () {
          this.reactComponentRef.setState({ ...this.$attrs })
        },
        deep: true
      },
      '$props.component': {
        handler (newValue) {
          this.mountReactComponent(newValue)
        }
      },
      $listeners: {
        handler () {
          this.reactComponentRef.setState({ ...this.$listeners })
        },
        deep: true
      },
      '$props.passedProps': {
        handler () {
          this.reactComponentRef.setState({ ...this.$props.passedProps })
        },
        deep: true
      }
    }
  }
}
