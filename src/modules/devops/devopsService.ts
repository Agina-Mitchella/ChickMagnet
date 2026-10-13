import fs from 'fs';
import path from 'path';

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  ip: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface SecurityIncident {
  id: string;
  timestamp: string;
  ip: string;
  reason: string;
  endpoint: string;
}

const LOG_FILE = path.join(process.cwd(), 'devops_audit_logs.json');
const INCIDENT_FILE = path.join(process.cwd(), 'devops_security_incidents.json');

let auditLogs: AuditLog[] = [];
let securityIncidents: SecurityIncident[] = [];

// Load logs on startup
try {
  if (fs.existsSync(LOG_FILE)) {
    auditLogs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
  }
} catch (e) {
  console.error('Failed to load devops audit logs:', e);
}

try {
  if (fs.existsSync(INCIDENT_FILE)) {
    securityIncidents = JSON.parse(fs.readFileSync(INCIDENT_FILE, 'utf8'));
  }
} catch (e) {
  console.error('Failed to load devops security incidents:', e);
}

function saveAuditLogs() {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(auditLogs, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write audit logs:', e);
  }
}

function saveIncidents() {
  try {
    fs.writeFileSync(INCIDENT_FILE, JSON.stringify(securityIncidents, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write security incidents:', e);
  }
}

export const DevOpsService = {
  recordAuditLog(action: string, actor: string, details: string, ip: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO') {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      details,
      ip: ip || '127.0.0.1',
      severity
    };
    auditLogs.unshift(log);
    if (auditLogs.length > 200) auditLogs.pop(); // limit size
    saveAuditLogs();
    return log;
  },

  recordIncident(ip: string, reason: string, endpoint: string) {
    const inc: SecurityIncident = {
      id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ip,
      reason,
      endpoint
    };
    securityIncidents.unshift(inc);
    if (securityIncidents.length > 100) securityIncidents.pop();
    saveIncidents();
    return inc;
  },

  getAuditLogs() {
    return auditLogs;
  },

  getIncidents() {
    return securityIncidents;
  },

  getSystemMetrics() {
    const memUsage = process.memoryUsage();
    return {
      uptimeSeconds: process.uptime(),
      memoryRssMB: Math.round(memUsage.rss / 1024 / 1024),
      memoryHeapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
      nodeVersion: process.version,
      platform: process.platform,
      auditLogCount: auditLogs.length,
      securityIncidentCount: securityIncidents.length,
    };
  },

  clearIncidents() {
    securityIncidents = [];
    saveIncidents();
  }
};
