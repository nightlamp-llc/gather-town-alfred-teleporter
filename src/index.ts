import fs from 'node:fs';
import path from 'node:path';
import { Game } from '@gathertown/gather-game-client';
import dotenv from 'dotenv';
import isomorphicWS from 'isomorphic-ws';
import sanitizeFilename from 'sanitize-filename';

dotenv.config({
  path: path.join(__dirname, '..', '.env'),
});

global.WebSocket = isomorphicWS;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const GATHER_API_KEY = process.env.GATHER_API_KEY || '';
const GATHER_SPACE_ID = process.env.GATHER_SPACE_ID || '';
const GATHER_SPACE_NAME = process.env.GATHER_SPACE_NAME || '';
const GATHER_SPACE_INFO = `${GATHER_SPACE_ID}\\${GATHER_SPACE_NAME}`;

if (!GATHER_API_KEY || !GATHER_SPACE_ID || !GATHER_SPACE_NAME) {
  throw new Error('GAME_API_KEY, GAME_SPACE_ID, and GAME_SPACE_NAME must be provided in the .env file');
}

const MODE_LIST = ['setup', 'teleport', 'save'] as const;
type CommandList = (typeof MODE_LIST)[number];

if (process.argv.length < 3 || !MODE_LIST.includes(process.argv[2] as CommandList)) {
  throw new Error(`Please set argument of ${MODE_LIST.join(' | ')}`);
}

const gather = new Game(GATHER_SPACE_INFO, () => Promise.resolve({ apiKey: GATHER_API_KEY }));
gather.subscribeToConnection((connection) => {
  if (!connection) {
    return;
  }

  switch (process.argv[2]) {
    case MODE_LIST[0]:
      featureSetup();
      break;
    case MODE_LIST[1]:
      featureTeleport();
      break;
    case MODE_LIST[2]:
      featureSave();
      break;
  }
});
gather.connect();

const featureSetup = async () => {
  const shFilesDirForAlfred = getPathOfShFilesDirForAlfred();

  const players = await getPlayers();
  for (const [playerId, player] of Object.entries(players)) {
    const shFileForAlfred = path.join(
      shFilesDirForAlfred,
      `gt-${sanitizeFilename(player.name, { replacement: '_' })}.sh`,
    );
    fs.writeFileSync(shFileForAlfred, `#!/bin/bash\n${process.argv[0]} ${process.argv[1]} teleport ${playerId}`);
    fs.chmodSync(shFileForAlfred, 0o755);
    console.log(`Created file: ${shFileForAlfred}`);
  }

  console.log('Setup completed');
  gather.disconnect();
};

const featureTeleport = async () => {
  const playerIdOrMapIdXY = process.argv[3] || '-';

  if (playerIdOrMapIdXY === '-') {
    console.log('Please set argument of player ID or map ID and coordinates');
    gather.disconnect();
    return;
  }

  if (process.argv[3].split(',').length === 3) {
    const [mapId, x, y] = process.argv[3].split(',');
    gather.teleport(mapId, Number(x), Number(y));
    console.log('Teleport completed');
    gather.disconnect();
    return;
  }

  await getPlayers();
  const targetPlayer = gather.getPlayer(playerIdOrMapIdXY);

  if (!targetPlayer) {
    console.log('Player not found');
    gather.disconnect();
    return;
  }

  gather.teleport(targetPlayer.map, targetPlayer.x, targetPlayer.y);
  console.log('Teleport completed');

  gather.disconnect();
  return;
};

const featureSave = async () => {
  if (!process.argv[3]) {
    console.log('Please set name of place');
    gather.disconnect();
    return;
  }

  const placeName = process.argv[3];
  const shFilesDirForAlfred = getPathOfShFilesDirForAlfred(4);

  await getPlayers();
  const player = gather.getMyPlayer();

  const shFileForAlfred = path.join(shFilesDirForAlfred, `gt-${sanitizeFilename(placeName, { replacement: '_' })}.sh`);
  fs.writeFileSync(
    shFileForAlfred,
    `#!/bin/bash\n${process.argv[0]} ${process.argv[1]} teleport ${player.map},${player.x},${player.y}`,
  );
  fs.chmodSync(shFileForAlfred, 0o755);
  console.log(`Created file: ${shFileForAlfred}`);
  console.log('Save completed');
  gather.disconnect();
};

const getPlayers = async () => {
  while (!Object.keys(gather.players).length) {
    await wait(100);
  }
  return gather.players;
};

const getPathOfShFilesDirForAlfred = (argvIndex = 3) => {
  const shFilesDirForAlfred =
    process.argv[argvIndex] ||
    path.join(String(process.env.HOME), 'Documents', 'gt');

  if (!fs.existsSync(shFilesDirForAlfred)) {
    fs.mkdirSync(shFilesDirForAlfred, { recursive: true });
    console.log(`Created directory: ${shFilesDirForAlfred}`);
  }
  return shFilesDirForAlfred;
};
