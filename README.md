# Vue和React快捷集成的工具包，并且适合复杂的集成场景 
#### 【暂不开源】 。。。等公司同意吧 
可以通过QQ联系我 QQ：9700616  
可以在任何的Vue和React项目中使用另一个类型框架的组件，并且解决了复杂的集成问题
+ 在React组件中使用Vue组件
    + 并解决传入的属性在Vue组件中$props与$attrs的处理关系  
    + 支持v-model和自定义v-model（使用$model，详见useVueInReact说明）
+ 在Vue组件中使用React组件
+ Vue和React的具名插槽转换  
+ Vue和React的作用域插槽转化  
+ 共享Vuex  
+ 共享Redux  
+ 在React路由中懒加载Vue组件  
+ 在Vue路由中懒加载React组件  

## Why?  
#### 大一统，前端再也不分家，让vue和react的同学们一起来完成同一个项目同一个页面甚至同一个组件
很幸运，集团公司在前端是不定死技术栈的，所以就造成了vue与react共存的情况，我的团队主要擅长vue技术栈，曾经被挑战的问道如何才能和其他react技术栈的开发人员沟通交流，关于这个问题我觉得研发人员从来就不会被技术栈所限制住，所以为了促进我们团队对react的熟悉以及可以直接在现有的vue项目中自由的使用第三方的react组件或者自定义组件，我调研了国外的一些方案，取长补短做到了以最细粒度的将两者集成在一起。并且实现了一些比较复杂的场景的集成。  
PS：这个工具包也是作为参加集团编程大赛的一个作品

#### 遇到的困难  
众所周知，React更纯粹，Vue做的封装更多，所以大多数的难度都是集中在react的组件引用vue组件的过程中（useVueInReact），比如具名插槽、作用域插槽、v-model、#attrs与$props的关系等，当然还有无数的功能需要完善，所以我只要还活着就会一直更新下去💪  

## 支持程度  
#### 在react组件中引入vue组件  
功能 | 支持程度 |  说明  
-|-|-  
属性 | 完全支持 |  |  
合成事件 | 完全支持 | 通过on属性 |  
原生事件 | 不支持 | react没有这种感念，可以自己包囊div |  

## 使用前提  
项目中要同时安装react和vue的相关环境
#### 如果是通过vue-cli3创建的项目
请参考 https://github.com/devilwjp/vuereact-for-vuecli3-demo  
 
#### 如果通过react-create-app创建的项目（react版本需要>=16.3）  
请参考 https://github.com/devilwjp/vuereact-for-cra-demo
  
## useVueInReact  
在react组件中使用vue的组件
````jsx harmony   
import React from 'react'
import VueComponent from '../views/test2.vue' // vue组件
import { useVueInReact } from 'vuereact-combined'
let VueComponentInReact = useVueInReact(VueComponent)
class demo1 extends React.Component{
  render(){
    return (
      <div>
        <VueComponentInReact prop1={'hello world'} prop2={'你好'}>
          <hr/>
          <h1>我是普通的插槽</h1>
        </VueComponentInReact>
      </div>
    )
  }
}
export default demo1

````  

在react组件中，向vue组件传递具名插槽和作用域插槽，以及绑定自定义事件，以及v-model应用  
react本身并不支持v-model，所以需要通过$model的方式转换成vue组件能接收的v-model，即便vue组件自定义了model属性和事件，$model的value和setter也不需要变化  
````jsx harmony  
import React from 'react'
import VueComponent from '../views/test2' // vue组件
import { useVueInReact } from 'vuereact-combined'
let VueComponentInReact = useVueInReact(VueComponent)
class demo1 extends React.Component{
  constructor (props) {
    super(props)
    this.event1 = this.event1.bind(this)
    this.state = {
      aaa: 1111
    }
  }
  event1 (...args) {
    console.log(args)
  }
  render(){
    return (
      <div>
        <VueComponentInReact prop1={'hello world'} prop2={'你好'} on={{
          event1: this.event1
        }} $slots={{
          slotA: <div>插槽A</div>,
          slotB: <div>插槽B</div>
        }} $scopedSlots={{
          slotC: (context) => <div>我是作用域插槽：{context.value}</div>
        }} $model={{
           value: this.state.aaa, // value必须是一个state
           setter: (value) => { this.setState({ aaa: value }) } // setter必须是直接修改state
         }}/>
          <hr/>
          <h1>我是普通的插槽</h1>
        </VueComponentInReact>
      </div>
    )
  }
}
export default demo1
````  
#### test2.vue
````html  
<template>
  <div>
    <h2>我是Vue组件</h2>
    <div>属性1 {{prop1}}</div>
    <div>属性2 {{prop2}}</div>
    <slot name="slotA"></slot>
    <slot></slot>
    <slot name="slotB"></slot>
    <slot name="slotC" :value="name"></slot>
  </div>
</template>

<script>
export default {
  name: 'demo1',
  data () {
    return {
      name: '本地作用域'
    }
  },
  props: ['prop1', 'prop2'],
  mounted () {
    this.$emit('event1', '11', '22')
  }
}
</script>
````  

## VueContainer  
在react组件动态引用vue组件，类似vue的<component \/>  
````jsx harmony  
import React from 'react'
import VueComponent from '../views/test2' // vue组件
import { VueContainer } from 'vuereact-combined'
class demo1 extends React.Component{
  constructor (props) {
    super(props)
    this.event1 = this.event1.bind(this)
  }
  event1 (...args) {
    console.log(args)
  }
  render(){
    return (
      <div>
        <VueContainer component={VueComponent} prop1={'hello world'} prop2={'你好'} on={{
          event1: this.event1
        }} $slots={{
          slotA: <div>插槽A</div>,
          slotB: <div>插槽B</div>
        }} $scopedSlots={{
          slotC: (context) => <div>我是作用域插槽：{context.value}</div>
        }}>
          <hr/>
          <h1>我是普通的插槽</h1>
        </VueContainer>
      </div>
    )
  }
}
export default demo1
````  
#### 在react中使用vue的全局注册组件  
与react不同，vue有全局注册组件的功能，使每个组件不需要再单独引入  
将vue全局组件的id作为参数传入useVueInReact中，或者将id作为component属性的值传入VueContainer中  
示例：在react中使用全局的vue版本element-ui的DatePicker
```jsx harmony  
const ElDatePickerInReact = useVueInReact('ElDatePicker') // 将el-date-picker转换成ElDatePicker就是id
// 或者
<VueContainer component={'ElDatePicker'}/>
```  

## useReactInVue  
在Vue的组件中使用React组件
````html  
<template>
  <ReactCom :prop1="prop1Value" prop2="222">我是普通插槽</ReactCom>
</template>

<script>
import { useReactInVue } from 'vuereact-combined'
import ReactComponents1 from '../reactComponents/cc.jsx' // React组件
export default {
  name: 'demo2',
  data () {
    return {
      prop1Value: 111
    }
  },
  components: {
    ReactCom: useReactInVue(ReactComponents1)
  }
}
</script>
````  
在Vue组件中，向React组件传递具名插槽和作用域插槽，以及绑定自定义事件  
由于React没有插槽的概念，所有都是以属性存在，Vue的具名插槽和作用域插槽会被转化为React的属性，其中作用域插槽会转换成render props的方式
并且Vue组件的事件也会被转化成React的属性
````html  
<template>
  <ReactCom :prop1="prop1Value" prop2="222" @event1="callEvent1">
    我是普通插槽
    <template v-slot:slotA>
      我是插槽A
    </template>
    <template v-slot:slotB>
      我是插槽B
    </template>
    <template v-slot:slotC="context">
      我是作用域插槽：{{context.value}}
    </template>
  </ReactCom>
</template>

<script>
import { useReactInVue } from 'vuereact-combined'
import ReactComponents1 from '../reactComponents/cc.jsx' // React组件
export default {
  name: 'demo2',
  data () {
    return {
      prop1Value: 111
    }
  },
  methods: {
    callEvent1 (...args) {
      console.log(args)
    }
  },
  components: {
    ReactCom: useReactInVue(ReactComponents1)
  }
}
</script>

````  
#### cc.jsx
````jsx harmony
import React from 'react'
class cc extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      slotValue: {
        value: '本地作用域'
      }
    }
  }
  componentDidMount () {
    this.props.event1(11,22)
  }
  render () {
    return (
      <div>
        <div>我是React组件</div>
        <div>属性1：{this.props.prop1}</div>
        <div>属性2：{this.props.prop2}</div>
        {this.props.slotA}
        {this.props.children}
        {this.props.slotB}
        {this.props.slotC(this.state.slotValue)}
      </div>
    )
  }
}
export default cc  
````  
#### useReactInVue的复杂案例
比如react版本的antd的Card组件，在react中的使用示例如下  
```jsx harmony  
<Card title="Default size card" extra={<a href="#">More</a>}>
  <p>Card content</p>
  <p>Card content</p>
  <p>Card content</p>
</Card>
```  
react版本的antd，在vue组件中使用的示例如下
````html
<CardInVue class="react-com" title="Default size card">
    <!--react antd的extra属性是传递html片段的，在vue中就使用具名插槽-->
    <template v-slot:extra>
        <a href="#">More</a>
    </template>
    <p>Card content</p>
    <p>Card content</p>
    <p>Card content</p>
</CardInVue>
````  

## useRedux  
作用：使得所有的Vue组件可以使用redux的状态管理
对工具包开启redux状态管理，这个场景一般存在于以React为主的项目中，为了使Vue组件也可以共享到redux，需要在项目的入口文件引入useRedux方法（整个项目应该只引一次），将redux的store以及redux的context作为参数传入（或者至少在redux的Provider高阶组件引入的地方使用useRedux方法）  
````js  
// 第二个参数是redux的context，之所以需要传第二个参数，是因为有如下场景
// Provider -> ReactCom1 -> VueCom1 -> ReactCom2
// Provider无法直接透过Vue组件传递给之后的React组件，所以useRedux提供了第二个参数，作用就是可以使通过Vue组件之后的React组件继续可以获取到redux的context
import { ReactReduxContext } from 'react-redux'
import store from '../reactComponents/reduxStore'
useRedux({ store, ReactReduxContext })
````  
#### store.js  
````js  
// 原生的redux store的创建方式
import { createStore } from 'redux'
import someCombineReducer from './reducer' // 建议通过react-redux的combineReducer输出
let store = createStore(someCombineReducer)
export default store
````  
React组件连接redux的方式这里就不再做介绍了，应该使用react-redux的connect方法  
这里介绍Vue组件如何使用redux，工具包尽可能的实现了vue组件使用vuex的方式去使用redux，通过vm.$redux可以在组件实例里获取到redux状态管理
````html  
<template>
  <div>
    redux状态testState1: {{$redux.state.testState1}}
  </div>
</template>

<script>
export default {
  name: 'demo3',
  mounted () {
    // 打印redux的testState2状态值
    console.log(this.$redux.state.testState2)
    // 五秒后将testState1修改成8888
    // 需要在reducer里存在一个action的type为test1可以修改testState1
    // 这里需要按照标准的redux的action标准（必须有type）触发dispatch
    setTimeout(() => {
      this.$redux.dispatch({
        type: 'test1',
        value: 8888
      })
    }, 5000)
  }
}
</script>
````  

## useVuex  
作用：使得所有的Redux组件可以使用Vuex的状态管理  
对工具包开启vuex状态管理，这个场景一般存在于以Vue为主的项目中，为了使React组件也可以共享到vuex，需要在项目的入口文件引入useVuex方法（整个项目应该只引一次），将vuex的store作为参数传入  
````js  
import store from '../store' // vuex的store文件
useVuex(store)
````  

## connectVuex
类似react-redux的connect方法，在React组件中使用，由于vuex的关键字比redux多，所以将参数改成了对象，包含了mapStateToProps、mapCommitToProps、mapGettersToProps、mapDispatchToProps，每个都是一个纯函数，返回一个对象（和redux的connect使用方式完全一致）  
````js  
export default connectVuex({
  mapStateToProps (state) {
    return {
      vuexState: state,
      state1: state.state1,
      moduleAstate: state.moduleA
    }
  },
  mapCommitToProps (commit) {
    return {
      vuexCommit: commit
    }
  },
  // mapGettersToProps = (getters) => {},
  // mapDispatchToProps = (dispatch) => {},
})(ReactComponent)
````  

## lazyVueInReact  
在React的router里懒加载Vue组件  
````jsx harmony  
import React, { lazy, Suspense } from "react"
import { lazyVueInReact } from 'vuereact-combined'
const Hello = lazy(() => import("./react_app/hello"));
//懒加载vue组件
const TestVue = lazyVueInReact(() => import("./vue_app/test.vue"))


export default [
{
    path: "/reactHello",
    component: () => {
        return (
            <Suspense fallback={<div>Loading...</div>}>
                <Hello />
            </Suspense>
        );
    }
},
{
    path: "/vuetest1",
    component: () => {
        return (
            <Suspense fallback={<div>Loading...</div>}>
                <div>
                    <h1>我是一个vue组件</h1>
                    <TestVue />
                </div>
            </Suspense>
        );
    }
}]
````  

## lazyReactInVue  
在Vue的router里懒加载React组件  
````js
import Vue from 'vue'
import VueRouter from 'vue-router'
import { lazyReactInVue } from 'vuereact-combined'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home')
  },
  {
    path: '/reactInVueDemo',
    name: 'reactInVueDemo',
    component: lazyReactInVue(() => import('../reactComponents/cc.jsx'))
  }
]

const router = new VueRouter({
  routes
})

export default router
````  

## 需要注意的包囊性问题  
由于在每一次跨越一个框架进行组件引用时，都会出现一层包囊，这个包囊是以div呈现，并且会被特殊属性标注  
React->Vue，会在vue组件的dom元素外包囊一层标识data-use-vue-component-wrap的div  
Vue->React，会在react组件的dom元素外包囊一层标识__use_react_component_wrap的div  
如果引发样式问题，可以全局对这些标识进行样式修正  
