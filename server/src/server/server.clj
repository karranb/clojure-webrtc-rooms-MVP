(ns server.server
  (:require [server.constants :refer [titles]])
  (:require [server.socket :refer [create-server message]])
  (:require [server.rooms :refer [
    create-room
    close-room
    get-rooms
    update-room
    join-room-request
    join-room-accept
    remove-connection]])
  (:require [server.helpers :refer [uuid json-to-set]]))

(def clients (atom {}))

(defn get-client [channel]
  (get @clients channel))  

(defn set-client [channel & data]
  (swap! clients assoc channel (apply merge data)))

(defn unset-client [channel]
  (swap! clients dissoc channel))

; (defn set-name [channel data]
;   (set-client channel {:name (:name data)})
;   (message channel :set-name {:name (:name data)}))

(defn get-client-data [channel key]
  (get (get-client channel) key))

(defn get-id [channel]
  (let [
      id (get-client-data channel :id)
    ]
    (message channel :get-id {:id id})))


(defn handle-on-receive [channel data-str] 
  (let [
      data (json-to-set data-str)
      data-title (:title data)
    ]
    (println data-title)
    (cond
      ; (= data-title (:set-name titles)) (set-name channel data)
      (= data-title (:get-id titles)) (get-id channel)
      (= data-title (:create-room titles)) (create-room channel (:name data) (:size data) set-client)
      (= data-title (:update-room titles)) (update-room channel (:publicInfo data) get-client)
      (= data-title (:close-room titles)) (close-room channel (:id data) set-client)
      (= data-title (:get-rooms titles)) (get-rooms channel)
      (= data-title (:connection-request titles)) (join-room-request channel data set-client)
      (= data-title (:connection-answer titles)) (join-room-accept channel data get-client)
      (= data-title (:connection-closed titles)) (remove-connection channel data set-client)
      :else (println "OTHER TITLE", data-title))))

(defn handle-on-close [channel status]
  (close-room channel (get-client-data channel :room-id) set-client)
  (unset-client channel)
  (println "channel closed: " status))

(defn handle-on-connect [channel]
  (let [id (uuid)]
    (set-client channel {:id id})
    (message channel :connected)
    (println "New Channel" id)))

(defn start-server []
  (create-server handle-on-connect handle-on-receive handle-on-close))
