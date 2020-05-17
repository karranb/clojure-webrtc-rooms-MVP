const DEFAULT = {
  id: null,
  isHost: false,
  name: null,
}

const User = (state = DEFAULT) => ({
  setId: id => User({...state, id}),
  setName: name => User({...state, name}),
  setIsHost: isHost => User({ ...state, isHost }),
  getId: () => state.id,
  getName: () => state.name,
  getIsHost: () => state.isHost
})

export default User
