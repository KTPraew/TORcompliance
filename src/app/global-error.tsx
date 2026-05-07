"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="th">
      <body style={{ margin: 0, background: "#f8fafb", fontFamily: "system-ui, sans-serif" }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}>
          <div style={{
            background: "white",
            borderRadius: "1rem",
            padding: "2rem",
            maxWidth: "420px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 8px 40px rgba(6,78,59,0.12)",
          }}>
            <div style={{
              width: "56px", height: "56px",
              borderRadius: "0.75rem",
              background: "#fef2f2",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1rem",
              fontSize: "1.5rem",
            }}>⚠️</div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#0f172a", marginBottom: "0.5rem" }}>
              เกิดข้อผิดพลาด
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1.5rem" }}>
              {error?.message || "ระบบเกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง"}
            </p>
            <button
              onClick={reset}
              style={{
                background: "#059669",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.625rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
