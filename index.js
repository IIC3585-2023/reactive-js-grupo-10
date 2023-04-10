const {
    fromEvent,
    map,
    tap,
    filter,
    merge,
    interval,
    concatMap,
} = rxjs

const MOVEMENT = CELL_SIZE/2
const SPEED = 75
const GAME = {
    players: [],
    ghosts: [],
    draw: function() {
        // this.players.forEach((player => player.clearPrevDraw()))
        // this.ghosts.forEach((ghost => ghost.clearPrevDraw()))
        drawBoard()
        drawDots()
        this.players.forEach((player) => player.draw())
        this.ghosts.forEach((ghost) => ghost.draw())
    }
}

function createPlayer(color, startPosX, startPosY) {
    let player = {
        x: startPosX * CELL_SIZE,
        prevX: null,
        y: startPosY * CELL_SIZE,
        prevY: null,
        points: 0,
        // clearPrevDraw: function() {
        //     ctx.clearRect(
        //         this.prevX - CELL_SIZE,
        //         this.prevY - CELL_SIZE,
        //         CELL_SIZE * 2,
        //         CELL_SIZE * 2
        //     )
        // },
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
            filter(_ => checkNoCollision(player.x, player.y - MOVEMENT)),
            tap(_ => {
                const intervalId = setInterval(() => {
                    if (checkNoCollision(player.x, player.y - MOVEMENT)) {
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
            filter(_ => checkNoCollision(player.x, player.y + MOVEMENT)),
            tap(_ => {
                const intervalId = setInterval(() => {
                    if (checkNoCollision(player.x, player.y + MOVEMENT)) {
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
            filter(_ => checkNoCollision(player.x - MOVEMENT, player.y)),
            tap(_ => {
                const intervalId = setInterval(() => {
                    if (checkNoCollision(player.x - MOVEMENT, player.y)) {
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
            filter(_ => checkNoCollision(player.x + MOVEMENT, player.y)),
            tap(_ => {
                const intervalId = setInterval(() => {
                    if (checkNoCollision(player.x + MOVEMENT, player.y)) {
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

function createGhost(color, startPosX, startPosY, initialDirection) {
    let ghost = {
        x: startPosX * CELL_SIZE,
        prevX: null,
        y: startPosY * CELL_SIZE,
        prevY: null,
        direction: initialDirection,
        // clearPrevDraw: function() {
        //     ctx.clearRect(
        //         this.prevX - CELL_SIZE,
        //         this.prevY - CELL_SIZE,
        //         CELL_SIZE * 2,
        //         CELL_SIZE * 2
        //     )
        // },
        draw: function() {
            ctx.beginPath()
            ctx.arc(this.x, this.y, PLAYER_RADIUS, Math.PI, 0)        
            ctx.lineTo(this.x + PLAYER_RADIUS, this.y + PLAYER_RADIUS);
            ctx.lineTo(this.x + PLAYER_RADIUS*0.5, this.y + PLAYER_RADIUS/2);
            ctx.lineTo(this.x + PLAYER_RADIUS*0.35, this.y + PLAYER_RADIUS);
            ctx.lineTo(this.x, this.y + PLAYER_RADIUS/2);
            ctx.lineTo(this.x - PLAYER_RADIUS*0.35, this.y + PLAYER_RADIUS);
            ctx.lineTo(this.x - PLAYER_RADIUS*0.5, this.y + PLAYER_RADIUS/2);
            ctx.lineTo(this.x - PLAYER_RADIUS, this.y + PLAYER_RADIUS);
            ctx.fillStyle = color
            ctx.fill()
            this.prevX = this.x
            this.prevY = this.y
        }
    }
    return ghost
}

const directions = ['U', 'D', 'L', 'R']

function addGhostToGame(ghost) {
    GAME.ghosts.push(ghost)
    GAME.draw()

    interval(SPEED/2)
        .pipe(
            map(_ => {
                if (checkIntersection(ghost.x, ghost.y)) {
                    directions[Math.floor(Math.random() * directions.length)]
                    return directions[Math.floor(Math.random() * directions.length)]
                }
                return ghost.direction
            }),
            map(dir => {
                let noCollision = false
                if (dir == 'U') {
                    noCollision = checkNoCollision(ghost.x, ghost.y - MOVEMENT)
                } else if (dir == 'D') {
                    noCollision = checkNoCollision(ghost.x, ghost.y + MOVEMENT)
                } else if (dir == 'L') {
                    noCollision = checkNoCollision(ghost.x - MOVEMENT, ghost.y)
                } else if (dir == 'R') {
                    noCollision = checkNoCollision(ghost.x + MOVEMENT, ghost.y)
                }
                if (noCollision) {
                    ghost.direction = dir
                }
                return noCollision
            }),
            filter(x => x),
            map(_ => {
                if (ghost.direction == 'U') {
                    ghost.y -= MOVEMENT
                } else if (ghost.direction == 'D') {
                    ghost.y += MOVEMENT
                } else if (ghost.direction == 'L') {
                    ghost.x -= MOVEMENT
                } else if (ghost.direction == 'R') {
                    ghost.x += MOVEMENT
                }
                GAME.draw()
            })
        )
        .subscribe()
}

let ghost1 = createGhost("red", 2, 2, 'L')
let ghost2 = createGhost("deepskyblue", 51, 2, 'R')
let ghost3 = createGhost("orange", 2, 30, 'L')
let ghost4 = createGhost("hotpink", 51, 30, 'R')

addGhostToGame(ghost1)
addGhostToGame(ghost2)
addGhostToGame(ghost3)
addGhostToGame(ghost4)


//////////////////////////// VERSION ANTERIOR (1 SOLO JUGADOR) ////////////////////////////////

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