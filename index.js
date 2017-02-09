'use strict'

var extend = require('xtend')
var PREFIX = 'SUBMIT_'

function isPromise (value) {
  return value && typeof value.then === 'function'
}

exports.reducer = function submissionReducer (state, action) {
  state = state || {}
  var nextState = extend(state)

  if (action.type.indexOf(PREFIX) === 0) {
    var typeWithoutPrefix = action.type.replace(PREFIX, '')
    nextState[typeWithoutPrefix] = {
      pending: true,
      error: null
    }
  } else if (action.type in state) {
    nextState[action.type] = {
      pending: false,
      error: action.error
        ? action.payload
        : null
    }
  }
  return nextState
}

exports.middleware = function promiseMiddleware (options) {
  var dispatch = options.dispatch
  return function (next) {
    return function (action) {
      var isValidAction = action && typeof action.type === 'string' && isPromise(action.payload)
      if (!isValidAction) {
        return next(action)
      }

      dispatch({type: PREFIX + action.type})

      action.payload.then(
        function (value) {
          dispatch({type: action.type, payload: value})
        },
        function (error) {
          dispatch({type: action.type, error: true, payload: error})
        })
    }
  }
}

exports.getPending = submissionCheck('pending', Boolean)
exports.getError = submissionCheck('error', function (value) {
  return value || null
})

function submissionCheck (property, mapValue) {
  return function check (actionType, state) {
    if (arguments.length < 2) return check.bind(null, actionType)

    if (!state.submission) throw new Error('Expose reduxSubmission.reducer at `state.submission`!')

    var submissionState = state.submission[actionType] || {}
    return mapValue(submissionState[property])
  }
}
