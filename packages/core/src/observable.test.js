/**
 * Tests for minimal Observable implementation
 * Ensures compatibility with RxJS Observable API
 */
import { describe, it, expect, vi } from 'vitest'
import { Observable, Subject } from './observable.js'

describe('Observable', () => {
  describe('constructor and basic functionality', () => {
    it('should create observable with subscriber function', () => {
      const observable = new Observable(() => {})
      expect(observable).toBeDefined()
      expect(typeof observable.subscribe).toBe('function')
    })

    it('should emit values to observer', async () => {
      const observable = new Observable(observer => {
        observer.next(1)
        observer.next(2)
        observer.complete()
      })

      const values = []
      await new Promise(resolve => {
        observable.subscribe({
          next: (value) => values.push(value),
          complete: () => {
            expect(values).toEqual([1, 2])
            resolve()
          }
        })
      })
    })

    it('should handle errors properly', async () => {
      const testError = new Error('Test error')
      const observable = new Observable(observer => {
        observer.error(testError)
      })

      await new Promise(resolve => {
        observable.subscribe({
          error: (error) => {
            expect(error).toBe(testError)
            resolve()
          }
        })
      })
    })

    it('should support function-style subscription', async () => {
      const observable = new Observable(observer => {
        observer.next('test')
        observer.complete()
      })

      await new Promise(resolve => {
        observable.subscribe(
          (value) => {
            expect(value).toBe('test')
          },
          (error) => {
            throw error
          },
          () => {
            resolve()
          }
        )
      })
    })
  })

  describe('subscription management', () => {
    it('should return subscription with unsubscribe method', () => {
      const observable = new Observable(() => {})
      const subscription = observable.subscribe(() => {})
      
      expect(subscription).toBeDefined()
      expect(typeof subscription.unsubscribe).toBe('function')
      expect(typeof subscription.closed).toBe('boolean')
    })

    it('should call cleanup function on unsubscribe', () => {
      const cleanup = vi.fn()
      const observable = new Observable(() => cleanup)
      
      const subscription = observable.subscribe(() => {})
      subscription.unsubscribe()
      
      expect(cleanup).toHaveBeenCalled()
    })

    it('should not emit after unsubscribe', () => {
      let observer
      const observable = new Observable(obs => {
        observer = obs
      })

      const next = vi.fn()
      const subscription = observable.subscribe(next)
      
      subscription.unsubscribe()
      observer.next('test')
      
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle multiple unsubscribes safely', () => {
      const cleanup = vi.fn()
      const observable = new Observable(() => cleanup)
      
      const subscription = observable.subscribe(() => {})
      subscription.unsubscribe()
      subscription.unsubscribe() // Should not throw
      
      expect(cleanup).toHaveBeenCalledTimes(1)
    })
  })

  describe('error handling', () => {
    it('should catch errors in subscriber function', async () => {
      const observable = new Observable(() => {
        throw new Error('Subscriber error')
      })

      await new Promise(resolve => {
        observable.subscribe({
          error: (error) => {
            expect(error.message).toBe('Subscriber error')
            resolve()
          }
        })
      })
    })

    it('should catch errors in next handler', async () => {
      const observable = new Observable(observer => {
        observer.next('test')
      })

      await new Promise(resolve => {
        observable.subscribe({
          next: () => {
            throw new Error('Next handler error')
          },
          error: (error) => {
            expect(error.message).toBe('Next handler error')
            resolve()
          }
        })
      })
    })
  })

  describe('static methods', () => {
    it('should create Observable from array', async () => {
      const values = [1, 2, 3]
      const observable = Observable.from(values)
      
      const results = []
      await new Promise(resolve => {
        observable.subscribe({
          next: (value) => results.push(value),
          complete: () => {
            expect(results).toEqual(values)
            resolve()
          }
        })
      })
    })

    it('should create Observable with single value', async () => {
      const observable = Observable.of('test')
      
      await new Promise(resolve => {
        observable.subscribe({
          next: (value) => {
            expect(value).toBe('test')
          },
          complete: () => {
            resolve()
          }
        })
      })
    })

    it('should create error Observable', async () => {
      const testError = new Error('Test error')
      const observable = Observable.throwError(testError)
      
      await new Promise(resolve => {
        observable.subscribe({
          error: (error) => {
            expect(error).toBe(testError)
            resolve()
          }
        })
      })
    })

    it('should create never Observable', async () => {
      const observable = Observable.never()
      
      const next = vi.fn()
      const complete = vi.fn()
      const error = vi.fn()
      
      observable.subscribe({ next, complete, error })
      
      // Should not emit anything
      await new Promise(resolve => {
        setTimeout(() => {
          expect(next).not.toHaveBeenCalled()
          expect(complete).not.toHaveBeenCalled()
          expect(error).not.toHaveBeenCalled()
          resolve()
        }, 10)
      })
    })

    it('should create empty Observable', async () => {
      const observable = Observable.empty()
      
      await new Promise(resolve => {
        observable.subscribe({
          next: () => {
            throw new Error('Should not emit values')
          },
          complete: () => {
            resolve()
          }
        })
      })
    })
  })
})

describe('Subject', () => {
  it('should create subject that is both observable and observer', () => {
    const subject = new Subject()
    
    expect(subject).toBeDefined()
    expect(typeof subject.subscribe).toBe('function')
    expect(typeof subject.next).toBe('function')
    expect(typeof subject.error).toBe('function')
    expect(typeof subject.complete).toBe('function')
  })

  it('should multicast values to multiple observers', () => {
    const subject = new Subject()
    
    const observer1 = { next: vi.fn(), error: vi.fn(), complete: vi.fn() }
    const observer2 = { next: vi.fn(), error: vi.fn(), complete: vi.fn() }
    
    subject.subscribe(observer1)
    subject.subscribe(observer2)
    
    subject.next('test')
    
    expect(observer1.next).toHaveBeenCalledWith('test')
    expect(observer2.next).toHaveBeenCalledWith('test')
  })

  it('should handle observer count correctly', () => {
    const subject = new Subject()
    
    expect(subject.observerCount).toBe(0)
    
    const sub1 = subject.subscribe(() => {})
    expect(subject.observerCount).toBe(1)
    
    const sub2 = subject.subscribe(() => {})
    expect(subject.observerCount).toBe(2)
    
    sub1.unsubscribe()
    expect(subject.observerCount).toBe(1)
    
    sub2.unsubscribe()
    expect(subject.observerCount).toBe(0)
  })

  it('should not emit after completion', () => {
    const subject = new Subject()
    
    const next = vi.fn()
    subject.subscribe({ next })
    
    subject.complete()
    expect(subject.closed).toBe(true)
    
    subject.next('test')
    expect(next).not.toHaveBeenCalled()
  })

  it('should clean up observers on error', () => {
    const subject = new Subject()
    
    const error = vi.fn()
    subject.subscribe({ error })
    
    expect(subject.observerCount).toBe(1)
    
    subject.error(new Error('test'))
    expect(subject.closed).toBe(true)
    expect(subject.observerCount).toBe(0)
  })
})