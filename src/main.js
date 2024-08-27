import {
  BOUNDARY_BUFFER,
  fullHeight,
  fullWidth,
  GRAVITY,
  halfHeight,
  halfWidth,
  PIPE_GAP,
  PIPE_RAND,
  PIPE_SCALE_FACTOR,
  PIPE_SPEED,
  PLAYER_JUMP,
  PLAYER_SCALE_FACTOR,
} from './constants';
import { k } from './kaboomCtx';
import { setCamScale } from './utils';

k.loadSprite('bg', './bg.png');
k.loadSprite('player', './boundman.png');
k.loadSprite('pipe', './pipe.png');
k.loadSound('bounce', './bounce.mp3');

k.setCursor('url(./cursor.png), auto');

let highScore = 0;

function handleStart() {
  k.onKeyPress('space', () => {
    k.go('game');
  });

  k.onMousePress((mouseBtn) => {
    if (mouseBtn === 'left') k.go('game');
  });
}

k.scene('start', () => {
  k.add([k.sprite('bg', { height: fullHeight, width: fullWidth })]);

  k.add([
    k.text(
      'Space/Click/Tap to Jump' + '\n' + '\n' + 'Space/Click/Tap to Start',
      {
        font: 'monogram',
        size: 28,
      }
    ),
    k.anchor('center'),
    k.pos(halfWidth, halfHeight),
  ]);

  handleStart();
});

k.scene('game', () => {
  let score = 0;

  k.add([k.sprite('bg', { height: fullHeight, width: fullWidth })]);
  k.setGravity(GRAVITY);

  const scoreText = k.add([
    k.text(score, { font: 'monogram', size: 100 }),
    k.pos(25, 0),
  ]);

  const player = k.add([
    k.sprite('player'),
    k.scale(PLAYER_SCALE_FACTOR),
    k.area(),
    k.body(),
    k.anchor('center'),
    k.pos(halfWidth / 2, halfHeight),
  ]);

  function producePipes() {
    const offset = k.rand(-PIPE_RAND, PIPE_RAND);

    k.add([
      k.sprite('pipe'),
      k.scale(PIPE_SCALE_FACTOR),
      k.area(),
      k.pos(fullWidth, halfHeight + offset + PIPE_GAP / 2),
      { passed: false },
      'pipe',
    ]);

    k.add([
      k.sprite('pipe', { flipY: true }),
      k.scale(PIPE_SCALE_FACTOR),
      k.area(),
      k.anchor('botleft'),
      k.pos(fullWidth, halfHeight + offset - PIPE_GAP / 2),
      'pipe',
    ]);
  }

  k.loop(3, () => {
    producePipes();
  });

  k.onUpdate('pipe', (pipe) => {
    pipe.move(-PIPE_SPEED, 0);

    if (pipe.passed === false && player.pos.x > pipe.pos.x) {
      pipe.passed = true;
      score += 1;
      scoreText.text = score;
    }
  });

  player.onCollide('pipe', () => {
    k.go('gameover', score);
  });

  player.onUpdate(() => {
    if (
      player.pos.y > fullHeight + BOUNDARY_BUFFER ||
      player.pos.y < 0 - BOUNDARY_BUFFER
    ) {
      k.go('gameover', score);
    }
  });

  function handleJump() {
    k.play('bounce');
    player.jump(PLAYER_JUMP);
  }

  k.onKeyPress('space', () => {
    handleJump();
  });

  k.onMousePress((mouseBtn) => {
    if (mouseBtn === 'left') {
      handleJump();
    }
  });

  setCamScale(k);

  k.onResize(() => {
    setCamScale(k);
  });
});

k.scene('gameover', (score) => {
  if (score > highScore) {
    highScore = score;
  }

  k.add([k.sprite('bg', { height: fullHeight, width: fullWidth })]);

  k.add([
    k.text(
      'Game Over!' +
        '\n' +
        `Score: ${score}` +
        '\n' +
        `High Score: ${highScore}` +
        '\n' +
        '\n' +
        'Space/Click/Tap to Restart',
      {
        font: 'monogram',
        size: 28,
      }
    ),
    k.anchor('center'),
    k.pos(halfWidth, halfHeight),
  ]);

  handleStart();
});

k.go('start');
