(ns server.socket
  (:require [org.httpkit.server :refer [send! with-channel on-close on-receive run-server]])
  (:require [server.helpers :refer [set-to-json get-title]]))

(defn message
  [channel title-key & data] 
    (send! channel (
      set-to-json (
        merge (apply merge data) {:title (get-title title-key)}))))

(defn server-handler [handle-on-connect handle-on-receive handle-on-close]
  (fn [request] (with-channel request channel
    (handle-on-connect channel)
    (on-close channel (fn [status] (handle-on-close channel status)))
    (on-receive channel (fn [data] (handle-on-receive channel data))))))

(defn create-server [handle-on-connect handle-on-receive handle-on-close]
  (run-server (server-handler handle-on-connect handle-on-receive handle-on-close) {:port 9090})
  (println "Server started"))

