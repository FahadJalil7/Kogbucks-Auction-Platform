import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { SettingsComponent } from './components/settings/settings.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { AdminComponent } from './components/admin/admin.component';
import { AdminReportsComponent } from './components/admin-reports/admin-reports.component';
import { AuctionListComponent } from './components/auction/auction-list/auction-list.component';
import { AuctionDetailComponent } from './components/auction/auction-detail/auction-detail.component';
import { AuctionFormComponent } from './components/auction/auction-form/auction-form.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'wishlist', component: WishlistComponent },
    { path: 'admin', component: AdminComponent },
    { path: 'admin/reports', component: AdminReportsComponent },
    { path: 'auctions', component: AuctionListComponent },
    { path: 'auctions/new', component: AuctionFormComponent },
    { path: 'auctions/:id', component: AuctionDetailComponent },
    { path: 'auctions/:id/edit', component: AuctionFormComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
