import { UpdateTheme } from './store/appearance/appearance.action';
import { Theme } from './store/appearance/appearance.types';
import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { AppearanceState } from '@store/appearance/appearance.state';
import { Observable, from } from 'rxjs';
import { first, flatMap, filter, tap } from 'rxjs/operators';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  @Select(AppearanceState.theme)
  theme: Observable<Theme>;
  constructor() {
    this.theme
      .pipe(
        filter(theme => theme === ''),
        tap(() => this.getPreferedColorScheme())
      )
      .subscribe();

    this.theme
      .pipe(
        filter(theme => theme !== ''),
        tap(theme => this.updateTheme(theme === 'dark'))
      )
      .subscribe();
  }

  private getPreferedColorScheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    this.updateTheme(prefersDark.matches);
    this.setTheme(prefersDark.matches ? 'dark' : 'light');
    // prefersDark.addEventListener('change', mediaQuery =>
    //   this.toggleTheme(mediaQuery.matches)
    // );
  }

  updateTheme(isDark: boolean) {
    document.body.classList.toggle('dark', isDark);
  }

  @Dispatch()
  setTheme = (theme: Theme) => new UpdateTheme(theme);
}
