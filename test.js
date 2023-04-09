const { Subject, Observable, fromEvent, throttleTime, map, scan } = rxjs;
// const { map, debounceTime } = rxjs.operators;

const button = document.getElementById("click-button");
// const text = document.getElementById("text-result");

// fromEvent(button, "click").subscribe(() => console.log('Clicked!'));
// fromEvent(document, "click")
//     .pipe(
//         throttleTime(1000),
//         map((event) => {
//             console.log(event)
//             return event.clientX
//         }),
//         scan((count, clientX) => count + clientX, 0)
//     )
//     .subscribe((count) => console.log(`Clicked ${count} times`));

const observable = new Observable((subscriber) => {
    // subscriber.next(1)
    // subscriber.next(2)
    // subscriber.next(3)
    // setTimeout(() => {
    //     subscriber.next(4)
    //     subscriber.complete()
    // }, 5000)
    const id = setInterval(() => {
        subscriber.next('hi')
    }, 1000)
    // return function unsubscribe() {
    //     clearInterval(id);
    // };
})

// console.log('just before subscribe');
// observable.subscribe({
//   next(x) {
//     console.log('got value ' + x);
//   },
//   error(err) {
//     console.error('something wrong occurred: ' + err);
//   },
//   complete() {
//     console.log('done');
//   },
// });
// console.log('just after subscribe');

// const subscription = observable.subscribe((x) => console.log(x))
// setTimeout(() => {
//     subscription.unsubscribe()
// }, 5000)

const subject = new Subject()

subject.subscribe({
    next(x) {
        console.log('observerA: ' + x)
    }
})
subject.subscribe({
    next(x) {
        console.log('observerB: ' + x)
    }
})
subject.next(1)
subject.next(2)