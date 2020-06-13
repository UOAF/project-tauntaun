import { Unit } from '../models/unit';

export type ForceColor = 'blue' | 'red';

export interface GameService {
  getShips(color: string): Promise<Unit[]>;
  getPlanes(color: string): Promise<Unit[]>;
}

class GameServiceImpl implements GameService {
  public async getShips(color: ForceColor): Promise<Unit[]> {
    try {
      const response = await fetch(`/game/ships/${color}`);
      return await response.json();
    } catch (error) {
      console.error(`couldn't fetch ships`, error);
      return [];
    }
  }

  public async getPlanes(color: ForceColor): Promise<Unit[]> {
    try {
      const response = await fetch(`/game/plane_groups/${color}`);
      return await response.json();
    } catch (error) {
      console.error(`couldn't fetch planes`, error);
      return [];
    }
  }
}

export const gameService: GameService = new GameServiceImpl();
