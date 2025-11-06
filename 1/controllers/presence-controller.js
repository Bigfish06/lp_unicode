const updatePresence=(io)=>{
    // storage
    // Map<documentId, Map<clientId, {userId, lastActiveAt}> > 
    const presence = new Map()

    // lets us have socket connections
    io.on("connection",(socket)=>{        
        // everytime a client connects, we give them a unique socket.id
        console.log(`Socket connected, id: ${socket.id}`)


        // ------------
        // UPON JOINING
        // ------------
        socket.on('joinDoc',({documentId, userId})=>{
            // add it to our map of docs->users
            if(!presence.has(documentId))
            {
                presence.set(documentId, new Map())
            }

            const documentPresence = presence.get(documentId)
            documentPresence.set(socket.id,{userId: userId, lastActiveAt: Date.now()})

            // join the user(socket) to its room (chararcterized by documentId)
            socket.join(documentId)

            // we broadcast the list of connected users to all users in the room
            // before that, we assemble the details into an array
            let usersArray=[]
            for(const [clientId,value] of documentPresence)             // for maps, we use "of" instead of "in"
            {
                usersArray.push({
                    clientId: clientId, 
                    userId: value.userId,
                    lastActiveAt: value.lastActiveAt
                })
            }

            io.to(documentId).emit("presence:update", {
                documentId: documentId,
                users: usersArray
            });

            console.log(`Document: ${documentId}, joined by: ${socket.id}`)
        })


        // ---------
        // HEARTBEAT
        // ---------
        socket.on('heartbeat',({documentId})=>{
            const documentPresence = presence.get(documentId)
            if(!documentPresence)return
            const user=documentPresence.get(socket.id)
            if(user)
            {
                const currentTime=Date.now()
                if(currentTime-user.lastActiveAt>60000)         // 60000 ms = 1min
                user.lastActiveAt=Date.now()
            }
        })


        // ------------
        // UPON LEAVING
        // ------------
        socket.on('leaveDoc',({documentId})=>{
            const documentPresence = presence.get(documentId)
            if(!documentPresence)return
            // leave the doc
            documentPresence.delete(socket.id)
            // leave the room
            socket.leave(documentId)

            // updated users array
            let usersArray=[]
            for(const [clientId,value] of documentPresence)         
            {
                usersArray.push({
                    clientId: clientId, 
                    userId: value.userId,
                    lastActiveAt: value.lastActiveAt
                })
            }

            // remove from the map if empty
            if(documentPresence.size===0)
            {
                presence.delete(documentId)
            }

            io.to(documentId).emit("presence:update", {
                documentId: documentId,
                users: usersArray
            });

            console.log(`Document: ${documentId}, left by: ${socket.id}`)
        })

        // -------------------------
        // DISCONNECT THEM OURSELVES 
        // -------------------------
        socket.on('disconnect',()=>{
            // when user didn't disconnect manually
            // we search in all docs and remove wherever we find them
            console.log(`Disconnected: ${socket.id}`)

            for(const [documentId, documentPresence] of presence.entries())
            {
                if(documentPresence.has(socket.id))
                {
                    documentPresence.delete(socket.id)
                    if(documentPresence.size===0)
                    {
                        presence.delete(documentId)
                    }

                    // as there is a change, we'll update our users list
                    let usersArray=[]
                    for(const [clientId,value] of documentPresence)         
                    {
                        usersArray.push({
                            clientId: clientId, 
                            userId: value.userId,
                            lastActiveAt: value.lastActiveAt
                        })
                    }

                    //and broadcast
                    io.to(documentId).emit("presence:update", {
                        documentId: documentId,
                        users: usersArray
                    });
                }
            }
        })
    })
}

module.exports={updatePresence}