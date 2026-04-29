"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Globe,
  Save,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Camera,
  Sun,
  Moon,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

const settingsTabs = [
  { label: "โปรไฟล์", icon: User, value: "profile" },
  { label: "การแจ้งเตือน", icon: Bell, value: "notifications" },
  { label: "ความปลอดภัย", icon: Shield, value: "security" },
  { label: "มาตรฐาน", icon: Globe, value: "standards" },
];

type Profile = {
  first_name: string;
  last_name: string;
  phone: string;
  organization: string;
  avatar_url: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>({
    first_name: "",
    last_name: "",
    phone: "",
    organization: "",
    avatar_url: "",
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileSave, setProfileSave] = useState<SaveState>("idle");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSave, setPasswordSave] = useState<SaveState>("idle");
  const [passwordError, setPasswordError] = useState("");

  const supabase = createClient();
  const { user: authUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const loadUserData = useCallback(async () => {
    if (!authUser) { setLoadingProfile(false); return; }
    setLoadingProfile(true);

    setEmail(authUser.email ?? "");
    setUserId(authUser.id);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone, organization, avatar_url")
      .eq("id", authUser.id)
      .single();

    if (profileData) {
      setProfile({
        first_name: profileData.first_name ?? "",
        last_name: profileData.last_name ?? "",
        phone: profileData.phone ?? "",
        organization: profileData.organization ?? "",
        avatar_url: profileData.avatar_url ?? "",
      });
    }
    setLoadingProfile(false);
  }, [supabase, authUser]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setAvatarError("");
    setAvatarUploading(true);

    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      // Add cache-busting so the browser doesn't show the old image
      const urlWithBust = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ id: userId, avatar_url: urlWithBust, updated_at: new Date().toISOString() });

      if (updateError) throw updateError;

      setProfile((p) => ({ ...p, avatar_url: urlWithBust }));
    } catch (err) {
      console.error("Avatar upload error:", err);
      setAvatarError(err instanceof Error ? err.message : "อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setAvatarUploading(false);
      // Reset input so the same file can be re-uploaded
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    setProfileSave("saving");

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      ...profile,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setProfileSave("error");
    } else {
      setProfileSave("saved");
    }
    setTimeout(() => setProfileSave("idle"), 2500);
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setPasswordSave("saving");

    // Re-authenticate first to verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      setPasswordSave("error");
      setPasswordError("รหัสผ่านปัจจุบันไม่ถูกต้อง");
      setTimeout(() => setPasswordSave("idle"), 2500);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordSave("error");
      setPasswordError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } else {
      setPasswordSave("saved");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setTimeout(() => setPasswordSave("idle"), 2500);
  };

  const initials = [profile.first_name[0], profile.last_name[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "?";

  return (
    <AppShell>
      <div className="px-6 py-7 lg:px-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-slate-900">ตั้งค่า</h1>
          <p className="text-slate-500 text-sm mt-1">จัดการบัญชีและการตั้งค่าระบบ</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(67,97,238,0.04),0_4px_16px_rgba(67,97,238,0.05)] border border-slate-100 p-3 h-fit"
          >
            <nav className="space-y-0.5">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.value
                        ? "gradient-primary text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-3 space-y-5"
          >
            {activeTab === "profile" && (
              <>
                <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(67,97,238,0.04),0_4px_16px_rgba(67,97,238,0.05)] border border-slate-100 p-6">
                  <h2 className="font-semibold text-slate-900 mb-5">ข้อมูลส่วนตัว</h2>

                  {loadingProfile ? (
                    <div className="flex items-center justify-center py-12 text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span className="text-sm">กำลังโหลด...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 mb-6">
                        {/* Avatar */}
                        <div className="relative group">
                          <div
                            className="w-16 h-16 rounded-2xl overflow-hidden cursor-pointer"
                            onClick={() => !avatarUploading && avatarInputRef.current?.click()}
                          >
                            {profile.avatar_url ? (
                              <img
                                src={profile.avatar_url}
                                alt=""
                                aria-hidden="true"
                                decoding="async"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full gradient-primary flex items-center justify-center text-white text-xl font-bold">
                                {initials}
                              </div>
                            )}
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              {avatarUploading
                                ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                                : <Camera className="w-5 h-5 text-white" />
                              }
                            </div>
                          </div>
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            className="hidden"
                            onChange={handleAvatarUpload}
                          />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {profile.first_name || profile.last_name
                              ? `${profile.first_name} ${profile.last_name}`.trim()
                              : "ยังไม่ได้ตั้งชื่อ"}
                          </p>
                          <p className="text-sm text-slate-500">{email}</p>
                          <button
                            onClick={() => !avatarUploading && avatarInputRef.current?.click()}
                            className="text-xs text-primary font-medium mt-0.5 hover:underline disabled:opacity-50"
                            disabled={avatarUploading}
                          >
                            {avatarUploading ? "กำลังอัปโหลด..." : "เปลี่ยนรูปโปรไฟล์"}
                          </button>
                          {avatarError && (
                            <p className="text-xs text-red-500 mt-0.5">{avatarError}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="profile-first-name" className="text-xs font-medium text-slate-600">ชื่อ</label>
                          <input
                            id="profile-first-name"
                            type="text"
                            value={profile.first_name}
                            onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))}
                            placeholder="ชื่อ"
                            autoComplete="given-name"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="profile-last-name" className="text-xs font-medium text-slate-600">นามสกุล</label>
                          <input
                            id="profile-last-name"
                            type="text"
                            value={profile.last_name}
                            onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))}
                            placeholder="นามสกุล"
                            autoComplete="family-name"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="profile-email" className="text-xs font-medium text-slate-600">อีเมล</label>
                          <input
                            id="profile-email"
                            type="email"
                            value={email}
                            disabled
                            aria-disabled="true"
                            autoComplete="email"
                            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="profile-phone" className="text-xs font-medium text-slate-600">เบอร์โทรศัพท์</label>
                          <input
                            id="profile-phone"
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                            placeholder="02-xxx-xxxx"
                            autoComplete="tel"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                          <label htmlFor="profile-organization" className="text-xs font-medium text-slate-600">หน่วยงาน</label>
                          <input
                            id="profile-organization"
                            type="text"
                            value={profile.organization}
                            onChange={(e) => setProfile((p) => ({ ...p, organization: e.target.value }))}
                            placeholder="ชื่อหน่วยงาน"
                            autoComplete="organization"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} size="md" disabled={loadingProfile || profileSave === "saving"}>
                    {profileSave === "saving" ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />กำลังบันทึก...</>
                    ) : profileSave === "saved" ? (
                      <><CheckCircle2 className="w-4 h-4" />บันทึกแล้ว</>
                    ) : profileSave === "error" ? (
                      <><AlertCircle className="w-4 h-4" />เกิดข้อผิดพลาด</>
                    ) : (
                      <><Save className="w-4 h-4" />บันทึกการตั้งค่า</>
                    )}
                  </Button>
                </div>

                {/* Theme toggle — only render after hydration to avoid mismatch */}
                {mounted && (
                  <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(67,97,238,0.04),0_4px_16px_rgba(67,97,238,0.05)] border border-slate-100 p-6">
                    <h2 className="font-semibold text-slate-900 mb-5">การแสดงผล</h2>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700">โหมดการแสดงผล</p>
                        <p className="text-xs text-slate-500 mt-0.5">เลือกระหว่าง light หรือ dark mode</p>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                        <button
                          onClick={() => setTheme("light")}
                          aria-label="Light mode"
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            theme === "light"
                              ? "bg-white shadow-sm text-slate-900"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                          Light
                        </button>
                        <button
                          onClick={() => setTheme("dark")}
                          aria-label="Dark mode"
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            theme === "dark"
                              ? "bg-slate-800 shadow-sm text-white"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                          Dark
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(67,97,238,0.04),0_4px_16px_rgba(67,97,238,0.05)] border border-slate-100 p-6">
                <h2 className="font-semibold text-slate-900 mb-5">การแจ้งเตือน</h2>
                <div className="space-y-4">
                  {[
                    { label: "เมื่อการวิเคราะห์ TOR เสร็จสิ้น", checked: true },
                    { label: "เมื่อการตรวจสอบ UI เสร็จสิ้น", checked: true },
                    { label: "เมื่อโปรเจคถูกแชร์", checked: false },
                    { label: "รายงานประจำสัปดาห์", checked: true },
                    { label: "อัปเดตมาตรฐานใหม่", checked: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50">
                      <span className="text-sm text-slate-700">{item.label}</span>
                      <div
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                          item.checked ? "gradient-primary" : "bg-slate-200"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                            item.checked ? "right-0.5" : "left-0.5"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <>
                <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(67,97,238,0.04),0_4px_16px_rgba(67,97,238,0.05)] border border-slate-100 p-6">
                  <h2 className="font-semibold text-slate-900 mb-5">เปลี่ยนรหัสผ่าน</h2>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="current-password" className="text-xs font-medium text-slate-600">รหัสผ่านปัจจุบัน</label>
                      <input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="new-password" className="text-xs font-medium text-slate-600">รหัสผ่านใหม่</label>
                      <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="confirm-password" className="text-xs font-medium text-slate-600">ยืนยันรหัสผ่านใหม่</label>
                      <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>

                    {passwordError && (
                      <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {passwordError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleChangePassword}
                    size="md"
                    disabled={!currentPassword || !newPassword || !confirmPassword || passwordSave === "saving"}
                  >
                    {passwordSave === "saving" ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />กำลังบันทึก...</>
                    ) : passwordSave === "saved" ? (
                      <><CheckCircle2 className="w-4 h-4" />เปลี่ยนรหัสผ่านแล้ว</>
                    ) : (
                      <><Save className="w-4 h-4" />เปลี่ยนรหัสผ่าน</>
                    )}
                  </Button>
                </div>
              </>
            )}

            {activeTab === "standards" && (
              <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(67,97,238,0.04),0_4px_16px_rgba(67,97,238,0.05)] border border-slate-100 p-6">
                <h2 className="font-semibold text-slate-900 mb-5">มาตรฐานที่ตรวจสอบ</h2>
                <div className="space-y-3">
                  {[
                    { name: "WCAG 2.1 Level A", enabled: true, desc: "Web Content Accessibility Guidelines ระดับ A" },
                    { name: "WCAG 2.1 Level AA", enabled: true, desc: "Web Content Accessibility Guidelines ระดับ AA (แนะนำ)" },
                    { name: "WCAG 2.1 Level AAA", enabled: false, desc: "Web Content Accessibility Guidelines ระดับ AAA" },
                    { name: "TWCAG 2010", enabled: true, desc: "มาตรฐาน Accessibility ของไทย" },
                    { name: "Website Policy", enabled: true, desc: "นโยบายเว็บไซต์ภาครัฐไทย" },
                    { name: "PDPA Compliance", enabled: true, desc: "พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล" },
                  ].map((std, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          std.enabled ? "border-primary bg-primary" : "border-slate-300"
                        }`}
                      >
                        {std.enabled && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{std.name}</p>
                        <p className="text-xs text-slate-500">{std.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
