export interface GameService {
  getShips(color: string): Promise<any>;
}

class GameServiceImpl implements GameService {
  public async getShips(color: string): Promise<any> {
    try {
      const response = await fetch(`/game/ships/${color.toLowerCase()}`);
      return await response.json();
    } catch (error) {
      console.error(`couldn't fetch ships`, error);
      return [];
    }
  }
}

export const gameService: GameService = new GameServiceImpl();
