module Main exposing (..)

import Html exposing (text)


type alias Exchange =
    { currency : String
    , source : String
    , last : Maybe Int
    }


type alias ExchangePath =
    List Exchange


type alias Model =
    { startCurrency : String
    , endCurrency : String
    , path : Maybe ExchangePath
    }


main =
    text "I'm an Elm app!"
