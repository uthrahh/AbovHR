"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { LinkedInEducationDraft, LinkedInExperienceDraft } from "@/lib/import/linkedin-parser";

export type BasicInfoDraft = {
  firstName?: string;
  lastName?: string;
  headline?: string;
  summary?: string;
  githubUsername?: string;
  linkedinUsername?: string;
  portfolioUrl?: string;
};

type ProfileImportState = {
  basicInfo: BasicInfoDraft | null;
  skills: string[];
  education: LinkedInEducationDraft[];
  experience: LinkedInExperienceDraft[];
};

type ProfileImportContextValue = ProfileImportState & {
  applyImport: (data: Partial<ProfileImportState>) => void;
  dismissEducation: (index: number) => void;
  dismissExperience: (index: number) => void;
  dismissSkill: (skill: string) => void;
};

const ProfileImportContext = createContext<ProfileImportContextValue | null>(null);

export function ProfileImportProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProfileImportState>({ basicInfo: null, skills: [], education: [], experience: [] });

  const applyImport = useCallback((data: Partial<ProfileImportState>) => {
    setState((prev) => ({
      basicInfo: data.basicInfo ? { ...prev.basicInfo, ...data.basicInfo } : prev.basicInfo,
      skills: data.skills && data.skills.length > 0 ? Array.from(new Set([...prev.skills, ...data.skills])) : prev.skills,
      education: data.education && data.education.length > 0 ? [...prev.education, ...data.education] : prev.education,
      experience: data.experience && data.experience.length > 0 ? [...prev.experience, ...data.experience] : prev.experience,
    }));
  }, []);

  const dismissEducation = useCallback((index: number) => {
    setState((prev) => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
  }, []);

  const dismissExperience = useCallback((index: number) => {
    setState((prev) => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
  }, []);

  const dismissSkill = useCallback((skill: string) => {
    setState((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  }, []);

  return (
    <ProfileImportContext.Provider value={{ ...state, applyImport, dismissEducation, dismissExperience, dismissSkill }}>
      {children}
    </ProfileImportContext.Provider>
  );
}

export function useProfileImport() {
  const ctx = useContext(ProfileImportContext);
  if (!ctx) throw new Error("useProfileImport must be used within a ProfileImportProvider");
  return ctx;
}
