const DEFAULT = {
  id: null,
  isHost: false,
  name: null,
  connectionId: null,
}

const User = (state = DEFAULT) => ({
  setId: id => User({ ...state, id }),
  setName: name => User({ ...state, name }),
  setIsHost: isHost => User({ ...state, isHost }),
  setConnectionId: connectionId => User({ ...state, connectionId }),
  getId: () => state.id,
  getName: () => state.name,
  getIsHost: () => state.isHost,
  getConnectionId: () => state.connectionId,
})

export default User
