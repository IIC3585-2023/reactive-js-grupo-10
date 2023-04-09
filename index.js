const {
    fromEvent,
    map,
    tap,
    filter,
    merge,
    takeLast,
    switchMap,
} = rxjs

// fromEvent(document, "keydown")
//     .pipe(
//         map((event) => event.key),
//         // scan((count) => count + 1, 0)
//     )
//     .subscribe((count) => console.log(count))

// const board = document.getElementById("pacman-board")
// const ctx = board.getContext("2d")

let player1 = {
    x: 25 * CELL_SIZE,
    prevX: null,
    y: 15 * CELL_SIZE,
    prevY: null,
    radius: CELL_SIZE * 0.75,
    draw: function() {
        ctx.clearRect(
            this.prevX - this.radius,
            this.prevY - this.radius,
            this.radius * 2,
            this.radius * 2
        )
        drawBoard()
        ctx.beginPath();
        ctx.arc(this.x, this.y, CELL_SIZE * 0.75, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow"
        ctx.fill()
        this.prevX = this.x
        this.prevY = this.y
    }
}

player1.draw()

const MOVEMENT = CELL_SIZE/2
const SPEED = 75

let allIntervals = []

const ArrowUpEvent = fromEvent(document, "keydown")
    .pipe(
        filter(event => event.code == "ArrowUp"),
        filter(_ => checkCollision(player1.x, player1.y - MOVEMENT)),
        tap(_ => {
            const intervalId = setInterval(() => {
                if (checkCollision(player1.x, player1.y - MOVEMENT)) {
                    player1.y -= MOVEMENT
                    player1.draw()
                }
            }, SPEED)
            allIntervals.push(intervalId)
        }),
    )

const ArrowDownEvent = fromEvent(document, "keydown")
    .pipe(
        filter(event => event.code == "ArrowDown"),
        filter(_ => checkCollision(player1.x, player1.y + MOVEMENT)),
        tap(_ => {
            const intervalId = setInterval(() => {
                if (checkCollision(player1.x, player1.y + MOVEMENT)) {
                    player1.y += MOVEMENT
                    player1.draw()
                }
            }, SPEED)
            allIntervals.push(intervalId)
        }),
    )

const ArrowLeftEvent = fromEvent(document, "keydown")
    .pipe(
        filter(event => event.code == "ArrowLeft"),
        filter(_ => checkCollision(player1.x - MOVEMENT, player1.y)),
        tap(_ => {
            const intervalId = setInterval(() => {
                if (checkCollision(player1.x - MOVEMENT, player1.y)) {
                    player1.x -= MOVEMENT
                    player1.draw()
                }
            }, SPEED)
            allIntervals.push(intervalId)
        }),
    )

const ArrowRightEvent = fromEvent(document, "keydown")
    .pipe(
        filter(event => event.code == "ArrowRight"),
        filter(_ => checkCollision(player1.x + MOVEMENT, player1.y)),
        tap(_ => {
            const intervalId = setInterval(() => {
                if (checkCollision(player1.x + MOVEMENT, player1.y)) {
                    player1.x += MOVEMENT
                    player1.draw()
                }
            }, SPEED)
            allIntervals.push(intervalId)
        }),
    )

const MovementEvent = merge(ArrowUpEvent, ArrowDownEvent, ArrowLeftEvent, ArrowRightEvent)
    .pipe(
        tap(_ => {
            const lastId = allIntervals.pop()
            allIntervals.forEach((intervalId) => clearInterval(intervalId))
            allIntervals = [lastId]
        }),
    )
    .subscribe()
