import { ChangeDetectorRef, Component, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RendererComponent } from "./renderer/renderer.component";
import { RunFunc } from "./encounter/interface/Encounter";
import { RunControl } from "./encounter/interface/RunControl";
import { EntityLayers, PlaybackControl, setupEncouter } from './encounter/game';
import { EncounterBoard } from "./encounter/EncounterBoard";
import { MatInputModule } from '@angular/material/input';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { P9sHectorJpAi } from './encounter/encounters/p9s.ai';
import { ProgressSpinnerMode, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { GetEncounter } from './encounter/encounters/p9s';
import {MatTabsModule} from '@angular/material/tabs';
import {MatExpansionModule} from '@angular/material/expansion';
import { ColorScheme, PlayerTokenComponent, PlayerTokenData } from './renderer/entities/player-token/player-token.component';
import { TEntity } from './renderer/entities/entity';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, RendererComponent, MatInputModule,
    MatFormFieldModule, FormsModule, MatButtonModule, MatProgressSpinnerModule,
    MatIconButton,
    MatIconModule,
    MatProgressBarModule,
    MatTabsModule,
    MatExpansionModule]
})
export class AppComponent {
  
  public paused = false;
  
  public cdr = inject(ChangeDetectorRef);

  public speed = 1;
  public playbackControl?: PlaybackControl;
  public board?: EncounterBoard;
  
  @HostListener('window:onunhandledrejections', ['$event'])
  globalErrorHandling(event: PromiseRejectionEvent) {
    console.log('uncaught promise event!', event);
  }
  
  constructor() {
    this.startPaused();
  }
  

  async startPaused() {
    const board = new EncounterBoard();
    this.board = board;
    const encounter = GetEncounter();
    const ai = new P9sHectorJpAi();
    this.createFullParty(board);
    const { playbackControl, runningEncounter } = setupEncouter(board, encounter, ai, this.speed);
    playbackControl.pause();
    this.playbackControl = playbackControl;
    this.cdr.detectChanges();
    await runningEncounter;
  }
  
  createFullParty(board: EncounterBoard) {
    const names = [
      "MT", "OT", "H1", "H2", "M1", "M2", "R1", "R2"
    ];
    
    for (let i = 0; i < 8; i++) {
      const [color, role] = i < 2 
        ? [ColorScheme.Tank, 'tank']
        : i < 4
          ? [ColorScheme.Healer, 'healer']
          : [ColorScheme.Dps, 'dps']
      
      const arc = 2 * Math.PI * (i+4) / 8;
      const r = 0.15;
          
      board.entities.unshift({
        tags: ['player', role],
        x: Math.sin(arc) * r,
        y: Math.cos(arc) * r + 0.3,
        component: PlayerTokenComponent,
        name: names[i],
        layer: EntityLayers.Player,
        data: {
          color: color,
          name: names[i]
        }
      } as TEntity<PlayerTokenData>);
    }
  }

  doTheTest() {
    const doer = () => this.title = 'i\'m doing it!';
    const code = "arguments[0]()";
    const f = Function(code);
    f(doer);
  }
  
  public async encounterTest(r: RendererComponent) {
    const start = new Date().getTime();
    const wait = (time: number) => new Promise(resolve => setTimeout(resolve, time));
    
    const getPassedTime = () => (new Date().getTime() - start) / 1000;
    
    
    const {playbackControl, runningEncounter} = setupEncouter(new EncounterBoard(), {
      setup(c) {
        c.addPhase({
          name: "testPhase",
          run: async (rc: RunControl) => {
            console.log('starting!', getPassedTime());
            await rc.wait(5000);
            console.log('done!', getPassedTime());
          }
        });
      },
    }, {
      setup(c) {
      },
    }, 1);
    
    await wait(1000);
    console.log('pausing!', getPassedTime());
    playbackControl.pause();
    await wait(2000);
    console.log('resume!', getPassedTime());
    playbackControl.resume();
    await wait(1000);
    console.log('pausing!', getPassedTime());
    playbackControl.pause();
    await wait(2000);
    console.log('resume!', getPassedTime());
    playbackControl.resume();
    await runningEncounter;
    
    console.log('test done', getPassedTime());
    
    
    
  }

  title = 'chariot';
}
