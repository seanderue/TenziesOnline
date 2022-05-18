import React from 'react'
import Tenzies from './Tenzies'

export default function GameRoom({ user, room, socket}) {

    const [boardCreated, setBoardCreated] = React.useState(false)
    const [boardCount, setBoardCount] = React.useState(0)

    const roomStateRef = React.useRef({
        "boards": ["boongalo"]
    }

    )

    const getBoardIndexByUsername = (username) =>
    {
        console.log('getBoardIndexByUsername output:')
        console.log(roomStateRef.current.boards.findIndex((board) => board.owner === username))
        return roomStateRef.current.boards.findIndex((board) => board.owner === username)
    }

    React.useEffect(()=>{


        const eventHandler = (roomData) => {
            roomStateRef.current = roomData

            console.log("This is the data received and placed into state:")
            console.log(roomData)

            console.log(`roomStateRef.current`)
            console.log(roomStateRef.current)
        }

        if(socket) {

            socket.on('startGame', eventHandler)
        }

        // Unsubscribe from event for preventing memory leaks
        return () => {
            socket.off('startGame', eventHandler)
        }

    }, [])

    //On local created board
    React.useEffect(() =>
    {
        const eventHandler = (updatedDice, board) => {
            
            console.log('Updated Dice:')
            console.log(updatedDice)            
            console.log('board:')
            console.log(board)

            //push returns the number of boards in the array
            setBoardCount(roomStateRef.current.boards.push(board))
            console.log(roomStateRef.current.boards)
            
        }

        socket.on('createBoard', eventHandler)
        
        // Unsubscribe from event for preventing memory leaks
        return () => {
            socket.off('createBoard', eventHandler)
        }

    }, [])

    //On remote created board WIP
    React.useEffect(() =>
    {
        const eventHandler = (boards) => {}
    })

    function createBoard() {
        console.log(`${user} is creating a board in ${room}`)
        socket.emit('createBoard', user)
        
        setTimeout(setBoardCreated(true), 100)
    }

    console.log("GameRoom rendered & roomStateRef.current.boards:")
    console.log(roomStateRef.current.boards)

const tenziesElements = roomStateRef.current.boards?.map((board) => (
        <Tenzies
            key = {board.id}
            roomState={roomStateRef.current}
            boardDice={board.dice}
            boardOwner={board.owner}
            boardId={board.id}
            socket = {socket}
            user = {user}
            getBoardIndexByUsername = {(user) => getBoardIndexByUsername(user)}
            
        />
    ))

  return (
    <>
        {boardCreated ?
            <>
                <div>
                    {tenziesElements}
                </div>
            </>
            :
            <>
                <button onClick={createBoard}>Create Board</button>
            </>
        }
    </>
  )
}
