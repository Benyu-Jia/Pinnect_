from flask_restful import Resource, reqparse, abort
from logging import Logger
from pymongo.database import Database
from bson.objectid import ObjectId
from time import time

from sessionchecker import SessionChecker

post_parser = reqparse.RequestParser()
post_parser.add_argument("session", type=str, required=True)
post_parser.add_argument("longitude", type=float, required=True)
post_parser.add_argument("latitude", type=float, required=True)
post_parser.add_argument("subject", type=str, required=True)
post_parser.add_argument("type", type=str, required=True)
post_parser.add_argument("image", type=str)

put_parser = reqparse.RequestParser()
put_parser.add_argument("session", type=str)
put_parser.add_argument("pin_id", type=str)
put_parser.add_argument("action", type=str)
put_parser.add_argument("subject", type=str)

put_allowed_actions = ["like", "unlike", "comment"]

get_parser = reqparse.RequestParser()
get_parser.add_argument("session", type=str)
get_parser.add_argument("pin_id", type=str)


class Pin(Resource):
    def __init__(self, logger: Logger, db: Database, session_checker: SessionChecker):
        self.logger = logger
        self.db_pins_col = db.get_collection("pins")
        self.db_users = db.get_collection("users")
        self.session_checker = session_checker

    def post(self):
        try:
            args = post_parser.parse_args()
            session = args["session"]
            longitude = args["longitude"]
            latitude = args["latitude"]
            subject = args["subject"]
            pin_type = args["type"]
        except:
            abort(400)

        # Validation
        if longitude < -180 or longitude > 180 or latitude < -90 or latitude > 90:
            abort(400)

        username = self.session_checker.verify_session(session)
        if username == None:
            abort(401)

        timestamp = int(time())

        image = None
        if "image" in args:
            image = args["image"]

        hashtags = []
        for word in subject.split():
            # checking the first charcter of every word
            if word[0] == "#":
                # adding the word to the hashtag_list
                hashtags.append(word[1:])

        result = self.db_pins_col.insert_one(
            {
                "created_at": timestamp,
                "location": {"type": "Point", "coordinates": [longitude, latitude]},
                "data": {
                    "username": username,
                    "type": pin_type,
                    "image": image,
                    "content": {"subject": subject},
                },
                "likes": [],
                "likeCounts": 0,
                "comments": [],
                "commentsCount": 0,
                "shareCounts": 0,
                "shareList": [],
                "viewCounts": 0,
                "ViewList": [],
                "hashtags": hashtags,
                "tags": "",
            }
        )

        return {"error": 0, "pin_id": str(result.inserted_id)}

    def put(self):
        try:
            args = put_parser.parse_args()
            session = args["session"]
            pin_id = args["pin_id"]
            action = args["action"]
            subject = args["subject"]
        except Exception as e:
            abort(400)

        if session == None or pin_id == None or action == None:
            abort(400)

        if action not in put_allowed_actions:
            abort(501)

        username = self.session_checker.verify_session(session)
        if username == None:
            abort(401)

        timestamp = int(time())

        if action == "like":
            # check if liked before
            liked_pin = self.db_pins_col.find_one({"_id": ObjectId(pin_id)})

            if liked_pin == None:
                return {"error": 1, "message": "Liked pin is not found"}

            for like_obj in liked_pin["likes"]:
                if like_obj["username"] == username:
                    return {
                        "error": 1,
                        "message": "Mulitple likes from the same user is not allowed",
                    }

            # update like in user profile
            result = self.db_users.update_one(
                {"username": username},
                {"$push": {"profile.stats.likes": {"pin_id": pin_id}}},
            )
            # update like in liked pin
            result = self.db_pins_col.update_one(
                {"_id": ObjectId(pin_id)},
                {"$push": {"likes": {"timestamp": timestamp, "username": username}}},
            )

            # update like count
            likeCount = liked_pin["likeCounts"] + 1
            result = self.db_pins_col.update_one(
                {"_id": ObjectId(pin_id)}, {"$set": {"likeCounts": likeCount}},
            )

        elif action == "unlike":
            # check if liked before

            liked_before = False
            liked_pin = self.db_pins_col.find_one({"_id": ObjectId(pin_id)})

            if liked_pin == None:
                return {"error": 1, "message": "Liked pin is not found"}

            for like_obj in liked_pin["likes"]:
                if like_obj["username"] == username:
                    liked_before = True

            if liked_before == False:
                return {
                    "error": 1,
                    "message": "Unliked Failed: no like record by the user",
                }

            # delete like in user profile
            result = self.db_users.update_one(
                {"username": username},
                {"$pull": {"profile.stats.likes": {"pin_id": pin_id}}},
            )
            # delete like in liked pin
            result = self.db_pins_col.update_one(
                {"_id": ObjectId(pin_id)}, {"$pull": {"likes": {"username": username}}},
            )

            # update like count
            likeCount = liked_pin["likeCounts"] - 1
            result = self.db_pins_col.update_one(
                {"_id": ObjectId(pin_id)}, {"$set": {"likeCounts": likeCount}},
            )

        elif action == "comment":
            result = self.db_pins_col.update_one(
                {"_id": ObjectId(pin_id)},
                {
                    "$push": {
                        "comments": {
                            "timestamp": timestamp,
                            "username": username,
                            "content": {"subject": subject},
                        },
                    }
                },
            )
            # update comment Counts
            pin = self.db_pins_col.find_one(
                {"_id": ObjectId(pin_id)}
            )
            result = self.db_pins_col.update_one(
                {"_id": ObjectId(pin_id)},
                {"$set": {"commentsCounts": len(pin["comments"])}}
            )
            # update comment in user profile
            result = self.db_users.update_one(
                {"username": username},
                {"$push": {"profile.stats.comment": {"pin_id": pin_id}}},
            )

        if result.matched_count == 0:
            abort(404)
        else:
            return {"error": 0}

    def delete(self):
        abort(501)

