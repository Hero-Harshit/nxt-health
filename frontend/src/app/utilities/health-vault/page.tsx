'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Script from 'next/script';
import {
  ShieldCheck, HardDrive, Upload, FileText, File, ImageIcon, Trash2, 
  ExternalLink, AlertCircle, RefreshCw, LogOut, CheckCircle2, Lock
} from 'lucide-react';

// Design System Tokens
const NAVY = '#0B1E3D';
const BLUE = '#2563EB';
const BLUE_LIGHT = '#EFF6FF';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const VAULT_FOLDER_NAME = 'Health Vault Documents';
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

interface VaultFile {
  id: string; name: string; mimeType: string;
  size?: string; createdTime?: string; webViewLink?: string;
}

export default function HealthVault() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [vaultFolderId, setVaultFolderId] = useState<string | null>(null);
  
  const [documents, setDocuments] = useState<VaultFile[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDisconnect = useCallback((expiredReason?: string) => {
    setAccessToken(null); setIsConnected(false); setVaultFolderId(null); setDocuments([]);
    localStorage.removeItem('hv_google_access_token');
    if (expiredReason) setSessionExpiredMessage(expiredReason);
  }, []);

  const driveFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    if (!accessToken) throw new Error('No access token available');
    const headers = { ...options.headers, Authorization: `Bearer ${accessToken}` };
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      handleDisconnect('Your session expired — please reconnect your Drive');
      throw new Error('SESSION_EXPIRED');
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `Drive API error: ${response.status}`);
    }
    return response;
  }, [accessToken, handleDisconnect]);

  useEffect(() => {
    const cachedToken = localStorage.getItem('hv_google_access_token');
    if (cachedToken) { setAccessToken(cachedToken); setIsConnected(true); }
    setIsInitializing(false);
  }, []);

  const handleConnectDrive = () => {
    setSessionExpiredMessage(null); setUploadError(null);
    if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
      alert('Google Identity Services library not loaded yet. Please wait a second and try again.');
      return;
    }
    if (!CLIENT_ID) {
      alert('Configuration Error: Google Client ID is missing from environment variables.');
      return;
    }

    const client = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          setAccessToken(tokenResponse.access_token);
          setIsConnected(true);
          localStorage.setItem('hv_google_access_token', tokenResponse.access_token);
        } else {
          alert('Failed to authorize Google Drive access.');
        }
      },
    });
    client.requestAccessToken();
  };

  const ensureVaultFolderExists = useCallback(async (): Promise<string | null> => {
    try {
      const query = encodeURIComponent(`name = '${VAULT_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
      const res = await driveFetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id, name)`);
      const data = await res.json();
      if (data.files && data.files.length > 0) return data.files[0].id;

      const createRes = await driveFetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: VAULT_FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
      });
      const folderData = await createRes.json();
      return folderData.id;
    } catch (err: any) {
      if (err.message !== 'SESSION_EXPIRED') console.error('Error ensuring vault folder:', err);
      return null;
    }
  }, [driveFetch]);

  const fetchVaultDocuments = useCallback(async (folderId: string) => {
    setIsLoadingDocs(true);
    try {
      const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
      const fields = encodeURIComponent('files(id, name, mimeType, size, createdTime, webViewLink)');
      const res = await driveFetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}`);
      const data = await res.json();
      setDocuments(data.files || []);
    } catch (err: any) {
      if (err.message !== 'SESSION_EXPIRED') console.error('Error fetching vault documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  }, [driveFetch]);

  useEffect(() => {
    if (isConnected && accessToken) {
      ensureVaultFolderExists().then((folderId) => {
        if (folderId) { setVaultFolderId(folderId); fetchVaultDocuments(folderId); }
      });
    }
  }, [isConnected, accessToken, ensureVaultFolderExists, fetchVaultDocuments]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const errorMsg = 'File exceeds the 25MB limit — please choose a smaller file';
      setUploadError(errorMsg);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (!vaultFolderId) { alert('Vault folder not initialized.'); return; }

    setIsUploading(true);
    try {
      const metadata = { name: file.name, parents: [vaultFolderId] };
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', file);

      const uploadRes = await driveFetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,webViewLink',
        { method: 'POST', body: formData }
      );
      const newFile = await uploadRes.json();
      setDocuments((prev) => [newFile, ...prev]);
    } catch (err: any) {
      if (err.message !== 'SESSION_EXPIRED') alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this document from your Health Vault?')) return;
    try {
      await driveFetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, { method: 'DELETE' });
      setDocuments((prev) => prev.filter((doc) => doc.id !== fileId));
    } catch (err: any) {
      if (err.message !== 'SESSION_EXPIRED') alert(`Delete failed: ${err.message}`);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image/')) return <ImageIcon className="w-5 h-5 text-blue-600" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-600" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return 'Unknown size';
    const numBytes = parseInt(bytes, 10);
    if (numBytes < 1024) return `${numBytes} B`;
    if (numBytes < 1024 * 1024) return `${(numBytes / 1024).toFixed(1)} KB`;
    return `${(numBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 antialiased font-sans text-gray-900">
        {/* HEADER CARD */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl text-white font-bold" style={{ backgroundColor: NAVY }}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: NAVY }}>Personal Health Vault</h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Securely store and manage medical records directly inside your own private Google Drive.
            </p>
          </div>
          {isConnected && (
            <button onClick={() => handleDisconnect()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 transition-all">
              <LogOut className="w-4 h-4" /> <span>Disconnect Drive</span>
            </button>
          )}
        </div>

        {/* DISCONNECTED STATE VIEW */}
        {!isConnected ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center" style={{ backgroundColor: BLUE_LIGHT }}>
              <HardDrive className="w-8 h-8" style={{ color: BLUE }} />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-xl font-bold" style={{ color: NAVY }}>Connect Your Google Drive</h2>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Your health documents stay completely private. Files are uploaded straight to a dedicated 
                <strong> "{VAULT_FOLDER_NAME}"</strong> folder inside your own Google Drive.
              </p>
            </div>
            
            {sessionExpiredMessage && (
              <div className="max-w-md mx-auto bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-amber-800 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{sessionExpiredMessage}</span>
              </div>
            )}

            <div className="pt-2">
              <button onClick={handleConnectDrive} disabled={isInitializing} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: BLUE }}>
                <HardDrive className="w-4 h-4" /> <span>Connect Google Drive</span>
              </button>
            </div>
            <div className="pt-4 flex items-center justify-center gap-6 text-[11px] text-gray-400 font-medium">
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-emerald-600" /> End-to-end user privacy</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> OAuth2 Implicit Flow</span>
            </div>
          </div>
        ) : (
          /* CONNECTED VAULT VIEW */
          <div className="space-y-6">
            {/* UPLOAD DROPZONE */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Upload New Record</h2>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Drive Connected</span>
              </div>
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-2xl p-8 text-center cursor-pointer transition-all bg-gray-50/50 hover:bg-blue-50/30 group">
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,image/png,image/jpeg" onChange={handleFileUpload} disabled={isUploading} />
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-white border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
                    {isUploading ? <RefreshCw className="w-6 h-6 animate-spin" style={{ color: BLUE }} /> : <Upload className="w-6 h-6" style={{ color: BLUE }} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: NAVY }}>{isUploading ? 'Uploading file to Google Drive...' : 'Click or drop medical file here'}</p>
                    <p className="text-xs text-gray-400 mt-1">Supports PDF, JPG, PNG up to 25MB</p>
                  </div>
                </div>
              </div>
              {uploadError && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" /> <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* DOCUMENT LIST */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold" style={{ color: NAVY }}>Vault Documents</h2>
                  <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{documents.length}</span>
                </div>
                {vaultFolderId && (
                  <button onClick={() => fetchVaultDocuments(vaultFolderId)} disabled={isLoadingDocs} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Refresh Documents">
                    <RefreshCw className={`w-4 h-4 ${isLoadingDocs ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>

              {isLoadingDocs ? (
                <div className="py-12 text-center text-xs text-gray-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  <p>Loading documents from Google Drive...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 space-y-1">
                  <File className="w-8 h-8 mx-auto text-gray-300" />
                  <p className="font-semibold text-gray-600 text-sm">No health records yet</p>
                  <p>Upload prescriptions, lab reports, or scans to store them securely.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {documents.map((doc) => (
                    <div key={doc.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/60 px-3 rounded-xl transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-gray-50 shrink-0">{getFileIcon(doc.mimeType)}</div>
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-xs sm:text-sm font-bold truncate" style={{ color: NAVY }}>{doc.name}</p>
                          <p className="text-[11px] text-gray-400 flex items-center gap-3">
                            <span>{formatFileSize(doc.size)}</span>
                            {doc.createdTime && <span>{new Date(doc.createdTime).toLocaleDateString()}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {doc.webViewLink && (
                          <a href={doc.webViewLink} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Open in Google Drive">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button onClick={() => handleDeleteFile(doc.id)} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete Document">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
