//add user
//remove user by id
//get user by id
//get all users in room
const users = []
const addUser = ({id, userName, room}) => {
    //VAlidate user info 
    if (!userName || !room) {
        return {error: 'Please provide username and room'}
    }
    //Clean data
    userName = userName.trim().toLowerCase()
    room = room.trim().toLowerCase()
    //Check for existing user
    const existingUser = users.find(user => {
        return user.userName === userName && user.room === room
    })
    if(existingUser) {
        return {error: 'Already exists!'}
    }
    //Store new user
    const user = {id, userName, room}
    users.push(user)
    return user
}

const removeById = (id) => {
    const userIndex = users.findIndex(user => {
        return user.id === id })
    if (userIndex !== -1) { 
        return users.splice(userIndex, 1)[0]
    }
}

const getUserById = (id) => {
    const user = users.find(user => user.id === id)
    if (user) {
        return user
    }
}

const getUsersInRoom = room => {
    room = room.trim().toLowerCase()
    const allUsers = users.filter(user => user.room === room)
    
    return allUsers
}

module.exports = {
    addUser, 
    removeById,
    getUserById,
    getUsersInRoom,
}