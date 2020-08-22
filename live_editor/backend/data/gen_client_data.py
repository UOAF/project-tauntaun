import inspect
import json
import sys
import dcs

sidc_overrides = {
    'E-3A': 'SFAPMFRW--*****',
    'Stennis': 'SFSPCLCV--****'
}

def map_planes():
    result = {}
    for module_name, module_obj in inspect.getmembers(sys.modules["dcs.planes"]):
        if inspect.isclass(module_obj) and issubclass(module_obj, dcs.unittype.FlyingType):
            plane_data = {}
            plane_data['flyable'] = module_obj.flyable
            plane_data['group_size_max'] = module_obj.group_size_max
            plane_data['large_parking_slot'] = module_obj.large_parking_slot
            plane_data['helicopter'] = module_obj.helicopter
            plane_data['fuel_max'] = module_obj.fuel_max
            # plane_data['ammo_type'] = module_obj.ammo_type
            plane_data['chaff'] = module_obj.chaff
            plane_data['flare'] = module_obj.flare
            plane_data['charge_total'] = module_obj.charge_total
            plane_data['chaff_charge_size'] = module_obj.chaff_charge_size
            plane_data['flare_charge_size'] = module_obj.flare_charge_size
            plane_data['category'] = module_obj.category
            plane_data['tacan'] = module_obj.tacan
            plane_data['eplrs'] = module_obj.eplrs
            plane_data['radio_frequency'] = module_obj.radio_frequency
            plane_data['pylons'] = {}
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


def map_weapons():
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

def map_vehicles():
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

def generate_sidc(mapped_vehicles):
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

if __name__ == '__main__':
    planes = map_planes()
    weapons = map_weapons()
    vehicles = map_vehicles()
    sidc = generate_sidc(vehicles)

    static_data = {
        'planes': planes,
        'weapons': weapons,
        'vehicles': vehicles,
        'sidc': sidc
    }

    filename = "dcs_static.json"
    with open(filename, "w") as f:
        json.dump(static_data, f)

    print("Static data saved to", filename)
