/**
 * Reconstruction Engine
 * Manages step-by-step visualization of vinyl design assembly
 */

import { VinylDesign, Shape } from '../types/vinyl';

export type PlaybackSpeed = 0.5 | 1 | 2 | 4;

export interface ReconstructionState {
  isPlaying: boolean;
  currentStep: number;
  speed: PlaybackSpeed;
  loopEnabled: boolean;
  highlightedShapeId: string | null;
  completedSteps: Set<number>;
}

export interface StepInfo {
  step: number;
  total: number;
  shape: Shape;
  description: string;
  progress: number;
  isFirst: boolean;
  isLast: boolean;
}

export class ReconstructionEngine {
  private design: VinylDesign;
  private state: ReconstructionState;
  private animationFrameId: number | null = null;
  private lastStepTime: number = 0;
  private listeners: Map<string, Set<(_data: any) => void>> = new Map();

  constructor(design: VinylDesign) {
    this.design = design;
    this.state = {
      isPlaying: false,
      currentStep: 0,
      speed: 1,
      loopEnabled: false,
      highlightedShapeId: design.buildOrder[0] || null,
      completedSteps: new Set([0])
    };
  }

  play(): void {
    if (this.state.isPlaying) return;
    this.state.isPlaying = true;
    this.lastStepTime = performance.now();
    this.animate();
  }

  pause(): void {
    if (!this.state.isPlaying) return;
    this.state.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private animate = (): void => {
    if (!this.state.isPlaying) return;
    const now = performance.now();
    const stepDuration = 1000 / this.state.speed;
    if (now - this.lastStepTime >= stepDuration) {
      this.nextStep();
      this.lastStepTime = now;
    }
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  nextStep(): void {
    if (this.state.currentStep >= this.design.buildOrder.length - 1) {
      if (this.state.loopEnabled) {
        this.reset();
        this.play();
      } else {
        this.pause();
        this.emit('complete');
      }
      return;
    }
    this.state.currentStep++;
    this.state.completedSteps.add(this.state.currentStep);
    this.state.highlightedShapeId = this.design.buildOrder[this.state.currentStep];
    this.emit('step-change', { step: this.state.currentStep + 1 });
  }

  previousStep(): void {
    if (this.state.currentStep <= 0) return;
    this.state.completedSteps.delete(this.state.currentStep);
    this.state.currentStep--;
    this.state.highlightedShapeId = this.design.buildOrder[this.state.currentStep];
    this.emit('step-change', { step: this.state.currentStep + 1 });
  }

  goToStep(step: number): void {
    if (step < 0 || step >= this.design.buildOrder.length) return;
    this.state.currentStep = step;
    this.state.completedSteps.clear();
    for (let i = 0; i <= step; i++) {
      this.state.completedSteps.add(i);
    }
    this.state.highlightedShapeId = this.design.buildOrder[step];
    this.emit('step-change', { step: this.state.currentStep + 1 });
  }

  reset(): void {
    this.state.currentStep = 0;
    this.state.completedSteps.clear();
    this.state.completedSteps.add(0);
    this.state.highlightedShapeId = this.design.buildOrder[0];
  }

  setSpeed(speed: PlaybackSpeed): void {
    this.state.speed = speed;
  }

  toggleLoop(): void {
    this.state.loopEnabled = !this.state.loopEnabled;
  }

  enableLoop(): void {
    this.state.loopEnabled = true;
  }

  disableLoop(): void {
    this.state.loopEnabled = false;
  }

  goToLast(): void {
    this.goToStep(this.design.buildOrder.length - 1);
  }

  on(event: string, callback: (_data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (_data: any) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data?: any): void {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  getVisibleShapeIds(): string[] {
    return this.design.buildOrder.slice(0, this.state.currentStep + 1);
  }

  getCurrentStepInfo(): StepInfo {
    const shapeId = this.design.buildOrder[this.state.currentStep];
    const shape = this.design.shapes.find(s => s.id === shapeId)!;
    return {
      step: this.state.currentStep + 1,
      total: this.design.buildOrder.length,
      shape,
      description: `Add ${shape.name}`,
      progress: ((this.state.currentStep + 1) / this.design.buildOrder.length) * 100,
      isFirst: this.state.currentStep === 0,
      isLast: this.state.currentStep === this.design.buildOrder.length - 1
    };
  }

  getState(): Readonly<ReconstructionState> {
    return { ...this.state };
  }

  destroy(): void {
    this.pause();
    this.listeners.clear();
  }
}
