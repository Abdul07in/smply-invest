"use client";

import { Avatar, Box, Button, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useState } from "react";
import { BarChart3, BookOpen, Bell, GraduationCap, LayoutDashboard, LogOut, Menu, Search } from "lucide-react";
import { tradingCopy } from "@/shared/copy/tradingCopy";
import { marketIndices } from "@/mock/data";
import { formatTime } from "@/shared/lib/formatters";

const navIcons = [LayoutDashboard, BarChart3, GraduationCap, BookOpen];

interface Props { onSearch: () => void; onUnavailableSection: () => void; onLogout: () => void; }

export function AppNavigation({ onSearch, onUnavailableSection, onLogout }: Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return <>
    <header className="topbar">
      <IconButton className="mobile-menu icon-button" aria-label={tradingCopy.common.menu} onClick={() => setMobileNavOpen(true)}><Menu size={19} /></IconButton>
      <a className="brand" href="#workspace" aria-label={tradingCopy.app.brand}>
        <span className="brand-mark"><BarChart3 size={21} strokeWidth={2.5} /></span>
        <span>{tradingCopy.app.brand}</span>
      </a>
      <nav className="main-nav" aria-label={tradingCopy.app.brand}>
        {tradingCopy.app.nav.map((item, index) => {
          const Icon = navIcons[index];
          return <Button className={`nav-link ${index === 0 ? "active" : ""}`} key={item} onClick={index === 0 ? undefined : onUnavailableSection}>
            <Icon size={15} /><span>{item}</span>
          </Button>;
        })}
      </nav>
      <div className="topbar-actions">
        <IconButton className="icon-button quiet" aria-label={tradingCopy.common.search} onClick={onSearch}><Search size={17} /></IconButton>
        <IconButton className="icon-button quiet notification-button" aria-label={tradingCopy.common.notifications}><Bell size={17} /><i /></IconButton>
        <Button className="profile-button" onClick={onLogout} aria-label={tradingCopy.common.signOut} title={tradingCopy.common.signOut}><Avatar className="avatar">{tradingCopy.app.profileInitial}</Avatar><span className="profile-name">{tradingCopy.app.profileName}</span><LogOut className="logout-icon" size={14} /></Button>
      </div>
    </header>
    <div className="market-strip">
      <div className="market-strip-label"><span className="pulse-dot" />{tradingCopy.market.open}<span className="market-time">{formatTime(new Date())} {tradingCopy.common.exchangeTime}</span></div>
      <div className="market-tickers">
        {marketIndices.map((item) => <div className="ticker-item" key={item.symbol}>
          <span>{item.symbol}</span><strong>{item.price}</strong><em>+{item.change} ({item.percent}%)</em>
        </div>)}
      </div>
      <div className="market-fresh"><span className="fresh-dot" />{tradingCopy.market.dataFresh}</div>
    </div>
    <Drawer anchor="left" open={mobileNavOpen} onClose={() => setMobileNavOpen(false)}>
      <Box className="mobile-drawer" role="presentation">
        <Box className="mobile-drawer-brand"><span className="brand-mark"><BarChart3 size={20} /></span>{tradingCopy.app.brand}</Box>
        <Divider />
        <List>{tradingCopy.app.nav.map((item, index) => {
          const Icon = navIcons[index];
          return <ListItemButton key={item} selected={index === 0} onClick={() => { setMobileNavOpen(false); if (index !== 0) onUnavailableSection(); }}>
            <ListItemIcon><Icon size={18} /></ListItemIcon><ListItemText primary={item} />
          </ListItemButton>;
        })}</List>
        <Divider />
        <List><ListItemButton onClick={() => { setMobileNavOpen(false); onLogout(); }}><ListItemIcon><LogOut size={18} /></ListItemIcon><ListItemText primary={tradingCopy.common.signOut} /></ListItemButton></List>
      </Box>
    </Drawer>
  </>;
}
