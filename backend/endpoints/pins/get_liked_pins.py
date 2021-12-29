from flask import Flask, request
from flask_restful import Api, Resource, reqparse, abort
from logging import Logger
from pymongo.database import Database
from bson.objectid import ObjectId
from bson.json_util import loads, dumps
from sessionchecker import SessionChecker
import time
import json

post_parser = reqparse.RequestParser()
post_parser.add_argument("session", type=str)


class GetLikedPins(Resource):
    def __init__(self, logger: Logger, db: Database, session_checker: SessionChecker):
        self.logger = logger
        self.db_users = db.get_collection("users")
        self.db_pins_col = db.get_collection("pins")
        self.session_checker = session_checker

    def post(self):
        try:
            args = post_parser.parse_args()
            session = args["session"]
        except Exception as e:
            abort(400)

        if session == None:
            abort(400)

        username = self.session_checker.verify_session(session)
        if username == None:
            abort(401)

        # liked_pin_ids is cursor
        current_user = self.db_users.find_one({"username": username})  # UNSURE
        liked_pin_ids = current_user["profile"]["stats"]["likes"]

        pins = []
        for liked_pin_id in liked_pin_ids:
            pin = self.db_pins_col.find_one({"_id": ObjectId(liked_pin_id["pin_id"])})
            if pin == None:
                continue
            pin["_id"] = str(pin["_id"])
            pins.append(pin)

        return {"error": 0, "pins": pins}
