(ns server.rooms
  (:require [server.socket :refer [message]])
  (:require [server.constants :refer [user-room-status]])
  (:require [server.helpers :refer [uuid parse-int]]))

(def rooms (atom {}))

(defn new-room-data [name channel id] 
  {
    :id id
    :host channel
    :name name
    :users {}
  })

(defn new-connection-data [channel offer]
  {
    :user channel
    :offer offer
    :status (:requesting user-room-status)
  })

(defn user-has-room [channel]
  (false? (empty? (filter #(= (get % :host) channel) (vals @rooms)))))

(defn get-room [id] (get @rooms id))

(defn get-users [room-id]
  (:users (get-room room-id)))

(defn get-connection [room-id connection-id]
  (get (get-users room-id) connection-id))

(defn set-room [id & data]
  (swap! rooms assoc id (merge (get-room id) (apply merge data))))

(defn set-users [room-id users]
  (set-room room-id {:users (merge (get-users room-id) users)}))

(defn set-connection [room-id connection-id & data]
  (set-users room-id {connection-id (merge (get-connection room-id connection-id) (apply merge data))}))

(defn remove-connection [channel data set-client]
  (let [{
      connection-id :connectionId
      room-id :roomId
    } data
    room (get-room room-id)
    connection (get-connection room-id connection-id)
    user-channel (:user connection)]
    (if (= (:host room) channel)
      (
        (set-room room-id {:users (dissoc (get-users room-id) connection-id)})
        (set-client user-channel {:joined-room-id nil})
        )
      (println "not a host"))))

(defn remove-room [id]
  (swap! rooms dissoc id))

(defn join-room-request [channel data set-client]
  (let [{
        room-id :roomId
        offer :offer
        connection-id :connectionId
      } data
      host (:host (get-room room-id))
      connection (new-connection-data channel offer)
    ]
    (set-connection room-id connection-id connection)
    (set-client channel {:joined-room-id room-id})
    (message host :connection-request (select-keys connection [:offer :status]) {:id connection-id})))

(defn join-room-accept [channel data get-client]
  (let [{
        connection-id :connectionId
        answer :answer
      } data
      content {
        :status (:connected user-room-status)
        :answer answer  
      }
      room-id (:room-id (get-client channel))
    ]
    (set-connection room-id connection-id content)
    (message (:user (get-connection room-id connection-id)) :connection-answer data)))

(defn create-room [channel name size set-client]
  (let [
      id (uuid)
    ]
    (if (false? (user-has-room channel))
      (do
        (set-room id (new-room-data name channel id) {:size (parse-int size)})
        (set-client channel {:room-id id})
        (message channel :create-room {:id id :name name})
      )
      (message channel :create-room-fail))))

(defn close-room [channel id set-client]
  (let [room (get-room id)]
    (if (= channel (:host room))
      (do
        (doseq [user (vals (:users room))]
          (set-client user {:joined-room-id nil}))
        (remove-room id)
        (set-client channel {:room-id nil})
        (message channel :close-room))
      (println "not host"))))

(defn get-rooms-set []
  {:rooms (map #(merge (select-keys % [:id :name :size]) {:connections (+ (count (:users %)) 1)}) (vals @rooms))})

(defn get-rooms [channel]
  (message channel :get-rooms (get-rooms-set)))
  