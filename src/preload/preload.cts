import { contextBridge, ipcRenderer } from "electron";

import type {
  EmailListResult,
  EmailSettings,
  ExtractionResult,
  NewOrderEmailNotification,
  ProgressEvent,
  UpdateCheckResult,
} from "../shared/types.js";
import type { EmailExtractionRequest, EmailExtractionResult, EmailListRequest } from "../core/extractionService.js";

export interface OrderOrganizerApi {
  loadSettings: () => Promise<EmailSettings>;
  saveSettings: (settings: EmailSettings) => Promise<EmailSettings>;
  selectLocalInputs: () => Promise<string[]>;
  listEmails: (payload: EmailListRequest) => Promise<EmailListResult>;
  extractLocal: (payload: { paths: string[]; recursive?: boolean; inferManual?: boolean }) => Promise<ExtractionResult>;
  extractEmail: (payload: EmailExtractionRequest) => Promise<EmailExtractionResult>;
  notifyNewOrderEmails: (notification: NewOrderEmailNotification) => Promise<boolean>;
  checkUpdates: () => Promise<UpdateCheckResult>;
  downloadAndInstallUpdate: (update: UpdateCheckResult) => Promise<string>;
  openPath: (targetPath: string) => Promise<void>;
  onProgress: (callback: (event: ProgressEvent) => void) => () => void;
}

const api: OrderOrganizerApi = {
  loadSettings: () => ipcRenderer.invoke("settings:load"),
  saveSettings: (settings) => ipcRenderer.invoke("settings:save", settings),
  selectLocalInputs: () => ipcRenderer.invoke("dialog:select-local-inputs"),
  listEmails: (payload) => ipcRenderer.invoke("emails:list", payload),
  extractLocal: (payload) => ipcRenderer.invoke("orders:extract-local", payload),
  extractEmail: (payload) => ipcRenderer.invoke("orders:extract-email", payload),
  notifyNewOrderEmails: (notification) => ipcRenderer.invoke("notifications:new-order-emails", notification),
  checkUpdates: () => ipcRenderer.invoke("updates:check"),
  downloadAndInstallUpdate: (update) => ipcRenderer.invoke("updates:download-and-install", update),
  openPath: (targetPath) => ipcRenderer.invoke("shell:open-path", targetPath),
  onProgress: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, progress: ProgressEvent) => {
      callback(progress);
    };
    ipcRenderer.on("orders:progress", listener);
    return () => ipcRenderer.off("orders:progress", listener);
  },
};

contextBridge.exposeInMainWorld("orderOrganizer", api);
