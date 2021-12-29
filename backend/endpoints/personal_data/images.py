from flask import Flask, request, Response
from flask_restful import Api, Resource, reqparse, abort

from logging import Logger
from pymongo.database import Database
from pathlib import Path
from bson.objectid import ObjectId

from sessionchecker import SessionChecker

ALLOWED_ACTIONS = ["general", "avatar"]


class Images(Resource):
    def __init__(
        self,
        logger: Logger,
        db: Database,
        session_checker: SessionChecker,
        upload_dir: str,
    ):
        self.logger = logger
        self.db_users = db.get_collection("users")
        self.db_pins = db.get_collection("pins")
        self.session_checker = session_checker
        self.upload_dir = upload_dir
        Path(upload_dir).mkdir(parents=True, exist_ok=True)

    def get(self):
        if "filename" not in request.args:
            abort(400)

        filename = f"{self.upload_dir}/{request.args['filename']}"
        if Path(filename).exists() == False:
            abort(404)
        with open(filename, "rb") as file:
            file_content = file.read()
            return Response(file_content, 200, mimetype="image")

    def post(self):
        session = request.form.get("session")
        action = request.form.get("action")

        # session is none when uploading pin_id
        if session == None or action == None:
            abort(400)

        if action not in ALLOWED_ACTIONS:
            abort(400)

        username = self.session_checker.verify_session(session)
        if username == None:
            abort(401)

        for item in request.files:
            filename = f"{username}_{item}"
            with open(f"{self.upload_dir}/{filename}", mode="w+b") as file:
                file.write(request.files.get(item).read())
                file.flush()

        if action == "general":
            return {"error": 0, "filename": filename}

        if action == "avatar":
            self.db_users.update_one(
                {"username": username}, {"$set": {"profile.avatar": filename}},
            )
            return {"error": 0}
