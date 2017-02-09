'use strict'

var test = require('tape')
var sinon = require('sinon')
var reduxSubmission = require('./')

test('reducer', function (t) {
  var state = {}
  state = reduxSubmission.reducer(state, {type: 'FOO'})
  t.deepEqual(state, {})

  state = reduxSubmission.reducer(state, {type: 'SUBMIT_FOO'})
  t.deepEqual(state, {
    FOO: {pending: true, error: null}
  })

  state = reduxSubmission.reducer(state, {type: 'FOO'})
  t.deepEqual(state, {
    FOO: {pending: false, error: null}
  })

  state = reduxSubmission.reducer(state, {type: 'SUBMIT_FOO'})
  t.deepEqual(state, {
    FOO: {pending: true, error: null}
  })

  state = reduxSubmission.reducer(state, {type: 'FOO', payload: 1, error: true})
  t.deepEqual(state, {
    FOO: {pending: false, error: 1}
  })
  t.end()
})

function setupMiddleware () {
  var next = sinon.spy()
  var dispatch = sinon.spy()

  var middleware = reduxSubmission.middleware({dispatch: dispatch})(next)

  return {next, dispatch, middleware}
}

test('middleware: noop for non promise', function (t) {
  var {next, dispatch, middleware} = setupMiddleware()

  middleware({type: 'FOO', payload: {bar: 1}})
  t.equal(next.calledOnce, true, 'Next called because it isnt a promise')
  t.equal(dispatch.called, false)
  t.end()
})

test('middleware: promise success', function (t) {
  var {next, dispatch, middleware} = setupMiddleware()

  var res
  var promise = new Promise((resolve) => { res = resolve })
  middleware({type: 'FOO', payload: promise})

  t.equal(next.called, false)
  t.equal(dispatch.calledOnce, true)
  t.deepEqual(dispatch.getCall(0).args[0], {type: 'SUBMIT_FOO'})

  res(1)
  setTimeout(() => {
    t.equal(dispatch.calledTwice, true)
    t.deepEqual(dispatch.getCall(1).args[0], {type: 'FOO', payload: 1})
    t.end()
  })
})

test('middleware: promise error', function (t) {
  var {dispatch, middleware} = setupMiddleware()

  var rej
  var promise = new Promise((resolve, reject) => { rej = reject })
  middleware({type: 'BAR', payload: promise})

  rej('fail')
  setTimeout(() => {
    t.equal(dispatch.calledTwice, true)
    t.deepEqual(dispatch.getCall(1).args[0], {type: 'BAR', payload: 'fail', error: true})
    t.end()
  })
})

test('getPending', function (t) {
  var state = {
    submission: {
      BAZ: {
        pending: true
      }
    }
  }

  t.equal(reduxSubmission.getPending('BAZ', state), true)

  state.submission.BAZ.pending = false
  t.equal(reduxSubmission.getPending('BAZ', state), false)

  delete state.submission.BAZ
  t.equal(reduxSubmission.getPending('BAZ', state), false)

  t.end()
})

test('getError', function (t) {
  var state = {
    submission: {
      BAZ: {
        error: 'fail'
      }
    }
  }

  t.equal(reduxSubmission.getError('BAZ', state), 'fail')

  state.submission.BAZ.error = null
  t.equal(reduxSubmission.getError('BAZ', state), null)

  delete state.submission.BAZ
  t.equal(reduxSubmission.getError('BAZ', state), null)

  t.end()
})
