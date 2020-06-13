import { Unit } from '../models/unit';

export type ForceColor = 'blue' | 'red';
export type GetType = 'ships' | 'plane_groups';

export interface GameService {
  getShips(color: string): Promise<Unit[]>;
  getPlanes(color: string): Promise<Unit[]>;
}

class GameServiceImpl implements GameService {
  private static async getUnits(type: GetType, color: ForceColor): Promise<Unit[]> {
    try {
      const response = await fetch(`/game/${type}/${color}`);
      const units = (await response.json()) as Unit[];
      return units.map(unit => ({
        ...unit,
        uiId: `${type}-${unit.id}`,
        isSelected: false
      }));
    } catch (error) {
      console.error(`couldn't fetch planes`, error);
      return [];
    }
  }

  public async getShips(color: ForceColor): Promise<Unit[]> {
    return GameServiceImpl.getUnits('ships', color);
  }

  public async getPlanes(color: ForceColor): Promise<Unit[]> {
    return GameServiceImpl.getUnits('plane_groups', color);
  }
}

export const gameService: GameService = new GameServiceImpl();
