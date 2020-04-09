# from game import db


class NameGenerator:
    number = 0

    def next_unit_name(self, country, unit_type=None):
        self.number += 1
        # return "unit|{}|{}|{}|".format(country.id, self.number, db.unit_type_name(unit_type))
        return "unit|{}|{}|".format(country.id, self.number)

    def next_basedefense_name(self):
        return "basedefense_aa|0|0|"

    def next_awacs_name(self, country):
        self.number += 1
        return "awacs|{}|{}|0|".format(country.id, self.number)

    def next_tanker_name(self, country):
        self.number += 1
        return "tanker|{}|{}|0|".format(country.id, self.number)

    def next_carrier_name(self, country):
        self.number += 1
        return "carrier|{}|{}|0|".format(country.id, self.number)


namegen = NameGenerator()

