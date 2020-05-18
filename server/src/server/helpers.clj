(ns server.helpers
  (:require [cheshire.core :refer [generate-string parse-string]])
  (:require [server.constants :refer [titles]]))

(defn uuid [] (str (java.util.UUID/randomUUID)))

(defn set-to-json [& args]
  (generate-string (apply merge args)))

(defn json-to-set [data]
  (parse-string data true))

(defn get-title [key]
  (get titles key))

(defn parse-int [number-string]
  (try (Integer/parseInt number-string)
    (catch Exception e nil)))