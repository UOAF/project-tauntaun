rules = {
    "UnitDamaged":
    {
        "name" : "c_unit_damaged",
        "fields" : [
            {
                "id" : "unit",
                "default" : "",
            }
        ]
    },
    "UnitAlive":
    {
        "name" : "c_unit_alive",
        "fields" : [
            {
                "id" : "unit",





                "default" : "",
            }
        ]
    },
    "UnitDead":
    {
        "name" : "c_unit_dead",
        "fields" : [
            {
                "id" : "unit",





                "default" : "",
            }
        ]
    },
    "GroupAlive":
    {
        "name" : "c_group_alive",
        "fields" : [
            {
                "id" : "group",
                "default" : "",
            }
        ]
    },
    "GroupDead":
    {
        "name" : "c_group_dead",
        "fields" : [
            {
                "id" : "group",

                "default" : "",
            }
        ]
    },
    "TimeAfter":
    {
        "name" : "c_time_after",
        "fields" : [
            {
                "id" : "seconds",

                "default" : 10,
            }
        ]
    },
    "TimeBefore":
    {
        "name" : "c_time_before",
        "fields" : [
            {
                "id" : "seconds",

                "default" : 10,
            }
        ]
    },
    "FlagIsTrue":
    {
        "name" : "c_flag_is_true",
        "fields" : [
            {
                "id": "flag",
                "default": 1,
            },
        ],
    },
    "FlagIsFalse":
    {
        "name" : "c_flag_is_false",
        "fields" : [
            {
                "id": "flag",
                "default": 1,
            },
        ],
    },
    "FlagIsMore":
    {
        "name" : "c_flag_more",
        "fields" : [
            {
                "id": "flag",
                "default": 1,
            },
            {
                "id" : "value",

                "default" : 10,
            },
        ],
    },
    "FlagIsLess":
    {
        "name" : "c_flag_less",
        "fields" : [
            {
                "id": "flag",
                "default": 1,
            },
            {
                "id" : "value",

                "default" : 10,
            },
        ],
    },
    "FlagIsLessThanFlag":
    {
        "name" : "c_flag_less_flag",
        "fields" : [
            {
                "id": "flag",
                "default": 1,
            },
            {
                "id" : "flag2",

                "default" : 1,
            }
        ],
    },
    "FlagEquals":
    {
        "name" : "c_flag_equals",
        "fields" : [
            {
                "id": "flag",
                "default": 1,
            },
            {
                "id" : "value",

                "default" : 10,
            },
        ],
    },
    "FlagEqualsFlag":
    {
        "name" : "c_flag_equals_flag",
        "fields" : [
            {
                "id": "flag",
                "default": 1,
            },
            {
                "id" : "flag2",

                "default" : 1,
            }
        ],
    },
    "TimeSinceFlag":
    {
        "name" : "c_time_since_flag",
        "fields" : [
            {
                "id": "flag",
                "default": 1,
            },
            {
                "id" : "seconds",

                "default" : 10,
            }
        ]
    },
    "BombInZone":
    {
        "name" : "c_bomb_in_zone",
        "fields" : [
            {
                "id" : "typebomb",
                "default" : "",
            },        
            {
                "id" : "numbombs",

                "default" : 1,
            },       
            {
                "id" : "zone",

                "default" : "",
            }        
        ]
    },
    "UnitInZone":
    {
        "name" : "c_unit_in_zone",
        "fields" : [
            {
                "id" : "unit",





                "default" : "",
            },
            {
                "id" : "zone",

                "default" : "",
            }
        ]
    },
    "UnitOutsideZone":
    {
        "name" : "c_unit_out_zone",
        "fields" : [
            {
                "id" : "unit",





                "default" : "",
            },
            {
                "id" : "zone",

                "default" : "",
            }
        ]
    },
    "UnitInMovingZone":
    {
        "name" : "c_unit_in_zone_unit",
        "fields" : [
            {
                "id" : "unit",





                "default" : "",
            },
            {
                "id" : "zone",



                "default" : "",
            },
            {
                "id" : "zoneunit",





                "default" : "",
            },
        ]
    },
    "UnitOutsideMovingZone":
    {
        "name" : "c_unit_out_zone_unit",
        "fields" : [
            {
                "id" : "unit",





                "default" : "",
            },
            {
                "id" : "zone",



                "default" : "",
            },
            {
                "id" : "zoneunit",





                "default" : "",
            },
        ]
    },
    "Random":
    {
        "name" : "c_random_less",
        "fields" : [
            {
                "id" : "percent",

                "default" : 10,
            }
        ]
    },
    "UnitAltitudeHigher":
    {
        "name" : "c_unit_altitude_higher",
        "fields" : [
            {
                "id" : "unit",





                "default" : "",
            },
            {
                "id" : "altitude",
                "default" : 1,
            },
        ]
    },
    "UnitAltitudeLower":
    {
        "name" : "c_unit_altitude_lower",
        "fields" : [
            {
                "id" : "unit",





                "default" : "",
            },
            {
                "id" : "altitude",
                "default" : 1,
            },
        ]
    },
    "UnitSpeedHigher":
    {
        "name" : "c_unit_speed_higher",
        "fields" : [
            {
                "id" : "unit",





                "default" : "",
            },
            {
                "id" : "speed",

                "default" : 100,
            },
        ]
    },
    "UnitSpeedLower":
    {
        "name" : "c_unit_speed_lower",
        "fields" : [
            {
                "id" : "unit",





                "default" : "",
            },
            {
                "id" : "speed",

                "default" : 100,
            },
        ]
    },
    "UnitHeadingWithin":
    {
        "name" : "c_unit_heading",
        "fields" : [
            {
                "id" : "unit",





                "default" : "",
            },
            {
                "id" : "min_unit_heading",

                "default" : 0,
            },
            {
                "id" : "max_unit_heading",

                "default" : 360,
            },
        ]
    },
    "UnitPitchWithin":
    {
        "name" : "c_unit_pitch",
        "fields" : [
            {
                "id" : "unit",





                "default" : "",
            },
            {
                "id" : "min_unit_pitch",

                "default" : -180,
            },
            {
                "id" : "max_unit_pitch",

                "default" : 180,
            },
        ]
    },
    "UnitBankWithin":
    {
        "name" : "c_unit_bank",
        "fields" : [
            {
                "id" : "unit",





                "default" : "",
            },
            {
                "id" : "min_unit_bank",

                "default" : -180,
            },
            {
                "id" : "max_unit_bank",

                "default" : 180,
            },
        ]
    },
    "UnitVerticalSpeedWithin":
    {
        "name" : "c_unit_vertical_speed",
        "fields" : [
            {
                "id" : "unit",





                "default" : "",
            },
            {
                "id" : "min_unit_vertical_speed",

                "default" : -300,
            },
            {
                "id" : "max_unit_vertical_speed",

                "default" : 300,
            },
        ]
    },
    "MissionScoreHigher":
    {
        "name" : "c_mission_score_higher",
        "fields" : [
            {
                "id" : "coalitionlist",



                "default" : "",
            },
            {
                "id" : "score",

                "default" : 50,
            },
        ]
    },
    "MissionScoreLower":
    {
        "name" : "c_mission_score_lower",
        "fields" : [
            {
                "id" : "coalitionlist",



                "default" : "",
            },
            {
                "id" : "score",

                "default" : 50,
            },
        ]
    },
    "CoalitionHasAirdrome":
    {
        "name" : "c_coalition_has_airdrome",
        "fields" : [
            {
                "id" : "coalitionlist",



                "default" : "",
            },
            {
                "id" : "airdromelist",

                "default" : "",
            },
        ]
    },
    "CoalitionHasHelipad":
    {
        "name" : "c_coalition_has_helipad",
        "fields" : [
            {
                "id" : "coalitionlist",



                "default" : "",
            },
            {
                "id" : "helipadlist",


                "default" : "",
            },
        ]
    },

    # predicates for cockpit triggers
    "CockpitHighlightVisible":
    {
        "name" : "c_cockpit_highlight_visible",
        "fields" : [
            {
                "id"      : "highlight_id",

                "default" : 0,
            },
        ]
    },
    "ArgumentInRange":
    {
        "name" : "c_argument_in_range",
        "fields" : [
            {
                "id" : "argument",

                "default" : 0,
            },
            {
                "id"      : "_min",

                "default" : 0,
            },
            {
                "id"      : "_max",

                "default" : 0,
            },
        ],
    },
    "CockpitParamInRange":
    {
        "name" : "c_cockpit_param_in_range",
        "fields" : [
             {
                "id"              : "cockpit_param",
                "default"         : "",
            },
            {
                "id" : "_min2",

                "default" : 0,

            },
            {
                "id" : "_max2",

                "default" : 0,

            },
        ],
    },
    "CockpitParamEqual":
    {
        "name" : "c_cockpit_param_equal_to",
        "fields" : [
            {
                "id"              : "cockpit_param",

                "default"         : "",
            },
            {
                "id"              : "value_text",

                "default"         : "",

            },
        ],
    },
    "CockpitParamEqualToAnother":
    {
        "name" : "c_cockpit_param_is_equal_to_another",
        "fields" : [
            {
                "id"              : "cockpit_param",

                "default"         : "",

            },
            {
                "id"              : "cockpit_param2",

                "default"         : "",

            },
        ],
    },
    "IndicationTextEqual":
    {
        "name" : "c_indication_txt_equal_to",
        "fields" : [
            {
                "id"      : "indicator_id",

                "default" : 0,
            },
            {
                "id"              : "element_name",

                "default"         : "",

            },
            {
                "id"              : "element_value",

                "default"         : "",

            },
        ],
    },
    "AllOfGroupInZone":
    {
        "name" : "c_all_of_group_in_zone",
        "fields" : [
            {
                "id" : "group",

                "default" : "",
            },
            {
                "id" : "zone",



                "default" : "",
            },
        ]
    },
    "AllOfGroupOutsideZone":
    {
        "name" : "c_all_of_group_out_zone",
        "fields" : [
            {
                "id" : "group",

                "default" : "",
            },
            {
                "id" : "zone",



                "default" : "",
            },
        ]
    },
    "PartOfGroupInZone":
    {
        "name" : "c_part_of_group_in_zone",
        "fields" : [
            {
                "id" : "group",

                "default" : "",
            },
            {
                "id" : "zone",



                "default" : "",
            },
        ]
    },
    "CargoUnhookedInZone":
    {
        "name" : "c_cargo_unhooked_in_zone",
        "fields" : [
            {
                "id" : "cargo",



                "default" : "",
            },
            {
                "id" : "zone",



                "default" : "",
            },
        ]
    },
    "PartOfGroupOutsideZone":
    {
        "name" : "c_part_of_group_out_zone",
        "fields" : [
            {
                "id" : "group",

                "default" : "",
            },
            {
                "id" : "zone",



                "default" : "",
            },
        ]
    },
    "AllOfCoalitionInZone":
    {
        "name" : "c_all_of_coalition_in_zone",
        "fields" : [
            {
                "id" : "coalitionlist",


                "default" : "",
            },
            {
                "id" : "zone",



                "default" : "",
            },
        ]
    },
    "AllOfCoalitionOutsideZone":
    {
        "name" : "c_all_of_coalition_out_zone",
        "fields" : [
            {
                "id" : "coalitionlist",


                "default" : "",
            },
            {
                "id" : "zone",



                "default" : "",
            },
        ]
    },
    "PartOfCoalitionInZone":
    {
        "name" : "c_part_of_coalition_in_zone",
        "fields" : [
            {
                "id" : "coalitionlist",

                "default" : "",
            },
            {
                "id" : "zone",



                "default" : "",
            },
        ]
    },
    "PartOfCoalitionOutsideZone":
    {
        "name" : "c_part_of_coalition_out_zone",
        "fields" : [
            {
                "id" : "coalitionlist",

                "default" : "",
            },
            {
                "id" : "zone",



                "default" : "",
            },
        ]
    },
    "PlayerScoreMore":
    {
        "name" : "c_player_score_more",
        "fields" : [
            {
                "id" : "scores",

                "default" : 100,
            },
        ]
    },
    "PlayerScoreLess":
    {
        "name" : "c_player_score_less",
        "fields" : [
            {
                "id" : "scores",

                "default" : 100,
            },
        ]
    },
    "GroupLifeLess":
    {
        "name" : "c_group_life_less",
        "fields" : [
            {
                "id" : "group",

                "default" : "",
            },
            {
                "id" : "percent",

                "default" : 10,
            },
        ]
    },
    "UnitLifeLess":
    {
        "name" : "c_unit_life_less",
        "fields" : [
            {
                "id" : "unit",





                "default" : "",
            },
            {
                "id" : "percent",

                "default" : 10,
            },
        ]
    },
    "Or" : #-- special predicates have indiv"id"ual key
    {
        "name" : "or",
        "fields" : [],
    },
    "Predicate":
    {
        "name" : "c_predicate",
        "fields" : [
            {
                "id" : "text",
                "default" : "",
            }           
        ]
    },
    "SignalFlareInZone":
    {
        "name" : "c_signal_flare_in_zone",
        "fields" : [
            {
                "id" : "flare_color",


                "default" : "",
            },
            {
                "id" : "numflares",

                "default" : 1,
            },
            {
                "id" : "zone",

                "default" : "",
            }
        ]
    }
}

def gengoalrule(name, d):
    templ = """
class {cl}(GoalRule):
    predicate = "{pred}"

    def __init__(self, {params}):
        super({cl}, self).__init__({cl}.predicate)
        {init}

    @classmethod
    def create_from_dict(cls, d):
        return cls({load})

    def dict(self):
        d = super({cl}, self).dict()
        {out}
        return d
"""
    params = []
    init = []
    load = []
    out = []
    for x in d["fields"]:
        default = "=" + str(x["default"]) if x["default"] else ""
        params.append(x["id"] + default)
        init.append("self.{id} = {id}".format(id=x["id"]))
        init.append("self.params.append(self.{id})".format(id=x["id"]))
        load.append('d["{id}"]'.format(id=x["id"]))
        out.append('d["{id}"] = self.{id}'.format(id=x["id"]))
    print(templ.format(
        cl=name,
        pred=d["name"],
        params=", ".join(params),
        init="\n        ".join(init),
        load=", ".join(load),
        out="\n        ".join(out)))

for x in sorted(rules):
    gengoalrule(x, rules[x])

print("goalrule_map = {")
for x in sorted(rules):
    print('    "{r}": {cl},'.format(r=rules[x]["name"], cl=x))
print("}")
