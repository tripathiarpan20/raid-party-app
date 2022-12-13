/*
party manager provides invitation, deactive, and switch player features
characters are transplanted between world app manager and local player app manager
*/
import * as THREE from 'three';

import {AppManager} from './app-manager.js';
import {world} from './world.js';
import {playersManager} from './players-manager.js';
import npcManager from './npc-manager.js';
import {appsMapName} from './constants.js';

class PartyManager extends EventTarget {
  constructor() {
    super();

    this.partyPlayers = [];
    this.removeFnMap = new WeakMap();

    this.appManager = new AppManager();

    npcManager.addEventListener('playerinvited', e => {
      const {player} = e.data;
      this.invitePlayer(player);
    });
  }

  inviteDefaultPlayer() {
    const player = playersManager.getLocalPlayer();
    const app = npcManager.getAppByNpc(player);
    world.appManager.importApp(app);
    world.appManager.transplantApp(app, this.appManager);

    this.invitePlayer(player);
  }

  switchCharacter() {
    // switch to next character
    if (this.partyPlayers.length >= 2) {
      const headPlayer = this.partyPlayers[0];
      const nextPlayer = this.partyPlayers[1];

      headPlayer.setControlMode('party');
      nextPlayer.setControlMode('controlled');

      const transplantToParty = () => {
        // transplant apps to party
        const localPlayer = headPlayer;
        for (let i = 0; i < this.partyPlayers.length; i++) {
          const player = this.partyPlayers[i];
          if (localPlayer.playerId !== player.playerId) {
            const app = npcManager.getAppByNpc(player);
            this.transplantPartyAppToParty(app, localPlayer);
          }
        }
      };
      transplantToParty();
      this.partyPlayers.shift();

      headPlayer.deletePlayerId(headPlayer.playerId);

      playersManager.setLocalPlayer(nextPlayer);

      nextPlayer.updatePhysicsStatus();
      headPlayer.updatePhysicsStatus();

      this.partyPlayers.push(headPlayer);
      this.updateMemberTargets();

      // transplant players to local player
      const transplantToPlayer = () => {
        const localPlayer = playersManager.getLocalPlayer();
        for (let i = 0; i < this.partyPlayers.length; i++) {
          const player = this.partyPlayers[i];
          if (localPlayer.playerId !== player.playerId) {
            const app = npcManager.getAppByNpc(player);
            this.transplantPartyAppToPlayer(app, localPlayer);
          }
        }
      };
      transplantToPlayer();

      return true;
    } else {
      return false;
    }
  }

  updateMemberTargets() {
    for (let i = 0; i < this.partyPlayers.length; i++) {
      const player = this.partyPlayers[i];
      const target = this.getTargetPlayer(player);
      npcManager.setPartyTarget(player, target);
    }
  }

  // add new player to party
  invitePlayer(newPlayer) {
    if (this.partyPlayers.length < 3) {
      // 3 max members
      // console.log('invitePlayer', newPlayer, this);
      this.partyPlayers.push(newPlayer);
      this.updateMemberTargets();
      if (newPlayer.getControlMode() === 'npc') {
        newPlayer.setControlMode('party');
      }

      const expelPlayer = () => {
        const player = newPlayer;
        // console.log('expelPlayer', player);
        const playerIndex = this.partyPlayers.indexOf(player);
        const app = npcManager.getAppByNpc(player);
        this.transplantPartyAppToWorld(app);
        this.partyPlayers.splice(playerIndex, 1);
        this.updateMemberTargets();
        newPlayer.setControlMode('npc');
      };

      const removePlayer = player => {
        const removeFn = this.removeFnMap.get(player);
        removeFn();
        this.removeFnMap.delete(player);
      };

      const playerexpelled = e => {
        const {player} = e.data;
        if (player === newPlayer) {
          // console.log('playerexpelled', newPlayer.name);
          const playerIndex = this.partyPlayers.indexOf(player);
          if (playerIndex > 0) {
            expelPlayer(player);
            removePlayer(player);
          } else {
            console.warn('deactive local player');
          }
        }
      };
      npcManager.addEventListener('playerexpelled', playerexpelled);

      if (this.partyPlayers.length >= 2) {
        const headPlayer = this.partyPlayers[0];
        const app = npcManager.getAppByNpc(newPlayer);
        this.transplantWorldAppToPlayer(app, headPlayer);
      }

      // add die listener
      const deletePlayer = player => {
        const playerIndex = this.partyPlayers.indexOf(player);
        if (playerIndex !== -1) {
          this.partyPlayers.splice(playerIndex, 1);
          this.updateMemberTargets();
        } else {
          console.warn('failed delete player', player);
        }
      };

      const playerApp = npcManager.getAppByNpc(newPlayer);
      const die = () => {
        const playerIndex = this.partyPlayers.indexOf(newPlayer);
        if (playerIndex > 0) {
          deletePlayer(newPlayer);
          removePlayer(newPlayer);
        } else {
          console.warn('die local player');
        }
      };
      playerApp.addEventListener('die', die);

      const removeFn = () => {
        newPlayer.removeEventListener('playerexpelled', playerexpelled);
        playerApp.removeEventListener('die', die);
      };

      this.removeFnMap.set(newPlayer, removeFn);

      return true;
    }
    return false;
  }

  getTargetPlayer(player) {
    const playerIndex = this.partyPlayers.indexOf(player);
    if (playerIndex > 0) {
      return this.partyPlayers[playerIndex - 1];
    }
    return null;
  }

  bindState(appsMap) {
    appsMap.set(appsMapName, this.appManager.appsArray);
  }

  transplantApp(app, srcAppManager, dstAppManager) {
    if (srcAppManager.hasTrackedApp(app.instanceId)) {
      srcAppManager.transplantApp(app, dstAppManager);
    } else {
      throw new Error('transplant unowned app');
    }
  }

  transplantWorldAppToPlayer(app, headPlayer) {
    this.transplantApp(app, world.appManager, headPlayer.appManager);
  }

  transplantPartyAppToPlayer(app, headPlayer) {
    this.transplantApp(app, this.appManager, headPlayer.appManager);
  }

  transplantPartyAppToWorld(app) {
    const headPlayer = this.partyPlayers[0];
    this.transplantApp(app, headPlayer.appManager, world.appManager);
  }

  transplantPartyAppToParty(app, localPlayer) {
    this.transplantApp(app, localPlayer.appManager, this.appManager);
  }

  clear() {
    // console.log('clear');
    for (const player of this.partyPlayers) {
      const removeFn = this.removeFnMap.get(player);
      removeFn();
      this.removeFnMap.delete(player);
    }
  }
}

const partyManager = new PartyManager();
export {partyManager};
