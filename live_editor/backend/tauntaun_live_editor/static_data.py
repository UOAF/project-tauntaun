import os
import sys
sys.path.append(f"{os.path.dirname(os.path.realpath(__file__))}/dcs")

import inspect
import json
import dcs

sidc_overrides = {
    'E-3A': 'SFAPMFRW--*****',
    'Stennis': 'SFSPCLCV--****',
    '55G6 EWR': 'SFGPUCDT----',
    '1L13 EWR': 'SFGPUCDT----',
    'Dry-cargo ship-1': 'SFSPXM------',
    'Dry-cargo ship-2': 'SFSPXM------'
}

def _map_planes():
    result = {}
    for module_name, module_obj in inspect.getmembers(sys.modules["dcs.planes"]):
        if inspect.isclass(module_obj) and issubclass(module_obj, dcs.unittype.FlyingType):
            plane_data = {'flyable': module_obj.flyable, 'group_size_max': module_obj.group_size_max,
                          'large_parking_slot': module_obj.large_parking_slot, 'helicopter': module_obj.helicopter,
                          'fuel_max': module_obj.fuel_max, 'chaff': module_obj.chaff, 'flare': module_obj.flare,
                          'charge_total': module_obj.charge_total, 'chaff_charge_size': module_obj.chaff_charge_size,
                          'flare_charge_size': module_obj.flare_charge_size, 'category': module_obj.category,
                          'tacan': module_obj.tacan, 'eplrs': module_obj.eplrs,
                          'radio_frequency': module_obj.radio_frequency, 'pylons': {}}
            # plane_data['ammo_type'] = module_obj.ammo_type
            for plane_name, plane_obj in inspect.getmembers(module_obj):
                if inspect.isclass(plane_obj) and plane_name[0:5] == "Pylon":
                    for pylon_name, pylon_obj in inspect.getmembers(plane_obj):
                        if isinstance(pylon_obj, tuple) and pylon_name[0] != '_':
                            pylon_number = pylon_obj[0]
                            if pylon_number not in plane_data['pylons']:
                                plane_data['pylons'][pylon_number] = []

                            plane_data['pylons'][pylon_number].append(pylon_name)

            result[module_obj.id] = plane_data

    return result

def _map_ships():
    result = {}
    for module_name, module_obj in inspect.getmembers(sys.modules["dcs.ships"]):
        if inspect.isclass(module_obj) and issubclass(module_obj, dcs.unittype.ShipType):
            ship_data = {'name': module_obj.name,
                         'detection_range': module_obj.detection_range if hasattr(module_obj, "detection_range") else 0,
                         'threat_range': module_obj.threat_range if hasattr(module_obj, "threat_range") else 0,
                         'air_weapon_dist': module_obj.air_weapon_dist if hasattr(module_obj, "air_weapon_dist") else 0}

            result[module_obj.id] = ship_data

    return result


def _map_weapons():
    def get_weapon_id(value):
        weapon_ids =  dcs.weapons_data.weapon_ids
        weapon_id = (x for x in weapon_ids if weapon_ids[x] == value)
        return next(iter(weapon_id))

    weapons_data = dcs.weapons_data.Weapons
    weapons = {}
    for name, obj in inspect.getmembers(weapons_data):
        if isinstance(obj, dict):
            weapons[name] = {
                'name': obj['name'],
                'weight': obj['weight'],
                'weapon_id': get_weapon_id(obj)
            }

    return weapons

def _map_vehicles():
    result = {}
    for module_name, module_obj in inspect.getmembers(sys.modules["dcs.vehicles"]):
        if inspect.isclass(module_obj) and module_name != "vehicle_map":
            for name, obj in inspect.getmembers(module_obj):
                if inspect.isclass(obj) and name[0] != '_':
                    result[name] = {
                        'id': obj.id,
                        'name': obj.name,
                        'detection_range': obj.detection_range,
                        'threat_range': obj.threat_range,
                        'air_weapon_dist': obj.air_weapon_dist,
                        'eprls': obj.eprls if hasattr(obj, 'eprls') else False,
                        'category': module_name
                    }

    return result

def _generate_sidc(mapped_vehicles):
    sidc_map = {}

    # Ships
    for id in dcs.ships.ship_map:
        sidc_map[id] = 'SFSP--------'

    # Planes
    for id in dcs.planes.plane_map:
        sidc_map[id] = 'SFAPMFF---*****1'

    # Helicopters
    for id in dcs.helicopters.helicopter_map:
        sidc_map[id] = 'SFAPMH------'

    # Vehicles
    for id in mapped_vehicles:
        vehicle = mapped_vehicles[id]

        sidc = 'SFGPU-------'
        category = vehicle['category']
        if category == 'Artillery':
            sidc = 'SFGPUCF-----'
        elif category == 'Infantry':
            sidc = 'SFGPUCI-----'
        elif category == 'AirDefence':
            sidc = 'SFGPUCDM----'
        elif category == 'Fortification':
            sidc = 'SFGPI-----H-'
        elif category == 'Unarmed':
            sidc = 'SFGPU-------' # default
        elif category == 'Armor':
            sidc = 'SFGPUCA-----'
        elif category == 'MissilesSS':
            sidc = 'SFGPUCM-----'
        elif category == 'Locomotive':
            sidc = 'SFGPUSTR----' # TODO "Railhead" symbol
        elif category == 'Carriage':
            sidc = 'SFGPUSTR----' # TODO "Railhead" symbol

        sidc_map[vehicle['id']] = sidc

    # Statics
    for id in dcs.statics.warehouse_map:
        sidc_map[id] = 'SFGPI-----H-'

    for id in dcs.statics.cargo_map:
        sidc_map[id] = 'SFGPI-----H-'

    for id in dcs.statics.fortification_map:
        sidc_map[id] = 'SFGPI-----H-'

    for id in dcs.statics.groundobject_map:
        sidc_map[id] = 'SFGPI-----H-'

    return {**sidc_map, **sidc_overrides}

_static_json = None

def get_static_json():
    global _static_json
    if _static_json is None:
        _static_json = gen_static_json()
    return _static_json

def gen_static_json():
    planes = _map_planes()
    weapons = _map_weapons()
    vehicles = _map_vehicles()
    ships = _map_ships()
    sidc = _generate_sidc(vehicles)
    # TODO add PointAction

    static_data = {
        'planes': planes,
        'weapons': weapons,
        'vehicles': vehicles,
        'ships': ships,
        'sidc': sidc
    }

    return  json.dumps(static_data)
