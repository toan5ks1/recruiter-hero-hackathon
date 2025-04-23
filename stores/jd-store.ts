import { CV } from "@prisma/client";
import { create } from "zustand";

import { JDExtended } from "@/lib/types";

export type ScoreResultStatus = "created" | "processing" | "success" | "failed";

type JDStore = {
  selectedJD: JDExtended | null;
  setSelectedJD: (jd: JDExtended) => void;
  addCVToJD: (cv: CV, status?: ScoreResultStatus) => void;
  updateCV: (updatedCV: CV) => void;
};

export const useJDStore = create<JDStore>((set) => ({
  selectedJD: null,
  setSelectedJD: (jd) => set({ selectedJD: jd }),
  addCVToJD: (cv, status = "created") =>
    set((state) => {
      if (!state.selectedJD) return state;
      const newCV: CV = { ...cv, status };
      return {
        selectedJD: {
          ...state.selectedJD,
          cvs: [...state.selectedJD.cvs, newCV],
        },
      };
    }),
  updateCV: (updatedCV) =>
    set((state) => {
      if (!state.selectedJD) return state;

      const updatedCVs = state.selectedJD.cvs.map((cv) =>
        cv.id === updatedCV.id ? { ...cv, ...updatedCV } : cv,
      );

      return {
        selectedJD: {
          ...state.selectedJD,
          cvs: updatedCVs,
        },
      };
    }),
}));
