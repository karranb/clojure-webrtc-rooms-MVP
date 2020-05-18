import RoomScreen from '_views/room'
import ClientController from './client'
import HostController from './host'

const RoomController = (props) => {
  const Controller = props.stateManager.getUser().getIsHost() ? HostController : ClientController
  Controller(props)
}

export default RoomController
