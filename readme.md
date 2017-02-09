# redux-submission [![Build Status](https://travis-ci.org/ajoslin/redux-submission.svg?branch=master)](https://travis-ci.org/ajoslin/redux-submission)

> Pending and error states for promises in redux.

This is *heavily* based upon [redux-pending](https://github.com/adriancooney/redux-pending/), with error support added.

* Expects actions to be of the format {type, payload}
* Handles pending and error state of promises and emits actions to handle pending promises.

## Install

```
$ npm install --save redux-submission
```

## Usage

Three steps.

1. Include `reduxSubmission.middleware` into your store's middleware. This makes our library 'take over' promises.
2. Add `reduxSubmission.reducer` to your reducers under the `submission` key.
3. Use `getPending` and `getError` to check if an action is pending or errored.

```js
const {applyMiddleware, createStore, combineReduces} = require('redux')
const {connect} = require('react-redux')
const reduxSubmission = require('redux-submission')

const reducers = combineReducers({
  // Add your `submission` reducer. The name must be `submission`.
  submission: reduxSubmission.reducer,

  myApp: (state = {}, action) => {
    if (action.type === 'FETCH_ITEMS') {
      if (action.error) {
        // In this case, action.payload is the error from the promise.
      } else {
        action.payload; // this is the resolved promise's value
      }
    }
    return state
  }
});

const store = finalCreateStore(reducers)
```

Now, just emit the `FETCH_ITEMS` action with a promise as the payload:

```js
const React = require('react')
const {conenct} = require('react-redux')
const {getPending, getError} = require('redux-submission')

const MyComponent = React.createClass({
  render () {
    if (this.props.error) return <div>Error! {this.props.error}</div>
    if (this.props.pending) return <div>Loading...</div>

    return <button onClick={this.fetchItems}>Fetch Items</button>
  }
  fetchItems () {
    this.props.dispatch({
      type: 'FETCH_ITEMS',
      payload: new Promise() // realistically, you would fetch something from the server...
    })
  }
})

module.exports = connect((state) => {
  return {
    pending: getPending('FETCH_ITEMS', state),
    error: getError('FETCH_ITEMS', state)
  }
})(MyComponent)
```

## API

#### `reduxSubmission.middleware`

Middleware for your store that manages promises.

#### `reduxSubmission.reducer`

The reducer that you *must* put under the key `submission`.

#### `reduxSubmission.getError(actionType, state)` -> `error|null`

Returns an error if the last promise dispatched for this actionType was rejected.

If `state` is not given, it will return a partially applied function.

#### `reduxSubmission.getPending(actionType, state)` -> `Boolean`

Returns true if there is a currenly pending promise dispatched for this action type.

If `state` is not given, it will return a partially applied function.

## License

MIT © [Andrew Joslin](http://ajoslin.com)
