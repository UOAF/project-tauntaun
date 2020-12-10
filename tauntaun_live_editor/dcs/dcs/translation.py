from typing import Dict


class String:
    def __init__(self, _id='', translation=None):
        self.translation = translation
        self.id = _id

    def __del__(self):
        if self.translation:
            self.translation.delete_string(self.id)

    def set(self, text, lang='DEFAULT'):
        self.translation.set_string(self.id, text, lang)
        return str(self)

    def str(self, lang='DEFAULT'):
        if self.translation:
            return self.translation.strings[lang][self.id]

        return ""

    def __str__(self):
        return self.str('DEFAULT')

    def __repr__(self):
        return self.id + ":" + str(self)


class ResourceKey:
    def __init__(self, res_key: str):
        self.res_key = res_key

    @property
    def key(self) -> str:
        return self.res_key

    def __str__(self):
        return self.res_key


class Translation:
    def __init__(self, _mission):
        self.strings = {}  # type: Dict[str,Dict[str,str]]
        self.mission = _mission

    def set_string(self, _id, string, lang='DEFAULT'):
        if lang not in self.strings:
            self.strings[lang] = {}
        self.strings[lang][_id] = string
        return _id

    def get_string(self, _id):
        return String(_id, self)

    def create_string(self, s: str, lang: str = 'DEFAULT'):
        _id = 'DictKey_Translation_{dict_id}'.format(dict_id=self.mission.next_dict_id())
        self.set_string(_id, s, lang)
        return String(_id, self)

    def delete_string(self, _id):
        for lang in self.strings:
            if _id in self.strings[lang]:
                del self.strings[lang][_id]

    def languages(self) -> [str]:
        return self.strings.keys()

    def dict(self, lang='DEFAULT'):
        if lang in self.strings:
            return {x: self.strings[lang][x] for x in self.strings[lang]}
        return {}

    def __str__(self):
        return str(self.strings)

    def __repr__(self):
        return repr(self.strings)
