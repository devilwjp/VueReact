import React from 'react'
let vuexStore
export function connectVuex ({ mapStateToProps = (state) => {}, mapGettersToProps = (getters) => {}, mapCommitToProps = (commit) => {}, mapDispatchToProps = (dispatch) => {} }) {
  return function (Component) {
    return class extends React.Component {
      constructor (props) {
        super(props)
        this.state = vuexStore.state
      }
      componentDidMount () {
        // 订阅
        this.subscribe = vuexStore.subscribe((mutation, state) => {
          this.setState(state)
        })
      }
      componentWillUnmount () {
        // 停止订阅
        this.subscribe()
      }
      render () {
        return (
          <Component {...this.props} {...{ ...mapStateToProps(this.state), ...mapGettersToProps(vuexStore.getters), ...mapCommitToProps(vuexStore.commit), ...mapDispatchToProps(vuexStore.dispatch) }} />
        )
      }
    }
  }
}

export default function useVuex (store) {
  vuexStore = store
}
