// ─────────────────────────────────────────────────────────────
//  AMML — Staff Self-Service Settings Page
//  Staff can set/change their own password here
// ─────────────────────────────────────────────────────────────
import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";

export default function StaffSettingsPage() {
  const { state, dispatch, can } = useApp();
  const { user, staff } = state;
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [msg, setMsg] = useState<{ok?: string; er?: string}>({});

  if (!user) return null;
  const staffId = user.staffId;
  const myStaff = staff.find(s => s.id === user.staffId);
  const hasPw = !!(myStaff?.password);

  function handleSetPassword() {
    if (hasPw) {
      if (!currentPw) { setMsg({er: "Enter your current password."}); return; }
      if (currentPw !== myStaff!.password) { setMsg({er: "Current password is wrong."}); return; }
    }
    if (!newPw) { setMsg({er: "Enter a new password."}); return; }
    if (newPw.length < 4) { setMsg({er: "Password must be at least 4 characters."}); return; }
    if (newPw !== confirmPw) { setMsg({er: "New passwords do not match."}); return; }
    dispatch({ type: "SET_PASSWORD", payload: { staffId: user!.staffId, password: newPw } });
    dispatch({ type: "AUDIT_LOG", payload: { action: "SET_PASSWORD", detail: `Password set for ${user!.staffId}` } });
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setMsg({ok: "Password saved successfully."});
  }

  function handleClearPassword() {
    if (!currentPw) { setMsg({er: "Enter current password to confirm."}); return; }
    if (currentPw !== myStaff!.password) { setMsg({er: "Current password is wrong."}); return; }
    dispatch({ type: "SET_PASSWORD", payload: { staffId: user!.staffId, password: "" } });
    dispatch({ type: "AUDIT_LOG", payload: { action: "CLEAR_PASSWORD", detail: `Password cleared for ${user!.staffId}` } });
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setMsg({ok: "Password cleared. Login with Staff ID only."});
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 20, maxWidth: 600 }}>
      <div style={{ background: "var(--surface)", borderRadius: "var(--r)", padding: 24, border: "1.5px solid var(--border)", boxShadow: "var(--shadow)" }}>
        <h2 style={{ marginBottom: 6 }}>🔐 Set Login Password</h2>
        <p style={{ color: "var(--text3)", fontSize: 13, marginBottom: 20 }}>
          {hasPw
            ? "You have a password set. Enter it below to update or clear it."
            : "Set a password so only you can access your account with your Staff ID."}
        </p>

        {hasPw && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display:"block", fontSize: 11, fontWeight: 700, color: "var(--text3)", marginBottom: 4 }}>CURRENT PASSWORD</label>
            <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
              style={{ width:"100%", padding:"9px 12px", borderRadius:"var(--r-sm)", border:"1.5px solid var(--border)", fontFamily:"inherit", fontSize: 14, background:"var(--surface)" }} />
          </div>
        )}
        {!hasPw && (
          <div style={{ marginBottom: 16, padding:"12px 16px", background:"rgba(40,140,40,.08)", borderRadius:"var(--r-sm)", border:"1px solid rgba(40,140,40,.2)", fontSize: 13 }}>
            No password set — your account is currently protected by Staff ID only.
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={{ display:"block", fontSize: 11, fontWeight: 700, color: "var(--text3)", marginBottom: 4 }}>NEW PASSWORD</label>
          <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min. 4 characters"
            style={{ width:"100%", padding:"9px 12px", borderRadius:"var(--r-sm)", border:"1.5px solid var(--border)", fontFamily:"inherit", fontSize: 14, background:"var(--surface)" }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display:"block", fontSize: 11, fontWeight: 700, color: "var(--text3)", marginBottom: 4 }}>CONFIRM NEW PASSWORD</label>
          <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter new password"
            style={{ width:"100%", padding:"9px 12px", borderRadius:"var(--r-sm)", border:"1.5px solid var(--border)", fontFamily:"inherit", fontSize: 14, background:"var(--surface)" }} />
        </div>

        {msg.er && <div style={{ color:"#C0392B", fontSize: 13, marginBottom: 12 }}>{msg.er}</div>}
        {msg.ok && <div style={{ color:"var(--green-logo)", fontSize: 13, marginBottom: 12 }}>{msg.ok}</div>}

        <div style={{ display:"flex", gap: 10 }}>
          <button onClick={handleSetPassword}
            style={{ padding:"10px 20px", borderRadius:"var(--r-sm)", border:"none", background:"var(--blue)", color:"#fff", fontWeight: 700, fontSize: 13, cursor:"pointer", fontFamily:"inherit" }}>
            {hasPw ? "Update Password" : "Set Password"}
          </button>
          {hasPw && (
            <button onClick={handleClearPassword}
              style={{ padding:"10px 20px", borderRadius:"var(--r-sm)", border:"1.5px solid #C0392B", background:"transparent", color:"#C0392B", fontWeight: 700, fontSize: 13, cursor:"pointer", fontFamily:"inherit" }}>
              Remove Password
            </button>
          )}
        </div>
      </div>

      {/* Account info */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--r)", padding: 20, border: "1.5px solid var(--border)" }}>
        <h3 style={{ marginBottom: 12 }}>Account Details</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 8, fontSize: 13 }}>
          <div style={{ padding:"8px 12px", background:"var(--surface2)", borderRadius: 8 }}>
            <div style={{ color:"var(--text3)", fontSize: 10, fontWeight: 700 }}>STAFF ID</div>
            <div style={{ fontWeight: 600, fontFamily:"monospace", marginTop: 2 }}>{user.staffId}</div>
          </div>
          <div style={{ padding:"8px 12px", background:"var(--surface2)", borderRadius: 8 }}>
            <div style={{ color:"var(--text3)", fontSize: 10, fontWeight: 700 }}>NAME</div>
            <div style={{ fontWeight: 600, marginTop: 2 }}>{user.name}</div>
          </div>
          <div style={{ padding:"8px 12px", background:"var(--surface2)", borderRadius: 8 }}>
            <div style={{ color:"var(--text3)", fontSize: 10, fontWeight: 700 }}>ROLE</div>
            <div style={{ fontWeight: 600, marginTop: 2 }}>{user.authLevel}</div>
          </div>
          <div style={{ padding:"8px 12px", background:"var(--surface2)", borderRadius: 8 }}>
            <div style={{ color:"var(--text3)", fontSize: 10, fontWeight: 700 }}>MARKET</div>
            <div style={{ fontWeight: 600, marginTop: 2 }}>{user.market}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
