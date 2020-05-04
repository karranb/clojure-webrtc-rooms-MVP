(ns server.core
  (:require [server.server :refer [start-server]]))

(defn -main []
  (start-server))
