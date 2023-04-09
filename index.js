const {
    fromEvent,
    map,
    tap,
    filter,
    merge,
} = rxjs

const MOVEMENT = CELL_SIZE/2
const SPEED = 75
const GAME = {
    players: [],
    draw: function() {
        this.players.forEach((player => player.clearPrevDraw()))
        drawBoard()
        drawDots()
        this.players.forEach((player) => player.draw())
    }
}

function createPlayer(color, startPosX, startPosY) {
    let player = {
        x: startPosX * CELL_SIZE,
        prevX: null,
        y: startPosY * CELL_SIZE,
        prevY: null,
        radius: PLAYER_RADIUS,
        points: 0,
        clearPrevDraw: function() {
            ctx.clearRect(
                this.prevX - this.radius,
                this.prevY - this.radius,
                this.radius * 2,
                this.radius * 2
            )
        },
        draw: function() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, PLAYER_RADIUS, 0, 2 * Math.PI);
            ctx.fillStyle = color
            ctx.fill()
            this.prevX = this.x
            this.prevY = this.y
        }
    }
    return player
}

function addPlayerToGame(player, upKey, downKey, leftKey, rightKey) {
    GAME.players.push(player)
    GAME.draw()

    let allIntervals = []

    const UpEvent = fromEvent(document, "keydown")
        .pipe(
            filter(event => event.code == upKey),
            filter(_ => checkCollision(player.x, player.y - MOVEMENT)),
            tap(_ => {
                const intervalId = setInterval(() => {
                    if (checkCollision(player.x, player.y - MOVEMENT)) {
                        player.y -= MOVEMENT
                        GAME.draw()
                    }
                    checkDotCollection(player.x, player.y)
                }, SPEED)
                allIntervals.push(intervalId)
            }),
        )

    const DownEvent = fromEvent(document, "keydown")
        .pipe(
            filter(event => event.code == downKey),
            filter(_ => checkCollision(player.x, player.y + MOVEMENT)),
            tap(_ => {
                const intervalId = setInterval(() => {
                    if (checkCollision(player.x, player.y + MOVEMENT)) {
                        player.y += MOVEMENT
                        GAME.draw()
                    }
                    checkDotCollection(player.x, player.y)
                }, SPEED)
                allIntervals.push(intervalId)
            }),
        )

    const LeftEvent = fromEvent(document, "keydown")
        .pipe(
            filter(event => event.code == leftKey),
            filter(_ => checkCollision(player.x - MOVEMENT, player.y)),
            tap(_ => {
                const intervalId = setInterval(() => {
                    if (checkCollision(player.x - MOVEMENT, player.y)) {
                        player.x -= MOVEMENT
                        GAME.draw()
                    }
                    checkDotCollection(player.x, player.y)
                }, SPEED)
                allIntervals.push(intervalId)
            }),
        )

    const RightEvent = fromEvent(document, "keydown")
        .pipe(
            filter(event => event.code == rightKey),
            filter(_ => checkCollision(player.x + MOVEMENT, player.y)),
            tap(_ => {
                const intervalId = setInterval(() => {
                    if (checkCollision(player.x + MOVEMENT, player.y)) {
                        player.x += MOVEMENT
                        GAME.draw()
                    }
                    checkDotCollection(player.x, player.y)
                }, SPEED)
                allIntervals.push(intervalId)
            }),
        )

    const MovementEvent = merge(UpEvent, DownEvent, LeftEvent, RightEvent)
        .pipe(
            tap(_ => {
                const lastId = allIntervals.pop()
                allIntervals.forEach((intervalId) => clearInterval(intervalId))
                allIntervals = [lastId]
            }),
        )
        .subscribe()
}

let player1 = createPlayer("yellow", 25, 15)
addPlayerToGame(player1, "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight")

let player2 = createPlayer("green", 28, 15)
addPlayerToGame(player2, "KeyW", "KeyS", "KeyA", "KeyD")

// let player1 = {
//     x: 25 * CELL_SIZE,
//     prevX: null,
//     y: 15 * CELL_SIZE,
//     prevY: null,
//     radius: PLAYER_RADIUS,
//     points: 0,
//     draw: function() {
//         ctx.clearRect(
//             this.prevX - this.radius,
//             this.prevY - this.radius,
//             this.radius * 2,
//             this.radius * 2
//         )
//         drawBoard()
//         drawDots()
//         ctx.beginPath();
//         ctx.arc(this.x, this.y, PLAYER_RADIUS, 0, 2 * Math.PI);
//         ctx.fillStyle = "yellow"
//         ctx.fill()
//         this.prevX = this.x
//         this.prevY = this.y
//     }
// }

// player1.draw()

// let allIntervals = []

// const ArrowUpEvent = fromEvent(document, "keydown")
//     .pipe(
//         filter(event => event.code == "ArrowUp"),
//         filter(_ => checkCollision(player1.x, player1.y - MOVEMENT)),
//         tap(_ => {
//             const intervalId = setInterval(() => {
//                 if (checkCollision(player1.x, player1.y - MOVEMENT)) {
//                     player1.y -= MOVEMENT
//                     player1.draw()
//                 }
//                 checkDotCollection(player1.x, player1.y)
//             }, SPEED)
//             allIntervals.push(intervalId)
//         }),
//     )

// const ArrowDownEvent = fromEvent(document, "keydown")
//     .pipe(
//         filter(event => event.code == "ArrowDown"),
//         filter(_ => checkCollision(player1.x, player1.y + MOVEMENT)),
//         tap(_ => {
//             const intervalId = setInterval(() => {
//                 if (checkCollision(player1.x, player1.y + MOVEMENT)) {
//                     player1.y += MOVEMENT
//                     player1.draw()
//                 }
//                 checkDotCollection(player1.x, player1.y)
//             }, SPEED)
//             allIntervals.push(intervalId)
//         }),
//     )

// const ArrowLeftEvent = fromEvent(document, "keydown")
//     .pipe(
//         filter(event => event.code == "ArrowLeft"),
//         filter(_ => checkCollision(player1.x - MOVEMENT, player1.y)),
//         tap(_ => {
//             const intervalId = setInterval(() => {
//                 if (checkCollision(player1.x - MOVEMENT, player1.y)) {
//                     player1.x -= MOVEMENT
//                     player1.draw()
//                 }
//                 checkDotCollection(player1.x, player1.y)
//             }, SPEED)
//             allIntervals.push(intervalId)
//         }),
//     )

// const ArrowRightEvent = fromEvent(document, "keydown")
//     .pipe(
//         filter(event => event.code == "ArrowRight"),
//         filter(_ => checkCollision(player1.x + MOVEMENT, player1.y)),
//         tap(_ => {
//             const intervalId = setInterval(() => {
//                 if (checkCollision(player1.x + MOVEMENT, player1.y)) {
//                     player1.x += MOVEMENT
//                     player1.draw()
//                 }
//                 checkDotCollection(player1.x, player1.y)
//             }, SPEED)
//             allIntervals.push(intervalId)
//         }),
//     )

// const Player1MovementEvent = merge(ArrowUpEvent, ArrowDownEvent, ArrowLeftEvent, ArrowRightEvent)
//     .pipe(
//         tap(_ => {
//             const lastId = allIntervals.pop()
//             allIntervals.forEach((intervalId) => clearInterval(intervalId))
//             allIntervals = [lastId]
//         }),
//     )
//     .subscribe()
