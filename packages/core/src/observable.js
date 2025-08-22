/**
 * Minimal Observable implementation
 * Replaces RxJS Observable for basic streaming functionality
 * Compatible API with RxJS Observable but much smaller bundle size
 */

/**
 * Simple observer interface
 * @typedef {Object} Observer
 * @property {Function} next - Handle next value
 * @property {Function} [error] - Handle error
 * @property {Function} [complete] - Handle completion
 */

/**
 * Subscription interface for cleanup
 * @typedef {Object} Subscription
 * @property {Function} unsubscribe - Cleanup function
 * @property {boolean} closed - Whether subscription is closed
 */

/**
 * Minimal Observable implementation
 * Provides same API as RxJS Observable but with much smaller footprint
 */
export class Observable {
  /**
   * Create an Observable
   * @param {Function} subscriber - Function that receives observer and returns cleanup function
   */
  constructor(subscriber) {
    this._subscriber = subscriber
  }

  /**
   * Subscribe to the observable
   * @param {Observer|Function} observerOrNext - Observer object or next function
   * @param {Function} [error] - Error handler function
   * @param {Function} [complete] - Complete handler function
   * @returns {Subscription} Subscription object
   */
  subscribe(observerOrNext, error, complete) {
    let observer

    // Handle different subscription patterns
    if (typeof observerOrNext === 'function') {
      observer = {
        next: observerOrNext,
        error: error || (() => {}),
        complete: complete || (() => {})
      }
    } else if (observerOrNext && typeof observerOrNext === 'object') {
      observer = {
        next: observerOrNext.next || (() => {}),
        error: observerOrNext.error || (() => {}),
        complete: observerOrNext.complete || (() => {})
      }
    } else {
      observer = {
        next: () => {},
        error: () => {},
        complete: () => {}
      }
    }

    let cleanup
    let closed = false

    // Create safe observer that checks if subscription is closed
    const safeObserver = {
      next: (value) => {
        if (!closed) {
          try {
            observer.next(value)
          } catch (err) {
            safeObserver.error(err)
          }
        }
      },
      error: (err) => {
        if (!closed) {
          closed = true
          try {
            observer.error(err)
          } catch (e) {
            console.error('Uncaught error in error handler:', e)
          }
          if (cleanup && typeof cleanup === 'function') {
            cleanup()
          }
        }
      },
      complete: () => {
        if (!closed) {
          closed = true
          try {
            observer.complete()
          } catch (err) {
            console.error('Uncaught error in complete handler:', err)
          }
          if (cleanup && typeof cleanup === 'function') {
            cleanup()
          }
        }
      },
      get closed() {
        return closed
      }
    }

    try {
      // Execute subscriber function
      cleanup = this._subscriber(safeObserver)
    } catch (err) {
      safeObserver.error(err)
    }

    // Return subscription object
    return {
      unsubscribe: () => {
        if (!closed) {
          closed = true
          if (cleanup && typeof cleanup === 'function') {
            cleanup()
          }
        }
      },
      get closed() {
        return closed
      }
    }
  }

  /**
   * Create Observable from array of values
   * @param {Array} values - Values to emit
   * @returns {Observable} Observable that emits each value
   */
  static from(values) {
    return new Observable(observer => {
      let index = 0
      const next = () => {
        if (index < values.length && !observer.closed) {
          observer.next(values[index++])
          setTimeout(next, 0) // Async emission
        } else if (!observer.closed) {
          observer.complete()
        }
      }
      next()
    })
  }

  /**
   * Create Observable that emits single value
   * @param {*} value - Value to emit
   * @returns {Observable} Observable that emits the value
   */
  static of(value) {
    return new Observable(observer => {
      if (!observer.closed) {
        observer.next(value)
        observer.complete()
      }
    })
  }

  /**
   * Create Observable that emits error
   * @param {Error} error - Error to emit
   * @returns {Observable} Observable that emits error
   */
  static throwError(error) {
    return new Observable(observer => {
      observer.error(error)
    })
  }

  /**
   * Create Observable that never emits
   * @returns {Observable} Observable that never emits
   */
  static never() {
    return new Observable(() => {})
  }

  /**
   * Create Observable that completes immediately
   * @returns {Observable} Observable that completes immediately
   */
  static empty() {
    return new Observable(observer => {
      observer.complete()
    })
  }
}

/**
 * Create a Subject (Observable + Observer)
 * Useful for manual emission of values
 */
export class Subject extends Observable {
  constructor() {
    super(observer => {
      this._observers.add(observer)
      return () => this._observers.delete(observer)
    })
    this._observers = new Set()
    this._closed = false
  }

  /**
   * Emit next value to all observers
   * @param {*} value - Value to emit
   */
  next(value) {
    if (!this._closed) {
      for (const observer of this._observers) {
        observer.next(value)
      }
    }
  }

  /**
   * Emit error to all observers
   * @param {Error} error - Error to emit
   */
  error(error) {
    if (!this._closed) {
      this._closed = true
      for (const observer of this._observers) {
        observer.error(error)
      }
      this._observers.clear()
    }
  }

  /**
   * Complete all observers
   */
  complete() {
    if (!this._closed) {
      this._closed = true
      for (const observer of this._observers) {
        observer.complete()
      }
      this._observers.clear()
    }
  }

  /**
   * Get number of active observers
   * @returns {number} Number of observers
   */
  get observerCount() {
    return this._observers.size
  }

  /**
   * Whether subject is closed
   * @returns {boolean} True if closed
   */
  get closed() {
    return this._closed
  }
}