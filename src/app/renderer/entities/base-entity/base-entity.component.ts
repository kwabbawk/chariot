import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { TEntity } from '../entity';

@Component({
  selector: '',
  standalone: true,
  imports: [],
  template: ''
})
export abstract class BaseEntityComponent<TData> {

  @ViewChild(TemplateRef, { read: TemplateRef })
  public set template(value: TemplateRef<any>) {
    setTimeout(() => this.entity.template = value, 0);
  }
  
  @Input()
  public entity!: TEntity<TData>;
  
  @Input()
  public viewSvg!: any;
}
