from flask import Flask, request
from flask_restful import Api, Resource, reqparse, abort
from logging import Logger
from pymongo.database import Database
from bson.objectid import ObjectId
from bson.json_util import loads, dumps
from sessionchecker import SessionChecker
import time

post_parser = reqparse.RequestParser()
post_parser.add_argument("session", type=str)
post_parser.add_argument("pin_id", type=str, required=True)


class ViewPin(Resource):
    def __init__(self, logger: Logger, db: Database, session_checker: SessionChecker):
        self.logger = logger
        self.db_pins_col = db.get_collection("pins")
        self.db_users = db.get_collection("users")
        self.session_checker = session_checker

    def post(self):
        try:
            args = post_parser.parse_args()
            session = args["session"]
            pin_id = args["pin_id"]
        except:
            abort(400)

        pin_record = self.db_pins_col.find_one({"_id": ObjectId(pin_id)})

        if pin_record == None:
            return {"error": 1, "message": "pin does not exist"}

        else:
            self.db_pins_col.update_one(
                {"_id": ObjectId(pin_id)}, {"$inc": {"viewCounts": 1}},
            )

            # update views in user profile
            # self.db_users.update_one(
            #     {"username": username},
            #     {"$push": {"profile.stats.views": {"pin_id": pin_id}}},
            # )

            # update views in liked pin
            if session != None:
                username = self.session_checker.verify_session(session)
                if username == None:
                    abort(401)

                self.db_pins_col.update_one(
                    {"_id": ObjectId(pin_id)}, {"$addToSet": {"ViewList": username}}
                )
            return {"error": 0}
