import unittest
from dcs.lua.parse import loads


class TestLuaParse(unittest.TestCase):

    def test_integer(self):
        r = loads("int = 3")
        self.assertEqual(r, {"int": 3})

        r = loads("int = 193984")
        self.assertEqual(r, {"int": 193984})

        r = loads("int = -23")
        self.assertEqual(r, {"int": -23})

    def test_decimal(self):
        r = loads("dec = 666.6")
        self.assertEqual(r, {"dec": 666.6})

    def test_exponent(self):
        r = loads("dec = 666.6e10")
        self.assertEqual(r, {"dec": 666.6e10})

        r = loads("dec = 666.6e-10")
        self.assertEqual(r, {"dec": 666.6e-10})

    def test_string(self):
        s = """
mission =
{
    ["trig"] =
    {
        ["actions"] =
        {
            [1] = "a_(get(\\"ResKey_Action_62\\")); mission.trig.func[1]=nil;",
            [2] = "a_do_script_file(getValueResourceByKey(\\"ResKey_Action_64\\")); mission.trig.func[2]=nil;",
            [3] = "a_out_text_delay(getValueDictByKey(\\"DictKey_ActionText_66\\"), 10, false);a_do_script(getValueDictByKey(\\"DictKey_ActionText_255\\")); mission.trig.func[3]=nil;",
            [4] = "a_add_radio_item(getValueDictByKey(\\"Destroy Red Ground Group\\"), 1500, 1); mission.trig.func[4]=nil;",
            [5] = "a_do_script(getValueDictByKey(\\"DictKey_ActionText_213\\"));a_clear_flag(1500);",
        }, -- end of ["actions"]
    }
}
"""
        r = loads(s)

        r = loads('x = "a_do_script_file(getValueResourceByKey(\\"ResKey_Action_62\\")); mission.trig.func[1]=nil;"')
        self.assertEqual(r, {
            "x": "a_do_script_file(getValueResourceByKey(\"ResKey_Action_62\")); mission.trig.func[1]=nil;"})

    def test_object(self):
        luas = """
mission=
{
    ["trig"]=
    {
    },

    ["coalitions"]=
    {
        ["blue"]=
        {
            [1]=11,
            [2]=4,
            [3]=6
        }
    }, -- end of ["coalitions"]
    ["maxDictId"]=18,
    ["descriptionBlueTask"]="DictKey_descriptionBlueTask_3"
}
"""
        ref = {'mission': {
            'coalitions': {'blue': {1: 11.0, 2: 4.0, 3: 6.0}},
            'descriptionBlueTask': 'DictKey_descriptionBlueTask_3',
            'trig': {},
            'maxDictId': 18.0}}
        r = loads(luas)
        self.assertEqual(r, ref)

    def test_dictmix(self):
        luas = """
o =
{
    ["callsign"] =
    {
        [1] = 1,
        [2] = 1,
        [3] = 1,
        ["name"] = "Enfield11",
    } -- end of ["callsign"]
}
"""
        ref = {"o": {
            'callsign': {
                1: 1,
                2: 1,
                3: 1,
                "name": "Enfield11"
            }
        }}
        r = loads(luas)
        self.assertEqual(r, ref)

    def test_syntaxerr(self):
        with self.assertRaises(SyntaxError):
            loads("""m=
            {
                ["x"] 12
            }""")

    def test_missing_curly(self):
        with self.assertRaises(SyntaxError):
            loads("""t=
            {
                ["payload"] = {
                    ["num"] = 1
            }
            """)

    def test_object_without_keys(self):
        luas = """
local unitPayloads = {
    ["name"] = "JF-17",
    ["payloads"] = {
        {
            ["name"] = "PL-5Ex2, C802AKx2, 800L Tank",
            ["pylons"] = {
                [1] = {
                    ["CLSID"] = "DIS_C-802AK",
                    ["num"] = 5
                }
            }
        }
    }
}
        """
        ref = {'unitPayloads': {
            'name': "JF-17",
            'payloads': {
                1: {
                    'name': "PL-5Ex2, C802AKx2, 800L Tank",
                    'pylons': {
                        1: {
                            'CLSID': "DIS_C-802AK",
                            'num': 5
                        }
                    }
                }
            }
        }}
        r = loads(luas)
        self.assertEqual(r, ref)

    def test_mixed_objects(self):
        luas = """
o = {
    "x",
    ["a"]=2,
    "y"
}
"""

        ref = {'o': {1: "x", "a": 2, 2: "y"}}
        r = loads(luas)
        self.assertEqual(r, ref)

    def test_payload_var_ref(self):
        luas = """
local pylon_1A,pylon_1B,pylon_2,pylon_3,pylon_4,pylon_5,pylon_6,pylon_7,pylon_8B,pylon_8A = 1,2,3,4,5,6,7,8,9,10

local unitPayloads = {
  ["name"] = "F-14B",
  ["payloads"] = {
    {
      ["name"] = "XT*2",
      ["pylons"] = {
        [1] = {
          ["CLSID"] = "{F14-300gal}", ["num"] = pylon_7,
        },
        [2] = {
          ["CLSID"] = "{F14-300gal}", ["num"] = pylon_2,
        },
      },
      ["tasks"] = {
        [1] = Intercept,
        [2] = CAP,
        [3] = Escort,
        [4] = FighterSweep,
      },
    },
    {
      ["name"] = "AIM-54A-MK47*6, AIM-9M*2, XT*2",
      ["pylons"] = {
        [1] = {
          ["CLSID"] = "{LAU-138 wtip - AIM-9M}", ["num"] = pylon_8A,
        },
        [2] = {
          ["CLSID"] = "{SHOULDER AIM_54A_Mk47 R}", ["num"] = pylon_8B,
        },
        [3] = {
          ["CLSID"] = "{F14-300gal}", ["num"] = pylon_7,
        },
        [4] = {
          ["CLSID"] = "{AIM_54A_Mk47}", ["num"] = pylon_6,
        },
        [5] = {
          ["CLSID"] = "{AIM_54A_Mk47}", ["num"] = pylon_5,
        },
        [6] = {
          ["CLSID"] = "{AIM_54A_Mk47}", ["num"] = pylon_4,
        },
        [7] = {
          ["CLSID"] = "{AIM_54A_Mk47}", ["num"] = pylon_3,
        },
        [8] = {
          ["CLSID"] = "{F14-300gal}", ["num"] = pylon_2,
        },
        [9] = {
          ["CLSID"] = "{SHOULDER AIM_54A_Mk47 L}", ["num"] = pylon_1B,
        },
        [10] = {
          ["CLSID"] = "{LAU-138 wtip - AIM-9M}", ["num"] = pylon_1A,
        },
      },
      ["tasks"] = {
        [1] = Intercept,
        [2] = CAP,
        [3] = Escort,
        [4] = FighterSweep,
      },
    },
  },
  ["unitType"] = "F-14B",
}
return unitPayloads
"""
        r = loads(luas, {'Intercept': 'Intercept', 'CAP': 'CAP', 'Escort': 'Escort', 'FighterSweep': 'FighterSweep'})
        self.assertEqual(r['unitPayloads']['name'], 'F-14B')
        self.assertEqual(r['unitPayloads']['payloads'][1]['name'], "XT*2")
        self.assertEqual(r['unitPayloads']['payloads'][1]['pylons'][1]['num'], 8)
        self.assertEqual(r['unitPayloads']['payloads'][2]['name'], "AIM-54A-MK47*6, AIM-9M*2, XT*2")
        self.assertEqual(r['unitPayloads']['payloads'][2]['tasks'][1], "Intercept")


if __name__ == '__main__':
    unittest.main()
