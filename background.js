async function fetchUsername() {
    try {
        const response = await fetch('username.php');
        const data = await response.json();
        if (data.username.includes('Guest')) {
            return "default";
        } else {
            return data.username;
        }
    } catch (error) {
        console.log('%cError fetching username: ' + error);
        return "default";
    }
}

async function fetchUserSettings(username) {
    try {
        const response = await fetch(`https://theme.house-778.theorangecow.org/thejsonfile.php?user=${encodeURIComponent(username)}`);
        const userSettings = await response.json();
        if (userSettings && userSettings.username && userSettings.username === username) {
            processUserSettings(userSettings);
        } else {
            console.log('%cError: Username mismatch or invalid user settings');
            applyDefaultSettings();
        }
    } catch (error) {
        console.log('%cError fetching JSON File: ' + error);
        applyDefaultSettings();
    }
}

function applyDefaultSettings() {
    processUserSettings({
        mode: "dots",
        background: "#ff00cc_#00ffcc_#cc00ff",
        mode_color: "#ffffff",
        background_mode_secondary: "#fafafa33",
        concolor: "rgba(250, 250, 250, 0.5)",
        textcolor: "#000000",
        buttoncolor: "#007bff",
        inputcolor: "#ffffff",
        inputcolor2: "#000000"
    });
}

function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const a = "0.05";
    return `rgb(${r}, ${g}, ${b}, ${a})`;
}

function processUserSettings(settings) {
    try {
        if (settings.background.includes('_')) {
            const colors = settings.background.split('_');
            document.body.style.background = `linear-gradient(45deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`;
            document.body.style.backgroundSize = "400% 400%";
            document.body.style.animation = "gradientAnimation 15s infinite";
        } else {
            document.body.style.background = settings.background;
            document.body.style.animation = "none";
        }
    } catch (error) {
        console.log('%cError fetching background color: ' + error.message);
        document.body.style.background = `linear-gradient(45deg, #ff00cc, #00ffcc, #cc00ff)`;
        document.body.style.backgroundSize = "400% 400%";
        document.body.style.animation = "gradientAnimation 15s infinite";
    }

    try {
        const cons = document.getElementsByClassName("con");
        [...cons].forEach(con => {
            con.style.background = settings.concolor || "rgba(250, 250, 250, 0.5)";
            con.style.color = settings.textcolor || "#000000";
        });

        function containers() {
            const inputs = document.querySelectorAll('input[type="text"], input[type="password"], input[type="date"], input[type="color"], textarea, select');
            inputs.forEach(input => {
                if (input.disabled) {
                    input.style.background = hexToRgb(settings.inputcolor);
                } else {
                    input.style.background = settings.inputcolor || "#ffffff";
                    input.style.color = settings.inputcolor2 || "#000000";
                }
            });
        }
        containers();
        setInterval(containers, 100);
    } catch (error) {
        console.log('%cError applying styles to containers: ' + error.message);
    }

    try {
        function styleButtons() {
            const buttons = document.querySelectorAll('button, input[type="submit"]');
            buttons.forEach(button => {
                button.style.backgroundColor = settings.buttoncolor || "#007bff";
                button.style.color = settings.textcolor || "#ffffff";
            });

            const circleBtns = document.getElementsByClassName("circle-btn");
            [...circleBtns].forEach(btn => {
                btn.style.backgroundColor = "#333";
                btn.style.color = "#ffffff";
            });
        }
        styleButtons();
        setInterval(styleButtons, 100);
    } catch (error) {
        console.log('%cError applying button styles: ' + error.message);
    }

    try {
        const color = settings.mode_color.includes('#') ? settings.mode_color : "#ffffff";
        const background_mode_secondary = settings.background_mode_secondary.includes('#') ? settings.background_mode_secondary : "#fafafa33";

        document.body.style.visibility = 'visible';

        switch (settings.mode) {
            case "dots":
                dot(color, background_mode_secondary);
                break;
            case "dots_magnetic":
                dot_magnetic(color, background_mode_secondary);
                break;
            case "particles":
                particles();
                break;
            case "dot_v3":
                dot_v3(color);
                break;
            case "matrix":
                matrix(color, hexToRgb(background_mode_secondary));
                break;
            default:
                console.error("Unknown background mode");
        }
    } catch (error) {
        console.log('%cError applying background mode: ' + error.message);
    }
}

(async function() {
    const username = await fetchUsername();
    if (username) {
        await fetchUserSettings(username);
    }
})();



function particles() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#FF0055', '#00FF55', '#0055FF', '#FFAA00'];

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 5 + 1;
            this.speedX = Math.random() * 3 - 1.5;
            this.speedY = Math.random() * 3 - 1.5;
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.size > 0.2) this.size -= 0.1;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }

    function createParticles(e) {
        const xPos = e.x;
        const yPos = e.y;
        for (let i = 0; i < 5; i++) {
            particles.push(new Particle(xPos, yPos));
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((particle, index) => {
            particle.update();
            particle.draw();
            if (particle.size <= 0.2) {
                particles.splice(index, 1);
            }
        });
        requestAnimationFrame(animate);
    }
    window.addEventListener('mousemove', createParticles);

    animate();
}

function dot(color, color2) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initDots();
    }

    class Dot {
        constructor(x, y, radius, color) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
            this.dx = (Math.random() - 0.5) * 2;
            this.dy = (Math.random() - 0.5) * 2;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            this.x += this.dx;
            this.y += this.dy;

            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
                this.dx = -this.dx;
            }

            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
                this.dy = -this.dy;
            }

            this.draw();
        }
    }

    let dots = [];

    function initDots() {
        dots = [];
        const numDots = Math.floor(window.innerWidth / 10);
        for (let i = 0; i < numDots; i++) {
            const radius = Math.random() * 3 + 1;
            const x = Math.random() * (canvas.width - radius * 2) + radius;
            const y = Math.random() * (canvas.height - radius * 2) + radius;
            dots.push(new Dot(x, y, radius, color));
        }
    }

    function connectDots() {
        for (let i = 0; i < dots.length; i++) {
            for (let j = i + 1; j < dots.length; j++) {
                const dx = dots[i].x - dots[j].x;
                const dy = dots[i].y - dots[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(dots[i].x, dots[i].y);
                    ctx.lineTo(dots[j].x, dots[j].y);
                    ctx.strokeStyle = color2;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dots.forEach(dot => dot.update());
        connectDots();
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
}

function dot_magnetic(color, color2) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initDots();
    }

    class Dot {
        constructor(x, y, radius, color) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
            this.dx = (Math.random() - 0.5) * 2;
            this.dy = (Math.random() - 0.5) * 2;
            this.originalX = x;
            this.originalY = y;
            this.distance = 0;
            this.maxDistance = 150;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update(mouseX, mouseY) {
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            this.distance = Math.sqrt(dx * dx + dy * dy);

            const withinCanvasX = mouseX >= 0 && mouseX <= canvas.width;
            const withinCanvasY = mouseY >= 0 && mouseY <= canvas.height;
            const withinCanvas = withinCanvasX && withinCanvasY;

            if (withinCanvas && this.distance < this.maxDistance) {
                const angle = Math.atan2(dy, dx);
                const force = (1 - this.distance / this.maxDistance) * 5;
                this.x += Math.cos(angle) * force;
                this.y += Math.sin(angle) * force;
            } else {
                this.x += this.dx;
                this.y += this.dy;
            }

            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
                this.dx = -this.dx;
            }

            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
                this.dy = -this.dy;
            }

            this.draw();
        }
    }

    let dots = [];
    let mouseX = 0;
    let mouseY = 0;

    function initDots() {
        dots = [];
        const numDots = Math.floor(window.innerWidth / 10);
        for (let i = 0; i < numDots; i++) {
            const radius = Math.random() * 3 + 1;
            const x = Math.random() * (canvas.width - radius * 2) + radius;
            const y = Math.random() * (canvas.height - radius * 2) + radius;
            dots.push(new Dot(x, y, radius, color));
        }
    }

    function connectDots() {
        for (let i = 0; i < dots.length; i++) {
            for (let j = i + 1; j < dots.length; j++) {
                const dx = dots[i].x - dots[j].x;
                const dy = dots[i].y - dots[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(dots[i].x, dots[i].y);
                    ctx.lineTo(dots[j].x, dots[j].y);
                    ctx.strokeStyle = color2;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dots.forEach(dot => dot.update(mouseX, mouseY));
        connectDots();
    }

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
    });

    resizeCanvas();
    animate();
}

function dot_v3(color) {
    function formatSubdomain(url) {
        const urlObj = new URL(url);
        const parts = urlObj.hostname.split('.');
        const subdomain = parts.length > 2 ? parts[0] : '';
        if (!subdomain) {
            return 'Home';
        }
        const formattedSubdomain = subdomain
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        return formattedSubdomain;
    }

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const floatingParticles = [];
    const mouse = { x: null, y: null };
    let attracting = false;
    let repelDelay = false;
    
    const textValue = formatSubdomain(window.location);
    ctx.fillStyle = color;

    ctx.font = 'bold 100px Arial';
    const textWidth = ctx.measureText(textValue).width;
    const textHeight = 100;
    
    const textX = (canvas.width - (textWidth / 2)) / 2;
    const textY = (canvas.height + textHeight / 4) / 2;
    
    ctx.fillText(textValue, textX, textY);
    
    const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    class Particle {
        constructor(x, y, size = 3, baseX = x, baseY = y, density = Math.random() * 30 + 1) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.baseX = baseX;
            this.baseY = baseY;
            this.density = density;
        }
    
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    
        update() {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = 100;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;
    
            if (attracting && distance < maxDistance) {
                this.x += directionX;
                this.y += directionY;
            } else {
                if (repelDelay && distance < maxDistance) {
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX;
                        this.x -= dx / 10;
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY;
                        this.y -= dy / 10;
                    }
                }
            }
        }
    }
    
    function initTextParticles() {
        particles.length = 0;
        for (let y = 0; y < textCoordinates.height; y++) {
            for (let x = 0; x < textCoordinates.width; x++) {
                if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
                    let posX = x + textX - canvas.width / 2;
                    let posY = y + textY - canvas.height / 2;
                    particles.push(new Particle(posX, posY));
                }
            }
        }
    }
    
    function initFloatingParticles() {
        floatingParticles.length = 0;
        for (let i = 0; i < 100; i++) {
            const size = Math.random() * 2 + 1;
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            floatingParticles.push(new Particle(x, y, size));
        }
    }
    
    function updateFloatingParticles() {
        for (let p of floatingParticles) {
            p.x += Math.random() * 2 - 1;
            p.y += Math.random() * 2 - 1;

            if (p.x > canvas.width) p.x = 0;
            if (p.x < 0) p.x = canvas.width;
            if (p.y > canvas.height) p.y = 0;
            if (p.y < 0) p.y = canvas.height;

            p.update();
            p.draw();
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let p of particles) {
            p.draw();
            p.update();
        }
        updateFloatingParticles();
        requestAnimationFrame(animate);
    }
    
    initTextParticles();
    initFloatingParticles();
    animate();
    
    window.addEventListener('mousemove', function(event) {
        mouse.x = event.x;
        mouse.y = event.y;
    });
    
    window.addEventListener('mousedown', function() {
        attracting = true;
        repelDelay = false;
    });
    
    window.addEventListener('mouseup', function() {
        attracting = false;
        setTimeout(() => {
            repelDelay = true;
        }, 500);
    });
}

function matrix(color, color2) {
    
    


    
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 12;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    const maskPattern = [
        "000000111110000000",
        "000111000011100000",
        "001100000000110000",
        "011000000000011000",
        "110000000000001100",
        "110001111110001100",
        "110010000001001100",
        "011000000000011000",
        "001100000000110000",
        "000111000011100000",
        "000000111110000000"
    ];

    function draw() {
        ctx.fillStyle = color2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = color;
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = Math.random() > 0.5 ? '0' : '1';
            const column = i % maskPattern[0].length;
            const row = Math.floor(drops[i]);

            
            if (row < maskPattern.length && maskPattern[row][column] === '1') {
                ctx.fillText('1', i * fontSize, drops[i] * fontSize);
            } else {
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            }

            
            if (drops[i] * fontSize > canvas.height || Math.random() > 0.95) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 50);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}
