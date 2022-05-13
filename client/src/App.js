import React from "react"

//Components
import SocketClient from './Components/SocketClient.js';
import Tenzies from "./Components/Tenzies";
import NewPlayer from "./Components/NewPlayer";
import RoomInput from "./Components/RoomInput";

export default function App() {

    const ENDPOINT = 'http://localhost:3002'

    // Player state

    const [receivedData, setReceivedData] = React.useState(false)
    // const [roomState, setRoomState] = React.useState({})
    const [username, setUsername] = React.useState("")
    const [user, setUser] = React.useState("")
    const [socket, setSocket] = React.useState(null)
    const [room, setRoom] = React.useState("")

    function sendUserToDatabase(userSent)
    {
        socket?.emit("newUser", userSent)
    }

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
    

    //BREADCRUMB: Moved socket "newUser" event to newPlayer component
        //!!!Testing removing this hook to stop doubling users
    // React.useEffect(() =>
    // {
    //     sendUserToDatabase(user)
    //     console.log(`newUser event emitted from ${user}`)
    // }, [socket, user])
    
    React.useEffect(()=> {
        socket?.on('connectRoom', (msg) => console.log(msg))
    }, [socket])

    React.useEffect(()=>{
        if(socket) {
            socket.on('startGame', (roomData) => {
                setReceivedData(true)
            })
        }
    }, [socket])

    function startGame() {
        
        console.log(`room: ${room}`)
        console.log(`socket:`)
        console.log(socket)
        console.log(`socket truthiness: ${socket? true: false}`)

        socket.emit('startGame', room, user)
    }

    return (
        <main>
            <RoomInput 
                room = {room}
                setRoom = {setRoom}
                connectRoom = {connectRoom}
            />
            {user && receivedData ? 
                <>
                    <Tenzies
                        socket = {socket}
                        user = {user}
                    />
                    <Tenzies
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
                    sendUserToDatabase = {sendUserToDatabase}
                    connectRoom = {connectRoom}
                />

            }
        <button onClick={startGame}> Start Game </button>
        <h1>Room: {room} </h1>
        </main>
    )
}