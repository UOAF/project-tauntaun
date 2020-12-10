"""This module holds all Tasks that are possible to specifiy in dcs.

There are 2 type of tasks, a MainTask and a Task action.
 * MainTasks are the flight groups main objective like :py:class:`CAS`, :py:class:`CAP`, :py:class:`SEAD`, ...
 * Task actions on the otherhand are specific tasks within a MainTask, these
   cover things like :py:class:`AttackGroup`, :py:class:`Orbit`, :py:class:`Follow`, :py:class:`Escort`, ...

Also options and commands are task actions.
"""
from typing import List, Dict, Optional, Type, Any, Union
from enum import Enum, IntEnum
from dcs.mapping import Point
from dcs.unit import Unit


TaskDict = Dict[str, Any]


def _create_from_dict(d: TaskDict) -> 'Task':
    _id = d["id"]
    if _id == "WrappedAction":
        actionid = d["params"]["action"]["id"]
        if actionid == "Option":
            t = options[d["params"]["action"]["params"]["name"]].create_from_dict(d)
        else:
            t = wrappedactions[actionid].create_from_dict(d)
    elif _id == "EngageTargets":
        t = engagetargets_tasks[d.get("key")].create_from_dict(d)
    else:
        t = tasks_map[_id].create_from_dict(d)

    t.auto = d["auto"]
    t.enabled = d["enabled"]
    t.number = d["number"]
    t.params = d["params"]
    return t


class Modulation(Enum):
    """Enum for VHF frequency bands"""
    AM = 0
    """AM frequency band"""
    FM = 1
    """FM frequency band"""


class Task:
    """Base class for task actions."""

    def __init__(self, _id: str = ''):
        self.id: str = _id
        self.params: Dict[str, Any] = {}
        self.auto: bool = False
        self.number: int = 1
        self.enabled: bool = True

    def __repr__(self) -> str:
        return str(self.dict())

    @classmethod
    def create_from_dict(cls, d: TaskDict) -> "Task":
        t = cls()
        t.params = d["params"]
        return t

    def dict(self) -> TaskDict:
        return {
            "id": self.id,
            "auto": self.auto,
            "enabled": self.enabled,
            "params": self.params,
            "number": self.number
        }


class ControlledTask(Task):
    """A ControlledTask is a task action with start and stop conditions.

    ControlledTask is a wrapper around a normal task action that has special
    methods to add start/stop conditions.

    :param task: to wrap
    """
    Id = "ControlledTask"

    def __init__(self, task: Optional[Task] = None):
        super(ControlledTask, self).__init__(self.Id)
        if task:
            self.params["task"] = task.dict()

    def start_after_time(self, time: int):
        """Start the wrapped task after time seconds.

        :param time: start after x seconds.
        """
        self.params.setdefault("condition", {})
        self.params["condition"]["time"] = time

    def start_if_user_flag(self, user_flag, value: bool):
        """Start the wrapped task if user_flag has value.

        :param user_flag: id of the userflag
        :param value: bool value of the flag
        """
        self.params.setdefault("condition", {})
        self.params["condition"]["userFlag"] = str(user_flag)
        self.params["condition"]["userFlagValue"] = value

    def start_probability(self, probability: int):
        """Chance that the wrapped task will actually start.

        :param probability: start chance in %
        """
        self.params.setdefault("condition", {})
        self.params["condition"]["probability"] = probability

    def start_if_lua_predicate(self, lua_predicate: str):
        """Start wrapped task if lua condition is true.

        :param lua_predicate: lua condition as string
        """
        self.params.setdefault("condition", {})
        self.params["condition"]["condition"] = lua_predicate

    def stop_after_time(self, time: int):
        """Stop the wrapped task after time seconds.

        :param time: start after x seconds.
        """
        self.params.setdefault("stopCondition", {})
        self.params["stopCondition"]["time"] = time

    def stop_if_user_flag(self, user_flag, value: bool):
        """Stop the wrapped task if user_flag has value.

        :param user_flag: id of the userflag
        :param value: bool value of the flag
        """
        self.params.setdefault("stopCondition", {})
        self.params["stopCondition"]["userFlag"] = str(user_flag)
        self.params["stopCondition"]["userFlagValue"] = value

    def stop_if_lua_predicate(self, lua_predicate: str):
        """Stop wrapped task if lua condition is true.

        :param lua_predicate: lua condition as string
        """
        self.params.setdefault("stopCondition", {})
        self.params["stopCondition"]["condition"] = lua_predicate

    def stop_after_duration(self, duration: int):
        """Stop task after duration seconds.

        :param duration: in seconds
        """
        self.params.setdefault("stopCondition", {})
        self.params["stopCondition"]["duration"] = duration


class WeaponType(Enum):
    Auto = 1073741822
    NoWeapon = 0
    All = 4294967295
    Unguided = 805339120
    Cannon = 805306368
    Rockets = 30720
    SmokeRockets = 4096
    LightRockets = 2048
    CandleRockets = 8192
    HeavyRockets = 16384
    Bombs = 2032
    IronBombs = 240
    ClusterBombs = 768
    CandleBombs = 1024
    Guided = 268402702
    GuidedBombs = 14
    Missiles = 268402688
    ASM = 4161536
    ATGM = 131072
    StandardASM = 1835008
    ARM = 32768
    Antiship = 65536
    CruiseMissile = 2097152
    AAM = 264241152
    SR_AAM = 4194304
    MR_AAM = 8388608
    LR_AAM = 16777216


class TargetType(type):
    id = None

    def __str__(self) -> str:
        return '"{id}"'.format(id=self.id)


class Targets(metaclass=TargetType):
    class All(TargetType, metaclass=TargetType):
        id = "All"

        class Air(TargetType, metaclass=TargetType):
            id = "Air"

            class Planes(TargetType, metaclass=TargetType):
                id = "Planes"

                class Fighters(TargetType, metaclass=TargetType):
                    id = "Fighters"

                class Bombers(TargetType, metaclass=TargetType):
                    id = "Bombers"

            class Helicopters(TargetType, metaclass=TargetType):
                id = "Helicopters"

        class GroundUnits(TargetType, metaclass=TargetType):
            id = "Ground Units"

            class Infantry(TargetType, metaclass=TargetType):
                id = "Infantry"

            class Fortifications(TargetType, metaclass=TargetType):
                id = "Fortifications"

            class GroundVehicles(TargetType, metaclass=TargetType):
                id = "Ground vehicles"

                class ArmoredVehicles(TargetType, metaclass=TargetType):
                    id = "Armored vehicles"

                    class Tanks(TargetType, metaclass=TargetType):
                        id = "Tanks"

                    class IFV(TargetType, metaclass=TargetType):
                        id = "IFV"

                    class APC(TargetType, metaclass=TargetType):
                        id = "APC"

                class Artillery(TargetType, metaclass=TargetType):
                    id = "Artillery"

                class UnarmedVehicles(TargetType, metaclass=TargetType):
                    id = "Unarmed vehicles"

            class AirDefence(TargetType, metaclass=TargetType):
                id = "Air Defence"

                class AAA(TargetType, metaclass=TargetType):
                    id = "AAA"

                    class SAMRelated(TargetType, metaclass=TargetType):
                        id = "SAM related"

                        class SRSAM(TargetType, metaclass=TargetType):
                            id = "SR SAM"

                        class MRSAM(TargetType, metaclass=TargetType):
                            id = "MR SAM"

                        class LRSAM(TargetType, metaclass=TargetType):
                            id = "LR SAM"

        class Naval(TargetType, metaclass=TargetType):
            id = "Naval"

            class Ships(TargetType, metaclass=TargetType):
                id = "Ships"

                class ArmedShips(TargetType, metaclass=TargetType):
                    id = "Armed ships"

                    class HeavyArmedShips(TargetType, metaclass=TargetType):
                        id = "Heavy armed ships"

                        class AircraftCarriers(TargetType, metaclass=TargetType):
                            id = "Aircraft Carriers"

                        class Cruisers(TargetType, metaclass=TargetType):
                            id = "Cruisers"

                        class Destroyers(TargetType, metaclass=TargetType):
                            id = "Destroyers"

                        class Frigates(TargetType, metaclass=TargetType):
                            id = "Frigates"

                        class Corvettes(TargetType, metaclass=TargetType):
                            id = "Corvettes"

                    class LightArmedShips(TargetType, metaclass=TargetType):
                        id = "Light armed ships"

                class UnarmedShips(TargetType, metaclass=TargetType):
                    id = "Unarmed ships"

            class Submarines(TargetType, metaclass=TargetType):
                id = "Submarines"


class NoTask(Task):
    Id = "NoTask"

    def __init__(self):
        super(NoTask, self).__init__(self.Id)


class AttackGroup(Task):
    """Attack group task action

    :param group_id: group id to attack
    :param weapon_type: :py:class:`WeaponType` to use for the attack
    """
    Id = "AttackGroup"

    def __init__(self, group_id=0, weapon_type: WeaponType = WeaponType.Auto):
        super(AttackGroup, self).__init__(AttackGroup.Id)
        self.params = {
            "groupId": group_id,
            "weaponType": weapon_type.value
        }


class AttackUnit(Task):
    """Attack unit task action

    :param unit_id: unit id to attack
    :param attack_limit: how much attack runs
    :param weapon_type: :py:class:`WeaponType` to use for the attack
    :param group_attack: indicate if the unit must be attacked by all aircrafts in the group.
    """
    Id = "AttackUnit"

    def __init__(self, unit_id=0, attack_limit: Optional[int] = None,
                 weapon_type: WeaponType = WeaponType.Auto, group_attack=False):
        super(AttackUnit, self).__init__(self.Id)
        self.params = {
            "groupId": unit_id,
            "weaponType": weapon_type.value,
            "groupAttack": group_attack,
            "attackQty": attack_limit,
            "attackQtyLimit": attack_limit is not None
        }


class AttackMapObject(Task):
    Id = "AttackMapObject"

    def __init__(self, position: Point = Point(0, 0), attack_limit: Optional[int] = None,
                 weapon_type: WeaponType = WeaponType.Auto, group_attack=False):
        super(AttackMapObject, self).__init__(self.Id)
        self.params = {
            "x": position.x,
            "y": position.y,
            "weaponType": weapon_type.value,
            "groupAttack": group_attack,
            "attackQty": attack_limit,
            "attackQtyLimit": attack_limit is not None
        }


class AntishipStrikeTaskAction(Task):
    Id = "EngageTargets"
    Key = "AntiShip"

    def __init__(self):
        super(AntishipStrikeTaskAction, self).__init__(AntishipStrikeTaskAction.Id)
        self.params = {
            "targetTypes": {
                1: Targets.All.Naval.Ships
            },
            "priority": 0
        }

    def dict(self) -> TaskDict:
        d = super(AntishipStrikeTaskAction, self).dict()
        d["key"] = AntishipStrikeTaskAction.Key
        return d


class CASTaskAction(Task):
    Id = "EngageTargets"
    Key = "CAS"

    def __init__(self):
        super(CASTaskAction, self).__init__(CASTaskAction.Id)
        self.params = {
            "targetTypes": {
                1: Targets.All.Air.Helicopters,
                2: Targets.All.GroundUnits,
                3: Targets.All.Naval.Ships.ArmedShips.LightArmedShips
            },
            "priority": 0
        }

    def dict(self) -> TaskDict:
        d = super(CASTaskAction, self).dict()
        d["key"] = CASTaskAction.Key
        return d


class SEADTaskAction(Task):
    Id = "EngageTargets"
    Key = "SEAD"

    def __init__(self):
        super(SEADTaskAction, self).__init__(SEADTaskAction.Id)
        self.params = {
            "targetTypes": {1: Targets.All.GroundUnits.AirDefence},
            "priority": 0
        }

    def dict(self) -> TaskDict:
        d = super(SEADTaskAction, self).dict()
        d["key"] = SEADTaskAction.Key
        return d


class CAPTaskAction(Task):
    Id = "EngageTargets"
    Key = "CAP"

    def __init__(self):
        super(CAPTaskAction, self).__init__(CAPTaskAction.Id)
        self.params = {
            "targetTypes": {1: Targets.All.Air},
            "priority": 0
        }

    def dict(self) -> TaskDict:
        d = super(CAPTaskAction, self).dict()
        d["key"] = CAPTaskAction.Key
        return d


class FighterSweepTaskAction(Task):
    Id = "EngageTargets"
    Key = "FighterSweep"

    def __init__(self):
        super(FighterSweepTaskAction, self).__init__(FighterSweepTaskAction.Id)
        self.params = {
            "targetTypes": {1: Targets.All.Air.Planes},
            "priority": 0
        }

    def dict(self) -> TaskDict:
        d = super(FighterSweepTaskAction, self).dict()
        d["key"] = FighterSweepTaskAction.Key
        return d


class EmptyTaskAction(Task):
    @classmethod
    def create_from_dict(cls, d: TaskDict) -> "EmptyTaskAction":
        t = cls(d["id"])
        t.params = d["params"]
        return t


engagetargets_tasks = {
    AntishipStrikeTaskAction.Key: AntishipStrikeTaskAction,
    CASTaskAction.Key: CASTaskAction,
    CAPTaskAction.Key: CAPTaskAction,
    SEADTaskAction.Key: SEADTaskAction,
    FighterSweepTaskAction.Key: FighterSweepTaskAction,
    None: EmptyTaskAction,
}


class EscortTaskAction(Task):
    Id = "Escort"

    def __init__(self,
                 group_id: Optional[int] = None,
                 engagement_max_dist: int = 60000,
                 lastwpt: Optional[int] = None,
                 targets: Optional[List[str]] = None,
                 position: Optional[Dict[str, float]] = None):
        super(EscortTaskAction, self).__init__(EscortTaskAction.Id)
        if targets is None:
            targets = [Targets.All.Air.Planes]
        if position is None:
            position = {"x": -200, "y": -100, "z": -500}
        self.params = {
            "lastWptIndexFlagChangedManually": False,
            "lastWptIndexFlag": False,
            "engagementDistMax": engagement_max_dist,
            "targetTypes": {i: targets[i - 1] for i in range(1, len(targets) + 1)},
            "pos": position
        }
        if group_id:
            self.params["groupId"] = group_id
        if lastwpt:
            self.params["lastWptIndexFlagChangedManually"] = True
            self.params["lastWptIndexFlag"] = True
            self.params["lastWptIndex"] = lastwpt


class Expend(Enum):
    Auto = "Auto"
    One = "One"
    Two = "Two"
    Four = "Four"
    Quarter = "Quarter"
    Half = "Half"


class Bombing(Task):
    Id = "Bombing"

    def __init__(self, position: Point = Point(0, 0), weapon_type: WeaponType = WeaponType.Auto,
                 expend: Expend = Expend.Auto, attack_qty=1, group_attack=False,
                 direction: Optional[int] = None, altitude: Optional[int] = None):
        super(Bombing, self).__init__(Bombing.Id)
        self.params = {
            "directionEnabled": direction is not None,
            "direction": direction if direction is not None else 0,
            "attackQtyLimit": attack_qty > 1,
            "attackQty": attack_qty if attack_qty > 1 else 1,
            "expend": expend.value,
            "x": position.x,
            "y": position.y,
            "groupAttack": group_attack,
            "altitude": altitude if altitude is not None else 0,
            "altitudeEnabled": altitude is not None,
            "weaponType": weapon_type.value
        }


class BombingRunway(Task):
    Id = "BombingRunway"

    def __init__(self, airport_id: int = 0, weapon_type: WeaponType = WeaponType.Auto,
                 expend: Expend = Expend.Auto, attack_qty: int = 1, group_attack: bool = False,
                 direction: Optional[int] = None, altitude: Optional[int] = None):
        super(BombingRunway, self).__init__(BombingRunway.Id)
        self.params = {
            "directionEnabled": direction is not None,
            "direction": direction if direction is not None else 0,
            "attackQtyLimit": attack_qty > 1,
            "attackQty": attack_qty if attack_qty > 1 else 1,
            "expend": expend.value,
            "runwayId": airport_id,
            "groupAttack": group_attack,
            "altitude": altitude if altitude is not None else 0,
            "altitudeEnabled": altitude is not None,
            "weaponType": weapon_type.value
        }


class EngageTargets(Task):
    Id = "EngageTargets"

    def __init__(self, max_distance: Optional[int] = None,
                 targets: Optional[List[Type[TargetType]]] = None):
        super(EngageTargets, self).__init__(EngageTargets.Id)
        if targets is None:
            targets = [Targets.All]
        self.params = {
            "targetTypes": {i: targets[i - 1] for i in range(1, len(targets) + 1)},
            "maxDistEnabled": True if max_distance else False,
            "maxDist": max_distance,
            "priority": 0
        }


class EngageTargetsInZone(Task):
    Id = "EngageTargetsInZone"

    def __init__(self, position: Point = Point(0, 0), radius: int = 5000,
                 targets: Optional[List[Type[TargetType]]] = None) -> None:
        super(EngageTargetsInZone, self).__init__(EngageTargetsInZone.Id)
        if targets is None:
            targets = [Targets.All]
        self.params = {
            "targetTypes": {i: targets[i - 1] for i in range(1, len(targets) + 1)},
            "priority": 0,
            "x": position.x,
            "y": position.y,
            "zoneRadius": radius
        }


class EngageGroup(Task):
    Id = "EngageGroup"

    def __init__(self, group_id=0, visible=False):
        super(EngageGroup, self).__init__(EngageGroup.Id)
        self.auto = False
        self.params = {
            "visible": visible,
            "groupId": group_id,
            "priority": 1,
            "weaponType": WeaponType.Auto.value
        }


class EngageUnit(Task):
    Id = "EngageUnit"

    def __init__(self, unit_id=0, visible=False):
        super(EngageUnit, self).__init__(EngageUnit.Id)
        self.auto = False
        self.params = {
            "visible": visible,
            "groupAttack": False,
            "unitId": unit_id,
            "priority": 1,
            "weaponType": WeaponType.Auto.value,
            "directionEnabled": False,
            "direction": 0,
            "altitudeEnabled": False,
            "attackQtyLimit": False,
            "attackQty": 0
        }


class FireAtPoint(Task):
    Id = "FireAtPoint"

    def __init__(self, position: Point = Point(0, 0), rounds: Optional[int] = None, radius: int = 0):
        super(FireAtPoint, self).__init__(FireAtPoint.Id)
        self.auto = False
        self.params = {
            "y": position.y,
            "x": position.x,
            "expendQty": rounds if rounds else 1,
            "expendQtyEnabled": rounds is not None,
            "templateId": "",
            "weaponType": WeaponType.Auto.value,
            "zoneRadius": radius
        }


class Hold(Task):
    """Unit will hold current position"""
    Id = "Hold"

    def __init__(self):
        super(Hold, self).__init__(self.Id)

        self.params = {
            "templateId": ""
        }


class AWACSTaskAction(Task):
    Id = "AWACS"

    def __init__(self):
        super(AWACSTaskAction, self).__init__(AWACSTaskAction.Id)


class RefuelingTaskAction(Task):
    """Assigns the aircraft group to refuel at the nearest tanker aircraft."""
    Id = "Refueling"

    def __init__(self):
        super(RefuelingTaskAction, self).__init__(RefuelingTaskAction.Id)


class Tanker(Task):
    """Assigns the aircraft to act as an Airborne tanker."""
    Id = "Tanker"

    def __init__(self):
        super(Tanker, self).__init__(Tanker.Id)


class OrbitAction(Task):
    Id = "Orbit"

    class OrbitPattern(Enum):
        RaceTrack = "Race-Track"
        Circle = "Circle"

    def __init__(self, altitude=4000, speed=600, pattern: OrbitPattern = OrbitPattern.RaceTrack):
        super(OrbitAction, self).__init__(OrbitAction.Id)
        self.params = {
            "altitude": altitude,
            "pattern": pattern.value,
            "speed": speed / 3.6,
            "speedEdited": True
        }


class Follow(Task):
    Id = "Follow"

    def __init__(self, groupid=None, position: Point = Point(-200, 0), altitude_difference=-200, last_wpt=None):
        super(Follow, self).__init__(self.Id)

        self.params = {
            "pos": {"x": position.x, "z": position.y, "y": altitude_difference}
        }
        if groupid is not None:
            self.params["groupId"] = groupid
        if last_wpt:
            self.params["lastWptIndexFlag"] = True
            self.params["lastWptIndex"] = last_wpt
            self.params["lastWptIndexFlagChangedManually"] = False


class Aerobatics(Task):
    Id = "Aerobatics"

    def __init__(self):
        super(Aerobatics, self).__init__(self.Id)

        self.params = {
            "maneuversSequency": [],  # TODO
            "maneuversParams": {}
        }


class Designation(Enum):
    No = "No"
    Auto = "Auto"
    WP = "WP"
    IRPointer = "IR-Pointer"
    Laser = "Laser"


class FAC(Task):
    Id = "FAC"

    def __init__(self, callsign: int = 1, designation: Designation = Designation.Auto,
                 frequency: int = 30, modulation: Modulation = Modulation.FM, number: int = 1):
        super(FAC, self).__init__(self.Id)

        self.params = {
            "designation": designation.value,
            "frequency": frequency * 1000000,
            "modulation": modulation.value,
            "datalink": True,
            "callname": callsign,
            "number": number
        }


class FACEngageGroup(Task):
    Id = "FAC_EngageGroup"

    def __init__(self, group_id: int = 0, visible=False, weapon_type: WeaponType = WeaponType.Auto, priority: int = 0,
                 callsign: int = 1, designation: Designation = Designation.Auto,
                 frequency: int = 30, modulation: Modulation = Modulation.FM, datalink=True, number: int = 1):
        super(FACEngageGroup, self).__init__(self.Id)

        self.params = {
            "groupId": group_id,
            "visible": visible,
            "weaponType": weapon_type.value,
            "designation": designation.value,
            "frequency": frequency * 1000000,
            "modulation": modulation.value,
            "datalink": datalink,
            "callname": callsign,
            "number": number,
            "priority": priority
        }


class Land(Task):
    """Helicopter landing task.

    If added to a helicopter group, the group will land at the given coordinates for the given duration.

    :param position: :py:class:`dcs.mapping.Point` where to land
    :param duration: how long the helicopter should stay on ground in seconds.
    """
    Id = "Land"

    def __init__(self, position: Point = Point(0, 0), duration: int = None):
        super(Land, self).__init__(self.Id)

        self.params = {
            "x": position.x,
            "y": position.y,
            "duration": duration if duration else 300,
            "durationFlag": duration is not None
        }


class Embarking(Task):
    """Pickup task for helicopters.

    Helicopter group will land at the given coordinates and will pickup the given groups.

    :param position: :py:class:`dcs.mapping.Point` where to land and pickup
    :param groupids: list of groups to pickup
    :param distribution: dictionary with heli unit to groups to pickup mapping {heliunit: [grp1, grp2], ..}
    :param duration: how long the helicopter should stay on ground  and wait in seconds.
    """
    Id = "Embarking"

    def __init__(self, position: Point = Point(0, 0), groupids: List[int] = None,
                 distribution: Dict[int, List[int]] = None, duration: int = None):
        super(Embarking, self).__init__(self.Id)

        groupids = [] if groupids is None else groupids
        distribution = {} if distribution is None else distribution

        self.params = {
            "x": position.x,
            "y": position.y,
            "duration": duration if duration else 300,
            "durationFlag": duration is not None,
            "groupsForEmbarking": {x: x for x in groupids},
            "distributionFlag": len(distribution) > 0,
            "distribution": {x: {y: y for y in distribution[x]} for x in distribution}
        }


class EmbarkToTransport(Task):
    """Task for ground units that will get picked up by a helicopter

    :param position: :py:class:`dcs.mapping.Point` where to wait to get picked up.
    :param zone_radius: radius around the point where the group will embark.
    :param concrete_unitid: if specified the group will embark to exaclty this unit.
    """
    Id = "EmbarkToTransport"

    def __init__(self, position: Point = Point(0, 0), zone_radius=200, concrete_unitid=None):
        super(EmbarkToTransport, self).__init__(self.Id)

        self.params = {
            "x": position.x,
            "y": position.y,
            "zoneRadius": zone_radius,
            "concretteUnitChecked": concrete_unitid is not None,
            "selectedUnit": concrete_unitid if concrete_unitid else -1
        }


class DisembarkFromTransport(Task):
    """Task for ground units that will disembark a transport helicopter

    :param position: :py:class:`dcs.mapping.Point` where the group will disembark
    :param zone_radius: radius around the point where the group will disembark.
    """
    Id = "DisembarkFromTransport"

    def __init__(self, position: Point = Point(0, 0), zone_radius=200):
        super(DisembarkFromTransport, self).__init__(self.Id)

        self.params = {
            "x": position.x,
            "y": position.y,
            "zoneRadius": zone_radius
        }


class CargoTransportation(Task):
    """Task for Cargo transportation.

    :param groupid: cargo group id
    :param zoneid: zone id to transport to??
    """
    Id = "CargoTransportation"

    def __init__(self, groupid=None, zoneid=None):
        super(CargoTransportation, self).__init__(self.Id)

        self.params = {}
        if groupid:
            self.params["groupId"] = groupid
        if zoneid:
            self.params["zoneId"] = zoneid


class EWR(Task):
    Id = "EWR"

    def __init__(self):
        super(EWR, self).__init__(self.Id)


class GoToWaypoint(Task):
    Id = "GoToWaypoint"

    def __init__(self, from_index=None, to_index=None):
        super(GoToWaypoint, self).__init__(self.Id)

        self.params = {}
        if from_index:
            self.params["fromWaypointIndex"] = from_index

        if to_index:
            self.params["nWaypointIndx"] = to_index


tasks_map = {
    ControlledTask.Id: ControlledTask,
    EscortTaskAction.Id: EscortTaskAction,
    AttackGroup.Id: AttackGroup,
    Bombing.Id: Bombing,
    BombingRunway.Id: BombingRunway,
    EngageTargetsInZone.Id: EngageTargetsInZone,
    EngageGroup.Id: EngageGroup,
    EngageUnit.Id: EngageUnit,
    AWACSTaskAction.Id: AWACSTaskAction,
    RefuelingTaskAction.Id: RefuelingTaskAction,
    Tanker.Id: Tanker,
    OrbitAction.Id: OrbitAction,
    Follow.Id: Follow,
    Aerobatics.Id: Aerobatics,
    FAC.Id: FAC,
    FACEngageGroup.Id: FACEngageGroup,
    Hold.Id: Hold,
    Land.Id: Land,
    Embarking.Id: Embarking,
    EmbarkToTransport.Id: EmbarkToTransport,
    DisembarkFromTransport.Id: DisembarkFromTransport,
    CargoTransportation.Id: CargoTransportation,
    EWR.Id: EWR,
    GoToWaypoint.Id: GoToWaypoint,
    FireAtPoint.Id: FireAtPoint
}


class WrappedAction(Task):
    Id = "WrappedAction"

    def __init__(self):
        super(WrappedAction, self).__init__(WrappedAction.Id)

    @property
    def value(self):
        return self.params["action"]["params"].get("value")


class EPLRS(WrappedAction):
    Key = "EPLRS"

    def __init__(self, group_id=1):
        super(EPLRS, self).__init__()
        self.params = {
            "action": {"id": EPLRS.Key, "params": {"value": True, "groupId": group_id}}
        }

    @property
    def eplrs(self):
        return self.params["action"]["params"]["groupId"]


class ActivateBeaconCommand(WrappedAction):
    Key = "ActivateBeacon"

    @staticmethod
    def calc_tacan_frequency(mode_channel, channel, aa=True):
        if not aa and mode_channel == "X":
            if channel < 64:
                freq = 962 + channel - 1
            else:
                freq = 1151 + channel - 64
        else:
            if channel < 64:
                freq = 1088 + channel - 1
            else:
                freq = 1025 + channel - 64

        return freq * 1000000

    def __init__(self, channel=10, modechannel="X", callsign="TKR", bearing=True, unit_id=0, aa=True):
        super(ActivateBeaconCommand, self).__init__()
        self.params = {
            "action": {
                "id": ActivateBeaconCommand.Key,
                "params": {
                    "type": 4,
                    "frequency": self.calc_tacan_frequency(modechannel, channel, aa),
                    "callsign": callsign,
                    "channel": channel,
                    "unitId": unit_id,
                    "modeChannel": modechannel,
                    "bearing": bearing,
                    "system": 4 if aa else 3,
                }
            }
        }


class DeActivateBeaconCommand(WrappedAction):
    Key = "DeactivateBeacon"

    def __init__(self):
        super(DeActivateBeaconCommand, self).__init__()
        self.params = {
            "action": {
                "id": DeActivateBeaconCommand.Key,
                "params": {}
            }
        }


class ActivateICLSCommand(WrappedAction):
    Key = "ActivateICLS"

    def __init__(self, channel=1, unit_id=0):
        super(ActivateICLSCommand, self).__init__()
        self.params = {
            "action": {
                "id": ActivateICLSCommand.Key,
                "params": {
                    "type": 131584,
                    "channel": channel,
                    "unitId": unit_id
                }
            }
        }


class RunScript(WrappedAction):
    """Runs a given script string

    :param script: to be executed
    """
    Key = "Script"

    def __init__(self, script: str = ""):
        super(RunScript, self).__init__()
        self.params = {
            "action": {
                "id": self.Key,
                "params": {"command": script}
            }
        }


class RunScriptFile(WrappedAction):
    """Runs a script attached to the mission

    :param resourcekey: resource key to the script file, see :py:class:`dcs.mission.MapResource`
    """
    Key = "ScriptFile"

    def __init__(self, resourcekey: str = ""):
        super(RunScriptFile, self).__init__()
        self.params = {
            "action": {
                "id": self.Key,
                "params": {"file": resourcekey}
            }
        }


class TransmitMessage(WrappedAction):
    """Transmits a given sound file over the current radio channel.

    :param soundfile_reskey: resource key to the sound file to transmit, see :py:class:`dcs.mission.MapResource`
    :param subtitle_resstring: string resource key to subtitle displayed,
                               see :py:attr:`dcs.mission.Mission.translation`
    :param loop: True or False if the sound file should be looped.
    :param subtitle_duration: how long the subtitle should be displayed in seconds.
    """
    Key = "TransmitMessage"

    def __init__(self, soundfile_reskey: Optional[str] = None, subtitle_resstring: Optional[str] = None,
                 loop=False, subtitle_duration=5):
        super(TransmitMessage, self).__init__()

        self.params = {
            "action": {
                "id": self.Key,
                "params": {
                    "file": soundfile_reskey,
                    "loop": loop,
                    "duration": subtitle_duration
                }
            }
        }
        if subtitle_resstring:
            self.params["action"]["params"]["subtitle"] = subtitle_resstring


class StopTransmission(WrappedAction):
    """Stops any :py:class:`dcs.task.TransmitMessage` task currently ongoing.
    """
    Key = "StopTransmission"

    def __init__(self):
        super(StopTransmission, self).__init__()

        self.params = {
            "action": {
                "id": self.Key,
                "params": {}
            }
        }


class SetFrequencyCommand(WrappedAction):
    """Set the groups radio frequency.

    :param frequency: frequency band in mhz.
    :param modulation: AM or FM, see :py:class:`dcs.task.Modulation`
    """
    Key = "SetFrequency"

    def __init__(self, frequency=133, modulation: Modulation = Modulation.AM, power: int = 10):
        super(SetFrequencyCommand, self).__init__()
        self.params = {
            "action": {
                "id": SetFrequencyCommand.Key,
                "params": {"modulation": modulation.value, "frequency": frequency * 1000000, "power": power}
            }
        }


class SetFrequencyForUnitCommand(WrappedAction):
    """Set the groups radio frequency.

    :param frequency: frequency band in mhz.
    :param modulation: AM or FM, see :py:class:`dcs.task.Modulation`
    """
    Key = "SetFrequencyForUnit"

    def __init__(self, frequency=133, modulation: Modulation = Modulation.AM, power: int = 10, unit: Unit = None):
        super(SetFrequencyForUnitCommand, self).__init__()
        self.params = {
            "action": {
                "id": SetFrequencyForUnitCommand.Key,
                "params": {
                    "modulation": modulation.value,
                    "frequency": frequency * 1000000,
                    "power": power}
            }
        }
        if unit:
            self.params["action"]["params"]["unitId"] = unit.id


class SwitchWaypoint(WrappedAction):
    """Switch to a different waypoint.

    :param from_waypoint: from which waypoint to switch.??
    :param to_waypoint: new current waypoint
    """
    Key = "SwitchWaypoint"

    def __init__(self, from_waypoint=1, to_waypoint=2):
        super(SwitchWaypoint, self).__init__()
        self.params = {
            "action": {
                "id": self.Key,
                "params": {
                    "goToWaypointIndex": to_waypoint,
                    "fromWaypointIndex": from_waypoint
                }
            }
        }


class SetInvisibleCommand(WrappedAction):
    Key = "SetInvisible"

    def __init__(self, value=True):
        super(SetInvisibleCommand, self).__init__()
        self.params = {
            "action": {
                "id": SetInvisibleCommand.Key,
                "params": {"value": value}
            }
        }


class SetImmortalCommand(WrappedAction):
    Key = "SetImmortal"

    def __init__(self, value=True):
        super(SetImmortalCommand, self).__init__()
        self.params = {
            "action": {
                "id": SetImmortalCommand.Key,
                "params": {"value": value}
            }
        }


class SmokeCommand(WrappedAction):
    Key = "SMOKE_ON_OFF"

    def __init__(self, value: bool = True):
        super(SmokeCommand, self).__init__()
        self.params = {
            "action": {
                "id": SmokeCommand.Key,
                "params": {"value": value}
            }
        }


class StartCommand(WrappedAction):
    Key = "Start"

    def __init__(self):
        super(StartCommand, self).__init__()
        self.params = {
            "action": {
                "id": StartCommand.Key,
                "params": {}
            }
        }


wrappedactions = {
    EPLRS.Key: EPLRS,
    ActivateBeaconCommand.Key: ActivateBeaconCommand,
    DeActivateBeaconCommand.Key: DeActivateBeaconCommand,
    ActivateICLSCommand.Key: ActivateICLSCommand,
    SetFrequencyCommand.Key: SetFrequencyCommand,
    SetFrequencyForUnitCommand.Key: SetFrequencyForUnitCommand,
    SetInvisibleCommand.Key: SetInvisibleCommand,
    SetImmortalCommand.Key: SetImmortalCommand,
    RunScript.Key: RunScript,
    RunScriptFile.Key: RunScriptFile,
    TransmitMessage.Key: TransmitMessage,
    StopTransmission.Key: StopTransmission,
    SwitchWaypoint.Key: SwitchWaypoint,
    StartCommand.Key: StartCommand,
    SmokeCommand.Key: SmokeCommand,
}


class MainTask:
    id = None  # type: int
    name = None  # type: str
    internal_name = None  # type: str
    sub_tasks = []
    perform_task: List[Type[Task]] = []
    map: Dict[str, Type['MainTask']] = {}


class Nothing(MainTask):
    id = 15
    name = "Nothing"
    internal_name = "Nothing"
    sub_tasks = [OrbitAction, Follow, Aerobatics]


class AFAC(MainTask):
    id = 16
    name = "AFAC"
    internal_name = "AFAK"
    sub_tasks = [OrbitAction, Follow, AttackGroup, AttackUnit, Bombing, AttackMapObject]


class AWACS(MainTask):
    id = 14
    name = "AWACS"
    internal_name = "AWACS"
    sub_tasks = [OrbitAction, Follow, RefuelingTaskAction]
    perform_task = [AWACSTaskAction]


class AntishipStrike(MainTask):
    id = 30
    name = "Antiship Strike"
    internal_name = "AntishipStrike"
    sub_tasks = [OrbitAction, Follow, AttackGroup, AttackUnit]
    perform_task = [AntishipStrikeTaskAction]


class CAS(MainTask):
    id = 31
    name = "CAS"
    internal_name = "CAS"
    sub_tasks = [OrbitAction, Follow, AttackGroup, AttackUnit, Aerobatics, RefuelingTaskAction]
    perform_task = [CASTaskAction]

    class EnrouteTasks:
        EngageGroup = EngageGroup
        EngageTargetsInZone = EngageTargetsInZone
        EngageUnit = EngageUnit


class CAP(MainTask):
    id = 11
    name = "CAP"
    internal_name = "CAP"
    sub_tasks = [OrbitAction, Follow, Aerobatics]
    perform_task = [CAPTaskAction]

    class EnrouteTasks:
        EngageTargets = EngageTargets
        EngageTargetsInZone = EngageTargetsInZone
        EngageGroup = EngageGroup
        EngageUnit = EngageUnit


class Escort(MainTask):
    id = 18
    name = "Escort"
    internal_name = "Escort"
    sub_tasks = [OrbitAction, Follow, EscortTaskAction]
    perform_task = [EscortTaskAction]


class FighterSweep(MainTask):
    id = 19
    name = "Fighter Sweep"
    internal_name = "FighterSweep"
    sub_tasks = [OrbitAction, Follow, Aerobatics]
    perform_task = [FighterSweepTaskAction]


class GroundAttack(MainTask):
    id = 32
    name = "Ground Attack"
    internal_name = "GroundAttack"
    sub_tasks = [OrbitAction, Follow, Bombing, AttackMapObject, Aerobatics]


class Intercept(MainTask):
    id = 10
    name = "Intercept"
    internal_name = "Intercept"
    sub_tasks = [OrbitAction, Follow, AttackGroup, AttackUnit, Aerobatics]


class PinpointStrike(MainTask):
    id = 33
    name = "Pinpoint Strike"
    internal_name = "PinpointStrike"
    sub_tasks = [OrbitAction, Follow, Bombing, AttackMapObject]


class Reconnaissance(MainTask):
    id = 17
    name = "Reconnaissance"
    internal_name = "Reconnaissance"
    sub_tasks = [OrbitAction, Follow, Aerobatics]
    perform_task = []


class Refueling(MainTask):
    id = 13
    name = "Refueling"
    internal_name = "Refueling"
    sub_tasks = [OrbitAction, Follow]
    perform_task = [Tanker]


class RunwayAttack(MainTask):
    id = 34
    name = "Runway Attack"
    internal_name = "RunwayAttack"
    sub_tasks = [OrbitAction, Follow, Bombing, BombingRunway, AttackMapObject]
    perform_task = []


class SEAD(MainTask):
    id = 29
    name = "SEAD"
    internal_name = "SEAD"
    sub_tasks = [OrbitAction, Follow, AttackGroup, AttackUnit, EscortTaskAction]
    perform_task = [SEADTaskAction]


class Transport(MainTask):
    id = 35
    name = "Transport"
    internal_name = "Transport"
    sub_tasks = [OrbitAction, Follow, Aerobatics]
    perform_task = []


MainTask.map = {
    Nothing.name: Nothing,
    AFAC.name: AFAC,
    AntishipStrike.name: AntishipStrike,
    CAS.name: CAS,
    SEAD.name: SEAD,
    CAP.name: CAP,
    Escort.name: Escort,
    FighterSweep.name: FighterSweep,
    Intercept.name: Intercept,
    PinpointStrike.name: PinpointStrike,
    GroundAttack.name: GroundAttack,
    RunwayAttack.name: RunwayAttack,
    AWACS.name: AWACS,
    Reconnaissance.name: Reconnaissance,
    Refueling.name: Refueling,
    Transport.name: Transport
}

# options


class Option(Task):
    Id = "WrappedAction"
    Key = None

    def __init__(self, value=None):
        super(Option, self).__init__(Option.Id)
        self.params = {
            "action": {"id": "Option", "params": {"name": self.Key}}
        }
        if value:
            self.params["action"]["params"]["value"] = value

    @property
    def value(self) -> Union[str, int, bool]:
        return self.params["action"]["params"]["value"]


class OptROE(Option):
    """
    Sets the groups rules of engagement.
    Ultimately defines whether or not the AI group is allowed to attack.
    This option can override all other tasking. With the 1.5 patch two of the values
    have different names in the mission editor.
    However the behavior is still exactly the same as before,
    its just labeled slightly different. The scripting engine still uses the previous values.
    """
    Key = 0

    class Values:
        WeaponFree = 0
        """
        AI will engage any enemy group it detects.
        Target prioritization is based based on the threat of the target.
        """
        OpenFireWeaponFree = 1
        """AI will engage any enemy group it detects, but will prioritize targets specified in the groups tasking."""
        OpenFire = 2
        """AI will engage only targets specified in its taskings."""
        ReturnFire = 3
        """AI will only engage threats that shoot first."""
        WeaponHold = 4
        """AI will hold fire under all circumstances."""

    def __init__(self, value=Values.WeaponFree):
        super(OptROE, self).__init__(value)


class OptReactOnThreat(Option):
    """
    Defines the allowable action for an airborne group to take in response to a threat.
    This option can have an effect on other tasking.
    """
    Key = 1

    class Values(IntEnum):
        NoReaction = 0
        """No defensive actions will take place to counter threats"""
        PassiveDefense = 1
        """
        AI will use jammers and other countermeasures in an attempt to defeat the threat.
        AI will not attempt a maneuver to defeat a threat.
        """
        EvadeFire = 2
        """
        AI will react by performing defensive maneuvers against incoming threats,
        AI will also use passive defense.
        """
        ByPassAndEscape = 3
        """
        AI will attempt to avoid enemy threat zones all together.
        This includes attempting to fly above or around threats.
        """
        AllowAbortMission = 4
        """If a threat is deemed severe enough the AI will abort its mission and return to base."""

    def __init__(self, value=Values.NoReaction):
        super(OptReactOnThreat, self).__init__(value.value)


class OptRadarUsing(Option):
    Key = 3

    class Values(IntEnum):
        NeverUse = 0
        UseForAttackOnly = 1
        UseForSearchIfRequired = 2
        UseForContinuousSearch = 3

    def __init__(self, value: Values = Values.UseForContinuousSearch):
        super(OptRadarUsing, self).__init__(value.value)


class OptChaffFlareUsing(Option):
    Key = 4

    class Values(IntEnum):
        NeverUse = 0
        """
        Never use chaff or flare
        """
        UseAgainstFiredMissile = 1
        """AI will use chaff/flare against fired missiles"""
        UseWhenFlyingInSAMWEZ = 2
        """AI will use chaff/flare while in SAM range"""
        UseWhenFlyingNearEnemies = 3
        """AI will use chaff/flare while enemies are near"""

    def __init__(self, value: Values = Values.UseWhenFlyingInSAMWEZ):
        super(OptChaffFlareUsing, self).__init__(value.value)


class OptFormation(Option):
    Key = 5

    # TODO missing option enums

    def __init__(self, value=None):
        super(OptFormation, self).__init__(value)


class OptRTBOnBingoFuel(Option):
    Key = 6

    def __init__(self, value: bool = True):
        super(OptRTBOnBingoFuel, self).__init__(value)


class OptRadioSilence(Option):
    Key = 7

    def __init__(self, value: bool = True):
        super(OptRadioSilence, self).__init__(value)


class OptDisparseUnderFire(Option):
    Key = 8

    def __init__(self, value=None):
        super(OptDisparseUnderFire, self).__init__(value)


class OptAlarmState(Option):
    Key = 9

    def __init__(self, value=None):
        super(OptAlarmState, self).__init__(value)


class OptRTBOnOutOfAmmo(Option):
    Key = 10

    class Values(IntEnum):
        NoWeapon = 0
        All = 4294967295
        Unguided = 805339120
        Cannon = 805306368
        Rockets = 30720
        SmokeRockets = 4096
        LightRockets = 2048
        CandleRockets = 8192
        HeavyRockets = 16384
        Bombs = 2032
        IronBombs = 240
        ClusterBombs = 768
        CandleBombs = 1024
        Guided = 268402702
        GuidedBombs = 14
        Missiles = 268402688
        ASM = 4161536
        ATGM = 131072
        StandardASM = 1835008
        ARM = 32768
        Antiship = 65536
        CruiseMissile = 2097152
        AAM = 264241152
        SR_AAM = 4194304
        MR_AAM = 8388608
        LR_AAM = 16777216

    def __init__(self, value: Values = Values.All):
        super(OptRTBOnOutOfAmmo, self).__init__(value.value)


class OptECMUsing(Option):
    Key = 13

    class Values(IntEnum):
        NeverUse = 0
        UseIfOnlyLockByRadar = 1
        UseIfDetectedLockByRadar = 2
        AlwaysUse = 3

    def __init__(self, value: Values = Values.UseIfOnlyLockByRadar):
        super(OptECMUsing, self).__init__(value.value)


class OptRestrictAirToAirAttack(Option):
    Key = 14

    def __init__(self, value: bool = True):
        super(OptRestrictAirToAirAttack, self).__init__(value)


class OptRestrictJettison(Option):
    Key = 15

    def __init__(self, value=None):
        super(OptRestrictJettison, self).__init__(value)


class OptRestrictAfterburner(Option):
    Key = 16

    def __init__(self, value=None):
        super(OptRestrictAfterburner, self).__init__(value)


class OptRestrictAirToGround(Option):
    Key = 17

    def __init__(self, value: bool = True):
        super(OptRestrictAirToGround, self).__init__(value)


class OptAAMissileAttackRange(Option):
    Key = 18

    class Values(IntEnum):
        MaxRange = 0
        NoEscRange = 1
        HalfWayRMaxNoEsc = 2
        TargetThreatEst = 3
        RandomRange = 4

    def __init__(self, value: Values = Values.TargetThreatEst):
        super(OptAAMissileAttackRange, self).__init__(value.value)


class OptNoReportWaypointPass(Option):
    Key = 19

    def __init__(self, value=None):
        super(OptNoReportWaypointPass, self).__init__(value)


class OptEngageAirWeapons(Option):
    Key = 20

    def __init__(self, value=None):
        super(OptEngageAirWeapons, self).__init__(value)


class OptRadioUsageContact(Option):
    Key = 21

    def __init__(self, value: Type[TargetType] = Targets.All):
        super(OptRadioUsageContact, self).__init__(value)


class OptRadioUsageEngage(Option):
    Key = 22

    def __init__(self, value: Type[TargetType] = Targets.All):
        super(OptRadioUsageEngage, self).__init__(value)


class OptRadioUsageKill(Option):
    Key = 23

    def __init__(self, value: Type[TargetType] = Targets.All):
        super(OptRadioUsageKill, self).__init__(value)


options = {
    OptROE.Key: OptROE,
    OptReactOnThreat.Key: OptReactOnThreat,
    OptRadarUsing.Key: OptRadarUsing,
    OptChaffFlareUsing.Key: OptChaffFlareUsing,
    OptFormation.Key: OptFormation,
    OptRTBOnBingoFuel.Key: OptRTBOnBingoFuel,
    OptRadioSilence.Key: OptRadioSilence,
    OptDisparseUnderFire.Key: OptDisparseUnderFire,
    OptAlarmState.Key: OptAlarmState,
    OptRTBOnOutOfAmmo.Key: OptRTBOnOutOfAmmo,
    OptECMUsing.Key: OptECMUsing,
    OptRestrictAirToAirAttack.Key: OptRestrictAirToAirAttack,
    OptRestrictJettison.Key: OptRestrictJettison,
    OptRestrictAfterburner.Key: OptRestrictAfterburner,
    OptRestrictAirToGround.Key: OptRestrictAirToGround,
    OptAAMissileAttackRange.Key: OptAAMissileAttackRange,
    OptNoReportWaypointPass.Key: OptNoReportWaypointPass,
    OptEngageAirWeapons.Key: OptEngageAirWeapons,
    OptRadioUsageContact.Key: OptRadioUsageContact,
    OptRadioUsageEngage.Key: OptRadioUsageEngage,
    OptRadioUsageKill.Key: OptRadioUsageKill,
}
