/* eslint-disable react/no-this-in-sfc */

import React, { Component as ReactComponent, forwardRef } from 'react'

import { getDisplayName } from '.'

export default (transformProps, keys) => (Component) => {
  const MemoizedComponent = React.memo(Component)

  class WithAsyncProp extends ReactComponent {
    state = { propOverrides: {} }

    componentDidMount = async () => this.resolveProps()

    componentDidUpdate = async (previousProps, previousState) => {
      if (this.props.name?.includes('Trinket.Amulet'))
        console.log('componentdidupdate', previousState, this.state)
      if (
        ((!keys || !keys.length) && previousProps !== this.props) ||
        keys.some((key) => previousProps[key] !== this.props[key])
      ) {
        if (this.props.name?.includes('Trinket.Amulet')) console.log('yes')
        await this.resolveProps()
      } else if (this.props.name?.includes('Trinket.Amulet')) console.log('no')
    }

    resolveProps = async () => {
      if (this.props.name?.includes('Trinket.Amulet'))
        console.log('resolving...', this.props)
      const resolvedEntries = await Promise.all(
        Object.entries(transformProps(this.props) || {})
          // .filter(([, transform]) => !!transform)
          // .map(async ([key, transform]) => {
          //   try {
          //     const value = await transform
          //     return [key, value]
          //   } catch (error) {
          //     return [key, null]
          //   }
          // }),
          .map(([key, transform]) =>
            Promise.resolve(transform)
              .then((value) => [key, value])
              .catch(() => [key, null]),
          ),
      )
      if (this.props.name?.includes('Trinket.Amulet'))
        console.log('...resolved', Object.fromEntries(resolvedEntries))
      this.setState({ propOverrides: Object.fromEntries(resolvedEntries) })
    }

    render = () => {
      if (this.props.name?.includes('Trinket.Amulet'))
        console.log('rendering hoc with:', this.props, this.state)
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
