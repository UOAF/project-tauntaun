from dcs import vehicles
from dcs.mission import Mission
from namegen import namegen
from dcs import mapping

def make_sa2_site(mission: Mission,
                  country,
                  center_pos: mapping.Point,
                  orientation=0,
                  size=50,
                  num_launchers=5):

    fan_song_class = vehicles.AirDefence.SAM_SA_2_TR_SNR_75_Fan_Song
    ln_class = vehicles.AirDefence.SAM_SA_2_LN_SM_90
    name = namegen.next_unit_name(country)
    vg = mission.vehicle_group(country, name, fan_song_class, center_pos, orientation)
    for ii in range(num_launchers):
        ln = mission.vehicle(namegen.next_unit_name(country), ln_class)
        heading = orientation + 360.0*ii/num_launchers
        ln.position = center_pos.point_from_heading(heading, size)
        ln.heading = heading
        vg.add_unit(ln)
    return vg
