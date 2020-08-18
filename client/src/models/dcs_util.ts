import { Mission, Group } from '.';

export function findGroupById(mission: Mission, groupId: number): Group | undefined {
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

        if (groupCategory) {
          const group = groupCategory.find(g => g.id === groupId);
          if (group) return group;
        }
      }
    }
  }

  return undefined;
};

export function changeSidcCoalition(sidc: string, coalition: string): string {
  const lcCoalition = coalition.toLowerCase();
  const affiliationChar = lcCoalition === 'blue' ? 'F' : lcCoalition === 'red' ? 'H' : 'N';
  return sidc[0] + affiliationChar + sidc.substr(2);  
};