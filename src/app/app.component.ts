import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RendererComponent } from "./renderer/renderer.component";
import { RunFunc } from "./encounter/interface/Encounter";
import { RunControl } from "./encounter/interface/RunControl";
import { PlaybackControl, setupEncouter } from './encounter/game';
import { MatInputModule } from '@angular/material/input';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { P9sHectorJpAi } from './encounter/encounters/p9s.ai';
import { ProgressSpinnerMode, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { GetEncounter } from './encounter/encounters/p9s';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, RendererComponent, MatInputModule,
    MatFormFieldModule, FormsModule, MatButtonModule, MatProgressSpinnerModule,
    MatIconButton,
    MatIconModule,
    MatProgressBarModule]
})
export class AppComponent {
  
  
  public paused = false;


  public speed = 1;
  public playbackControl?: PlaybackControl;


  async start(r: RendererComponent) {
    r.reset();
    const encounter = GetEncounter();
    const ai = new P9sHectorJpAi();

    const { playbackControl, runningEncounter } = setupEncouter(r, encounter, ai, this.speed);
    this.playbackControl = playbackControl;
    await runningEncounter;
    this.playbackControl = undefined;
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
    
    
    const {playbackControl, runningEncounter} = setupEncouter(r, {
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
