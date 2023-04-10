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
        drawBoard()
        drawDots()
        this.players.forEach((player) => player.draw())
        this.ghosts.forEach((ghost) => ghost.draw())
    }
}

function createPlayer(name, color, startPosX, startPosY) {
    let player = {
        name: name,
        x: startPosX * CELL_SIZE,
        prevX: null,
        y: startPosY * CELL_SIZE,
        prevY: null,
        points: 0,
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

    interval(SPEED)
        .pipe(
            filter(_ => GAME.ghosts.some(
                ghost => checkCollisionPlayerGhosts(player.x, player.y, ghost.x, ghost.y)
            )),
            map(_ => {
                GAME.players = GAME.players.filter(p => p.name !== player.name)
                MovementEvent.unsubscribe()
            })
        )
        .subscribe()
}

let player1 = createPlayer("Jugador 1", "yellow", 25, 15)
addPlayerToGame(player1, "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight")

let player2 = createPlayer("Jugador 2", "green", 28, 15)
addPlayerToGame(player2, "KeyW", "KeyS", "KeyA", "KeyD")

function createGhost(color, startPosX, startPosY, initialDirection) {
    let ghost = {
        x: startPosX * CELL_SIZE,
        prevX: null,
        y: startPosY * CELL_SIZE,
        prevY: null,
        direction: initialDirection,
        draw: function() {
            ctx.beginPath()
            ctx.arc(this.x, this.y, GHOST_RADIUS, Math.PI, 0)        
            ctx.lineTo(this.x + GHOST_RADIUS, this.y + GHOST_RADIUS);
            ctx.lineTo(this.x + GHOST_RADIUS*0.5, this.y + GHOST_RADIUS/2);
            ctx.lineTo(this.x + GHOST_RADIUS*0.35, this.y + GHOST_RADIUS);
            ctx.lineTo(this.x, this.y + GHOST_RADIUS/2);
            ctx.lineTo(this.x - GHOST_RADIUS*0.35, this.y + GHOST_RADIUS);
            ctx.lineTo(this.x - GHOST_RADIUS*0.5, this.y + GHOST_RADIUS/2);
            ctx.lineTo(this.x - GHOST_RADIUS, this.y + GHOST_RADIUS);
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

// let ghost5 = createGhost("purple", 13, 2, 'L')
// addGhostToGame(ghost5)
// let ghost6 = createGhost("brown", 40, 2, 'R')
// addGhostToGame(ghost6)
// let ghost7 = createGhost("grey", 17, 2, 'R')
// addGhostToGame(ghost7)
// let ghost8 = createGhost("darkgreen", 37, 2, 'L')
// addGhostToGame(ghost8)