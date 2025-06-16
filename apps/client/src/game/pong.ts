import {
  Engine,
  Scene,
  Vector3,
  HemisphericLight,
  ArcRotateCamera,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Mesh,
  ActionManager,
} from '@babylonjs/core';

export class PongGame {
  private engine!: Engine;
  private scene!: Scene;
  private canvas!: HTMLCanvasElement;
  private ball!: Mesh;
  private paddle1!: Mesh;
  private paddle2!: Mesh;
  private ballVelocity!: Vector3;
  private gameContainer: HTMLElement;
  private score1: number = 0;
  private score2: number = 0;
  private scoreElement!: HTMLElement;
  private gameRunning: boolean = false;
  private onGameEnd?: (player1Score: number, player2Score: number) => void;

  // 키보드 입력 상태
  private keys: { [key: string]: boolean } = {};
  private readonly WINNING_SCORE: number; // 동적으로 설정 가능하도록 변경

  // 키보드 이벤트 핸들러들을 저장해서 나중에 제거할 수 있도록 함
  private keyDownHandler!: (event: KeyboardEvent) => void;
  private keyUpHandler!: (event: KeyboardEvent) => void;

  constructor(
    container: HTMLElement,
    targetScore: number,
    onGameEnd?: (player1Score: number, player2Score: number) => void,
  ) {
    this.gameContainer = container;
    this.WINNING_SCORE = targetScore; // 생성자에서 타겟 스코어 설정
    this.onGameEnd = onGameEnd;
    this.createCanvas();
    this.initEngine();
    this.createScene();
    this.setupGame();
    this.startGameLoop();
  }

  private createCanvas(): void {
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '400px';
    this.canvas.style.display = 'block';
    this.canvas.tabIndex = 0; // 포커스를 받을 수 있도록 설정
    this.gameContainer.appendChild(this.canvas);

    // 점수 표시
    this.scoreElement = document.createElement('div');
    this.scoreElement.className = 'text-white text-xl font-bold text-center mb-4';
    this.scoreElement.textContent = `Player 1: ${this.score1} | Player 2: ${this.score2}`;
    this.gameContainer.insertBefore(this.scoreElement, this.canvas);
  }

  private initEngine(): void {
    this.engine = new Engine(this.canvas, true);

    // 리사이즈 이벤트
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  private createScene(): void {
    this.scene = new Scene(this.engine);

    // 카메라 설정
    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 2,
      10,
      Vector3.Zero(),
      this.scene,
    );
    camera.setTarget(Vector3.Zero());

    // 조명 설정
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.7;

    // 게임 필드 (경계)
    this.createGameField();
  }

  private createGameField(): void {
    // 게임 필드 경계
    const fieldWidth = 8;
    const fieldHeight = 6;

    // 상단 벽
    const topWall = MeshBuilder.CreateBox(
      'topWall',
      { width: fieldWidth, height: 0.2, depth: 0.2 },
      this.scene,
    );
    topWall.position.y = fieldHeight / 2;

    // 하단 벽
    const bottomWall = MeshBuilder.CreateBox(
      'bottomWall',
      { width: fieldWidth, height: 0.2, depth: 0.2 },
      this.scene,
    );
    bottomWall.position.y = -fieldHeight / 2;

    // 벽 재질
    const wallMaterial = new StandardMaterial('wallMaterial', this.scene);
    wallMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
    topWall.material = wallMaterial;
    bottomWall.material = wallMaterial;
  }

  private setupGame(): void {
    // 공 생성
    this.ball = MeshBuilder.CreateSphere('ball', { diameter: 0.2 }, this.scene);
    const ballMaterial = new StandardMaterial('ballMaterial', this.scene);
    ballMaterial.diffuseColor = new Color3(1, 1, 1);
    this.ball.material = ballMaterial;
    this.resetBall();

    // 패들 1 (왼쪽)
    this.paddle1 = MeshBuilder.CreateBox(
      'paddle1',
      { width: 0.2, height: 1.5, depth: 0.2 },
      this.scene,
    );
    this.paddle1.position.x = -3.5;
    const paddle1Material = new StandardMaterial('paddle1Material', this.scene);
    paddle1Material.diffuseColor = new Color3(0, 1, 0);
    this.paddle1.material = paddle1Material;

    // 패들 2 (오른쪽)
    this.paddle2 = MeshBuilder.CreateBox(
      'paddle2',
      { width: 0.2, height: 1.5, depth: 0.2 },
      this.scene,
    );
    this.paddle2.position.x = 3.5;
    const paddle2Material = new StandardMaterial('paddle2Material', this.scene);
    paddle2Material.diffuseColor = new Color3(1, 0, 0);
    this.paddle2.material = paddle2Material;

    // 키보드 이벤트 설정
    this.setupKeyboardControls();
  }

  private setupKeyboardControls(): void {
    this.scene.actionManager = new ActionManager(this.scene);

    // 키보드 이벤트 핸들러 생성
    this.keyDownHandler = (event: KeyboardEvent) => {
      // 게임이 실행 중일 때만 키 입력 처리
      if (!this.gameRunning) return;

      // 이벤트 전파 방지
      event.preventDefault();
      event.stopPropagation();

      this.keys[event.key.toLowerCase()] = true;
    };

    this.keyUpHandler = (event: KeyboardEvent) => {
      // 게임이 실행 중일 때만 키 입력 처리
      if (!this.gameRunning) return;

      // 이벤트 전파 방지
      event.preventDefault();
      event.stopPropagation();

      this.keys[event.key.toLowerCase()] = false;
    };

    // 캔버스에 포커스가 있을 때만 키보드 이벤트 처리
    this.canvas.addEventListener('keydown', this.keyDownHandler);
    this.canvas.addEventListener('keyup', this.keyUpHandler);

    // 캔버스 클릭시 포커스 주기
    this.canvas.addEventListener('click', () => {
      this.canvas.focus();
    });
  }

  private resetBall(): void {
    this.ball.position = Vector3.Zero();
    const direction = Math.random() > 0.5 ? 1 : -1;
    this.ballVelocity = new Vector3(direction * 0.05, (Math.random() - 0.5) * 0.03, 0);
  }

  private updatePaddles(): void {
    if (!this.gameRunning) return;

    const paddleSpeed = 0.1;
    const fieldBoundary = 2.5;

    // 패들 1 (W/S 키)
    if (
      (this.keys['w'] || this.keys['W'] || this.keys['ㅈ'] || this.keys['ㅉ']) &&
      this.paddle1.position.y < fieldBoundary
    ) {
      this.paddle1.position.y += paddleSpeed;
    }
    if (
      (this.keys['s'] || this.keys['S'] || this.keys['ㄴ']) &&
      this.paddle1.position.y > -fieldBoundary
    ) {
      this.paddle1.position.y -= paddleSpeed;
    }

    // 패들 2 (↑/↓ 키)
    if (this.keys['arrowup'] && this.paddle2.position.y < fieldBoundary) {
      this.paddle2.position.y += paddleSpeed;
    }
    if (this.keys['arrowdown'] && this.paddle2.position.y > -fieldBoundary) {
      this.paddle2.position.y -= paddleSpeed;
    }
  }

  private updateBall(): void {
    if (!this.gameRunning) return;

    // 공 이동
    this.ball.position.addInPlace(this.ballVelocity);

    // 상하 벽 충돌
    if (this.ball.position.y > 2.8 || this.ball.position.y < -2.8) {
      this.ballVelocity.y *= -1;
    }

    // 패들 충돌 검사
    this.checkPaddleCollision();

    // 점수 체크
    if (this.ball.position.x > 4) {
      // Player 1 점수
      this.score1++;
      this.updateScore();
      this.resetBall();
    } else if (this.ball.position.x < -4) {
      // Player 2 점수
      this.score2++;
      this.updateScore();
      this.resetBall();
    }
  }

  private checkPaddleCollision(): void {
    const ballPos = this.ball.position;
    const paddle1Pos = this.paddle1.position;
    const paddle2Pos = this.paddle2.position;

    // 패들 1과 충돌
    if (
      ballPos.x <= paddle1Pos.x + 0.2 &&
      ballPos.x >= paddle1Pos.x - 0.2 &&
      ballPos.y <= paddle1Pos.y + 0.75 &&
      ballPos.y >= paddle1Pos.y - 0.75 &&
      this.ballVelocity.x < 0
    ) {
      this.ballVelocity.x *= -1.1; // 속도 증가
      this.ballVelocity.y += (ballPos.y - paddle1Pos.y) * 0.02;
    }

    // 패들 2와 충돌
    if (
      ballPos.x >= paddle2Pos.x - 0.2 &&
      ballPos.x <= paddle2Pos.x + 0.2 &&
      ballPos.y <= paddle2Pos.y + 0.75 &&
      ballPos.y >= paddle2Pos.y - 0.75 &&
      this.ballVelocity.x > 0
    ) {
      this.ballVelocity.x *= -1.1; // 속도 증가
      this.ballVelocity.y += (ballPos.y - paddle2Pos.y) * 0.02;
    }
  }

  private updateScore(): void {
    this.scoreElement.textContent = `Player 1: ${this.score1} | Player 2: ${this.score2}`;

    // 승리 조건 확인
    if (this.score1 >= this.WINNING_SCORE) {
      this.endGame('Player 1 승리!');
    } else if (this.score2 >= this.WINNING_SCORE) {
      this.endGame('Player 2 승리!');
    }
  }

  private endGame(winner: string): void {
    this.gameRunning = false;

    // 승리 메시지 표시
    const winnerElement = document.createElement('div');
    winnerElement.className = 'text-center text-2xl font-bold text-white mt-4';
    winnerElement.textContent = `${winner}`;
    this.gameContainer.appendChild(winnerElement);

    // 게임 종료 콜백 호출 (점수 정보 포함)
    if (this.onGameEnd) {
      this.onGameEnd(this.score1, this.score2);
    }
  }

  private startGameLoop(): void {
    this.engine.runRenderLoop(() => {
      this.updatePaddles();
      this.updateBall();
      this.scene.render();
    });
  }

  public startGame(): void {
    this.gameRunning = true;
    this.score1 = 0;
    this.score2 = 0;
    this.updateScore();
    this.resetBall();

    // 게임 시작 시 캔버스에 포커스 주기
    setTimeout(() => {
      this.canvas.focus();
    }, 100);
  }

  public dispose(): void {
    // 키보드 이벤트 리스너 제거
    if (this.canvas && this.keyDownHandler && this.keyUpHandler) {
      this.canvas.removeEventListener('keydown', this.keyDownHandler);
      this.canvas.removeEventListener('keyup', this.keyUpHandler);
    }

    this.engine.dispose();
    this.gameContainer.innerHTML = '';
  }
}
