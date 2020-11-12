import json
from json import JSONEncoder


class SessionsEncoder(JSONEncoder):
        def session_data(self, obj):
            return {
                'name': obj.name,
                'selected_unit_id': obj.selected_unit_id,
                'coalition': obj.coalition
            }

        def default(self, obj):
            if isinstance(obj, SessionData):
                return self.session_data(obj)

            return json.JSONEncoder.default(self, obj)

class SessionData:
    def __init__(self):
        self.name = ''
        self.selected_unit_id = -1
        self.coalition = ""

class SessionManager:
    def __init__(self):
        self.sessions = {}

    def register(self, id):
        self.sessions[id] = SessionData()
        self.sessions[id].name = "Pilot " + str(id)

    def deregister(self, id):
        del self.sessions[id]

    def update_session(self, id, sessionData):
        name = sessionData['name']
        selected_unit_id = sessionData['selected_unit_id']

        # Reject update if name or unit is occupied
        for session_id in self.sessions:
            session = self.sessions[session_id]
            if session_id != id:
                if name == session.name:
                    print("Session update rejected: name occupied")
                    return

                if selected_unit_id != -1 and selected_unit_id == session.selected_unit_id:
                    print("Session update rejected: unit is occupied")
                    return

        self.sessions[id].name = name
        self.sessions[id].selected_unit_id = selected_unit_id
        self.sessions[id].coalition = sessionData['coalition']

        print("Session updated")
