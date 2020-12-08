import wu from 'wu';
import { filter, find } from 'lodash';
import { Mission, Group, Coalitions, Dictionary, Skill, SessionData, Unit, DcsStaticData } from '.';

export function* getGroupArrays(mission: Mission) {
  for (const coalitionKey in mission.coalition) {
    const coalition = mission.coalition[coalitionKey];

    for (const countryKey in coalition.countries) {
      const country = coalition.countries[countryKey];

      const possibleGroupCategories = [
        'helicopter_group',
        'plane_group',
        'ship_group',
        'vehicle_group',
        'static_group'
      ];
      for (const groupCategoryIndex in possibleGroupCategories) {
        const groupCategoryName = possibleGroupCategories[groupCategoryIndex];
        const groupCategory = country[groupCategoryName] as Array<Group>;

        yield groupCategory.map(g => ({
          groupCategory: groupCategoryName,
          group: g,
          coalition: coalition.name,
          country: country.name
        }));
      }
    }
  }
}

export function* getGroups(mission: Mission) {
  for (const group of getGroupArrays(mission)) {
    yield* group;
  }
}

export function findGroupById(mission: Mission, groupId: number): Group | undefined {
  for (const groupArray of getGroupArrays(mission)) {
    const group = groupArray.find(g => g.group.id === groupId);
    if (group) return group.group;
  }

  return undefined;
}

export enum Affiliation {
  FRIENDLY = 'F',
  HOSTILE = 'H',
  NEUTRAL = 'N'
}

export function setSidcCoalition(sidc: string, affiliation: Affiliation): string {
  return sidc[0] + affiliation + sidc.substr(2);
}

export function calcAffiliation(from: string, to: string) {
  const affiliationMatrix: Dictionary<Dictionary<Affiliation>> = {
    [Coalitions.BLUE]: {
      [Coalitions.BLUE]: Affiliation.FRIENDLY,
      [Coalitions.RED]: Affiliation.HOSTILE,
      [Coalitions.NEUTRAL]: Affiliation.NEUTRAL,
      [Coalitions.NEUTRAL_2]: Affiliation.NEUTRAL
    },
    [Coalitions.RED]: {
      [Coalitions.BLUE]: Affiliation.HOSTILE,
      [Coalitions.RED]: Affiliation.FRIENDLY,
      [Coalitions.NEUTRAL]: Affiliation.NEUTRAL,
      [Coalitions.NEUTRAL_2]: Affiliation.NEUTRAL
    },
    [Coalitions.NEUTRAL]: {
      [Coalitions.BLUE]: Affiliation.NEUTRAL,
      [Coalitions.RED]: Affiliation.NEUTRAL,
      [Coalitions.NEUTRAL]: Affiliation.FRIENDLY,
      [Coalitions.NEUTRAL_2]: Affiliation.FRIENDLY
    },
    [Coalitions.NEUTRAL_2]: {
      [Coalitions.BLUE]: Affiliation.NEUTRAL,
      [Coalitions.RED]: Affiliation.NEUTRAL,
      [Coalitions.NEUTRAL]: Affiliation.FRIENDLY,
      [Coalitions.NEUTRAL_2]: Affiliation.FRIENDLY
    }
  };

  return affiliationMatrix[from.toLowerCase()][to.toLowerCase()];
}

export function getGroupOfUnit(mission: Mission, unitId: number | undefined) {
  if (unitId === undefined || unitId === -1) return undefined;
  return wu(getGroups(mission)).find(g => g.group.units.find(u => u.id === unitId) !== undefined)?.group;
}

export function matchCategoryToStaticCategory(category: string) {
  switch (category) {
    case 'helicopter_group':
      return 'planes';
    case 'plane_group':
      return 'planes';
    case 'vehicle_group':
      return 'vehicles';

    default:
      return '';
  }
}

export function getGroupsWithClients(mission: Mission) {
  return wu(getGroups(mission))
    .filter(g => g.group.units.find(u => !isSkillAI(u.skill)) !== undefined)
    .toArray();
}

export function findPilotNameForUnit(sessions: Dictionary<SessionData>, id: number) {
  const session = find(sessions, s => s.selected_unit_id === id);
  return session?.name;
}

export function getStaticUnit(dcsStaticData: DcsStaticData, groupCategory: string, unit: Unit) {
  switch (groupCategory) {
    case 'vehicle_group': {
      return filter(dcsStaticData.vehicles, vehicle => vehicle.id === unit.type).pop();
    }
    case 'ship_group': {
      return dcsStaticData.ships[unit.type];
    }
    default:
      return undefined;
  }
}

export function isSkillAI(skill: string) {
  return skill !== Skill.Client && skill !== Skill.Player;
}
