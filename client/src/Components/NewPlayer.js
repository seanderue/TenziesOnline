import React, { useEffect, useState, useContext } from "react"

export default function NewPlayer(props)
{


    return (
        <>
            <form
                onSubmit={ (event) => {
                    event.preventDefault()
                    console.log(`Username is ${props.username}`)
                    console.log(`Room is ${props.room}`)
                    props.setUser(props.username)
                    props.connectRoom(props.room, props.username)
                    console.log(`${props.user} submitted form`)
                }}
            >
                <input
                    id="display-name--input"
                    type="text"
                    autoComplete="off"
                    autoFocus
                    placeholder="Display Name"
                    onChange={(e) => props.setUsername(e.target.value)}
                />

                <input
                    id="room-name--input"
                    type="text"
                    autoComplete="off"
                    placeholder="Room name"
                    onChange={(e) => props.setRoom(e.target.value)}
                />

                <button> Submit </button>
            </form>
        </>
    )
}