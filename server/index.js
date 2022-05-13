import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
import {nanoid} from "nanoid"

const l = (any) =>
{
    console.log(any)
}

const app = express()
const server = http.createServer(app)
app.use(cors())

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
})

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})


/**
 *  Storing online users & parsing gamestate data
 */

let onlineUsers = []

const addNewUser = (username, socketId) =>
{
    !onlineUsers.some((user) => user.username === username) && 
    onlineUsers.push({ username, socketId, "currentRoom": null })
}

const removeUser = (socketId) =>
{
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId)
}

const getUserByUsername = (username) =>
{
    return onlineUsers.find((user) => user.username === username)
}

// I don't think this works.
const getUserBySocket = (socketId) =>
{
    return onlineUsers.find((user) => user.socketId === socketId)
}

const getBoardByUsername = (username) =>
{
    //Diag
    //     l("let's see what's broken")
    //     l(`username passed: ${username}`)
    //     //Checks out
    // l("")
    //     l("gameState:")
    //     l(gameState)
    //     //Checks out
    // l("")
    //     l("gameState.rooms[getRoomIndexByUsername(username):")
    //     l(gameState.rooms[getRoomIndexByUsername(username)])
    //     //Checks out
    // l("")
    //     l("getRoomIndexByUsername(username):")
    //     l(getRoomIndexByUsername(username))
    //     //Checks out
    // l("")
    //     l("gameState.rooms[getRoomIndexByUsername(username).boards[getBoardIndexByOwner(username):")
    //     l(gameState.rooms[getRoomIndexByUsername(username)].boards[getBoardIndexByOwner(username)])
    //     //broken
    // l("")
    //     l("getBoardIndexByOwner:")
    //     l(getBoardIndexByOwner(username))
    //     //


    return gameState.rooms[getRoomIndexByUsername(username)].boards[getBoardIndexByUsername(username)]
}

const getRoomByUsername = (username) =>
{
    return gameState.rooms[getRoomIndexByUsername(username)]
}

const getPlayerByUsername = (username) =>
{
    const room = getRoomByUsername(username)
    
    for (let player in room.players)
    {
        if (player.user === username) return player
    }
}

const getPlayerIndexByUsername = (username) =>
{
    const room = getRoomByUsername(username)
    let scanner = 0

    for (player in room.players)
    {
        if (player.user === username) return scanner
        scanner++
    }
}



const userEnterRoom = (username, room) =>
{  
    if(username != undefined && getUserByUsername(username) != undefined)
    {
        const user = getUserByUsername(username)
        user.currentRoom = room
        console.log(`updating ${user.username}'s current room to ${room}`)
    }
    else
    {
        console.log(`user ${username} doesn't exist`)
        return
    }

}



const getRoomIndexByRoomId = (roomId) =>
{
    return gameState.rooms.findIndex((room) => room.id === roomId)
}

const getRoomIndexByUsername = (username) =>
{
    const user = getUserByUsername(username)

    //diag:
        // console.log(`printing the whole onlineUsers array`)
        // console.log(onlineUsers)
        // console.log(`attempting to print user`)
        // console.log(user)
        // console.log(`Username passed is: ${username}`)

    return gameState.rooms.findIndex((room) => room.id === user.currentRoom)
}

const getBoardIndexByUsername = (username) =>
{
    return gameState.rooms[getRoomIndexByUsername(username)].boards.findIndex((board) => board.owner === username)
}


/**
 * Game functions
 */

    let gameState = {
        "rooms": 
        [{
            "id": "dummy",
            "hasWinner": false,
            "players": 
            [{
                "user": "Sean",
                "abilities":
                    [{
                        "name": "freeze",
                        "hasUsed": false, 
                    },
                    {
                        "name": "shuffle",
                        "hasUsed": false,
                    }
                    ],
                "score": 456,
                "hasWon": false,
            },
            {
                "user": "Ryan",
                "abilities": 
                    [{
                        "name": "nuke",
                        "hasUsed": false, 
                    }],
                "score": 157,
                "hasWon": false,
            }],
            "diceCount": 25,
            "boards": [{
                "id": "nanoid",
                "dice": {"value": 0, "id": 1203, "isHeld": false} //x25
            }]
        }]     
    }


 function generateNewDie() {
    return {
        value: Math.ceil(Math.random() * 6),
        isHeld: false,
        id: nanoid()
    }
}

function allNewDice(diceCount) {
    const newDice = []
    for (let i = 0; i < diceCount; i++) {
        newDice.push(generateNewDie())
    }
    return newDice
}

//Diag function used because the rollDice function has logs it's own updated dice
    // function checkDice(username) {
    //     const room = getRoomByUsername(username)
    //     const board = getBoardByUsername(username)
        
    //     //Diag
    //     l(`checkDice:`)
    //     l(`room data received:`)
    //     l(room)
    //     l(`board data received:`)
    //     l(board)
    // }

function rollDice(username) {
    const room = getRoomByUsername(username)
    const board = getBoardByUsername(username)
    
    //Diag
    l(`room data received:`)
    l(room)
    l(`board data received:`)
    l(board)

    const player = getPlayerByUsername(username)
    if(!room.hasWinner)
    {
        board.dice = board.dice.map(die => {
                    return die.isHeld ?
                    die :
                    generateNewDie()
                    })  

    } else {
        player.hasWon = false
        board.dice = allNewDice()
    }
}

function holdDice(roomId, dieId) {
    roomId.boards[0].dice = dice.map(die => {
        return die.id === dieId ?
            {...die, isHeld: !die.isHeld} :
            die
    })
}

function createNewRoom(roomId, diceCount, user)
{
    gameState.rooms.push(
        {
            "id": roomId,
            "hasWinner": false,
            "players": 
            [{
                //Dummy data...delete later
                "user": "dummyData",
                "abilities": [],
                "score": 0,
                "hasWon": false,
            },
            {
                user
            }],
            "diceCount": diceCount,
            "boards": [{
                "owner": user.username,
                "id": nanoid(),
                "dice": allNewDice(diceCount)
            }]
        }
    )

    console.log("New game room created")
    logGamestate(1, 0, 1)

}

function addPlayerToRoom(roomId, username)
{
    const room = gameState.rooms[getRoomIndexByRoomId(roomId)]
    room.players.push(getUserByUsername(username))
    l(`testing room variable:`)
    l(room)
}

function logGamestate(roomIndex, boardsIndex, playersIndex)
{
    console.log(`Full gamestate:`)
    console.log(gameState)
    console.log(`Players Array:`)
    console.log(gameState.rooms[roomIndex].players[playersIndex])
    console.log(`boards array:`)
    console.log(gameState.rooms[roomIndex].boards[boardsIndex])
    // console.log(`dice array:`)
    // console.log(gameState.room[roomIndex].boards[boardsIndex].dice)
}


function updatePlayer(username, property, newValue)
{
    const player = getPlayerByUsername(username)

    switch(property)
    {
        case "user":
            player.user = newValue
        case "abilities":
            player.abilities = newValue
        case "score":
            player.score = newValue
        case "hasWon":
            player.hasWon = newValue
        default:
            console.log(`The ${property} property is not recognized`)
    }

}



/**
 *  Socket Events
 */

io.on('connect', (socket) => {
    console.log(`A new client has connected: ${socket.id}`)
    // console.log(onlineUsers)

    socket.on('newUser', (username) => 
    {
        if (username !== "")
        {
            addNewUser(username, socket.id)
            console.log(`New user, ${username}, added`)
            console.log(onlineUsers)
        }
        //Need to add username validation
    })

    socket.on('connectRoom', (roomId, username) => {
        //TODO: Check if the room exists, if not, create a new one
        if (gameState.rooms.find((room) => {
            if(room.id == roomId)
            return true
        }))
        {
            l('Inside "includes roomId" conditional')
            userEnterRoom(username, roomId)
            addPlayerToRoom(roomId, username)
            socket.join(roomId)
            const roomIndex = gameState.rooms.findIndex(room => room.id === roomId)
            io.to(roomId).emit('startGame', gameState.rooms[roomIndex])   
        }
        else
        {
            l('Outside "includes roomId" conditional')
            createNewRoom(roomId, 10, getUserBySocket(socket.id))
            userEnterRoom(username, roomId)
            socket.join(roomId)
            const roomIndex = gameState.rooms.findIndex(room => room.id === roomId)
            io.to(roomId).emit('startGame', gameState.rooms[roomIndex])
        }

        console.log(`Full user details:`)
        console.log(getUserByUsername(username))

        io.to(roomId).emit('connectRoom', `You've connected to room ${roomId}`)
    })

    socket.on('disconnect', () =>
    {
        console.log(`user ${socket.id} disconnected`)
        removeUser(socket.id)

        // Will have to update playerState here eventually
    })

    socket.on('tenziesWin', (user) =>
    {
        console.log(`user ${user} has won Tenzies`)
    })

    socket.on('startGame', (roomId, username) => 
    {
        createNewRoom(roomId, 10, getUserByUsername(username))

        setTimeout(() => {
            //changed before functioning
            const roomIndex = getRoomIndexByRoomId(roomId)
            console.log("This is the object emitted:")
            console.log(gameState.rooms[roomIndex])
            io.to(roomId).emit('startGame', gameState.rooms[roomIndex])
        }, 150)

    })

    socket.on('rollDice', (username) =>
    {
        // checkDice(username)
        const room = getRoomByUsername(username)
        const board = getBoardByUsername(username)
        const roomIndex = getRoomIndexByUsername(username)
        const boardIndex = getBoardIndexByUsername(username)

        
        console.log(`Attempting to rollDice according to username: ${username}`)
        
        rollDice(username)
        console.log(`using logGamestate`)
        logGamestate(roomIndex, boardIndex, room.players.length - 1) //Temp logging player at i=0
        
        // console.log(`Logging rollDice(username)`)
        // console.log(rollDice(username))

        l(`Emitting the following board.dice:`)
        l(board.dice)
        io.to(room.id).emit('rollDice', board.dice)
    })
})

server.listen(3002, () => {
    console.log('listening on *:3002')
})