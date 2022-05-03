import React from "react"

export default function RoomInput(props)
{


    return (
        <>
            <form
                onSubmit={ (event) => {
                    event.preventDefault()
                    props.connectRoom(props.room)
                    console.log(`Attempting connection to ${props.room}`)
                }}
            >
                <input
                    id="room-name--input"
                    type="text"
                    autoComplete="off"
                    placeholder="Room name"
                    onChange={(e) => props.setRoom(e.target.value)}
                />
            </form>
        </>
    )
}