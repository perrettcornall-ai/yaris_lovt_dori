class FallingItem {
    constructor(x, y, type = 'gold') {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = type;
        this.speed = 3;
        this.rotation = 0;
        this.rotationSpeed = 0.1;
    }

    update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);

        switch (this.type) {
            case 'gold':
                this.drawGoldDory(ctx);
                break;
            case 'silver':
                this.drawSilverDory(ctx);
                break;
            case 'bomb':
                this.drawBomb(ctx);
                break;
        }

        ctx.restore();
    }

    drawGoldDory(ctx) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFF99';
        ctx.beginPath();
        ctx.ellipse(-4, -8, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 15, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawSilverDory(ctx) {
        ctx.fillStyle = '#C0C0C0';
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#EEEEEE';
        ctx.beginPath();
        ctx.ellipse(-4, -8, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 15, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawBomb(ctx) {
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.arc(-3, -5, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FF6B35';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(0, -18);
        ctx.stroke();

        const sparkAngle = Math.random() * Math.PI * 2;
        const sparkDist = 5;
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.arc(
            Math.cos(sparkAngle) * sparkDist,
            -18 + Math.sin(sparkAngle) * sparkDist,
            1,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    isOffScreen(canvasHeight) {
        return this.y > canvasHeight;
    }

    increaseSpeed(multiplier = 1.1) {
        this.speed *= multiplier;
    }
}

class ItemsManager {
    constructor() {
        this.items = [];
        this.spawnRate = 0.02;
        this.level = 1;
    }

    spawnItem(canvasWidth) {
        if (Math.random() < this.spawnRate) {
            const x = Math.random() * (canvasWidth - 30);
            const rand = Math.random();
            let type = 'gold';

            if (rand < 0.5) {
                type = 'gold';
            } else if (rand < 0.8) {
                type = 'silver';
            } else {
                type = 'bomb';
            }

            this.items.push(new FallingItem(x, -30, type));
        }
    }

    update(canvasHeight) {
        for (let i = this.items.length - 1; i >= 0; i--) {
            this.items[i].update();

            if (this.items[i].isOffScreen(canvasHeight)) {
                this.items.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (let item of this.items) {
            item.draw(ctx);
        }
    }

    increaseLevel() {
        this.level++;
        this.spawnRate = Math.min(0.05, this.spawnRate + 0.005);

        for (let item of this.items) {
            item.increaseSpeed(1.15);
        }
    }

    getAndRemoveItem(index) {
        return this.items.splice(index, 1)[0];
    }

    clear() {
        this.items = [];
    }
}
