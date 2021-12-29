from flask import Flask, request
from flask_restful import Api, Resource, reqparse, abort
from logging import Logger
from pymongo.database import Database
from bson import ObjectId
from bson.json_util import loads, dumps
from sessionchecker import SessionChecker
import time

post_parser = reqparse.RequestParser()
post_parser.add_argument("pin_id", type=str)
post_parser.add_argument("session", type=str)

class SharePin(Resource):
    def __init__(self, logger: Logger, db: Database, session_checker: SessionChecker):
        self.logger = logger
        self.db_pins_col = db.get_collection("pins")
        self.db_users = db.get_collection("users")
        self.session_checker = session_checker

    def post(self):
        try:
            args = post_parser.parse_args()
            pin_id = args["pin_id"]
            session = args["session"]
        except Exception as e:
            abort(400)

        if (
            session == None
            or pin_id == None
        ):
            abort(400)

        # Validation
        username = self.session_checker.verify_session(session)
        if username == None:
            abort(401)

        # timestamp = int(time.time())
        # TODO: add user name to share list
        query = {"_id": ObjectId(pin_id)}
        pin_record = self.db_pins_col.find_one({'_id':ObjectId(pin_id)})
        if pin_record == None:
            return {"error": 1, "message": "pin does not exist"}
        else:
            # share_list = pin_record["shareList"]
            share_count = pin_record["shareCounts"]
            share_count = share_count + 1
            # share_list = share_list.append(username)
            result = self.db_pins_col.update_one(
                {"_id": ObjectId(pin_id)},
                {
                    "$set": {
                        # "shareList": share_list,
                        "shareCounts": share_count
                    }
                },
            )

            # update shares in user profile
            result = self.db_users.update_one(
                {"username": username},
                {"$push": {"profile.stats.shares": {"pin_id": pin_id}}},
            )
            # update share in liked pin
            result = self.db_pins_col.update_one(
                {"_id": ObjectId(pin_id)},
                {"$push": {"shareList": { "username": username}}},
            )
           

        if result == 0:
            abort(404)
        else: 
            return {"error": 0}
