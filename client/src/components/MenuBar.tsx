import React from "react";
import { gameService } from "../services";

export class MenuBar extends React.Component {
    handleClick() {
        console.log("Saving mission.");
        gameService.sendSaveMission();
    }

    render() {
      return (
        <button onClick={this.handleClick}>
            Save mission
        </button>
      );
    }  
};
  