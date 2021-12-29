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


class GetPin(Resource):
    def __init__(self, logger: Logger, db: Database, session_checker: SessionChecker):
        self.logger = logger
        self.db_pins_col = db.get_collection("pins")
        self.session_checker = session_checker

    def post(self):
        try:
            args = post_parser.parse_args()
            pin_id = args["pin_id"]
            session = args["session"]
        except Exception as e:
            abort(400)

        # username = self.session_checker.verify_session(session)
        # if username == None:
        #    abort(401)

        query = {"_id": ObjectId(pin_id)}
        pin_record = self.db_pins_col.find_one({"_id": ObjectId(pin_id)})

        if pin_record == None:
            return {"error": 1, "message": "pin does not exist"}
        else:
            pin_record["_id"] = str(pin_record["_id"])
            return {"error": 0, "pin": pin_record}
