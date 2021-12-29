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
post_parser.add_argument("pin_id", type=str)
post_parser.add_argument("pin_type", type=str)
post_parser.add_argument("subject", type=str)

put_parser = reqparse.RequestParser()
put_parser.add_argument("session", type=str)
put_parser.add_argument("pin_id", type=str)

allowing_option = [
    "type",
    "subject"
]

class EditPin(Resource):
    def __init__(self, logger: Logger, db: Database, session_checker: SessionChecker):
        self.logger = logger
        self.db_pins_col = db.get_collection("pins")
        self.session_checker = session_checker

    def post(self):

        try:
            args = post_parser.parse_args()
            pin_id = args["pin_id"]
            session = args["session"]
            pin_type = args["pin_type"]
            subject = args["subject"]
        except Exception as e:
            abort(400)

        if session == None or pin_id == None or pin_type == None or subject == None:
            abort(400)

        username = self.session_checker.verify_session(session)
        if username == None:
            abort(401)

        query = {"_id": ObjectId(pin_id)}
        pin_record = self.db_pins_col.find_one({'_id':ObjectId(pin_id)})

        if pin_record == None:
            return {"error": 1, "message": "pin does not exist"}
        
        if pin_record["data"]["username"] != username:
            abort(401)
               
        try:
            self.db_pins_col.update_one(
                query, {"$set": {"data.type": pin_type}}
            )
        except Exception as e:
            return {"error": 2, "message": str(e)}
            
        try:
            self.db_pins_col.update_one(
                query, {"$set": {"data.content.subject": subject}}
            )
            return {"error": 0}
        except Exception as e:
            return {"error": 2, "message": str(e)}

    
    def put(self):

        try:
            args = put_parser.parse_args()
            pin_id = args["pin_id"]
            session = args["session"]
        except Exception as e:
            abort(400)

        if session == None or pin_id == None:
            abort(400)

        username = self.session_checker.verify_session(session)
        if username == None:
            abort(401)

        query = {"_id": ObjectId(pin_id)}
        pin_record = self.db_pins_col.find_one({'_id': ObjectId(pin_id)})

        if pin_record == None:
            return {"error": 1, "message": "pin does not exist"}

        return {"error": 0}

        
