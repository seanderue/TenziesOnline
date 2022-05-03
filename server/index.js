import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
import {nanoid} from "nanoid"

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
 *  Storing online users
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

const getUserBySocket = (socketId) =>
{
    return onlineUsers.find((user) => user.socketId === socketId)
}

const userEnterRoom = (username, room) =>
{  
    if(getUserByUsername(username) != undefined)
    {
        const user = getUserByUsername(username)
        createNewRoom(room, 10, user)
        user.currentRoom = room
        console.log(`updating ${user.username}'s current room to ${room}`)
    }
    else
    {
        console.log(`user ${username} doesn't exist`)
        return
    }

}


/**
 * Game functions
 */

    let gameState = {
        "rooms": 
        [{
            "id": "dummy",
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
                "Score": 456,
                "hasWon": false,
            },
            {
                "user": "Ryan",
                "abilities": 
                    [{
                        "name": "nuke",
                        "hasUsed": false, 
                    }],
                "Score": 157,
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

//TODO: replace array index with proper board & fix inevitable mistakes
function rollDice(roomId) {
    if(!roomId.players.user.hasWon) {
        roomId.boards[0].dice.map(die => {
            return die.isHeld ?
                die :
                generateNewDie()
        })
    } else {
        roomId.players.user.hasWon = false
        roomId.boards[0].dice = allNewDice()
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
            "players": 
            [{
                //Dummy data...delete later
                "user": "",
                "abilities": [],
                "score": 0,
                "hasWon": false,
            },
            {
                user
            }],
            "diceCount": diceCount,
            "boards": [{
                "id": nanoid(),
                "dice": allNewDice(diceCount)
            }]
        }
    )

    console.log("New game room created")
    logGamestate(1, 0, 1)

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

function getPlayer(username)
{
    const containsPlayer = (element) => element.players.includes(username)
    const roomIndex = gameState.rooms.findIndex(containsPlayer)
    const playersArray = gameState.rooms[roomIndex].players
    const player = playersArray[playersArray.findIndex(player => player.includes(playerId))]

    return player
}

function updatePlayer(username, property, newValue)
{
    const player = getPlayer(username)

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
    })

    socket.on('connectRoom', (room, username) => {
        //TODO: Check if the room exists, if not, create a new one
        
        socket.join(room)
        //May have problems later if timeout isn't long enough
        setTimeout(() => {
            userEnterRoom(username, room)
            console.log(`${getUserByUsername(username).username} connected to room ${room}`)
            console.log(`Full user details:`)
            console.log(getUserByUsername(username))
        }, 500)

        io.to(room).emit('connectRoom', `You've connected to room ${room}`)
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

    socket.on('startGame', (roomId) => 
    {
        createNewRoom(roomId, 10, getUserBySocket(socket.id))

        const roomIndex = gameState.rooms.findIndex(room => room.id === roomId)
        io.to(roomId).emit('startGame', gameState.rooms[roomIndex])
    })

})

server.listen(3001, () => {
    console.log('listening on *:3001')
})