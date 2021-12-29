from flask import Flask, request
from flask_restful import Api, Resource, reqparse, abort
from logging import Logger
from pymongo.database import Database
from sessionchecker import SessionChecker
import time

parser = reqparse.RequestParser()
parser.add_argument("session", type=str)
parser.add_argument("longitude", type=float)
parser.add_argument("latitude", type=float)
parser.add_argument("range", type=int)


class PinQuery(Resource):
    def __init__(self, logger: Logger, db: Database, session_checker: SessionChecker):
        self.logger = logger
        self.db_pins_col = db.get_collection("pins")
        self.db_users_col = db.get_collection("users")
        self.session_checker = session_checker

    def post(self):
        try:
            args = parser.parse_args()
            session = args["session"]
            longitude = args["longitude"]
            latitude = args["latitude"]
            get_range = args["range"]
        except:
            abort(400)

        if longitude == None or latitude == None or get_range == None:
            abort(400)

        # session is not used currently.

        if longitude < -180 or longitude > 180 or latitude < -90 or latitude > 90:
            abort(400)

        if get_range <= 0 or get_range > 5000:
            abort(400)

        # if user not login
        pins = []
        if session == None:
            result = self.db_pins_col.find(
                {
                    "location": {
                        "$near": {
                            "$geometry": {
                                "type": "Point",
                                "coordinates": [longitude, latitude],
                            },
                            "$minDistance": 0,
                            "$maxDistance": get_range,
                        }
                    },
                    "data.type": "public",
                }
            )
            for pin in result:
                pin["_id"] = str(pin["_id"])
                pins.append(pin)

            return {"error": 0, "pins": pins}

        # if user log in
        username = self.session_checker.verify_session(session)
        # remove all private pin not user's friend
        result = self.db_pins_col.find(
            {
                "location": {
                    "$near": {
                        "$geometry": {
                            "type": "Point",
                            "coordinates": [longitude, latitude],
                        },
                        "$minDistance": 0,
                        "$maxDistance": get_range,
                    }
                }
            }
        )
        pins = []
        for pin in result:
            if pin["data"]["type"] == "friend":
                owner = self.db_users_col.find_one(
                    {"username": pin["data"]["username"]}
                )
                if owner == None:
                    self.logger.warning(
                        f"Pin {pin['_id']}'s owner {pin['data']['username']} is not in registered users."
                    )
                    continue
                if (username != owner["username"]) and (
                    username not in owner["friendsStates"]["friends"]
                ):
                    continue
                pin["_id"] = str(pin["_id"])
                pins.append(pin)
                continue

            if pin["data"]["type"] == "private":
                owner = self.db_users_col.find_one(
                    {"username": pin["data"]["username"]}
                )
                if owner == None:
                    self.logger.warning(
                        f"Pin {pin['_id']}'s owner {pin['data']['username']} is not in registered users."
                    )
                    continue
                if (username != owner["username"]):
                    continue
                pin["_id"] = str(pin["_id"])
                pins.append(pin)
                continue

            pin["_id"] = str(pin["_id"])
            pins.append(pin)
                
        return {"error": 0, "pins": pins}
