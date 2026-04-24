// ─────────────────────────────────────────────────────────────
//  AMML — Security Threat Model v1.0
//  Date: 2026-04-24
//  Framework: P110 Layered Defense + P111 Default-Deny
// ─────────────────────────────────────────────────────────────

// ── THREAT ACTORS ─────────────────────────────────────────────
export const THREAT_ACTORS = {
  // Internal: disgruntled staff with device/PIN access
  INSIDER_LOW: {
    capability: 'low', intent: 'opportunistic', motivation: 'convenience',
    attackVectors: ['clock in/out for colleagues', 'view colleague records'],
  },
  // Internal: staff colluding with external actor
  INSIDER_COLLUDE: {
    capability: 'medium', intent: 'directed', motivation: 'financial',
    attackVectors: ['ghost employees on payroll', 'device spoofing', 'false attendance records'],
  },
  // External: nation-state or organized crime targeting government parastatal
  APT_NATIONSTATE: {
    capability: 'critical', intent: 'strategic', motivation: 'espionage/sabotage',
    attackVectors: ['physical plant behind switch (P108)', 'supply chain compromise',
                    'ZK device firmware backdoor', 'LAN man-in-the-middle'],
  },
  // External: criminal financial fraud
  CRIMINAL_FINANCIAL: {
    capability: 'high', intent: 'directed', motivation: 'fraud',
    attackVectors: ['phish staff creds + relay 2FA (P106)', 'device cert theft',
                    'payroll ghost employee injection', 'device firmware patch'],
  },
  // External: script kiddie / opportunistic
  OPPORTUNIST: {
    capability: 'low', intent: 'opportunistic', motivation: 'curiosity/证明',
    attackVectors: ['SQL injection on public routes', 'XSS on any reflected input',
                    'default ZK device creds', 'unpatched LAN services'],
  },
};

// ── ATTACK TAXONOMY — all vectors mapped to Mitre ATT&CK ────
export interface AttackVector {
  id: string;               // e.g. 'T1078.002'
  name: string;
  mitre: string;
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  riskScore: number;        // likelihood × impact
  affectedLayer: Layer;
  affectedComponent: string;
  primaryVulnerability: string;
  existingControl: string;
  residualRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  mitigation: string;
  mitreUrl: string;
}

export type Layer = 'PHYSICAL' | 'NETWORK' | 'APPLICATION' | 'AUTH' | 'DATA' | 'INFRA';

export const ATTACK_TAXONOMY: AttackVector[] = [
  // ── PHYSICAL ────────────────────────────────────────────
  {
    id: 'T0844', name: 'Physical device tampering', mitre: 'T0844',
    likelihood: 2, impact: 5, riskScore: 10,
    affectedLayer: 'PHYSICAL', affectedComponent: 'ZK Biometric Device',
    primaryVulnerability: 'Device accessible without tamper-evident seal',
    existingControl: 'None currently',
    residualRisk: 'HIGH',
    mitigation: 'Tamper-evident seals on device enclosure; MAC address allowlist on network switch; monthly physical inspection',
    mitreUrl: 'https://attack.mitre.org/techniques/T0844/',
  },
  {
    id: 'T0875', name: 'Rogue device on LAN segment', mitre: 'T0875',
    likelihood: 2, impact: 5, riskScore: 10,
    affectedLayer: 'PHYSICAL', affectedComponent: 'Network switch/hub',
    primaryVulnerability: 'Uncontrolled switch ports in public market areas',
    existingControl: 'None currently',
    residualRisk: 'HIGH',
    mitigation: 'VLAN isolate ZK device segment from general market LAN; 802.1X port authentication; disable unused ports',
    mitreUrl: 'https://attack.mitre.org/techniques/T0875/',
  },

  // ── NETWORK ──────────────────────────────────────────────
  {
    id: 'T1046', name: 'Port scan + default ZK creds', mitre: 'T1046',
    likelihood: 3, impact: 4, riskScore: 12,
    affectedLayer: 'NETWORK', affectedComponent: 'ZK device TCP 4370',
    primaryVulnerability: 'ZK device admin panel accessible on LAN; default admin/Tadmin password',
    existingControl: 'None currently',
    residualRisk: 'HIGH',
    mitigation: 'Change all ZK device admin passwords on deployment; isolate device VLAN; monitor 4370 port scans via OSSEC',
    mitreUrl: 'https://attack.mitre.org/techniques/T1046/',
  },
  {
    id: 'T1043', name: 'mTLS cert spoofing — device impersonation', mitre: 'T1043',
    likelihood: 2, impact: 5, riskScore: 10,
    affectedLayer: 'NETWORK', affectedComponent: 'ZK Push Listener (TCP 4370)',
    primaryVulnerability: 'Device presents forged client cert; listener trusts it',
    existingControl: 'None currently',
    residualRisk: 'HIGH',
    mitigation: 'mTLS with pinned CA; device cert fingerprint stored in AMML DB; listener rejects certs not in allowlist (see listener.ts)',
    mitreUrl: 'https://attack.mitre.org/techniques/T1043/',
  },
  {
    id: 'T1071.001', name: 'Malformed packet buffer overflow', mitre: 'T1071.001',
    likelihood: 1, impact: 5, riskScore: 5,
    affectedLayer: 'NETWORK', affectedComponent: 'ZK Push Listener (TCP 4370)',
    primaryVulnerability: 'No bounds checking on ZK packet field lengths',
    existingControl: 'None currently',
    residualRisk: 'MEDIUM',
    mitigation: '4KB read buffer cap; parseZKPacket() validates header + length before field extraction (see zk/types.ts)',
    mitreUrl: 'https://attack.mitre.org/techniques/T1071/',
  },
  {
    id: 'T1078.002', name: 'Unauthorized device enrollment', mitre: 'T1078.002',
    likelihood: 2, impact: 4, riskScore: 8,
    affectedLayer: 'NETWORK', affectedComponent: 'ZK Push Listener',
    primaryVulnerability: 'No device certificate validation on new device onboarding',
    existingControl: 'None currently',
    residualRisk: 'HIGH',
    mitigation: 'Device onboarding requires SUPERADMIN approval; cert fingerprint stored in DB; deviceRegistry allowlist enforced',
    mitreUrl: 'https://attack.mitre.org/techniques/T1078/',
  },
  {
    id: 'T1071.002', name: 'Clock skew replay attack', mitre: 'T1071.002',
    likelihood: 2, impact: 3, riskScore: 6,
    affectedLayer: 'NETWORK', affectedComponent: 'ZK Push Listener',
    primaryVulnerability: 'Event timestamps not validated against server time',
    existingControl: 'None currently',
    residualRisk: 'MEDIUM',
    mitigation: 'MAX_CLOCK_SKEW_MS = 300s (5 min); events outside window rejected with eventId logged',
    mitreUrl: 'https://attack.mitre.org/techniques/T1071/',
  },

  // ── APPLICATION ──────────────────────────────────────────
  {
    id: 'T1190', name: 'SQL injection via /api/amml/* params', mitre: 'T1190',
    likelihood: 2, impact: 5, riskScore: 10,
    affectedLayer: 'APPLICATION', affectedComponent: 'amml-api.ts routes',
    primaryVulnerability: 'User input not parameterized before DB query',
    existingControl: 'None currently',
    residualRisk: 'HIGH',
    mitigation: 'All routes use parameterized queries via bun:sqlite; Zod schema validation strips SQL meta-characters; safeOrderBy() whitelist',
    mitreUrl: 'https://attack.mitre.org/techniques/T1190/',
  },
  {
    id: 'T1059.003', name: 'Command injection via device serial / user input', mitre: 'T1059.003',
    likelihood: 1, impact: 5, riskScore: 5,
    affectedLayer: 'APPLICATION', affectedComponent: 'amml-api.ts, zk listener',
    primaryVulnerability: 'Device serial or user-supplied field passed to shell exec',
    existingControl: 'None currently',
    residualRisk: 'LOW',
    mitigation: 'No shell exec calls anywhere in codebase; all fields validated via Zod; stripHtml() for XSS; CSP header blocks script injection',
    mitreUrl: 'https://attack.mitre.org/techniques/T1059/',
  },
  {
    id: 'T1333', name: 'XSS via reflected user input in UI', mitre: 'T1333',
    likelihood: 2, impact: 4, riskScore: 8,
    affectedLayer: 'APPLICATION', affectedComponent: 'React UI components',
    primaryVulnerability: 'User-supplied data rendered without sanitization',
    existingControl: 'React escapes by default; CSP header blocks inline scripts',
    residualRisk: 'MEDIUM',
    mitigation: 'stripHtml() on all user text fields before storage; CSP header with script-src restrictions; no innerHTML usage',
    mitreUrl: 'https://attack.mitre.org/techniques/T1333/',
  },
  {
    id: 'T1070.004', name: 'Direct object reference — staff/attendance records', mitre: 'T1070.004',
    likelihood: 3, impact: 4, riskScore: 12,
    affectedLayer: 'APPLICATION', affectedComponent: 'All /api/amml/* routes',
    primaryVulnerability: 'API does not verify requester owns/can access the resource',
    existingControl: 'PIN-based auth; no RBAC enforcement on API',
    residualRisk: 'HIGH',
    mitigation: 'RoleConfig nav array enforced at UI level; API routes need bearer token auth + resource ownership check (future)',
    mitreUrl: 'https://attack.mitre.org/techniques/T1070/',
  },

  // ── AUTH ─────────────────────────────────────────────────
  {
    id: 'T1078.004', name: 'Credential stuffing — staff PIN reuse', mitre: 'T1078.004',
    likelihood: 3, impact: 4, riskScore: 12,
    affectedLayer: 'AUTH', affectedComponent: 'PIN login (LoginScreen.tsx)',
    primaryVulnerability: '4-digit PIN is low entropy; staff reuse PINs',
    existingControl: 'Failed attempt lockout (3 attempts → 15 min)',
    residualRisk: 'HIGH',
    mitigation: 'TOTP 2FA on all SUPERVISOR/MD/SUPERADMIN accounts; hardware-bound FIDO2 for critical roles; device fingerprint binding',
    mitreUrl: 'https://attack.mitre.org/techniques/T1078/',
  },
  {
    id: 'T1078.003', name: 'Relay attack — phishing + 2FA capture (P106)', mitre: 'T1078.003',
    likelihood: 2, impact: 5, riskScore: 10,
    affectedLayer: 'AUTH', affectedComponent: '2FA implementation (future)',
    primaryVulnerability: 'TOTP code relayed in real-time before expiration',
    existingControl: '2FA not yet implemented',
    residualRisk: 'HIGH',
    mitigation: 'FIDO2/WebAuthn hardware-bound auth — attacker cannot relay hardware key; session binding to device fingerprint',
    mitreUrl: 'https://attack.mitre.org/techniques/T1078/',
  },
  {
    id: 'T1565.002', name: 'Session hijacking via localStorage', mitre: 'T1565.002',
    likelihood: 2, impact: 4, riskScore: 8,
    affectedLayer: 'AUTH', affectedComponent: 'AppContext.tsx session storage',
    primaryVulnerability: 'Session stored in plaintext in localStorage',
    existingControl: 'None currently',
    residualRisk: 'HIGH',
    mitigation: 'Move session to httpOnly cookie with SameSite=Strict; set server-side session in Redis; rotate session ID on auth',
    mitreUrl: 'https://attack.mitre.org/techniques/T1565/',
  },

  // ── DATA ─────────────────────────────────────────────────
  {
    id: 'T1005', name: 'PII exfiltration — staff phone/number extraction', mitre: 'T1005',
    likelihood: 2, impact: 4, riskScore: 8,
    affectedLayer: 'DATA', affectedComponent: 'staff table, attendance records',
    primaryVulnerability: 'API returns full staff list without authentication',
    existingControl: 'Public routes return staff data via /api/amml/*',
    residualRisk: 'HIGH',
    mitigation: 'Auth gate all /api/amml/* routes; encrypt PII fields at rest; rate-limit list endpoints; audit log all staff data access',
    mitreUrl: 'https://attack.mitre.org/techniques/T1005/',
  },
  {
    id: 'T1486', name: 'Ransomware — SQLite file encryption', mitre: 'T1486',
    likelihood: 1, impact: 5, riskScore: 5,
    affectedLayer: 'DATA', affectedComponent: 'amml.db file',
    primaryVulnerability: 'Single SQLite file on filesystem; no backup automation',
    existingControl: 'None currently',
    residualRisk: 'MEDIUM',
    mitigation: 'Automated daily backup to S3 via AWS CLI in cron; RDS migration (Phase 4) replaces SQLite with multi-AZ PostgreSQL; WAL mode ensures crash consistency',
    mitreUrl: 'https://attack.mitre.org/techniques/T1486/',
  },

  // ── INFRA ────────────────────────────────────────────────
  {
    id: 'T1490', name: 'Denial of service — single AZ failure', mitre: 'T1490',
    likelihood: 2, impact: 4, riskScore: 8,
    affectedLayer: 'INFRA', affectedComponent: 'Single-instance deployment',
    primaryVulnerability: 'No horizontal scaling; no multi-AZ; single point of failure',
    existingControl: 'None currently',
    residualRisk: 'HIGH',
    mitigation: 'CDK stack deploys ECS Fargate with multi-AZ RDS; ALB distributes across N instances; scale-out on CPU threshold',
    mitreUrl: 'https://attack.mitre.org/techniques/T1490/',
  },
  {
    id: 'T0899', name: 'Credential exposure via env vars in CI/CD', mitre: 'T0899',
    likelihood: 1, impact: 5, riskScore: 5,
    affectedLayer: 'INFRA', affectedComponent: 'CDK deployment, GitHub Actions',
    primaryVulnerability: 'API keys stored in plaintext environment variables',
    existingControl: 'None currently',
    residualRisk: 'MEDIUM',
    mitigation: 'AWS Secrets Manager for all DB/app secrets; GitHub Actions secrets for CDK env vars; no plaintext credentials in infrastructure code',
    mitreUrl: 'https://attack.mitre.org/techniques/T0899/',
  },
];

// ── RISK MATRIX ───────────────────────────────────────────────
export function getRiskColor(score: number): string {
  if (score <= 4) return 'text-green-400';
  if (score <= 9) return 'text-yellow-400';
  return 'text-red-400';
}

export const HIGH_RISK_VECTORS = ATTACK_TAXONOMY.filter(v => v.riskScore >= 10);
export const MEDIUM_RISK_VECTORS = ATTACK_TAXONOMY.filter(v => v.riskScore >= 5 && v.riskScore < 10);