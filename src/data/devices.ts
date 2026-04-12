// ─────────────────────────────────────────────────────────────
//  AMML — Devices Seed Data
//  All devices are Realand AL325 (WiFi) or AL321 models.
//  AL325: TCP/IP + USB + WiFi (wireless sites)
//  AL321: TCP/IP + USB only (wired sites)
//  Both: 5000 users/fingerprints, 100k transaction logs
// ─────────────────────────────────────────────────────────────

import type { Device } from '../types/models';

export const DEVICES: Device[] = [
  // Gudu Market
  { id: 'd1',  name: 'Main Gate AL325',    type: 'Realand AL325', market: 'Gudu Market',                        serial: 'SN-AL325-GD-001',  location: 'Main Entrance',  active: true,  lastSeen: '2 min ago', clocksToday: 28 },
  // Wuse Market
  { id: 'd2',  name: 'Main Gate AL325',   type: 'Realand AL325', market: 'Wuse Market',                        serial: 'SN-AL325-WS-001',  location: 'Main Entrance',  active: true,  lastSeen: '1 min ago', clocksToday: 47 },
  { id: 'd3',  name: 'East Wing AL321',   type: 'Realand AL321', market: 'Wuse Market',                        serial: 'SN-AL321-WS-002',  location: 'East Entrance',  active: true,  lastSeen: '5 min ago', clocksToday: 23 },
  // Kado Market
  { id: 'd4',  name: 'Main Gate AL325',   type: 'Realand AL325', market: 'Kado Market',                        serial: 'SN-AL325-KD-001',  location: 'Main Entrance',  active: true,  lastSeen: '8 min ago', clocksToday: 19 },
  // Karimo Market
  { id: 'd5',  name: 'North Gate AL321',  type: 'Realand AL321', market: 'Karimo Market',                      serial: 'SN-AL321-KM-001',  location: 'North Gate',      active: true,  lastSeen: '3 min ago', clocksToday: 16 },
  // Kugbo International Market
  { id: 'd6',  name: 'Gate A AL325',      type: 'Realand AL325', market: 'Kugbo International Market',          serial: 'SN-AL325-KG-001',  location: 'Gate A',          active: true,  lastSeen: 'Just now', clocksToday: 62 },
  { id: 'd7',  name: 'Gate B AL321',      type: 'Realand AL321', market: 'Kugbo International Market',          serial: 'SN-AL321-KG-002',  location: 'Gate B',          active: false, lastSeen: '2h ago',     clocksToday: 0  },
  // Area 7/10 Market
  { id: 'd8',  name: 'Main Terminal AL325', type: 'Realand AL325', market: 'Area 7/10 Market',                   serial: 'SN-AL325-A7-001',  location: 'Main Entrance',  active: true,  lastSeen: '4 min ago', clocksToday: 24 },
  // Garki International Market
  { id: 'd9',  name: 'Main Gate AL325',    type: 'Realand AL325', market: 'Garki International Market',          serial: 'SN-AL325-GI-001',  location: 'Main Gate',      active: true,  lastSeen: '1 min ago', clocksToday: 55 },
  { id: 'd10', name: 'Side Entrance AL321', type: 'Realand AL321', market: 'Garki International Market',          serial: 'SN-AL321-GI-002',  location: 'Side Entrance',  active: true,  lastSeen: '6 min ago', clocksToday: 31 },
  // Garki Model Market
  { id: 'd11', name: 'Entry AL325',        type: 'Realand AL325', market: 'Garki Model Market',                  serial: 'SN-AL325-GM-001',  location: 'Main Entrance',  active: true,  lastSeen: '2 min ago', clocksToday: 38 },
  // Zone 3 Market
  { id: 'd12', name: 'Main Gate AL325',    type: 'Realand AL325', market: 'Zone 3 Market',                      serial: 'SN-AL325-Z3-001',  location: 'Main Entrance',  active: true,  lastSeen: '9 min ago', clocksToday: 21 },
  // Apo Zone A, D & E Shopping Complex
  { id: 'd13', name: 'Reception AL325',     type: 'Realand AL325', market: 'Apo Zone A, D & E Shopping Complex',  serial: 'SN-AL325-AP-001',  location: 'Reception',      active: true,  lastSeen: '3 min ago', clocksToday: 33 },
  // Area 1 Market
  { id: 'd14', name: 'Main Gate AL321',    type: 'Realand AL321', market: 'Area 1 Market',                     serial: 'SN-AL321-A1-001',  location: 'Main Entrance',  active: true,  lastSeen: '7 min ago', clocksToday: 18 },
  // Nyanya Market
  { id: 'd15', name: 'Main Gate AL325',     type: 'Realand AL325', market: 'Nyanya Market',                     serial: 'SN-AL325-NY-001',  location: 'Main Entrance',  active: true,  lastSeen: '2 min ago', clocksToday: 29 },
  // Area 2 Market
  { id: 'd16', name: 'Main Gate AL321',     type: 'Realand AL321', market: 'Area 2 Market',                     serial: 'SN-AL321-A2-001',  location: 'Main Entrance',  active: false, lastSeen: '1h ago',     clocksToday: 0  },
  // Area 3 Neighbourhood Centre
  { id: 'd17', name: 'Centre AL325',         type: 'Realand AL325', market: 'Area 3 Neighbourhood Centre',        serial: 'SN-AL325-A3-001',  location: 'Main Entrance',  active: true,  lastSeen: '11 min ago', clocksToday: 14 },
  // Kaura Market
  { id: 'd18', name: 'Main Terminal AL325',  type: 'Realand AL325', market: 'Kaura Market',                      serial: 'SN-AL325-KA-001',  location: 'Main Entrance',  active: true,  lastSeen: '5 min ago', clocksToday: 22 },
  // Dei Dei Market
  { id: 'd19', name: 'Main Gate AL325',     type: 'Realand AL325', market: 'Dei Dei Market',                    serial: 'SN-AL325-DD-001',  location: 'Main Gate',      active: true,  lastSeen: 'Just now', clocksToday: 41 },
  // Utako Farmers Market
  { id: 'd20', name: 'Farmers AL321',       type: 'Realand AL321', market: 'Utako Farmers Market',              serial: 'SN-AL321-UF-001',  location: 'Main Entrance',  active: true,  lastSeen: '4 min ago', clocksToday: 17 },
  // Farmers Market
  { id: 'd21', name: 'Main Gate AL325',     type: 'Realand AL325', market: 'Farmers Market',                    serial: 'SN-AL325-FM-001',  location: 'Main Entrance',  active: true,  lastSeen: '3 min ago', clocksToday: 35 },
];
