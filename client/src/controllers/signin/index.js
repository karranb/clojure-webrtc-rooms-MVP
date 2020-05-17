import { TITLES } from '_constants'
import SignInScreen from '_views/signin'

const SigninController = ({ $game, stateManager, sendSocketMessage, setSocketListener }) => {
  
  const sendGetId = () => {
    const data = {
      title: TITLES.GET_ID,
    }
    sendSocketMessage(data)
  }
  
  const sendSetName = name => {
    stateManager.updateUser(user => user.setName(name))
    sendGetId()
    // stateManager.setUser(stateManager.getUser().setName(name)) 
    // stateManager.webStateMachineSend('CONFIRM')
    // const data = {
    //   title: TITLES.SET_NAME,
    //   name,
    // }
    // sendSocketMessage(data)
  }

  // const onMessage = ({ data }) => {
    // const parsedData = JSON.parse(data)
    // switch (parsedData.title) {
    //   case TITLES.SET_NAME:
    //     stateManager.setUser(stateManager.getUser().setName(parsedData.name))
    //     stateManager.webStateMachineSend('CONFIRM')
    //     return
    // }
  // }

  // setSocketListener(onMessage)

  const onMessage = ({ data }) => {
    const parsedData = JSON.parse(data)
    switch (parsedData.title) {
      case TITLES.GET_ID:
        stateManager.updateUser(user => user.setId(parsedData.id))
        // stateManager.setUser(stateManager.getUser().setName(parsedData.name))
        stateManager.webStateMachineSend('CONFIRM')
        return
    }
  }

  setSocketListener(onMessage)

  SignInScreen({ $game, sendSetName })
}

export default SigninController
