import { Component, signal, HostListener, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { ApiService } from './services/api.service';
import { Toast } from './shared/toast/toast';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith, switchMap, catchError, of, map } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, Toast, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('BoutiqueFlow');
  sidebarCollapsed = true;
  isScrolled = false;

  theme: 'dark' | 'light' = 'dark';
  private readonly THEME_KEY = 'bf_theme';

  searchControl = new FormControl('', { nonNullable: true });
  searchOpen = false;

  private authService = inject(AuthService);
  private router      = inject(Router);
  private cartService = inject(CartService);
  private apiService = inject(ApiService);

  /** Cart item count from observable */
  cartCount$ = this.cartService.items$.pipe(map(items => items.reduce((sum, item) => sum + item.quantity, 0)));

  /** Live search results */
  searchResults$ = this.searchControl.valueChanges.pipe(
    startWith(this.searchControl.value),
    debounceTime(220),
    distinctUntilChanged(),
    switchMap((raw) => {
      const q = (raw || '').trim();
      if (q.length < 2) return of([]);
      return this.apiService.searchProducts(q, 8).pipe(catchError(() => of([])));
    })
  );

  ngOnInit(): void {
    this.initTheme();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 24;
  }

  private initTheme(): void {
    const saved = (localStorage.getItem(this.THEME_KEY) || '').toLowerCase();
    if (saved === 'light' || saved === 'dark') {
      this.setTheme(saved as 'light' | 'dark');
      return;
    }
    const prefersLight = typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-color-scheme: light)').matches;
    this.setTheme(prefersLight ? 'light' : 'dark');
  }

  private setTheme(theme: 'dark' | 'light'): void {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  toggleTheme(): void {
    this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
  }

  onSidebarMouseEnter(): void { this.sidebarCollapsed = false; }
  onSidebarMouseLeave(): void { this.sidebarCollapsed = true; }

  isAdminRoute(): boolean {
    const url = this.router.url || '';
    return url.startsWith('/admin') || url.startsWith('/superadmin');
  }

  isLoggedIn(): boolean { return this.authService.isLoggedIn(); }

  getCurrentUser() { return this.authService.getCurrentUser(); }

  getCurrentRole(): string { return this.getCurrentUser()?.role || ''; }

  logout(): void { this.authService.logout(); }

  getDashboardRoute(): string {
    switch (this.getCurrentRole()) {
      case 'superadmin': return '/superadmin/dashboard';
      case 'admin':      return '/admin/dashboard';
      case 'customer':   return '/customer/dashboard';
      default:           return '/';
    }
  }

  openSearch(): void  { this.searchOpen = true; }
  closeSearch(): void { this.searchOpen = false; }

  onSearchSubmit(): void {
    const q = (this.searchControl.value || '').trim();
    if (q) {
      this.closeSearch();
      this.searchControl.setValue('', { emitEvent: false });
      this.router.navigate(['/'], { queryParams: { q } });
    }
  }

  goToProduct(id: string): void {
    this.closeSearch();
    this.searchControl.setValue('', { emitEvent: false });
    this.router.navigate(['/product', id]);
  }
}
