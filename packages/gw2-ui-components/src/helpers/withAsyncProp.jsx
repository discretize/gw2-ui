/* eslint-disable react/no-this-in-sfc */

import React, { Component as ReactComponent, forwardRef } from 'react'
import { equal } from 'fast-deep-equal/react'

import { getDisplayName } from '.'

export default (transformProps, keys) => (Component) => {
  const MemoizedComponent = React.memo(Component)

  class WithAsyncProp extends ReactComponent {
    state = { propOverrides: {} }

    componentDidMount = async () => this.resolveProps()

    componentDidUpdate = async (previousProps) => {
      if (
        ((!keys || !keys.length) && previousProps !== this.props) ||
        keys.some((key) => previousProps[key] !== this.props[key])
      ) {
        await this.resolveProps()
      }
    }

    shouldComponentUpdate = (nextProps, nextState) => {
      return !equal(nextState, this.state) || !equal(nextProps, this.props)
    }

    resolveProps = async () => {
      const resolvedEntries = await Promise.all(
        Object.entries(transformProps(this.props) || {}).map(
          ([key, transform]) =>
            Promise.resolve(transform)
              .then((value) => [key, value])
              .catch(() => [key, null]),
        ),
      ).filter(([, value]) => value)

      this.setState({ propOverrides: Object.fromEntries(resolvedEntries) })
    }

    render = () => {
      const { forwardedRef, ...rest } = this.props
      return (
        <MemoizedComponent
          ref={forwardedRef}
          {...rest}
          {...this.state.propOverrides}
        />
      )
    }
  }

  const forwardRefFn = (props, ref) => (
    <WithAsyncProp {...props} forwardedRef={ref} />
  )

  forwardRefFn.displayName = `WithAsyncProp(${getDisplayName(Component)})`

  return forwardRef(forwardRefFn)
}
