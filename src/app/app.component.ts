import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RendererComponent } from "./renderer/renderer.component";
import { GetEncounter } from './encounter/p9s';
import { runGameLoop } from './encounter/game';
import {MatInputModule} from '@angular/material/input';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import { P9sHectorJpAi } from './encounter/npcs/p9s.ai';
import {ProgressSpinnerMode, MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [RouterOutlet, RendererComponent, MatInputModule, MatFormFieldModule, FormsModule, MatButtonModule, MatProgressSpinnerModule, MatProgressBarModule]
})
export class AppComponent {
  
  public speed = 1;
  public running = false;
  
  
  async start(r: RendererComponent) {
    this.running = true;
    r.reset();
    console.log('gogogo!');
    const encounter = GetEncounter();
    const ai = new P9sHectorJpAi();
    
    await runGameLoop(r, encounter, ai, this.speed);
    this.running = false;
  }
  
  doTheTest() {
    const doer = () => this.title = 'i\'m doing it!';
    const code="arguments[0]()";
    const f = Function(code);
    f(doer);
  }

  title = 'chariot';
}
