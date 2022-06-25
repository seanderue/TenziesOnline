import React, {useEffect} from "react"
import Die from "./Die"
import {nanoid} from "nanoid"
import Confetti from "react-confetti"

export default function Tenzies({ roomState, boardDice, boardOwner, boardId, socket, user, getBoardIndexByUsername})
{
    const dummyData = {
        "boards": [
        { value: 'B', isHeld: false, id: 'GDv5ZmurWoFlsPHLNmMDT' },
        { value: 'E', isHeld: false, id: 'V-X4S97scUSjIGbsoA6PE' },
        { value: 'G', isHeld: false, id: '2__zG59DoNL9oKlPLc9FN' },
        { value: 'I', isHeld: false, id: 'b8eBjfKbVkIeYegDHoraM' },
        { value: 'N', isHeld: false, id: 'Z_OoIv3AtdCcK-BDWH3Bu' },
        { value: '', isHeld: false, id: 'YiT8q8g9sfEKDJ4G-1Pb8' },
        { value: '', isHeld: false, id: 'rS-2dF9uVXbAp4inl699N' },
        { value: '', isHeld: false, id: 'thFAgcUdIBJtYYT0ii4WW' },
        { value: '', isHeld: false, id: 'yl1MdPaUPSRnuNIQqpuYa' },
        { value: '', isHeld: false, id: 'qt18T5dAo7sRQin9B4n2o' }]
    }

    const [dice, setDice] = React.useState(boardDice)
    const [tenziesWin, setTenzies] = React.useState(false)

    function initalizeDiceData()
    {   
        if (roomState !== undefined)
        {
            setTimeout(()=> {
                return roomState.boards[0].dice
            }, 500)    
        }
        else
        {
            return (null)
            // return (allNewDice())
        }
    }

    React.useEffect(() => {
        const allHeld = dice?.every(die => die.isHeld)
        const firstValue = dice? dice[0].value : 0
        const allSameValue = dice?.every(die => die.value === firstValue)
        if (allHeld && allSameValue) {
            setTenzies(true)
            socket.emit("tenziesWin", user)
        }
    }, [dice])
    
    function rollDice() {
        socket.emit('rollDice', user)
    }
    
    //On rollDice Event
    useEffect(() => {
      
        const eventHandler = (updatedBoard) => {
            if (updatedBoard.id === boardId)
            {
                setDice(updatedBoard.dice)
            }
        }

        socket.on('rollDice', eventHandler)
    
        // Unsubscribe from event for preventing memory leaks
        return () => {
            socket.off('rollDice', eventHandler)
      }
    }, [])
    

    function holdDice(id) {
        socket.emit('holdDice', user, id)
    }

    //On holdDice Event
    useEffect(() => {
      
        const eventHandler = (updatedBoard) => 
        {
            if (updatedBoard.id === boardId)
            {
                setDice(updatedBoard.dice)
            }
        }

        socket.on('holdDice', eventHandler)
    
        //Unsubscribe from event for preventing memory leaks
        // return () => {
        //     socket.off('holdDice', eventHandler)
        //   }
    }, [])

    //On createBoard event
    useEffect(() => {
      
        const eventHandler = (updatedDice, board) => {
            setDice(updatedDice)
            console.log('board recieved:')
            console.log(board)
        }

        socket.on('createBoard', eventHandler)
    
        //Unsubscribe from event for preventing memory leaks
        return () => {
            socket.off('createBoard', eventHandler)
      }
    }, [])

    const diceElements = Array.from(dice).map(die => (
        <Die 
            key={die.id} 
            value={die.value} 
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
        />
    ))

    // const WIPdiceElements = Array.from(roomState.boards[getBoardIndexByUsername(user)].dice).map(die => (
    //     <Die
    //         key={die.id}
    //         value={die.value}
    //         isHeld={die.isHeld}
    //         holdDice = {() => holdDice(die.id)}
    //     />
    // ))

    // function diagHandler()
    // {
    //     setTimeout(()=> {
    //         console.log(roomState.boards[0].dice)
    //     }, 500)
    // }

    console.log("roomState")
    console.log(roomState)
    console.log("roomState.boards")
    console.log(roomState.boards)
    
    const userOwnsBoard = () => {
        console.log('userOwnsBoard:')
        console.log(user === boardOwner? true : false)
        return user === boardOwner? true : false
    }

    return(
        <div className={userOwnsBoard() ? "game-container owner": "game-container"}>
            {tenziesWin && <Confetti />}
            <div className="owner-tag-container">
                <p className="owner-tag"> Board owner: {boardOwner}</p>
            </div>
            
            <div className={userOwnsBoard() ? "dice-container owner": "dice-container"}>
                {diceElements}
            </div>
            {
                userOwnsBoard() && 
                <button 
                    className="roll-dice" 
                    onClick={rollDice}
                >
                {tenziesWin ? "New Game" : "Roll"}
                
                </button>
            }
            {/* <button onClick={diagHandler}> Log dice</button> */}
        </div>
    )
}