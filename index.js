const {
    fromEvent,
    map,
    tap,
    filter,
    merge,
    interval,
    of,
    mergeMap,
} = rxjs

const MOVEMENT = CELL_SIZE/2
const INTERVAL_LENGTH = 75

// Creamos sesión del juego
const GAME = {
    players: [],
    ghosts: [],
    playersInterval: interval(INTERVAL_LENGTH),
    ghostsInterval: interval(INTERVAL_LENGTH/2),
    draw: function() {
        drawBoard()
        drawDots()
        this.players.forEach((player) => player.draw())
        this.ghosts.forEach((ghost) => ghost.draw())
    }
}

// Función para inicializar al jugador
function createPlayer(name, color, startPosX, startPosY) {
    let player = {
        name: name,
        x: startPosX * CELL_SIZE,
        y: startPosY * CELL_SIZE,
        points: 0,
        intervals: [],
        draw: function() { // Función para dibujar al jugador
            ctx.beginPath();
            ctx.arc(this.x, this.y, PLAYER_RADIUS, 0, 2 * Math.PI); // Círculo con centro en x,y
            ctx.fillStyle = color
            ctx.fill()
        }
    }
    return player
}

// Función para agregar al jugador a la sesión del juego (con las teclas de movimiento)
function addPlayerToGame(player, upKey, downKey, leftKey, rightKey) {
    GAME.players.push(player) // Agregamos al listado de jugadroes
    GAME.draw() // Dibujamos el tablero, los puntos y los jugadores
    
    // let allIntervals = []

    function DirectionObservable(dirKey, nextPosX, nextPosY) {
        return fromEvent(document, "keydown")
            .pipe(
                filter(event => event.code == dirKey),
                filter(_ => checkNoCollision(player.x + nextPosX, player.y + nextPosY)),
                tap(_ => {
                    const intervalObservable = GAME.playersInterval
                        .pipe(
                            tap(_ => {
                                if (checkNoCollision(player.x + nextPosX, player.y + nextPosY)) {
                                    player.x += nextPosX
                                    player.y += nextPosY
                                    GAME.draw()
                                }
                                checkDotCollection(player.x, player.y)
                            })
                        ).subscribe()
                    player.intervals.push(intervalObservable)
                })
            )
    }

    const UpObservable = DirectionObservable(upKey, 0, -MOVEMENT)
    const DownObservable = DirectionObservable(downKey, 0, MOVEMENT)
    const LeftObservable = DirectionObservable(leftKey, -MOVEMENT, 0)
    const RightObservable = DirectionObservable(rightKey, MOVEMENT, 0)

    const MovementObservable = merge(UpObservable, DownObservable, LeftObservable, RightObservable)
        .pipe(
            tap(_ => {
                // Detenemos todos los intervalos activas excepto el último (jugador solo se moverá en la última dirección presionada, si es válida)
                const lastId = player.intervals.pop()
                player.intervals.forEach((intervalObservable) => intervalObservable.unsubscribe())
                // allIntervals.forEach((intervalId) => clearInterval(intervalId))
                player.intervals = [lastId]
            }),
        )
        .subscribe() // Asociamos jugador (Observer) al Observable
    
    // Observable para determinar si el jugador colisiona con un fantasma
    GAME.playersInterval
        .pipe(
            // Verificamos si el jugador se intersecta con cualquier fantasma
            filter(_ => GAME.ghosts.some(
                ghost => checkCollisionPlayerGhosts(player.x, player.y, ghost.x, ghost.y)
            )),
            // Si es así, eliminamos al jugador de la sesión y lo desuscribimos del Observable de movimiento
            map(_ => {
                GAME.players = GAME.players.filter(p => p.name !== player.name)
                player.intervals.forEach((intervalObservable) => intervalObservable.unsubscribe())
                MovementObservable.unsubscribe()
            })
        )
        .subscribe()

    /*

    // Observable para la dirección hacia arriba
    const UpEvent = fromEvent(document, "keydown") // "Escucha" cuando se presiona una tecla
        .pipe(
            filter(event => event.code == upKey), // Filtramos para que la tecla corresponda a la dirección del Observable
            filter(_ => checkNoCollision(player.x, player.y - MOVEMENT)), // Verificamos que en el primer movimiento (justo al presionar la tecla) el jugador no colisione con una pared
            tap(_ => {
                const intervalObservable = GAME.playersInterval
                    .pipe(
                        tap(_ => {
                            if (checkNoCollision(player.x, player.y - MOVEMENT)) { // Jugador se mueve solamente si no colisonará con una pared
                                player.y -= MOVEMENT
                                GAME.draw()
                            }
                            checkDotCollection(player.x, player.y) // Recolectamos los puntos que tocamos al movernos
                        })
                    ).subscribe()
                allIntervals.push(intervalObservable)
            }),
            // tap(_ => {
            //     const intervalId = setInterval(() => { // Loop infinito para que el jugador se mueva en la misma dirección automáticamente (solo basta presionar la tecla una vez)
            //         if (checkNoCollision(player.x, player.y - MOVEMENT)) { // Jugador se mueve solamente si no colisonará con una pared
            //             player.y -= MOVEMENT
            //             GAME.draw()
            //         }
            //         checkDotCollection(player.x, player.y) // Recolectamos los puntos que tocamos al movernos
            //     }, INTERVAL_LENGTH)
            //     allIntervals.push(intervalId) // Guardamos el id del loop infinito
            // }),
        )
    
    // Observable para la dirección hacia abajo
    const DownEvent = fromEvent(document, "keydown")
        .pipe(
            filter(event => event.code == downKey),
            filter(_ => checkNoCollision(player.x, player.y + MOVEMENT)),
            tap(_ => {
                const intervalObservable = GAME.playersInterval
                    .pipe(
                        tap(_ => {
                            if (checkNoCollision(player.x, player.y + MOVEMENT)) {
                                player.y += MOVEMENT
                                GAME.draw()
                            }
                            checkDotCollection(player.x, player.y)
                        })
                    ).subscribe()
                allIntervals.push(intervalObservable)
            }),
            // tap(_ => {
            //     const intervalId = setInterval(() => {
            //         if (checkNoCollision(player.x, player.y + MOVEMENT)) {
            //             player.y += MOVEMENT
            //             GAME.draw()
            //         }
            //         checkDotCollection(player.x, player.y)
            //     }, INTERVAL_LENGTH)
            //     allIntervals.push(intervalId)
            // }),
        )
    
    // Observable para la dirección hacia la izquierda
    const LeftEvent = fromEvent(document, "keydown")
        .pipe(
            filter(event => event.code == leftKey),
            filter(_ => checkNoCollision(player.x - MOVEMENT, player.y)),
            tap(_ => {
                const intervalObservable = GAME.playersInterval
                    .pipe(
                        tap(_ => {
                            if (checkNoCollision(player.x - MOVEMENT, player.y)) {
                                player.x -= MOVEMENT
                                GAME.draw()
                            }
                            checkDotCollection(player.x, player.y)
                        })
                    ).subscribe()
                allIntervals.push(intervalObservable)
            }),
            // tap(_ => {
            //     const intervalId = setInterval(() => {
            //         if (checkNoCollision(player.x - MOVEMENT, player.y)) {
            //             player.x -= MOVEMENT
            //             GAME.draw()
            //         }
            //         checkDotCollection(player.x, player.y)
            //     }, INTERVAL_LENGTH)
            //     allIntervals.push(intervalId)
            // }),
        )

    // Observable para la dirección hacia la derecha
    const RightEvent = fromEvent(document, "keydown")
        .pipe(
            filter(event => event.code == rightKey),
            filter(_ => checkNoCollision(player.x + MOVEMENT, player.y)),
            tap(_ => {
                const intervalObservable = GAME.playersInterval
                    .pipe(
                        tap(_ => {
                            if (checkNoCollision(player.x + MOVEMENT, player.y)) {
                                player.x += MOVEMENT
                                GAME.draw()
                            }
                            checkDotCollection(player.x, player.y)
                        })
                    ).subscribe()
                allIntervals.push(intervalObservable)
            }),
            // tap(_ => {
            //     const intervalId = setInterval(() => {
            //         if (checkNoCollision(player.x + MOVEMENT, player.y)) {
            //             player.x += MOVEMENT
            //             GAME.draw()
            //         }
            //         checkDotCollection(player.x, player.y)
            //     }, INTERVAL_LENGTH)
            //     allIntervals.push(intervalId)
            // }),
        )
    
    // Unimos los 4 observables en uno (así, va a estar escuchando que se presione cualquiera de las 4 teclas)
    const MovementEvent = merge(UpEvent, DownEvent, LeftEvent, RightEvent)
        .pipe(
            tap(_ => {
                // Detenemos todos los intervalos activas excepto el último (jugador solo se moverá en la última dirección presionada, si es válida)
                const lastId = allIntervals.pop()
                allIntervals.forEach((intervalObservable) => intervalObservable.unsubscribe())
                // allIntervals.forEach((intervalId) => clearInterval(intervalId))
                allIntervals = [lastId]
            }),
        )
        .subscribe() // Asociamos jugador (Observer) al Observable

    */
    
    // // Observable para determinar si el jugador colisiona con un fantasma
    // GAME.playersInterval
    //     .pipe(
    //         // Verificamos si el jugador se intersecta con cualquier fantasma
    //         filter(_ => GAME.ghosts.some(
    //             ghost => checkCollisionPlayerGhosts(player.x, player.y, ghost.x, ghost.y)
    //         )),
    //         // Si es así, eliminamos al jugador de la sesión y lo desuscribimos del Observable de movimiento
    //         map(_ => {
    //             GAME.players = GAME.players.filter(p => p.name !== player.name)
    //             allIntervals.forEach((intervalId) => clearInterval(intervalId))
    //             MovementEvent.unsubscribe()
    //         })
    //     )
    //     .subscribe()
}

let player1 = createPlayer("Jugador 1", "yellow", 25, 15)
addPlayerToGame(player1, "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight")

let player2 = createPlayer("Jugador 2", "green", 28, 15)
addPlayerToGame(player2, "KeyW", "KeyS", "KeyA", "KeyD")

// Función para inicializar un fantasma enemigo
function createGhost(color, startPosX, startPosY, initialDirection) {
    let ghost = {
        x: startPosX * CELL_SIZE,
        y: startPosY * CELL_SIZE,
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
        }
    }
    return ghost
}

const directions = ['U', 'D', 'L', 'R']

// Función para agregar fantasma a la sesión del juego
function addGhostToGame(ghost) {
    GAME.ghosts.push(ghost)
    GAME.draw()

    // Observable con loop infinito (dado por el tiempo entre cada movimiento/frame)
    GAME.ghostsInterval
        .pipe(
            // Si fantasma se encuentra en un cruce/intersección de caminos, cambiamos de dirección al azar
            map(_ => {
                if (checkIntersection(ghost.x, ghost.y)) {
                    return directions[Math.floor(Math.random() * directions.length)]
                }
                return ghost.direction
            }),
            // Verificamos si el fantasma va a chocar con alguna pared en su siguiente movimiento
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
            // Nos quedamos solamente con los futuros movimientos que no generarán una colisión
            filter(x => x),
            // Actualizamos la posición del fantasma
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