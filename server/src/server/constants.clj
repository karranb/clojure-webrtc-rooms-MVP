(ns server.constants)

(def titles {
  :connected "CONNECTED"
  ; :set-name "SET-NAME"
  :get-id "GET-ID"
  :create-room "CREATE-ROOM"
  :create-room-fail "CREATE-ROOM-FAIL"
  :close-room "CLOSE-ROOM"
  :get-rooms "GET-ROOMS"
  :connection-request "CONNECTION-REQUEST"
  :connection-answer "CONNECTION-ANSWER"
  :connection-success "CONNECTION-SUCCESS"
  :connection-closed "CONNECTION-CLOSED"
})

(def user-room-status {
  :requesting "REQUESTING"
  :connected "CONNECTED"
})