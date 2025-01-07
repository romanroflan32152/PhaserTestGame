import skyImage from '../assets/sky.jpg';
import ballImage from '../assets/ball.png';
import paddleImage from '../assets/paddle.png';
import brickImage from '../assets/brick.png';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    init() {
        this.gameStarted = false;
    }

    preload() {
        // Load assets using imported URLs
        this.load.image('sky', skyImage);
        this.load.image('ball', ballImage);
        this.load.image('paddle', paddleImage);
        this.load.image('brick', brickImage);
    }

    create() {
        // Add background
        this.add.image(400, 300, 'sky').setScale(1.5);

        // Create paddle
        this.paddle = this.add.sprite(400, 550, 'paddle');
        this.physics.add.existing(this.paddle, true);

        // Create ball
        this.ball = this.add.sprite(400, 530, 'ball');
        this.physics.add.existing(this.ball);
        this.ball.body.setCollideWorldBounds(true);
        this.ball.body.setBounce(1, 1);
        this.ball.body.setCircle(8);

        // Create bricks
        this.bricks = this.physics.add.staticGroup();
        const brickColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 8; j++) {
                const brick = this.add.sprite(125 + j * 80, 60 + i * 40, 'brick');
                brick.setTint(brickColors[i]);
                this.physics.add.existing(brick, true);
                this.bricks.add(brick);
            }
        }

        // Add colliders
        this.physics.world.setBounds(0, 0, 800, 600, true, true, true, false);
        
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.startText = this.add.text(400, 400, 'Press SPACE to Start', {
            color: '#ffffff',
            fontSize: '24px'
        }).setOrigin(0.5);

        // Add space key handler
        this.input.keyboard.on('keydown-SPACE', () => {
            if (!this.gameStarted) {
                this.startGame();
            }
        });
    }

    update() {
        // Platform movement
        if (this.cursors.left.isDown && this.paddle.x > 50) {
            this.paddle.x -= 7;
            this.paddle.body.updateFromGameObject();
        }
        else if (this.cursors.right.isDown && this.paddle.x < 750) {
            this.paddle.x += 7;
            this.paddle.body.updateFromGameObject();
        }

        // Ball follows paddle before game starts
        if (!this.gameStarted) {
            this.ball.x = this.paddle.x;
        }

        // Check for game over
        if (this.ball.y > 600) {
            this.scene.restart();
        }
    }

    startGame() {
        this.gameStarted = true;
        this.startText.destroy();
        this.ball.body.setVelocity(-200, -200);
    }

    hitPaddle(ball, paddle) {
        let diff = ball.x - paddle.x;
        ball.body.setVelocityX(5 * diff);
        
        const currentVelY = ball.body.velocity.y;
        const minVelY = 200;
        
        if (Math.abs(currentVelY) < minVelY) {
            ball.body.setVelocityY(currentVelY > 0 ? minVelY : -minVelY);
        }
    }

    hitBrick(ball, brick) {
        brick.destroy();
        
        // Check for win condition
        if (this.bricks.countActive() === 0) {
            this.scene.restart();
        }
    }
}
