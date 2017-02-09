# redux-submission [![Build Status](https://travis-ci.org/ajoslin/redux-submission.svg?branch=master)](https://travis-ci.org/ajoslin/redux-submission)

> Pending and error states for promises in redux.

This heavily borrows from [redux-pending](https://github.com/adriancooney/redux-pending/), with error support added.

* Expects actions to be of the format {type, payload}
* Handles pending and error state of promises and emits actions to handle pending promises.

## Install

```
$ npm install --save redux-submission
```

## Usage

Three steps.

1. Include `submissionMiddleware` into your store's middleware. This makes our library 'take over' promises.
2. Add `submissionReducer` to your reducers under the `submission` key.
3. Use `getPending` and `getError` to check if an action is pending or errored.

```js
const {applyMiddleware, createStore, combineReduces} = require('redux')
const {connect} = require('react-redux')
const {submissionMiddleware, submissionReducer} = require('redux-submission')

const finalCreateStore = applyMiddleware(submissionMiddleware)(createStore)

const reducers = combineReducers({
  // Add your `submission` reducer. The name must be `submission`.
  submission: submissionReducer,

  myApp: (state = {}, action) => {
    if (action.type === 'FETCH_ITEMS') {
      if (action.error) {
        // In this case, action.payload is the error from the promise.
      } else {
        action.payload; // this is the resolved promise's value
      }
    } else if (action.type === 'SUBMIT_FETCH_ITEMS') {
      // This is called when the FETCH_ITEMS promise begins.
    }
    return state
  }
});

const store = finalCreateStore(reducers)
```

Now, just emit the `FETCH_ITEMS` action with a promise as the payload:

```js
const React = require('react')
const {connect} = require('react-redux')
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

`reduxSubmission` exports the following variables:

#### `submissionMiddleware`

Middleware for your store that manages promises.

#### `submissionReducer`

The reducer that you *must* put under the key `submission`.

#### `getError(actionType, state)` -> `error|null`

Returns an error if the last promise dispatched for this actionType was rejected.

If `state` is not given, it will return a partially applied function.

#### `getPending(actionType, state)` -> `Boolean`

Returns true if there is a currenly pending promise dispatched for this action type.

If `state` is not given, it will return a partially applied function.

#### `submissionPrefix(actionType)` -> `String`

Given an `actionType`, returns the `actionType` with the `SUBMIT_` prefix.

## License

MIT © [Andrew Joslin](http://ajoslin.com)
