const board = document.getElementById("pacman-board");

let grid = [
    ["■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■"],
    ["■"," "," "," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," "," "," ","■"],
    ["■"," "," "," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," "," "," ","■"],
    ["■"," "," ","■","■","■"," "," ","■","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■","■"," "," ","■"," "," ","■","■","■","■"," "," ","■","■","■"," "," ","■"],
    ["■"," "," ","■","■","■"," "," ","■","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■","■"," "," ","■"," "," ","■","■","■","■"," "," ","■","■","■"," "," ","■"],
    ["■"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","■"],
    ["■"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","■"],
    ["■"," "," ","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■","■"," "," ","■"," "," ","■","■","■"," "," ","■"],
    ["■"," "," "," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," "," "," ","■"],
    ["■"," "," "," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," "," "," ","■"],
    ["■","■","■","■","■","■"," "," ","■"," "," ","■"," "," ","■"," "," ","■","■","■","■","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■","■"," "," ","■"," "," ","■"," "," ","■"," "," ","■","■","■","■","■","■"],
    ["■","■","■","■","■","■"," "," ","■"," "," ","■"," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," ","■"," "," ","■"," "," ","■","■","■","■","■","■"],
    ["■","■","■","■","■","■"," "," ","■"," "," ","■"," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," ","■"," "," ","■"," "," ","■","■","■","■","■","■"],
    ["■","■","■","■","■","■"," "," ","■"," "," ","■"," "," ","■","■","■","■"," "," ","■"," "," ","■","■"," "," "," ","■","■"," "," ","■"," "," ","■","■","■","■"," "," ","■"," "," ","■"," "," ","■","■","■","■","■","■"],
    ["■"," "," "," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," "," "," ","■"],
    ["■"," "," "," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," "," "," ","■"],
    ["■","■","■","■","■","■"," "," ","■"," "," ","■","■","■","■"," "," ","■","■","■","■"," "," ","■","■","■","■","■","■","■"," "," ","■","■","■","■"," "," ","■","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■"],
    ["■","■","■","■","■","■"," "," ","■"," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," ","■"," "," ","■","■","■","■","■","■"],
    ["■","■","■","■","■","■"," "," ","■"," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," ","■"," "," ","■","■","■","■","■","■"],
    ["■","■","■","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■"],
    ["■"," "," "," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," "," "," ","■"],
    ["■"," "," "," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," "," "," ","■"],
    ["■"," "," ","■","■","■"," "," ","■","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■","■"," "," ","■"," "," ","■","■","■","■"," "," ","■","■","■"," "," ","■"],
    ["■"," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," ","■"],
    ["■"," "," "," "," ","■"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","■"," "," "," "," ","■"],
    ["■","■","■"," "," ","■"," "," ","■"," "," ","■","■","■","■","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■","■"," "," ","■"," "," ","■"," "," ","■","■","■"],
    ["■"," "," "," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," "," "," ","■"],
    ["■"," "," "," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," ","■"," "," "," "," "," "," "," ","■"],
    ["■"," "," ","■","■","■","■","■","■","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■","■"," "," ","■"," "," ","■","■","■","■","■","■","■","■","■"," "," ","■"],
    ["■"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","■"],
    ["■"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","■"],
    ["■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■","■"],
]

const CELL_SIZE = 20
const DOT_RADIUS = CELL_SIZE * 0.1
const PLAYER_RADIUS = CELL_SIZE * 0.75

board.width = CELL_SIZE * grid[0].length
board.height = CELL_SIZE * grid.length

const ctx = board.getContext("2d")

let walls = []

function drawBoard() {
    for(let row = 0; row < grid.length; row++) {
        for(let col = 0; col < grid[0].length; col++) {
            if ([" ", "X", "O"].includes(grid[row][col])) {
                ctx.fillStyle = "#000000"
            } else {
                walls.push([col, row])
                ctx.fillStyle = "#0000A6" //#000080 #0000CD
            }
            ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        }
    }
}

let dots = []

for(let row = 1; row < grid.length; row++) {
    for(let col = 1; col < grid[0].length; col++) {

        let cellUpLeft = grid[row-1][col-1] == " "
        let cellLeft = grid[row][col-1] == " "
        let cellRight = grid[row-1][col] == " "
        let currCell = grid[row][col] == " "

        if (cellUpLeft && cellLeft && cellRight && currCell) {
            dots.push([col, row])
        }
    }
}

function drawDots() {
    // ctx.fillStyle = '#00a308' //#964b4b
    for(let i = 0; i < dots.length; i++) {
        let dot = dots[i]
        let dotCenterX = dot[0] * CELL_SIZE
        let dotCenterY = dot[1] * CELL_SIZE
        ctx.beginPath();
        ctx.arc(dotCenterX, dotCenterY, DOT_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = "white"
        ctx.fill()
    }
}

// Basado en https://stackoverflow.com/a/16012490
function rectanglesIntersect(minAx, minAy, minBx, minBy) {
    let maxAx = minAx+1
    let maxAy = minAy+1
    let maxBx = minBx+2
    let maxBy = minBy+2
    let aLeftOfB = maxAx <= minBx;
    let aRightOfB = minAx >= maxBx;
    let aAboveB = minAy >= maxBy;
    let aBelowB = maxAy <= minBy;

    return !( aLeftOfB || aRightOfB || aAboveB || aBelowB );
}

function checkCollision(x, y) {
    let playerCol = (x / CELL_SIZE) - 1
    let playerRow = (y / CELL_SIZE) - 1
    for(let i = 0; i < walls.length; i++){
        let wall = walls[i]
        let wallCol = wall[0]
        let wallRow = wall[1]
        if (rectanglesIntersect(wallCol, wallRow, playerCol, playerRow)){
            return false
        }
    }
    return true
}

// Basado en https://stackoverflow.com/a/68841877
function circlesIntersect(dotX, dotY, playerX, playerY) {
    return Math.hypot(dotX-playerX, dotY-playerY) <= DOT_RADIUS + PLAYER_RADIUS
}

function checkDotCollection(x, y) {
    for(let i = 0; i < dots.length; i++){
        let dot = dots[i]
        let dotX = dot[0] * CELL_SIZE
        let dotY = dot[1] * CELL_SIZE
        if (circlesIntersect(dotX, dotY, x, y)){
            dots = dots.filter(item => item !== dot)
            drawDots()
        }
    }
}