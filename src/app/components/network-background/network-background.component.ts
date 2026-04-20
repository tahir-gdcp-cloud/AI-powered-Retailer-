import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
}

@Component({
  selector: 'app-network-background',
  standalone: true,
  template: `<canvas #canvas class="absolute inset-0 w-full h-full pointer-events-none blur-[1px] opacity-80"></canvas>`
})
export class NetworkBackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationFrameId: number = 0;
  private mouse = { x: -9999, y: -9999, radius: 150 };
  private isBrowser: boolean;

  // Configuration
  private readonly particleCount = 100; // Will be scaled by screen size
  private readonly connectionDistance = 150;
  private readonly particleSpeed = 2.5;

  constructor(
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;
    this.ctx = context;

    this.resizeCanvas();
    this.initParticles();

    // Run outside Angular to prevent constant change detection
    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.isBrowser) return;
    this.resizeCanvas();
    this.initParticles(); // Re-init to distribute properly
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isBrowser) return;
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
  }

  @HostListener('window:mouseout')
  onMouseOut(): void {
    if (!this.isBrowser) return;
    this.mouse.x = -9999;
    this.mouse.y = -9999;
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    this.ctx.scale(dpr, dpr);

    // Reset canvas CSS width/height to fill screen
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  }

  private initParticles(): void {
    this.particles = [];

    // Adjust particle count based on screen size (density)
    const area = window.innerWidth * window.innerHeight;
    const count = Math.min(Math.floor(area / 7000), 200); // 1 particle per 10k pixels, max 200

    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 2 + 1;
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * this.particleSpeed,
        vy: (Math.random() - 0.5) * this.particleSpeed,
        radius: radius,
        baseRadius: radius
      });
    }
  }

  private animate = (): void => {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Movement
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

      // Mouse interaction (repel slightly or glow)
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.mouse.radius) {
        // Optional: slight parallax or repel effect
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const force = (this.mouse.radius - distance) / this.mouse.radius;

        // Gentle repel
        p.x -= forceDirectionX * force * 1.5;
        p.y -= forceDirectionY * force * 1.5;
        p.radius = p.baseRadius * 1.5;
      } else {
        p.radius = p.baseRadius;
      }

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(0, 255, 204, 0.7)'; // Cyan glow
      this.ctx.fill();

      // Draw connections
      for (let j = i; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const cdx = p.x - p2.x;
        const cdy = p.y - p2.y;
        const cDistance = Math.sqrt(cdx * cdx + cdy * cdy);

        if (cDistance < this.connectionDistance) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(0, 255, 204, ${1 - cDistance / this.connectionDistance})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }

    // Connect to mouse
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.connectionDistance) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(0, 255, 204, ${0.8 - distance / this.connectionDistance})`;
        this.ctx.lineWidth = 1;
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(this.mouse.x, this.mouse.y);
        this.ctx.stroke();
      }
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  }
}
