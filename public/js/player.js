class Player {
    constructor(x, y, width = 40, height = 50) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 5;
        this.velocityX = 0;
        this.isMovingLeft = false;
        this.isMovingRight = false;
    }

    update(canvasWidth) {
        if (this.isMovingLeft && this.x > 0) {
            this.x -= this.speed;
        }
        if (this.isMovingRight && this.x + this.width < canvasWidth) {
            this.x += this.speed;
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#2C1810';
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y + 10, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2C1810';
        ctx.beginPath();
        ctx.arc(this.x + 12, this.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 28, this.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(this.x + 12, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 28, this.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x + 16, this.y + 8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 24, this.y + 8, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x + 17, this.y + 8, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 25, this.y + 8, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y + 13, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y + 13, 4, 0, Math.PI, true);
        ctx.stroke();

        ctx.fillStyle = '#FF6B35';
        ctx.fillRect(this.x + 8, this.y + 20, 24, 20);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('YARIS', this.x + 20, this.y + 32);

        ctx.fillStyle = '#2C1810';
        ctx.fillRect(this.x + 4, this.y + 22, 4, 15);
        ctx.fillRect(this.x + 32, this.y + 22, 4, 15);

        ctx.fillStyle = '#2C1810';
        ctx.fillRect(this.x + 10, this.y + 38, 6, 12);
        ctx.fillRect(this.x + 24, this.y + 38, 6, 12);

        ctx.strokeStyle = '#2C1810';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x + 20, this.y + 38);
        const tailWag = Math.sin(Date.now() * 0.01) * 5;
        ctx.quadraticCurveTo(this.x + 15 + tailWag, this.y + 50, this.x + 12, this.y + 60);
        ctx.stroke();
    }

    isCollidingWith(item) {
        return (
            this.x < item.x + item.width &&
            this.x + this.width > item.x &&
            this.y < item.y + item.height &&
            this.y + this.height > item.y
        );
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
}
