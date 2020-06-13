const Messages = () => {
  let messages = []
  return {
    addMessage: message => {
      messages = [...messages, message].slice(-10)
    },
    getMessages: () => messages,
  }
}

export default Messages
