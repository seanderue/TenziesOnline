import React from "react"
import Die from "./Die"
import {nanoid} from "nanoid"
import Confetti from "react-confetti"

export default function Tenzies(props)
{
    const dummyData = {
        "boards": [
        { value: 6, isHeld: false, id: 'GDv5ZmurWoFlsPHLNmMDT' },
        { value: 3, isHeld: false, id: 'V-X4S97scUSjIGbsoA6PE' },
        { value: 1, isHeld: false, id: '2__zG59DoNL9oKlPLc9FN' },
        { value: 5, isHeld: false, id: 'b8eBjfKbVkIeYegDHoraM' },
        { value: 2, isHeld: false, id: 'Z_OoIv3AtdCcK-BDWH3Bu' },
        { value: 5, isHeld: false, id: 'YiT8q8g9sfEKDJ4G-1Pb8' },
        { value: 6, isHeld: false, id: 'rS-2dF9uVXbAp4inl699N' },
        { value: 3, isHeld: false, id: 'thFAgcUdIBJtYYT0ii4WW' },
        { value: 1, isHeld: false, id: 'yl1MdPaUPSRnuNIQqpuYa' },
        { value: 5, isHeld: false, id: 'qt18T5dAo7sRQin9B4n2o' }]
    }

    const [roomState, setRoomState] = React.useState(dummyData)
    const [dice, setDice] = React.useState(dummyData.boards)
    const [tenzies, setTenzies] = React.useState(false)
    const socket  = props.socket
    const user = props.user

    // //imported
    // React.useEffect(() => {
    //     const gameListener = (gameState) => {
    //       setMessages((prevMessages) => {
    //         const newMessages = {...prevMessages}
    //         newMessages[message.id] = message
    //         return newMessages
    //       })
    //     }

    React.useEffect(()=>{
        if(socket) {
            socket.on('startGame', (roomData) => {
                setRoomState(roomData)

                console.log("This is the data received and placed into state:")
                console.log(roomData)
            })
        }
    }, [socket])

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
            return (allNewDice())
        }
    }

    console.log(roomState.boards[0].dice)

    React.useEffect(() => {
        const allHeld = dice?.every(die => die.isHeld)
        const firstValue = dice? dice[0].value : 0
        const allSameValue = dice?.every(die => die.value === firstValue)
        if (allHeld && allSameValue) {
            setTenzies(true)
            socket.emit("tenziesWin", user)
        }
    }, [dice])

    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }
    
    function allNewDice() {
        const newDice = []
        for (let i = 0; i < 25; i++) {
            newDice.push(generateNewDie())
        }
        return newDice
    }
    
    function rollDice() {
        socket.emit('rollDice', user)

        

        //Client side rollDice
        // if(!tenzies) {
        //     setDice(oldDice => oldDice.map(die => {
        //         return die.isHeld ? 
        //             die :
        //             generateNewDie()
        //     }))
        // } else {
        //     setTenzies(false)
        //     setDice(allNewDice())
        // }
    }
    
    socket.on('rollDice', (updatedDice) => {
        setDice(updatedDice)
    })

    function holdDice(id) {
        setDice(oldDice => oldDice.map(die => {
            return die.id === id ? 
                {...die, isHeld: !die.isHeld} :
                die
        }))
    }
    
    const diceElements = Array.from(dice).map(die => (
        <Die 
            key={die.id} 
            value={die.value} 
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
        />
    ))

    function diagHandler()
    {
        setTimeout(()=> {
            console.log(roomState.boards[0].dice)
        }, 500)
    }

    return(
        <div className="game-container">
            {tenzies && <Confetti />}
            <h1 className="title">Tenzies</h1>
            <p className="instructions">Roll until all dice are the same. 
            Click each die to freeze it at its current value between rolls.</p>
            <div className="dice-container">
                {diceElements}
            </div>
            <button 
                className="roll-dice" 
                onClick={rollDice}
            >
                {tenzies ? "New Game" : "Roll"}
            </button>
            <button
            onClick={diagHandler}> Log dice</button>
        </div>
    )
}