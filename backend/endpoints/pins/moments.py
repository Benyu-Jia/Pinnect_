from flask import Flask, request
from flask_restful import Api, Resource, reqparse, abort
from logging import Logger
from pymongo.database import Database
from bson.objectid import ObjectId
from bson.json_util import loads, dumps
from sessionchecker import SessionChecker

PINS_PER_PAGE = 5


class Moments(Resource):
    def __init__(self, logger: Logger, db: Database, session_checker: SessionChecker):
        self.logger = logger
        self.db_users = db.get_collection("users")
        self.db_pins = db.get_collection("pins")
        self.session_checker = session_checker

    # /api/moments?session=session&page=page
    def get(self):
        if "session" not in request.args:
            abort(400)
        if "page" not in request.args:
            abort(400)
        session = request.args["session"]
        page = int(request.args["page"])
        username = self.session_checker.verify_session(session)
        if username == None:
            abort(401)

        userdata = self.db_users.find_one({"username": username})
        friends = userdata["friendsStates"]["friends"]
        friends.append(username)
        moments = (
            self.db_pins.find(
                {
                    "data.username": {"$in": friends},
                    "data.type": {"$not": {"$eq": "private"}},
                },
                {"_id": 1, "created_at": 1},
            )
            .sort("created_at", -1)
            .skip(int(page * PINS_PER_PAGE))
            .limit(PINS_PER_PAGE)
        )

        # filter private pins

        moments_ids = []
        for moment in moments:
            moments_ids.append(str(moment["_id"]))

        return {"error": 0, "data": moments_ids}
