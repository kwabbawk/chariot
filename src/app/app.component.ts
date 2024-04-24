import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RendererComponent } from "./renderer/renderer.component";
import { GetEncounter } from './encounter/p9s';
import { runGameLoop } from './encounter/game';
import {MatInputModule} from '@angular/material/input';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [RouterOutlet, RendererComponent, MatInputModule, MatFormFieldModule, FormsModule, MatButtonModule]
})
export class AppComponent {
  
  public speed = 1;
  
  async start(r: RendererComponent) {
    r.reset();
    console.log('gogogo!');
    const encounter = GetEncounter();
    await runGameLoop(r, encounter, this.speed);
  }
  
  doTheTest() {
    const doer = () => this.title = 'i\'m doing it!';
    const code="arguments[0]()";
    const f = Function(code);
    f(doer);
  }

  title = 'chariot';
}
