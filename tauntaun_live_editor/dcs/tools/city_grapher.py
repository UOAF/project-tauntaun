import dcs
import os


def load_graph(mission_file):
    m = dcs.mission.Mission()
    m.load_file(mission_file)

    graph = dcs.terrain.Graph()

    # add nodes
    for g in [x for x in m.country('USA').vehicle_group if x.units[0].type == dcs.vehicles.Armor.APC_AAV_7.id]:
        splitname = str(g.name).split(' ')
        rating = None
        if not splitname[-1] in dcs.terrain.Graph.Edge_indicators \
                and not splitname[-1].startswith('#') \
                and not splitname[-1] == 'shortcut':
            rating = g.spawn_probability * 100
        graph.add_node(dcs.terrain.Node(str(g.name), rating, dcs.Point(g.position.x, g.position.y)))

    # add building air defence positions
    for g in [x for x in m.country('USA').vehicle_group
              if x.units[0].type == dcs.vehicles.AirDefence.SAM_Stinger_MANPADS.id]:
        nodename = str(g.name)
        nodename = nodename.split(' ')[:-1][0]
        graph.node(nodename).air_defence_pos_small.append(g.position)

    # add node edges
    for g in [x for x in m.country('USA').vehicle_group if x.units[0].type == dcs.vehicles.Armor.APC_AAV_7.id]:
        nodename = str(g.name)
        splitname = nodename.split(' ')
        if splitname[-1] in dcs.terrain.Graph.Edge_indicators or splitname[-1].startswith('#') or splitname[-1] == 'shortcut':
            from_node = graph.node(nodename)

            if not nodename.endswith('shortcut'):
                mainnode_name = ' '.join(splitname[:-1])
                main_node = graph.node(mainnode_name)
                graph.add_edge(from_node, main_node, g.position.distance_to_point(main_node.position))
                graph.add_edge(main_node, from_node, g.position.distance_to_point(main_node.position))
                # print(from_node, main_node)

            targets = str(g.units[0].name)
            targets = targets.split(',')
            for target in targets:
                target = target.strip()
                r = target.find('#')
                if r >= 0:
                    target = target[:r].strip()

                if target.endswith('.'):
                    on_road = False
                    target = target[:-1]
                else:
                    on_road = True

                # print(from_node, target)
                to_node = graph.node(target)
                dist = g.position.distance_to_point(to_node.position)
                graph.add_edge(from_node, to_node, dist, on_road)

    # print(self.nodes)

    return graph


def main():
    basedir = os.path.dirname(__file__)
    for x in os.listdir(os.path.join(basedir, 'graph_missions')):
        split = x.split('_')
        terrainname = split[0]
        graph = load_graph(os.path.join(basedir, 'graph_missions', x))
        graph.store_pickle(os.path.join(basedir, '..', 'dcs', 'terrain', '{name}.p'.format(name=terrainname)))

if __name__ == '__main__':
    main()
