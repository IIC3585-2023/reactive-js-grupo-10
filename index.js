const {
    fromEvent,
    map,
    tap,
    filter,
    merge,
    interval,
    take,
} = rxjs

// Función para inicializar al jugador
function createPlayer(name, color, startPosX, startPosY) {
    let player = {
        name: name,
        x: startPosX * CELL_SIZE,
        y: startPosY * CELL_SIZE,
        currDir: null,
        activeSubscriptions: [],
        ghostSubscription: null,
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
    GAME.startedSession = true
    GAME.players.push(player) // Agregamos al listado de jugadroes
    GAME.draw() // Dibujamos el tablero, los puntos y los jugadores
    
    // Observable para crear un observable para una dirección de movimiento
    function DirectionObservable(dirKey, nextMoveX, nextMoveY) {
        return fromEvent(document, "keydown") // "Escucha" cuando se presiona una tecla
            .pipe(
                filter(event => event.code == dirKey), // Filtramos para que la tecla corresponda a la dirección del Observable
                filter(_ => dirKey !== player.currDir), // Filtramos si hubo un cambio de dirección
                filter(_ => checkNoCollision(player.x + nextMoveX, player.y + nextMoveY)), // Verificamos que en el primer movimiento (justo al presionar la tecla) el jugador no colisione con una pared
                tap(_ => {
                    const intervalObservable = interval(PLAYER_INTERVAL_LENGTH)
                        .pipe(
                            tap(_ => {
                                if (checkNoCollision(player.x + nextMoveX, player.y + nextMoveY)) { // Jugador se mueve solamente si no colisonará con una pared
                                    player.x += nextMoveX
                                    player.y += nextMoveY
                                    GAME.draw()
                                }
                                checkDotCollection(player.x, player.y) // Recolectamos los puntos que tocamos al movernos
                            })
                        ).subscribe()
                    player.activeSubscriptions.push(intervalObservable)
                    player.currDir = dirKey
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
                const lastId = player.activeSubscriptions.pop()
                player.activeSubscriptions.forEach((intervalObservable) => intervalObservable.unsubscribe())
                player.activeSubscriptions = [lastId]
            }),
        )
        .subscribe() // Asociamos jugador (Observer) al Observable
    
    // Observable para determinar si el jugador colisiona con un fantasma
    player.ghostSubscription = interval(PLAYER_INTERVAL_LENGTH)
        .pipe(
            // Verificamos si el jugador se intersecta con cualquier fantasma
            filter(_ => GAME.ghosts.some(
                ghost => checkCollisionPlayerGhosts(player.x, player.y, ghost.x, ghost.y)
            )),
            // Si es así, eliminamos al jugador de la sesión y lo desuscribimos del Observable de movimiento
            tap(_ => {
                GAME.players = GAME.players.filter(p => p.name !== player.name)
                player.activeSubscriptions.forEach((intervalObservable) => intervalObservable.unsubscribe())
                MovementObservable.unsubscribe()
            })
        )
        .subscribe()
}

// Función para inicializar un fantasma enemigo
function createGhost(color, startPosX, startPosY, initialDirection) {
    let ghost = {
        x: startPosX * CELL_SIZE,
        y: startPosY * CELL_SIZE,
        direction: initialDirection,
        subscription: null,
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

// Función para agregar fantasma a la sesión del juego
function addGhostToGame(ghost) {
    GAME.ghosts.push(ghost)
    GAME.draw()

    // Observable con loop infinito (dado por el tiempo entre cada movimiento/frame)
    ghost.subscription = interval(GHOST_INTERVAL_LENGTH)
        .pipe(
            // Si fantasma se encuentra en un cruce/intersección de caminos, cambiamos de dirección al azar
            map(_ => {
                if (checkIntersection(ghost.x, ghost.y)) {
                    return GAME.directions[Math.floor(Math.random() * GAME.directions.length)]
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
            tap(_ => {
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

function startSession(grid){
    GAME.grid = grid
    board.width = CELL_SIZE * GAME.grid[0].length
    board.height = CELL_SIZE * GAME.grid.length
    createDots()
    createIntersections()
    
    interval(PLAYER_INTERVAL_LENGTH)
        .pipe(
            // Filtramos que la partida hay sido iniciada (hubieron jugadores)
            filter(_ => GAME.startedSession),
            // Filtramos que la partida haya terminado
            filter(_ => GAME.players.length == 0 || GAME.dots.length == 0),
            // Detenemos el loop infinito
            take(1),
            // Determinamos si los jugadores ganaron o perdieron
            tap(_ => {
                // Detenemos todas las subscripciones de intervalos
                GAME.ghosts.forEach(ghost => ghost.subscription.unsubscribe())
                GAME.players.forEach(player => {
                    player.ghostSubscription.unsubscribe()
                    player.activeSubscriptions.forEach(sub => sub.unsubscribe())
                })
                // Creamos la pantalla de término del juego
                ctx.fillStyle = "black"
                ctx.fillRect(0, 0, board.width, board.height)
                ctx.font = "40px Arial";
                ctx.fillStyle = "white"
                ctx.textAlign = "center";
                if (GAME.players.length == 0) { // No quedan jugadores -> Perdida
                    ctx.fillText("GAME OVER", board.width/2, board.height/2);
                } else if (GAME.dots.length == 0) { // No quedan puntos -> Victoria
                    ctx.fillText("YOU WIN", board.width/2, board.height/2);
                }
            }),
        ).subscribe()
    
}

///////////////////////////// GRID 1 ////////////////////////////////

// startSession(grid1)

// let player1 = createPlayer("Jugador 1", "yellow", 25, 15)
// let player2 = createPlayer("Jugador 2", "green", 28, 15)

// let ghost1 = createGhost("red", 2, 2, 'L')
// let ghost2 = createGhost("deepskyblue", 51, 2, 'R')
// let ghost3 = createGhost("orange", 2, 30, 'L')
// let ghost4 = createGhost("hotpink", 51, 30, 'R')

// addPlayerToGame(player1, "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight")
// addPlayerToGame(player2, "KeyW", "KeyS", "KeyA", "KeyD")
// addGhostToGame(ghost1)
// addGhostToGame(ghost2)
// addGhostToGame(ghost3)
// addGhostToGame(ghost4)

// // let ghost5 = createGhost("purple", 13, 2, 'L')
// // addGhostToGame(ghost5)
// // let ghost6 = createGhost("brown", 40, 2, 'R')
// // addGhostToGame(ghost6)
// // let ghost7 = createGhost("grey", 17, 2, 'R')
// // addGhostToGame(ghost7)
// // let ghost8 = createGhost("darkgreen", 37, 2, 'L')
// // addGhostToGame(ghost8)

///////////////////////////// GRID 2 ////////////////////////////////

startSession(grid2)

let player1 = createPlayer("Jugador 1", "yellow", 20, 15)
let player2 = createPlayer("Jugador 2", "green", 23, 15)

let ghost1 = createGhost("red", 2, 2, 'L')
let ghost2 = createGhost("deepskyblue", 41, 2, 'R')
let ghost3 = createGhost("orange", 2, 15, 'L')
let ghost4 = createGhost("hotpink", 41, 15, 'R')

addPlayerToGame(player1, "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight")
addPlayerToGame(player2, "KeyW", "KeyS", "KeyA", "KeyD")
// addGhostToGame(ghost1)
// addGhostToGame(ghost2)
// addGhostToGame(ghost3)
// addGhostToGame(ghost4)