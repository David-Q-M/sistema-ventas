import { Component, HostListener, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface StarParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  color: string;
}

interface EnergyPulse {
  planetIndex: number;
  progress: number;
  speed: number;
  color: string;
  size: number;
}

interface LightningBolt {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  life: number;
  segments: { x: number; y: number }[];
  color: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cyberCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('loginCardRef') loginCardRef!: ElementRef<HTMLDivElement>;

  credentials = { username: '', password: '', role: 'ADMIN' };
  error = '';
  loading = false;
  showPassword = false;

  // Role options (Administrador, Cajero, Almacenero)
  roles = [
    { id: 'ADMIN', label: 'Administrador', icon: 'bi-shield-lock-fill' },
    { id: 'CAJERO', label: 'Cajero', icon: 'bi-cash-coin' },
    { id: 'ALMACENERO', label: 'Almacenero', icon: 'bi-box-seam-fill' }
  ];

  // Lockout / Security Validation state
  failedAttempts = 0;
  lockoutTimer = 0;
  isLockedOut = false;
  private lockoutInterval: any = null;

  // 3D Parallax & Interactive Tilt state
  cardTransform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  lightPosition = '50% 50%';

  // Canvas animation variables
  private ctx!: CanvasRenderingContext2D | null;
  private animationFrameId!: number;
  private stars: StarParticle[] = [];
  private energyPulses: EnergyPulse[] = [];
  private lightningBolts: LightningBolt[] = [];
  private mousePos = { x: 0, y: 0 };
  private planetPositions: { x: number; y: number; name: string }[] = [];
  private centerCardPos = { x: 0, y: 0 };

  constructor(private authService: AuthService, private router: Router) { }

  ngAfterViewInit() {
    this.initCanvas();
    this.initEnergyPulses();
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.lockoutInterval) {
      clearInterval(this.lockoutInterval);
    }
  }

  selectRole(roleId: string) {
    if (this.isLockedOut) return;
    this.credentials.role = roleId;
    this.error = '';
  }

  normalizeRole(roleStr: string): string {
    if (!roleStr) return '';
    const r = roleStr.toUpperCase().trim();
    if (r.includes('ADMIN')) return 'ADMIN';
    if (r.includes('CAJER') || r.includes('POS') || r.includes('CAJA')) return 'CAJERO';
    if (r.includes('ALMACEN') || r.includes('VENDEDOR') || r.includes('STOCK')) return 'ALMACENERO';
    return r;
  }

  getRoleLabel(roleId: string): string {
    const found = this.roles.find(r => r.id === roleId);
    return found ? found.label : roleId;
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    this.resizeCanvas();
    this.createStars();
    this.animateCanvas();
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (this.canvasRef) {
      this.resizeCanvas();
    }
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.updatePositions();
  }

  private initEnergyPulses() {
    this.energyPulses = [];
    const colors = ['#38BDF8', '#F472B6', '#F59E0B', '#10B981', '#A855F7'];
    for (let i = 0; i < 18; i++) {
      this.energyPulses.push({
        planetIndex: i % 5,
        progress: Math.random(),
        speed: 0.004 + Math.random() * 0.008,
        color: colors[i % colors.length],
        size: 3 + Math.random() * 3
      });
    }
  }

  private createStars() {
    this.stars = [];
    const count = Math.floor((window.innerWidth * window.innerHeight) / 3000);
    const colors = ['#FFFFFF', '#E0F2FE', '#FCE7F3', '#FEF08A', '#38BDF8'];

    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2.2 + 0.6,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: 0.005 + Math.random() * 0.025,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  private updatePositions() {
    const planetEls = document.querySelectorAll('.orbit-planet');
    this.planetPositions = [];
    planetEls.forEach((planet) => {
      const rect = planet.getBoundingClientRect();
      const name = planet.getAttribute('data-planet-name') || '';
      this.planetPositions.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        name
      });
    });

    if (this.loginCardRef && this.loginCardRef.nativeElement) {
      const loginRect = this.loginCardRef.nativeElement.getBoundingClientRect();
      this.centerCardPos = {
        x: loginRect.left + loginRect.width / 2,
        y: loginRect.top + loginRect.height / 2
      };
    } else {
      this.centerCardPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }
  }

  private animateCanvas = () => {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.width;
    const height = canvas.height;

    this.ctx.clearRect(0, 0, width, height);
    this.updatePositions();

    this.drawDeepSpaceCosmos(width, height);
    this.drawStars();
    this.drawOrbitEllipses(width, height);
    this.drawEnergyBeams();
    this.updateAndDrawLightning();

    this.animationFrameId = requestAnimationFrame(this.animateCanvas);
  };

  private drawDeepSpaceCosmos(width: number, height: number) {
    if (!this.ctx) return;

    const centerGlow = this.ctx.createRadialGradient(
      this.centerCardPos.x, this.centerCardPos.y, 60,
      this.centerCardPos.x, this.centerCardPos.y, 700
    );
    centerGlow.addColorStop(0, 'rgba(14, 116, 144, 0.25)');
    centerGlow.addColorStop(0.35, 'rgba(168, 85, 247, 0.16)');
    centerGlow.addColorStop(0.7, 'rgba(217, 70, 239, 0.08)');
    centerGlow.addColorStop(1, 'rgba(3, 7, 18, 0)');

    this.ctx.fillStyle = centerGlow;
    this.ctx.fillRect(0, 0, width, height);
  }

  private drawStars() {
    if (!this.ctx) return;
    const time = Date.now();

    this.stars.forEach((star) => {
      const currentOpacity = star.opacity + Math.sin(time * star.twinkleSpeed) * 0.35;
      const opacity = Math.max(0.1, Math.min(1, currentOpacity));

      this.ctx!.beginPath();
      this.ctx!.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx!.fillStyle = star.color;
      this.ctx!.globalAlpha = opacity;
      this.ctx!.shadowBlur = star.size > 1.5 ? 8 : 0;
      this.ctx!.shadowColor = star.color;
      this.ctx!.fill();
    });

    this.ctx.globalAlpha = 1.0;
    this.ctx.shadowBlur = 0;
  }

  private drawOrbitEllipses(width: number, height: number) {
    if (!this.ctx) return;
    const time = Date.now() * 0.0005;
    const cx = this.centerCardPos.x;
    const cy = this.centerCardPos.y;

    this.ctx.save();
    
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy, width * 0.42, height * 0.36, -0.15, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
    this.ctx.lineWidth = 1.8;
    this.ctx.setLineDash([10, 14]);
    this.ctx.lineDashOffset = -time * 25;
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy, width * 0.46, height * 0.42, 0.2, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(6, 182, 212, 0.28)';
    this.ctx.lineWidth = 1.8;
    this.ctx.setLineDash([14, 18]);
    this.ctx.lineDashOffset = time * 30;
    this.ctx.stroke();

    this.ctx.restore();
  }

  private drawEnergyBeams() {
    if (!this.ctx || this.planetPositions.length === 0) return;

    const centerX = this.centerCardPos.x;
    const centerY = this.centerCardPos.y;
    const time = Date.now() * 0.002;

    this.planetPositions.forEach((planet, idx) => {
      const px = planet.x;
      const py = planet.y;

      const grad = this.ctx!.createLinearGradient(px, py, centerX, centerY);
      if (idx % 2 === 0) {
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.7)');
        grad.addColorStop(0.5, 'rgba(59, 130, 246, 0.8)');
        grad.addColorStop(1, 'rgba(217, 70, 239, 0.6)');
      } else {
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.7)');
        grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.8)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0.6)');
      }

      this.ctx!.save();
      this.ctx!.beginPath();
      this.ctx!.moveTo(px, py);
      this.ctx!.lineTo(centerX, centerY);
      this.ctx!.strokeStyle = grad;
      this.ctx!.lineWidth = 2.2;
      this.ctx!.shadowBlur = 12;
      this.ctx!.shadowColor = idx % 2 === 0 ? '#06B6D4' : '#F59E0B';
      this.ctx!.setLineDash([8, 8]);
      this.ctx!.lineDashOffset = -time * 25;
      this.ctx!.stroke();
      this.ctx!.restore();

      const nextIdx = (idx + 1) % this.planetPositions.length;
      const nextPlanet = this.planetPositions[nextIdx];
      this.ctx!.save();
      this.ctx!.beginPath();
      this.ctx!.moveTo(px, py);
      this.ctx!.lineTo(nextPlanet.x, nextPlanet.y);
      this.ctx!.strokeStyle = 'rgba(168, 85, 247, 0.25)';
      this.ctx!.lineWidth = 1.2;
      this.ctx!.setLineDash([5, 10]);
      this.ctx!.stroke();
      this.ctx!.restore();
    });

    this.energyPulses.forEach((pulse) => {
      pulse.progress += pulse.speed;
      if (pulse.progress > 1) {
        pulse.progress = 0;
        pulse.planetIndex = Math.floor(Math.random() * this.planetPositions.length);
      }

      if (this.planetPositions[pulse.planetIndex]) {
        const targetPlanet = this.planetPositions[pulse.planetIndex];
        const startX = targetPlanet.x;
        const startY = targetPlanet.y;
        const endX = centerX;
        const endY = centerY;

        const currX = startX + (endX - startX) * pulse.progress;
        const currY = startY + (endY - startY) * pulse.progress;

        this.ctx!.save();
        this.ctx!.beginPath();
        this.ctx!.arc(currX, currY, pulse.size, 0, Math.PI * 2);
        this.ctx!.fillStyle = pulse.color;
        this.ctx!.shadowBlur = 16;
        this.ctx!.shadowColor = pulse.color;
        this.ctx!.fill();

        const tailX = startX + (endX - startX) * Math.max(0, pulse.progress - 0.08);
        const tailY = startY + (endY - startY) * Math.max(0, pulse.progress - 0.08);
        const tailGrad = this.ctx!.createLinearGradient(tailX, tailY, currX, currY);
        tailGrad.addColorStop(0, 'transparent');
        tailGrad.addColorStop(1, pulse.color);

        this.ctx!.beginPath();
        this.ctx!.moveTo(tailX, tailY);
        this.ctx!.lineTo(currX, currY);
        this.ctx!.strokeStyle = tailGrad;
        this.ctx!.lineWidth = pulse.size * 0.85;
        this.ctx!.stroke();
        this.ctx!.restore();
      }
    });

    if (Math.random() < 0.05 && this.planetPositions.length > 0) {
      const randomIdx = Math.floor(Math.random() * this.planetPositions.length);
      const targetPlanet = this.planetPositions[randomIdx];
      this.spawnLightning(targetPlanet.x, targetPlanet.y, centerX, centerY);
    }
  }

  private spawnLightning(fromX: number, fromY: number, toX: number, toY: number) {
    const distance = Math.hypot(toX - fromX, toY - fromY);
    const steps = Math.floor(distance / 28);
    const segments: { x: number; y: number }[] = [{ x: fromX, y: fromY }];

    const dx = (toX - fromX) / steps;
    const dy = (toY - fromY) / steps;

    for (let i = 1; i < steps; i++) {
      const offsetX = (Math.random() - 0.5) * 28;
      const offsetY = (Math.random() - 0.5) * 28;
      segments.push({
        x: fromX + dx * i + offsetX,
        y: fromY + dy * i + offsetY
      });
    }
    segments.push({ x: toX, y: toY });

    const colors = ['#06B6D4', '#E0F2FE', '#F472B6', '#F59E0B', '#38BDF8'];
    this.lightningBolts.push({
      fromX,
      fromY,
      toX,
      toY,
      life: 1.0,
      segments,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  private updateAndDrawLightning() {
    if (!this.ctx) return;

    for (let i = this.lightningBolts.length - 1; i >= 0; i--) {
      const bolt = this.lightningBolts[i];
      bolt.life -= 0.12;

      if (bolt.life <= 0) {
        this.lightningBolts.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(bolt.segments[0].x, bolt.segments[0].y);

      for (let j = 1; j < bolt.segments.length; j++) {
        this.ctx.lineTo(bolt.segments[j].x, bolt.segments[j].y);
      }

      this.ctx.strokeStyle = bolt.color;
      this.ctx.lineWidth = 2.5 * bolt.life;
      this.ctx.globalAlpha = bolt.life;
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = bolt.color;
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mousePos.x = event.clientX;
    this.mousePos.y = event.clientY;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const offsetX = (event.clientX - windowWidth / 2) / (windowWidth / 2);
    const offsetY = (event.clientY - windowHeight / 2) / (windowHeight / 2);

    const rotateY = offsetX * 10;
    const rotateX = -offsetY * 10;

    this.cardTransform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px)`;
    this.lightPosition = `${((event.clientX / windowWidth) * 100).toFixed(1)}% ${((event.clientY / windowHeight) * 100).toFixed(1)}%`;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.cardTransform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.isLockedOut) {
      this.error = `Has superado los 5 intentos fallidos. Por seguridad, intente de nuevo en ${this.lockoutTimer} segundos.`;
      return;
    }

    if (!this.credentials.username || !this.credentials.password) {
      this.error = 'Por favor complete todos los campos';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login({ username: this.credentials.username, password: this.credentials.password }).subscribe({
      next: (response) => {
        const userRoleNormalized = this.normalizeRole(response.rol);
        const selectedRoleNormalized = this.normalizeRole(this.credentials.role);

        // Strict Role Match Validation
        if (userRoleNormalized !== selectedRoleNormalized) {
          // Discard session and token
          this.authService.logout();
          this.loading = false;
          this.failedAttempts++;

          const roleLabel = this.getRoleLabel(this.credentials.role);

          if (this.failedAttempts >= 5) {
            this.startLockoutTimer();
          } else {
            const remaining = 5 - this.failedAttempts;
            this.error = `El usuario no pertenece al rol seleccionado de '${roleLabel}' (Quedan ${remaining} intento${remaining > 1 ? 's' : ''})`;
          }
          return;
        }

        // Role match successful!
        this.failedAttempts = 0;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.failedAttempts++;

        if (this.failedAttempts >= 5) {
          this.startLockoutTimer();
        } else {
          const remaining = 5 - this.failedAttempts;
          this.error = `Credenciales incorrectas (Quedan ${remaining} intento${remaining > 1 ? 's' : ''})`;
        }
      }
    });
  }

  private startLockoutTimer() {
    this.isLockedOut = true;
    this.lockoutTimer = 30;
    this.error = `Has superado los 5 intentos fallidos. Por seguridad, intente de nuevo en ${this.lockoutTimer} segundos.`;

    if (this.lockoutInterval) {
      clearInterval(this.lockoutInterval);
    }

    this.lockoutInterval = setInterval(() => {
      this.lockoutTimer--;
      if (this.lockoutTimer > 0) {
        this.error = `Has superado los 5 intentos fallidos. Por seguridad, intente de nuevo en ${this.lockoutTimer} segundos.`;
      } else {
        clearInterval(this.lockoutInterval);
        this.isLockedOut = false;
        this.failedAttempts = 0;
        this.error = '';
      }
    }, 1000);
  }
}
