import React from "react"

//Components
import SocketClient from './Components/SocketClient.js';
import Tenzies from "./Components/Tenzies";
import NewPlayer from "./Components/NewPlayer";
import { connect } from "socket.io-client";
import RoomInput from "./Components/RoomInput";

export default function App() {

    const ENDPOINT = 'http://localhost:3001'

    // Player state
    
    const [roomState, setRoomState] = React.useState(null)
    const [username, setUsername] = React.useState("")
    const [user, setUser] = React.useState("")
    const [socket, setSocket] = React.useState(null)
    const [room, setRoom] = React.useState("")


    function connectRoom(room, user) {
        socket?.emit("connectRoom", room, user)
        console.log("connectRoom triggered")
    }

    // Socket events
    React.useEffect(() =>
    {
        // On mount initialize the socket connection
        setSocket(SocketClient)

        // Dispose gracefully
        return () => {
            if (socket) socket.disconnect()
        }
    }, [])

    // This will eventually be the "update game-state" useEffect hook
    // React.useEffect(() => 
    // {
    //     if (socket) {
    //         socket.on('opponentMove', (clients) => {
    //             setGamestate(clients)
    //         })
    //     }

    // }, [socketClient])

    React.useEffect(() =>
    {
        socket?.emit("newUser", user)
        console.log(`newUser event emitted from ${user}`)
    }, [socket, user])
    
    React.useEffect(()=> {
        if(socket) {
            socket.on('connectRoom', (msg) => console.log(msg))
        }
    }, [socket])

    React.useEffect(()=>{
        if(socket) {
            socket.on('startGame', (roomData) => {
                setRoomState(roomData)
                setTimeout(()=> console.log(roomState), 5000)
                })
        }
    }, [socket])

    function startGame() {
        console.log(room)
        socket.emit('startGame', (room))
    }

    return (
        <main>
            <RoomInput 
                room = {room}
                setRoom = {setRoom}
                connectRoom = {connectRoom}
            />
            {user ? 
                <>
                    <Tenzies
                        roomState = {roomState}
                        socket = {socket}
                        user = {user}
                    />
                    <Tenzies
                        roomState = {roomState}
                        socket = {socket}
                        user = {user}
                    />
                </>
            :
                <NewPlayer 
                    setUser = {setUser}
                    user = {user}
                    setUsername = {setUsername}
                    username = {username}
                    setRoom = {setRoom}
                    room = {room}
                    connectRoom = {connectRoom}
                />

            }
        <button onClick={startGame}> Start Game </button>
        <h1>Room: {room} </h1>
        </main>
    )
}